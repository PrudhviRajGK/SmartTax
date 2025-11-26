def calculate_new_regime_tax(gross_salary):
    """
    Calculates income tax based on the New Tax Regime (FY 2025-26).
    - Standard Deduction: ₹75,000
    - Tax-Free Income (Rebate 87A): Up to ₹12 Lakhs taxable income is tax-free.
    
    Slabs (Budget 2025):
    0 - 4L   : Nil
    4L - 8L  : 5%
    8L - 12L : 10%
    12L - 16L: 15%
    16L - 20L: 20%
    20L - 24L: 25%
    > 24L    : 30%
    """
    
    # 1. Standard Deduction (Increased to 75k)
    standard_deduction = 75000
    taxable_income = max(0, gross_salary - standard_deduction)
    
    tax = 0.0
    
    # 2. Tax Slabs (Latest FY 2025-26 Rules)
    # > 24L
    if taxable_income > 2400000:
        tax += (taxable_income - 2400000) * 0.30
        tax += (2400000 - 2000000) * 0.25
        tax += (2000000 - 1600000) * 0.20
        tax += (1600000 - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05
    # 20L - 24L
    elif taxable_income > 2000000:
        tax += (taxable_income - 2000000) * 0.25
        tax += (2000000 - 1600000) * 0.20
        tax += (1600000 - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05
    # 16L - 20L
    elif taxable_income > 1600000:
        tax += (taxable_income - 1600000) * 0.20
        tax += (1600000 - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05
    # 12L - 16L
    elif taxable_income > 1200000:
        tax += (taxable_income - 1200000) * 0.15
        tax += (1200000 - 800000) * 0.10
        tax += (800000 - 400000) * 0.05
    # 8L - 12L
    elif taxable_income > 800000:
        tax += (taxable_income - 800000) * 0.10
        tax += (800000 - 400000) * 0.05
    # 4L - 8L
    elif taxable_income > 400000:
        tax += (taxable_income - 400000) * 0.05
    
    # 3. Rebate u/s 87A
    # Budget 2025: If taxable income <= 12 Lakhs, Tax is 0.
    if taxable_income <= 1200000:
        tax = 0.0

    # 4. Health & Education Cess (4%)
    cess = tax * 0.04
    total_tax = tax + cess

    return {
        "gross_salary": gross_salary,
        "standard_deduction": standard_deduction,
        "taxable_income": taxable_income,
        "base_tax": tax,
        "cess": cess,
        "final_tax": total_tax
    }