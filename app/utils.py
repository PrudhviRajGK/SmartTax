"""
Tax Calculation Utilities for Indian Income Tax (FY 2024-25)
Place at: app/utils.py
"""

from datetime import date

# ============================================================
# TAX CONSTANTS
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
# INTERNAL HELPER
# ============================================================

def _calculate_slab_tax(income: float) -> float:
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
# 1. SALARY TAX
# ============================================================

def calculate_new_regime_tax(gross_salary: float, extra_income: float = 0.0, hp_income: float = 0.0):
    taxable_income = max(0.0, gross_salary - STANDARD_DEDUCTION + extra_income + hp_income)
    tax = _calculate_slab_tax(taxable_income)
    if taxable_income <= 1_200_000:
        tax = 0.0
    return {
        "gross_salary": round(gross_salary, 2),
        "extra_income": round(extra_income, 2),
        "hp_income_added": round(hp_income, 2),
        "taxable_income": round(taxable_income, 2),
        "salary_tax": round(tax, 2),
    }


# ============================================================
# 2. EQUITY STOCKS
# ============================================================

def calculate_equity_stock_capital_gains_tax(
    stcg_before: float, stcg_after: float,
    ltcg_before: float, ltcg_after: float
):
    stcg_tax = 0.0
    if stcg_before > 0:
        stcg_tax += stcg_before * 0.15
    if stcg_after > 0:
        stcg_tax += stcg_after * 0.20

    total_ltcg = ltcg_before + ltcg_after
    ltcg_tax = 0.0
    if total_ltcg > LTCG_EXEMPTION:
        taxable_ltcg = total_ltcg - LTCG_EXEMPTION
        ratio_before = ltcg_before / total_ltcg if total_ltcg else 0.0
        ratio_after  = ltcg_after  / total_ltcg if total_ltcg else 0.0
        ltcg_tax += taxable_ltcg * ratio_before * 0.10
        ltcg_tax += taxable_ltcg * ratio_after  * 0.125

    return {
        "stcg_tax": round(stcg_tax, 2),
        "ltcg_tax": round(ltcg_tax, 2),
        "total_capital_gains_tax": round(stcg_tax + ltcg_tax, 2),
    }


# ============================================================
# 3. EQUITY MUTUAL FUNDS
# ============================================================

def calculate_equity_mf_capital_gains_tax(equity_stcg: float, equity_ltcg: float):
    stcg_tax = max(0.0, equity_stcg) * 0.20
    taxable_ltcg = max(0.0, equity_ltcg - LTCG_EXEMPTION)
    ltcg_tax = taxable_ltcg * 0.125
    return {
        "stcg_tax": round(stcg_tax, 2),
        "ltcg_tax": round(ltcg_tax, 2),
        "total_capital_gains_tax": round(stcg_tax + ltcg_tax, 2),
    }


# ============================================================
# 4. DEBT MUTUAL FUNDS
# ============================================================

def calculate_debt_mf_taxable_income(debt_stcg: float, debt_ltcg: float):
    return round((debt_stcg if debt_stcg > 0 else 0) + (debt_ltcg if debt_ltcg > 0 else 0), 2)


# ============================================================
# 5. HOUSE PROPERTY — FIXED (Sec 23 vacancy + Sec 25A unrealized)
# ============================================================

class PropertyType(str):
    SELF_OCCUPIED = "SOP"
    LET_OUT = "LOP"
    DEEMED_LET_OUT = "DLOP"


def calculate_house_property_income(
    property_type: str,
    gross_rent_received: float = 0.0,
    expected_market_rent: float = 0.0,
    municipal_taxes_paid: float = 0.0,
    home_loan_interest: float = 0.0,
    vacancy_loss: float = 0.0,
    unrealized_rent: float = 0.0,
    pre_construction_interest: float = 0.0,
) -> dict:
    """
    House Property Income/Loss — New Regime FY 2024-25.

    GAV Rules (Sec 23):
      SOP  → GAV = 0, no deductions.
      LOP  → GAV = max(actual, expected), with vacancy & unrealized adjustments.
      DLOP → GAV = expected_market_rent.

    Vacancy adjustment (Sec 23(1)(c)):
      If actual_rent + vacancy_loss >= expected_rent → vacancy is genuine
      → GAV = actual_rent (not the higher expected rent).

    Unrealized rent recovery (Sec 25A):
      Arrears from a previous tenant → added directly to GAV.

    Pre-construction interest:
      Included in Sec 24(b) total (annual instalment).

    HP Loss: cannot offset salary under New Regime.
    Carry forward 8 years, intra-head only.
    """
    result = {
        "property_type": property_type,
        "gross_annual_value": 0.0,
        "municipal_taxes_paid": 0.0,
        "net_annual_value": 0.0,
        "standard_deduction_24a": 0.0,
        "interest_deduction_24b": 0.0,
        "hp_income_or_loss": 0.0,
        "can_setoff_against_salary": False,
        "carryforward_years": 0,
        "notes": [],
    }

    # ── SOP ─────────────────────────────────────────────────────────
    if property_type == "SOP":
        result["notes"].append(
            "Self-Occupied under New Regime: NAV = ₹0. No interest deduction under Sec 24(b)."
        )
        return result

    # ── Step 1: Base GAV ─────────────────────────────────────────────
    if property_type == "LOP":
        base_gav = max(gross_rent_received, expected_market_rent)

        # Vacancy adjustment — Sec 23(1)(c)
        if vacancy_loss > 0:
            adjusted_actual = gross_rent_received + vacancy_loss
            if adjusted_actual >= expected_market_rent:
                base_gav = gross_rent_received          # genuine vacancy
                result["notes"].append(
                    f"Vacancy (Sec 23): actual ₹{gross_rent_received:,.0f} + "
                    f"vacancy ₹{vacancy_loss:,.0f} = ₹{adjusted_actual:,.0f} "
                    f"≥ expected ₹{expected_market_rent:,.0f} → GAV = actual rent."
                )
    else:  # DLOP
        base_gav = expected_market_rent
        result["notes"].append("DLOP: GAV = Expected Market Rent.")

    # ── Step 2: Unrealized rent recovery — Sec 25A ───────────────────
    gav = base_gav + unrealized_rent
    if unrealized_rent > 0:
        result["notes"].append(
            f"Unrealized rent recovered ₹{unrealized_rent:,.0f} added to GAV (Sec 25A)."
        )

    # ── Step 3: NAV ──────────────────────────────────────────────────
    nav = max(0.0, gav - municipal_taxes_paid)

    # ── Step 4: Standard deduction 30% — Sec 24(a) ──────────────────
    std_deduction = nav * 0.30

    # ── Step 5: Interest — Sec 24(b), fully deductible for LOP/DLOP ──
    interest_deduction = max(0.0, home_loan_interest + pre_construction_interest)
    if pre_construction_interest > 0:
        result["notes"].append(
            f"Pre-construction interest instalment ₹{pre_construction_interest:,.0f} "
            f"included in Sec 24(b)."
        )

    # ── Step 6: HP income / loss ─────────────────────────────────────
    hp_income = nav - std_deduction - interest_deduction

    result.update({
        "gross_annual_value":    round(gav, 2),
        "municipal_taxes_paid":  round(municipal_taxes_paid, 2),
        "net_annual_value":      round(nav, 2),
        "standard_deduction_24a": round(std_deduction, 2),
        "interest_deduction_24b": round(interest_deduction, 2),
        "hp_income_or_loss":     round(hp_income, 2),
    })

    if hp_income < 0:
        result["carryforward_years"] = 8
        result["notes"].append(
            f"HP Loss ₹{abs(round(hp_income)):,.0f} cannot be set-off against salary "
            f"under New Regime. Carry forward 8 years (intra-head only)."
        )
    else:
        result["notes"].append("HP Income will be added to total taxable income.")

    return result
