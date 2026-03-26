import pandas as pd
from datetime import date

CUT_OFF_DATE = date(2024, 7, 23)


def parse_amount(val):
    """Parse amount handling commas, brackets (negative), and missing values"""
    if pd.isna(val):
        return 0.0

    s = str(val).replace(",", "").strip()

    if s.startswith("(") and s.endswith(")"):
        try:
            return -float(s[1:-1])
        except:
            return 0.0

    try:
        return float(s)
    except:
        return 0.0


class ZerodhaCapitalGainsParser:
    """
    Robust parser for Zerodha Equity Capital Gains report
    Handles sections: Equity - Short Term, Equity - Long Term
    """

    def parse(self, file):
        try:
            df = pd.read_excel(file, header=None)
        except Exception as e:
            raise ValueError("Unable to read the uploaded file. Please ensure it's a valid Excel file (.xlsx or .xls).")

        if df.empty or len(df) < 5:
            raise ValueError("The uploaded file appears to be empty or invalid. Please upload a valid Zerodha capital gains report.")

        stcg_before = stcg_after = 0.0
        ltcg_before = ltcg_after = 0.0

        mode = None
        headers = None
        found_valid_section = False

        for i in range(len(df)):
            row = df.iloc[i]
            first_cell = str(row[0]).lower()

            # ---------------- Detect STCG section ----------------
            if "equity" in first_cell and "short term" in first_cell:
                mode = "STCG"
                headers = None
                found_valid_section = True
                continue

            # ---------------- Detect LTCG section ----------------
            if "equity" in first_cell and "long term" in first_cell:
                mode = "LTCG"
                headers = None
                found_valid_section = True
                continue

            # ---------------- Detect header row ----------------
            if mode and headers is None:
                row_str = " ".join([str(x).lower().strip() for x in row if pd.notna(x)])
                if "exit date" in row_str and ("taxable profit" in row_str or "profit" in row_str):
                    headers = [str(x).lower().strip() for x in row]
                    continue

            # ---------------- Exit section on empty or total ----------------
            if mode and ("total" in first_cell or pd.isna(row[0]) or str(row[0]).strip() == ""):
                if headers:
                    mode = None
                    headers = None
                continue

            # ---------------- Parse trade rows ----------------
            if mode and headers:
                try:
                    # Find Exit Date column
                    exit_idx = next(
                        i for i, h in enumerate(headers)
                        if "exit" in h and "date" in h
                    )
                    # Find Taxable Profit column
                    profit_idx = next(
                        i for i, h in enumerate(headers)
                        if "taxable" in h and "profit" in h
                    )
                except StopIteration:
                    continue

                profit = parse_amount(row[profit_idx])
                exit_date = pd.to_datetime(
                    row[exit_idx], dayfirst=True, errors="coerce"
                )

                if pd.isna(exit_date):
                    continue

                is_before = exit_date.date() < CUT_OFF_DATE

                if mode == "STCG":
                    if is_before:
                        stcg_before += profit
                    else:
                        stcg_after += profit

                elif mode == "LTCG":
                    if is_before:
                        ltcg_before += profit
                    else:
                        ltcg_after += profit

        if not found_valid_section:
            raise ValueError("This doesn't appear to be a valid Zerodha capital gains report. Please ensure you've uploaded the correct file with 'Equity - Short Term' or 'Equity - Long Term' sections.")

        return {
            "stcg_before": round(stcg_before, 2),
            "stcg_after": round(stcg_after, 2),
            "ltcg_before": round(ltcg_before, 2),
            "ltcg_after": round(ltcg_after, 2),
        }
