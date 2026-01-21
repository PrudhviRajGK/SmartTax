"""
SmartTax API - Indian Income Tax Filing Backend

FastAPI-based REST API for Indian Income Tax Return (ITR) filing.
Supports ITR-1 (salary income) and ITR-2 (salary + capital gains).

Features:
- Form-16 PDF parsing (OCR + table extraction)
- Equity stock trade parsing (Groww/Zerodha Excel reports)
- Mutual fund capital gains parsing
- Tax calculation for FY 2024-25 (New Tax Regime)
- AI-powered tax advisor chatbot (local LLM via Ollama)

Endpoints:
    GET  /                      - Health check
    POST /parse/form16          - Parse Form-16 PDF
    POST /parse/equity          - Parse equity trades Excel
    POST /parse/mf              - Parse mutual fund gains Excel
    POST /calculate/tax         - Calculate total tax liability
    POST /chatbot/message       - Send message to tax advisor AI
    GET  /chatbot/history       - Get conversation history
    POST /chatbot/clear         - Clear conversation history

Security:
- CORS enabled for localhost:3000, localhost:3001
- No authentication (local use only)
- File uploads validated by type

Author: SmartTax Team
Version: 1.0.0
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
from typing import Optional
from datetime import datetime

from app.form16_parser import Form16Parser
from app.groww_parser import GrowwCapitalGainsParser
from app.mutual_fund_parser import MutualFundCapitalGainsParser
from app.chatbot import TaxAdvisorChatbot
from app import utils

app = FastAPI(title="SmartTax API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize parsers and chatbot
form16_parser = Form16Parser()
groww_parser = GrowwCapitalGainsParser()
mf_parser = MutualFundCapitalGainsParser()
chatbot = TaxAdvisorChatbot()


# Pydantic Models
class TaxCalculationRequest(BaseModel):
    gross_salary: Optional[float] = 0.0
    tds_paid: Optional[float] = 0.0
    stcg_before: Optional[float] = 0.0
    stcg_after: Optional[float] = 0.0
    ltcg_before: Optional[float] = 0.0
    ltcg_after: Optional[float] = 0.0
    equity_stcg: Optional[float] = 0.0
    equity_ltcg: Optional[float] = 0.0
    debt_stcg: Optional[float] = 0.0
    debt_ltcg: Optional[float] = 0.0


class ChatbotRequest(BaseModel):
    message: str
    user_context: Optional[dict] = None


@app.get("/")
def read_root():
    return {"message": "SmartTax API is running", "version": "1.0.0"}


@app.post("/parse/form16")
async def parse_form16(file: UploadFile = File(...)):
    """Parse Form-16 PDF and extract salary and TDS information"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        
        result = form16_parser.parse(pdf_file)
        
        return {
            "success": True,
            "data": {
                "employer_name": result.get("employer_name", "Unknown"),
                "salary": result.get("gross_salary", 0.0),
                "deductions": result.get("tds_paid", 0.0),
                "gross_salary": result.get("gross_salary", 0.0),
                "tds_paid": result.get("tds_paid", 0.0)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing Form-16: {str(e)}")


@app.post("/parse/equity")
async def parse_equity(file: UploadFile = File(...), broker: str = Form("groww")):
    """
    Parse equity stock trades from broker Excel report.
    
    Extracts STCG/LTCG data from trade-wise Excel reports.
    Handles date-based tax rate changes (July 23, 2024).
    
    Args:
        file: Excel file (.xlsx, .xls) with trade data
        broker: Broker name ("groww" or "zerodha")
        
    Returns:
        dict: {
            "success": True,
            "data": {
                "broker": str,
                "stcg_before": float,  # STCG before July 23, 2024
                "stcg_after": float,   # STCG after July 23, 2024
                "ltcg_before": float,  # LTCG before July 23, 2024
                "ltcg_after": float    # LTCG after July 23, 2024
            }
        }
        
    Raises:
        HTTPException: 400 if file type invalid, 500 if parsing fails
        
    Notes:
        - Zerodha parser not yet implemented (uses Groww parser as fallback)
        - Date-based split is critical for correct tax calculation
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400, 
                detail="Only Excel files (.xlsx, .xls) are supported"
            )
        
        contents = await file.read()
        excel_file = io.BytesIO(contents)
        
        # Note: Zerodha parser not yet implemented
        # Both brokers currently use Groww parser logic
        if broker.lower() == "zerodha":
            # Future: Implement Zerodha-specific parser
            result = groww_parser.parse(excel_file)
        else:
            result = groww_parser.parse(excel_file)
        
        return {
            "success": True,
            "data": {
                "broker": broker,
                "stcg": result.get("stcg_after", 0.0),
                "ltcg": result.get("ltcg_after", 0.0),
                "stcg_before": result.get("stcg_before", 0.0),
                "stcg_after": result.get("stcg_after", 0.0),
                "ltcg_before": result.get("ltcg_before", 0.0),
                "ltcg_after": result.get("ltcg_after", 0.0)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error parsing {broker} report: {str(e)}"
        )


@app.post("/parse/groww")
async def parse_groww(file: UploadFile = File(...)):
    """Parse Groww equity trades Excel report (legacy endpoint)"""
    return await parse_equity(file, "groww")


@app.post("/parse/mf")
async def parse_mutual_fund(file: UploadFile = File(...)):
    """Parse Mutual Fund capital gains Excel report"""
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Only Excel files are supported")
        
        contents = await file.read()
        excel_file = io.BytesIO(contents)
        
        result = mf_parser.parse(excel_file)
        
        return {
            "success": True,
            "data": {
                "totalGains": result.get("equity_stcg", 0.0) + result.get("equity_ltcg", 0.0) + 
                             result.get("debt_stcg", 0.0) + result.get("debt_ltcg", 0.0),
                "equity_stcg": result.get("equity_stcg", 0.0),
                "equity_ltcg": result.get("equity_ltcg", 0.0),
                "debt_stcg": result.get("debt_stcg", 0.0),
                "debt_ltcg": result.get("debt_ltcg", 0.0)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing MF report: {str(e)}")


@app.post("/calculate/tax")
def calculate_tax(request: TaxCalculationRequest):
    """
    Calculate tax EXACTLY as Streamlit does
    Returns same structure and values as Streamlit display
    """
    try:
        # ============================================================
        # STEP 1: Calculate Debt MF Income (added to salary)
        # ============================================================
        debt_extra_income = utils.calculate_debt_mf_taxable_income(
            debt_stcg=request.debt_stcg,
            debt_ltcg=request.debt_ltcg
        )
        
        # ============================================================
        # STEP 2: Calculate Salary Tax (includes debt MF)
        # ============================================================
        salary_res = utils.calculate_new_regime_tax(
            gross_salary=request.gross_salary,
            extra_income=debt_extra_income
        )
        salary_tax = salary_res["salary_tax"]
        
        # ============================================================
        # STEP 3: Calculate Equity Stock Tax
        # ============================================================
        stock_tax_res = utils.calculate_equity_stock_capital_gains_tax(
            stcg_before=request.stcg_before,
            stcg_after=request.stcg_after,
            ltcg_before=request.ltcg_before,
            ltcg_after=request.ltcg_after
        )
        stock_tax = stock_tax_res["total_capital_gains_tax"]
        
        # ============================================================
        # STEP 4: Calculate Equity MF Tax
        # ============================================================
        eq_mf_tax_res = utils.calculate_equity_mf_capital_gains_tax(
            equity_stcg=request.equity_stcg,
            equity_ltcg=request.equity_ltcg
        )
        mf_tax = eq_mf_tax_res["total_capital_gains_tax"]
        
        # ============================================================
        # STEP 5: Calculate Total Income Tax (before cess)
        # ============================================================
        total_income_tax_before_cess = salary_tax + stock_tax + mf_tax
        
        # ============================================================
        # STEP 6: Apply 4% Health & Education Cess on TOTAL tax
        # ============================================================
        cess = total_income_tax_before_cess * utils.CESS_RATE
        total_tax_liability = total_income_tax_before_cess + cess
        
        # ============================================================
        # STEP 7: Calculate Net Payable / Refund
        # ============================================================
        net_payable = total_tax_liability - request.tds_paid
        
        # ============================================================
        # STEP 6: Calculate Exemptions and Taxable Amounts
        # ============================================================
        # Equity MF LTCG exemption
        equity_mf_ltcg_exemption = utils.LTCG_EXEMPTION
        equity_mf_taxable_ltcg = max(0, request.equity_ltcg - utils.LTCG_EXEMPTION)
        
        # ============================================================
        # RETURN: Match Streamlit display structure EXACTLY
        # ============================================================
        return {
            "success": True,
            "data": {
                # === PARSED STOCK GAINS (JSON display) ===
                "parsedStockGains": {
                    "stcg_before": request.stcg_before,
                    "stcg_after": request.stcg_after,
                    "ltcg_before": request.ltcg_before,
                    "ltcg_after": request.ltcg_after
                },
                
                # === STOCK TAX COMPUTATION ===
                "stockTaxComputation": {
                    "stcgTax": stock_tax_res["stcg_tax"],
                    "ltcgTax": stock_tax_res["ltcg_tax"]
                },
                
                # === PARSED MUTUAL FUND GAINS (JSON display) ===
                "parsedMutualFundGains": {
                    "equity_stcg": request.equity_stcg,
                    "equity_ltcg": request.equity_ltcg,
                    "debt_stcg": request.debt_stcg,
                    "debt_ltcg": request.debt_ltcg
                },
                
                # === EQUITY MUTUAL FUNDS ===
                "equityMutualFunds": {
                    "stcg": request.equity_stcg,
                    "ltcg": request.equity_ltcg,
                    "ltcgExemption": equity_mf_ltcg_exemption,
                    "taxableLtcg": equity_mf_taxable_ltcg,
                    "equityMfTax": mf_tax
                },
                
                # === DEBT MUTUAL FUNDS ===
                "debtMutualFunds": {
                    "debtStcg": request.debt_stcg,
                    "debtLtcg": request.debt_ltcg,
                    "addedToIncome": debt_extra_income
                },
                
                # === FINAL TAX SUMMARY (4 columns) ===
                "finalTaxSummary": {
                    "salaryPlusDebtMfTax": salary_tax,
                    "stockCapitalGainsTax": stock_tax,
                    "mutualFundEquityTax": mf_tax,
                    "totalIncomeTaxBeforeCess": total_income_tax_before_cess,
                    "cess": cess,
                    "totalTaxLiability": total_tax_liability
                },
                
                # === NET PAYABLE / REFUND ===
                "netPayable": net_payable,
                "isRefund": net_payable < 0,
                
                # === METADATA ===
                "calculatedAt": datetime.utcnow().isoformat() + "Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating tax: {str(e)}")


@app.post("/chatbot/message")
def chatbot_message(request: ChatbotRequest):
    """
    Tax advisor chatbot endpoint
    Accepts user message and context, returns AI-generated response
    """
    try:
        # Update chatbot context if provided
        if request.user_context:
            chatbot.set_user_context(request.user_context)
        
        # Generate response
        response = chatbot.generate_response(request.message, use_ollama=True)
        
        return {
            "success": True,
            "data": {
                "message": response,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


@app.get("/chatbot/history")
def get_chatbot_history():
    """Get chatbot conversation history"""
    try:
        return {
            "success": True,
            "data": {
                "history": chatbot.get_conversation_history()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")


@app.post("/chatbot/clear")
def clear_chatbot_history():
    """Clear chatbot conversation history"""
    try:
        chatbot.clear_history()
        return {
            "success": True,
            "message": "Conversation history cleared"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
