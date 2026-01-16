from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
from typing import Optional
from datetime import datetime

from app.form16_parser import Form16Parser
from app.groww_parser import GrowwCapitalGainsParser
from app.mutual_fund_parser import MutualFundCapitalGainsParser
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

# Initialize parsers
form16_parser = Form16Parser()
groww_parser = GrowwCapitalGainsParser()
mf_parser = MutualFundCapitalGainsParser()


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
    """Parse equity trades Excel report from Groww or Zerodha"""
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Only Excel files are supported")
        
        contents = await file.read()
        excel_file = io.BytesIO(contents)
        
        # Currently only Groww parser is implemented
        if broker.lower() == "zerodha":
            # TODO: Implement Zerodha-specific parser
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing {broker} report: {str(e)}")


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
        # STEP 5: Calculate Totals (exactly as Streamlit)
        # ============================================================
        total_tax = salary_tax + stock_tax + mf_tax
        net_payable = total_tax - request.tds_paid
        
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
                    "totalTaxLiability": total_tax
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
