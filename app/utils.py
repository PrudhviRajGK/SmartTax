"""
Tax Calculation Utilities for Indian Income Tax (FY 2024-25)

This module provides core tax calculation functions for:
- Salary tax under New Tax Regime
- Equity stock capital gains (STCG/LTCG with date-based rates)
- Equity mutual fund capital gains
- Debt mutual fund taxable income

All calculations follow Indian Income Tax Act provisions for FY 2024-25.
Tax rates changed on July 23, 2024 - functions handle both pre and post-change rates.

Constants:
    CUT_OFF_DATE: July 23, 2024 - date when tax rates changed
    STANDARD_DEDUCTION: ₹75,000 for salaried individuals
    LTCG_EXEMPTION: ₹1,25,000 annual exemption on equity LTCG
    CESS_RATE: 4% Health & Education Cess on total income tax
    NEW_REGIME_SLABS: Progressive tax slabs for new regime

Author: SmartTax Team
Last Updated: 2024
"""

from datetime import date

# ============================================================
# TAX CONSTANTS (FY 2024–25 | New Regime | ITR-2 Aligned)
# ============================================================

# Critical date: Tax rates changed on July 23, 2024
CUT_OFF_DATE = date(2024, 7, 23)

# Standard deduction for salaried individuals (New Regime)
STANDARD_DEDUCTION = 75_000

# Annual LTCG exemption on equity shares and equity mutual funds
LTCG_EXEMPTION = 125_000

# Health & Education Cess applied on total income tax
CESS_RATE = 0.04

# New Tax Regime slab rates (no deductions except standard deduction)
# Format: (upper_limit, rate)
NEW_REGIME_SLABS = [
    (400_000, 0.00),    # Up to ₹4L: 0%
    (800_000, 0.05),    # ₹4L - ₹8L: 5%
    (1_200_000, 0.10),  # ₹8L - ₹12L: 10%
    (1_600_000, 0.15),  # ₹12L - ₹16L: 15%
    (2_000_000, 0.20),  # ₹16L - ₹20L: 20%
    (2_400_000, 0.25),  # ₹20L - ₹24L: 25%
    (float("inf"), 0.30),  # Above ₹24L: 30%
]

# ============================================================
# INTERNAL HELPER — SLAB TAX ENGINE
# ============================================================

def _calculate_slab_tax(income: float) -> float:
    """
    Calculate tax using progressive slab rates (New Tax Regime).
    
    This is an internal helper function that applies tax slabs progressively.
    Each slab is taxed at its respective rate, not the entire income.
    
    Args:
        income: Taxable income amount in INR
        
    Returns:
        Calculated tax amount (before cess)
        
    Example:
        For income of ₹10,00,000:
        - First ₹4L at 0% = ₹0
        - Next ₹4L at 5% = ₹20,000
        - Next ₹2L at 10% = ₹20,000
        - Total = ₹40,000
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
    
    Returns tax WITHOUT cess (cess is applied on total tax liability)
    """

    taxable_income = max(
        0.0,
        gross_salary - STANDARD_DEDUCTION + extra_income
    )

    tax = _calculate_slab_tax(taxable_income)

    # Section 87A rebate (new regime)
    if taxable_income <= 1_200_000:
        tax = 0.0

    return {
        "gross_salary": round(gross_salary, 2),
        "extra_income": round(extra_income, 2),
        "taxable_income": round(taxable_income, 2),
        "salary_tax": round(tax, 2),  # WITHOUT cess
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
