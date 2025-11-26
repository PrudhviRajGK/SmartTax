import re
import pdfplumber
import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import io

# Tesseract configuration
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
try:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
except:
    pass

class Form16Parser:
    def __init__(self):
        pass

    def _clean_amount(self, text):
        """Converts string '1,50,000.00' to float 150000.0"""
        if not text: return 0.0
        try:
            clean_text = re.sub(r"[^\d.]", "", str(text))
            return float(clean_text)
        except:
            return 0.0

    def _extract_from_tables(self, pdf):
        """
        Reads tables page by page.
        Prioritizes the word 'Deducted' for TDS.
        """
        data = {}
        
        for page in pdf.pages:
            tables = page.extract_tables()
            
            for table in tables:
                for row in table:
                    # Clean row
                    row_items = [str(cell).lower() for cell in row if cell]
                    row_str = " ".join(row_items)
                    
                    # --- 1. Gross Salary ---
                    if "17(1)" in row_str or ("gross" in row_str and "salary" in row_str):
                        for cell in reversed(row):
                            val = self._clean_amount(cell)
                            if val > 100000: 
                                data["gross_salary"] = val
                                break

                    # --- 2. TDS (Updated: Deducted-First Logic) ---
                    is_tds_candidate = False
                    
                    # Priority 1: Explicit "Tax Deducted" (No 'Total' needed)
                    if "tax" in row_str and "deducted" in row_str:
                        is_tds_candidate = True
                    
                    # Priority 2: "Net Tax" or "Tax Payable"
                    elif "net tax" in row_str or "tax payable" in row_str:
                        is_tds_candidate = True
                        
                    # Priority 3: "Total Tax" (Fallback)
                    elif "total" in row_str and "tax" in row_str:
                        is_tds_candidate = True

                    # Priority 4: Specific Case "Total (Rs.)" (For your specific PDF)
                    elif "total (rs.)" in row_str:
                        is_tds_candidate = True

                    if is_tds_candidate:
                        # Safety: Ignore "Income" to avoid 21L error
                        if "income" in row_str:
                            continue
                            
                        for cell in reversed(row):
                            val = self._clean_amount(cell)
                            if val > 0:
                                if val == data.get("gross_salary", 0):
                                    continue
                                
                                # Keep the highest valid tax number found
                                current_best = data.get("tds_paid", 0.0)
                                if val > current_best:
                                    data["tds_paid"] = val
                                break
        return data

    def _extract_with_ocr(self, pdf_file):
        """Fallback: OCR for images"""
        print("Standard extraction failed. Trying OCR...")
        text_content = ""
        try:
            pdf_file.seek(0)
            doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
            for page in doc:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text_content += pytesseract.image_to_string(img) + "\n"
        except Exception as e:
            print(f"OCR Error: {e}")
        return text_content

    def _extract_text_regex(self, text):
        """Regex Search (Backup)"""
        data = {}
        # Salary Pattern
        sal_match = re.search(r"(?i)(?:17\(1\)|gross\s+salary).*?([\d,]+\.\d{2})", text)
        if sal_match:
            data["gross_salary"] = self._clean_amount(sal_match.group(1))

        # TDS Pattern (FIXED: removed 'Total' requirement)
        # Matches: "Tax Deducted", "Total Tax Deducted", "Net Tax", "Total Tax"
        # The (?: ... ) group allows for variations
        tds_match = re.search(r"(?i)(?:tax\s+deducted|net\s+tax|total\s+tax).*?([\d,]+\.\d{2})", text)
        if tds_match:
            data["tds_paid"] = self._clean_amount(tds_match.group(1))
            
        return data

    def parse(self, pdf_file):
        result = {"employer_name": "Unknown", "gross_salary": 0.0, "tds_paid": 0.0}
        
        try:
            with pdfplumber.open(pdf_file) as pdf:
                # --- 1. Employer Name ---
                try:
                    page1_text = pdf.pages[0].extract_text()
                    match = re.search(r"(?i)employer[:\s\n]+([A-Za-z0-9\s\.]+)", page1_text)
                    if match:
                        name_candidate = match.group(1).split('\n')[0].strip()
                        if "from" not in name_candidate.lower() and "to" not in name_candidate.lower():
                            result["employer_name"] = name_candidate
                except:
                    pass

                # --- 2. Table Extraction ---
                table_data = self._extract_from_tables(pdf)
                result.update(table_data)

                # --- 3. Text Line Extraction (Backup) ---
                if result["gross_salary"] == 0.0:
                    full_text = ""
                    for page in pdf.pages:
                        t = page.extract_text()
                        if t: full_text += t + "\n"
                    
                    text_data = self._extract_text_regex(full_text)
                    if text_data.get("gross_salary", 0) > 0:
                        result.update(text_data)

        except Exception as e:
            print(f"Error reading PDF: {e}")

        # --- 4. OCR Backup ---
        if result["gross_salary"] == 0.0:
            ocr_text = self._extract_with_ocr(pdf_file)
            ocr_data = self._extract_text_regex(ocr_text)
            if ocr_data.get("gross_salary", 0) > 0:
                result.update(ocr_data)
                
                # Try employer name in OCR
                if result["employer_name"] == "Unknown":
                     match = re.search(r"(?i)employer[:\s\n]+([A-Za-z0-9\s\.]+)", ocr_text)
                     if match: 
                        result["employer_name"] = match.group(1).split('\n')[0].strip()

        return result