import streamlit as st

# ------------------------------------------------------------
# FORCE CLEAR STREAMLIT CACHE (DEV MODE ONLY)
# ------------------------------------------------------------
st.cache_data.clear()

from form16_parser import Form16Parser
from groww_parser import GrowwCapitalGainsParser
from mutual_fund_parser import MutualFundCapitalGainsParser
from utils import (
    calculate_new_regime_tax,
    calculate_equity_stock_capital_gains_tax,
    calculate_equity_mf_capital_gains_tax,
    calculate_debt_mf_taxable_income,
    LTCG_EXEMPTION,
)

st.set_page_config(
    page_title="SmartTax",
    layout="wide"
)


def main():
    st.title("SmartTax")
    st.caption("Salary • Equity Stocks • Mutual Funds (ITR-2 Compliant)")

    # ============================================================
    # 1. SALARY
    # ============================================================

    st.header("Salary Income")

    form16_file = st.file_uploader(
        "Upload Form-16 (PDF)",
        type=["pdf"]
    )

    gross_salary = 0.0
    tds_paid = 0.0

    if form16_file:
        parser = Form16Parser()
        data = parser.parse(form16_file)

        gross_salary = data.get("gross_salary", 0.0)
        tds_paid = data.get("tds_paid", 0.0)

        c1, c2, c3 = st.columns(3)
        c1.metric("Employer", data.get("employer_name", "Unknown"))
        c2.metric("Gross Salary", f"₹{gross_salary:,.2f}")
        c3.metric("TDS Deducted", f"₹{tds_paid:,.2f}")

    # ============================================================
    # 2. CAPITAL GAINS
    # ============================================================

    st.markdown("---")
    st.header("Capital Gains")

    col_stocks, col_mf = st.columns(2)

    stock_tax = 0.0
    mf_tax = 0.0
    debt_extra_income = 0.0

    # ============================================================
    # LEFT COLUMN — EQUITY STOCKS
    # ============================================================

    with col_stocks:
        st.subheader("Equity Stocks")

        broker = st.selectbox(
            "Select Broker",
            ["Groww"],
            help="Trade-wise equity stock transactions"
        )

        stock_file = st.file_uploader(
            "Upload Equity Trades Report (Excel)",
            type=["xlsx"],
            key="stocks"
        )

        if stock_file and broker == "Groww":
            parser = GrowwCapitalGainsParser()
            stock_data = parser.parse(stock_file)

            st.markdown("Parsed Stock Gains")
            st.json(stock_data)

            tax = calculate_equity_stock_capital_gains_tax(
                stock_data["stcg_before"],
                stock_data["stcg_after"],
                stock_data["ltcg_before"],
                stock_data["ltcg_after"],
            )

            stock_tax = tax["total_capital_gains_tax"]

            st.markdown("Stock Tax Computation")
            c1, c2 = st.columns(2)
            c1.metric("STCG Tax", f"₹{tax['stcg_tax']:,.2f}")
            c2.metric("LTCG Tax", f"₹{tax['ltcg_tax']:,.2f}")

    # ============================================================
    # RIGHT COLUMN — MUTUAL FUNDS
    # ============================================================

    with col_mf:
        st.subheader("Mutual Funds")

        mf_file = st.file_uploader(
            "Upload Mutual Fund Capital Gains Summary (Excel)",
            type=["xlsx"],
            key="mf"
        )

        if mf_file:
            parser = MutualFundCapitalGainsParser()
            mf = parser.parse(mf_file)

            st.markdown("Parsed Mutual Fund Gains")
            st.json(mf)

            # ---------------- EQUITY MUTUAL FUNDS ----------------
            eq_tax = calculate_equity_mf_capital_gains_tax(
                mf["equity_stcg"],
                mf["equity_ltcg"]
            )

            mf_tax = eq_tax["total_capital_gains_tax"]

            st.markdown("Equity Mutual Funds")
            st.write(f"STCG: ₹{mf['equity_stcg']:,.2f}")
            st.write(f"LTCG: ₹{mf['equity_ltcg']:,.2f}")
            st.write(f"LTCG Exemption: ₹{LTCG_EXEMPTION:,.2f}")
            st.write(
                f"Taxable LTCG: ₹{max(0, mf['equity_ltcg'] - LTCG_EXEMPTION):,.2f}"
            )
            st.write(f"Equity MF Tax: ₹{mf_tax:,.2f}")

            # ---------------- DEBT MUTUAL FUNDS ----------------
            debt_extra_income = calculate_debt_mf_taxable_income(
                mf["debt_stcg"],
                mf["debt_ltcg"]
            )

            st.markdown("Debt Mutual Funds")
            st.write(
                "Debt mutual fund gains are added to income and "
                "taxed as per slab under the new regime."
            )
            st.write(f"Debt MF STCG: ₹{mf['debt_stcg']:,.2f}")
            st.write(f"Debt MF LTCG: ₹{mf['debt_ltcg']:,.2f}")
            st.write(f"Added to Income: ₹{debt_extra_income:,.2f}")

    # ============================================================
    # 3. FINAL TAX SUMMARY
    # ============================================================

    st.markdown("---")
    st.header("Final Tax Summary (New Regime)")

    salary_res = calculate_new_regime_tax(
        gross_salary=gross_salary,
        extra_income=debt_extra_income
    )

    salary_tax = salary_res["salary_tax"]
    total_tax = salary_tax + stock_tax + mf_tax
    net_payable = total_tax - tds_paid

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Salary + Debt MF Tax", f"₹{salary_tax:,.2f}")
    c2.metric("Stock Capital Gains Tax", f"₹{stock_tax:,.2f}")
    c3.metric("Mutual Fund Equity Tax", f"₹{mf_tax:,.2f}")
    c4.metric("Total Tax Liability", f"₹{total_tax:,.2f}")

    if net_payable < 0:
        st.success(f"Refund Due: ₹{abs(net_payable):,.2f}")
    else:
        st.error(f"Tax Payable: ₹{net_payable:,.2f}")


if __name__ == "__main__":
    main()
