from datetime import date

CUT_OFF_DATE = date(2024, 7, 23)

def calculate_capital_gains_tax(
    stcg_before,
    stcg_after,
    ltcg_before,
    ltcg_after
):
    """
    Capital Gains Tax Calculation
    - STCG: 15% before 23 Jul 2024, 20% after
    - LTCG: 10% before, 12.5% after
    - LTCG exemption: ₹1,25,000
    - Losses are NOT taxed
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
    ltcg_loss_for_setoff = 0.0

    if total_ltcg <= 0:
        # Entire LTCG is loss → available for set-off
        ltcg_loss_for_setoff = abs(total_ltcg)

    else:
        taxable_ltcg = max(0, total_ltcg - 125000)

        if taxable_ltcg > 0:
            # Proportionate taxation
            ratio_before = ltcg_before / total_ltcg if total_ltcg else 0
            ratio_after = ltcg_after / total_ltcg if total_ltcg else 0

            ltcg_tax += taxable_ltcg * ratio_before * 0.10
            ltcg_tax += taxable_ltcg * ratio_after * 0.125

    return {
        "stcg_tax": round(stcg_tax, 2),
        "ltcg_tax": round(ltcg_tax, 2),
        "total_capital_gains_tax": round(stcg_tax + ltcg_tax, 2),
        "ltcg_loss_available_for_setoff": round(ltcg_loss_for_setoff, 2),
    }





def calculate_new_regime_tax(gross_salary):
    standard_deduction = 75000
    taxable_income = max(0, gross_salary - standard_deduction)

    tax = 0.0

    if taxable_income > 2400000:
        tax += (taxable_income - 2400000) * 0.30
        tax += (2400000 - 2000000) * 0.25
        tax += (2000000 - 1600000) * 0.20
        tax += (1600000 - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05

    elif taxable_income > 2000000:
        tax += (taxable_income - 2000000) * 0.25
        tax += (2000000 - 1600000) * 0.20
        tax += (1600000 - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05

    elif taxable_income > 1600000:
        tax += (taxable_income - 1600000) * 0.20
        tax += (1600000 - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05

    elif taxable_income > 1200000:
        tax += (taxable_income - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05

    elif taxable_income > 800000:
        tax += (taxable_income - 800000) * 0.10
        tax += (800000 - 400000) * 0.05

    elif taxable_income > 400000:
        tax += (taxable_income - 400000) * 0.05

    if taxable_income <= 1200000:
        tax = 0.0

    cess = tax * 0.04

    return {
        "gross_salary": gross_salary,
        "taxable_income": taxable_income,
        "salary_tax": tax + cess
    }
