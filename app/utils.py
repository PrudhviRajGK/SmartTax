from datetime import date

# ============================================================
# CONSTANTS (FY 2024–25 | New Regime | ITR-2 aligned)
# ============================================================

CUT_OFF_DATE = date(2024, 7, 23)

STANDARD_DEDUCTION = 75_000
LTCG_EXEMPTION = 125_000
CESS_RATE = 0.04

NEW_REGIME_SLABS = [
    (400_000, 0.00),
    (800_000, 0.05),
    (1_200_000, 0.10),
    (1_600_000, 0.15),
    (2_000_000, 0.20),
    (2_400_000, 0.25),
    (float("inf"), 0.30),
]

# ============================================================
# INTERNAL HELPER — SLAB TAX ENGINE
# ============================================================

def _calculate_slab_tax(income: float) -> float:
    """
    Generic slab-based tax calculator (new regime)
    """
    tax = 0.0
    prev_limit = 0.0

    for limit, rate in NEW_REGIME_SLABS:
        if income <= prev_limit:
            break

        taxable_part = min(income, limit) - prev_limit
        tax += taxable_part * rate
        prev_limit = limit

    return tax


# ============================================================
# 1. SALARY TAX (NEW REGIME)
# ============================================================

def calculate_new_regime_tax(gross_salary: float, extra_income: float = 0.0):
    """
    Calculates tax under New Regime.
    extra_income is used ONLY for:
    - Debt Mutual Funds (post Apr 2023)
    """

    taxable_income = max(
        0.0,
        gross_salary - STANDARD_DEDUCTION + extra_income
    )

    tax = _calculate_slab_tax(taxable_income)

    # Section 87A rebate (new regime)
    if taxable_income <= 1_200_000:
        tax = 0.0

    cess = tax * CESS_RATE

    return {
        "gross_salary": round(gross_salary, 2),
        "extra_income": round(extra_income, 2),
        "taxable_income": round(taxable_income, 2),
        "salary_tax": round(tax + cess, 2),
    }


# ============================================================
# 2. EQUITY STOCKS (GROWW / ZERODHA)
# ============================================================

def calculate_equity_stock_capital_gains_tax(
    stcg_before: float,
    stcg_after: float,
    ltcg_before: float,
    ltcg_after: float
):
    """
    Equity Shares (Section 111A & 112A)
    """

    # ---------- STCG ----------
    stcg_tax = 0.0
    if stcg_before > 0:
        stcg_tax += stcg_before * 0.15
    if stcg_after > 0:
        stcg_tax += stcg_after * 0.20

    # ---------- LTCG ----------
    total_ltcg = ltcg_before + ltcg_after
    ltcg_tax = 0.0

    if total_ltcg > LTCG_EXEMPTION:
        taxable_ltcg = total_ltcg - LTCG_EXEMPTION

        # Proportionate taxation (before / after 23 July)
        ratio_before = ltcg_before / total_ltcg if total_ltcg else 0.0
        ratio_after = ltcg_after / total_ltcg if total_ltcg else 0.0

        ltcg_tax += taxable_ltcg * ratio_before * 0.10
        ltcg_tax += taxable_ltcg * ratio_after * 0.125

    return {
        "stcg_tax": round(stcg_tax, 2),
        "ltcg_tax": round(ltcg_tax, 2),
        "total_capital_gains_tax": round(stcg_tax + ltcg_tax, 2),
    }


# ============================================================
# 3. EQUITY MUTUAL FUNDS / ETFs (SECTION 112A)
# ============================================================

def calculate_equity_mf_capital_gains_tax(
    equity_stcg: float,
    equity_ltcg: float
):
    """
    Equity Mutual Funds / Equity ETFs
    """

    # STCG — flat 20%
    stcg_tax = max(0.0, equity_stcg) * 0.20

    # LTCG — exemption + flat 12.5%
    taxable_ltcg = max(0.0, equity_ltcg - LTCG_EXEMPTION)
    ltcg_tax = taxable_ltcg * 0.125

    return {
        "stcg_tax": round(stcg_tax, 2),
        "ltcg_tax": round(ltcg_tax, 2),
        "total_capital_gains_tax": round(stcg_tax + ltcg_tax, 2),
    }


# ============================================================
# 4. DEBT MUTUAL FUNDS (POST APRIL 2023)
# ============================================================

def calculate_debt_mf_taxable_income(
    debt_stcg: float,
    debt_ltcg: float
):
    """
    Debt MF gains are treated as NORMAL INCOME
    (no indexation, no exemption)
    """

    taxable_income = 0.0

    if debt_stcg > 0:
        taxable_income += debt_stcg

    if debt_ltcg > 0:
        taxable_income += debt_ltcg

    return round(taxable_income, 2)


# ============================================================
# 5. COMPREHENSIVE TAX CALCULATION (ALL SOURCES)
# ============================================================

def calculate_complete_tax(
    gross_salary: float = 0.0,
    tds_paid: float = 0.0,
    stcg_before: float = 0.0,
    stcg_after: float = 0.0,
    ltcg_before: float = 0.0,
    ltcg_after: float = 0.0,
    equity_stcg: float = 0.0,
    equity_ltcg: float = 0.0,
    debt_stcg: float = 0.0,
    debt_ltcg: float = 0.0
):
    """
    Complete tax calculation for ITR-2 (all income sources)
    Returns comprehensive breakdown matching Streamlit structure
    """
    
    # 1. Calculate Debt MF taxable income (added to salary)
    debt_mf_income = calculate_debt_mf_taxable_income(debt_stcg, debt_ltcg)
    
    # 2. Calculate Salary Tax (New Regime) including debt MF income
    salary_result = calculate_new_regime_tax(gross_salary, debt_mf_income)
    
    # 3. Calculate Equity Stock Capital Gains Tax
    equity_stock_result = calculate_equity_stock_capital_gains_tax(
        stcg_before, stcg_after, ltcg_before, ltcg_after
    )
    
    # 4. Calculate Equity Mutual Fund Capital Gains Tax
    equity_mf_result = calculate_equity_mf_capital_gains_tax(equity_stcg, equity_ltcg)
    
    # 5. Calculate LTCG exemptions and taxable amounts
    total_equity_stock_ltcg = ltcg_before + ltcg_after
    equity_stock_ltcg_exemption = min(total_equity_stock_ltcg, LTCG_EXEMPTION)
    equity_stock_taxable_ltcg = max(0.0, total_equity_stock_ltcg - LTCG_EXEMPTION)
    
    equity_mf_ltcg_exemption = min(equity_ltcg, LTCG_EXEMPTION)
    equity_mf_taxable_ltcg = max(0.0, equity_ltcg - LTCG_EXEMPTION)
    
    # 6. Aggregate totals
    salary_tax = salary_result["salary_tax"]
    equity_stock_tax = equity_stock_result["total_capital_gains_tax"]
    equity_mf_tax = equity_mf_result["total_capital_gains_tax"]
    
    total_capital_gains_tax = equity_stock_tax + equity_mf_tax
    total_tax_liability = salary_tax + total_capital_gains_tax
    net_payable = total_tax_liability - tds_paid
    
    # 7. Calculate effective rate
    total_income = (
        gross_salary + 
        stcg_before + stcg_after +
        ltcg_before + ltcg_after + 
        equity_stcg + equity_ltcg +
        debt_stcg + debt_ltcg
    )
    effective_rate = (total_tax_liability / total_income * 100) if total_income > 0 else 0.0
    
    return {
        # === SALARY SECTION ===
        "grossSalary": round(gross_salary, 2),
        "tdsDeducted": round(tds_paid, 2),
        "taxableIncome": salary_result["taxable_income"],
        "salaryTax": salary_tax,
        
        # === EQUITY STOCKS SECTION ===
        "equityStocks": {
            "stcgBefore": round(stcg_before, 2),
            "stcgAfter": round(stcg_after, 2),
            "ltcgBefore": round(ltcg_before, 2),
            "ltcgAfter": round(ltcg_after, 2),
            "stcgTax": equity_stock_result["stcg_tax"],
            "ltcgTax": equity_stock_result["ltcg_tax"],
            "totalEquityStockTax": equity_stock_tax,
            "ltcgExemption": round(equity_stock_ltcg_exemption, 2),
            "taxableLtcg": round(equity_stock_taxable_ltcg, 2)
        },
        
        # === MUTUAL FUNDS SECTION ===
        "mutualFunds": {
            "equityStcg": round(equity_stcg, 2),
            "equityLtcg": round(equity_ltcg, 2),
            "equityLtcgExemption": round(equity_mf_ltcg_exemption, 2),
            "equityTaxableLtcg": round(equity_mf_taxable_ltcg, 2),
            "equityStcgTax": equity_mf_result["stcg_tax"],
            "equityLtcgTax": equity_mf_result["ltcg_tax"],
            "equityMfTax": equity_mf_tax,
            "debtStcg": round(debt_stcg, 2),
            "debtLtcg": round(debt_ltcg, 2),
            "debtMfIncomeAddedToSalary": debt_mf_income
        },
        
        # === FINAL TAX SUMMARY ===
        "totalTaxLiability": round(total_tax_liability, 2),
        "capitalGainsTax": round(total_capital_gains_tax, 2),
        "equityStockTax": equity_stock_tax,
        "equityMfTax": equity_mf_tax,
        "effectiveRate": round(effective_rate, 2),
        "tdsAlreadyPaid": round(tds_paid, 2),
        "netPayable": round(net_payable, 2)
    }
