import streamlit as st

from form16_parser import Form16Parser
from groww_parser import GrowwCapitalGainsParser
from utils import calculate_new_regime_tax, calculate_capital_gains_tax

st.set_page_config(page_title="SmartTax AI", layout="wide", page_icon="⚡")


def main():
    st.title("⚡ SmartTax AI")
    st.caption("Form-16 + Capital Gains → One Click Tax")

    # ================== SALARY ==================
    st.header("1️⃣ Upload Form-16")
    form16_file = st.file_uploader("Upload Form-16 (PDF)", type=["pdf"])

    salary_tax = 0.0
    tds_paid = 0.0

    if form16_file:
        parser = Form16Parser()
        data = parser.parse(form16_file)

        st.success("Form-16 Processed Successfully")

        col1, col2, col3 = st.columns(3)
        col1.metric("Employer", data.get("employer_name", "Unknown"))
        col2.metric("Gross Salary", f"₹{data.get('gross_salary', 0):,.2f}")
        col3.metric("TDS Deducted", f"₹{data.get('tds_paid', 0):,.2f}")

        salary_res = calculate_new_regime_tax(data.get("gross_salary", 0))
        salary_tax = salary_res["salary_tax"]
        tds_paid = data.get("tds_paid", 0)

    # ================== CAPITAL GAINS ==================
    st.markdown("---")
    st.header("2️⃣ Capital Gains")

    platform = st.selectbox("Select Platform", ["Groww"])

    cg_file = st.file_uploader(
        "Upload Capital Gains Report (Excel)",
        type=["xlsx"]
    )

    capital_tax = 0.0

    if cg_file and platform == "Groww":
        cg_parser = GrowwCapitalGainsParser()
        cg_data = cg_parser.parse(cg_file)

        # ---- SAFE extraction (no KeyErrors) ----
        stcg_before = cg_data.get("stcg_before", 0.0)
        stcg_after = cg_data.get("stcg_after", 0.0)
        ltcg_before = cg_data.get("ltcg_before", 0.0)
        ltcg_after = cg_data.get("ltcg_after", 0.0)

        cg_tax = calculate_capital_gains_tax(
            stcg_before,
            stcg_after,
            ltcg_before,
            ltcg_after
        )

        st.subheader("Capital Gains Breakdown")

        c1, c2 = st.columns(2)

        with c1:
            st.write(f"**STCG (Before 23 Jul 2024):** ₹{stcg_before:,.2f}")
            st.write(f"**STCG (After 23 Jul 2024):** ₹{stcg_after:,.2f}")
            st.write(f"**LTCG (Before 23 Jul 2024):** ₹{ltcg_before:,.2f}")
            st.write(f"**LTCG (After 23 Jul 2024):** ₹{ltcg_after:,.2f}")

        with c2:
            st.write(f"**STCG Tax:** ₹{cg_tax['stcg_tax']:,.2f}")
            st.write(f"**LTCG Tax:** ₹{cg_tax['ltcg_tax']:,.2f}")

            if cg_tax["ltcg_loss_available_for_setoff"] > 0:
                st.info(
                    f"📉 **LTCG Loss available for set-off:** "
                    f"₹{cg_tax['ltcg_loss_available_for_setoff']:,.2f}"
                )

        capital_tax = cg_tax["total_capital_gains_tax"]

    # ================== FINAL TAX ==================
    st.markdown("---")
    st.header("3️⃣ Final Tax Liability")

    total_tax = salary_tax + capital_tax
    net_payable = total_tax - tds_paid

    col1, col2, col3 = st.columns(3)
    col1.metric("Salary Tax", f"₹{salary_tax:,.2f}")
    col2.metric("Capital Gains Tax", f"₹{capital_tax:,.2f}")
    col3.metric("Total Tax", f"₹{total_tax:,.2f}")

    if net_payable < 0:
        st.balloons()
        st.success(f"🎉 **REFUND:** ₹{abs(net_payable):,.2f}")
    else:
        st.error(f"💸 **TAX PAYABLE:** ₹{net_payable:,.2f}")


if __name__ == "__main__":
    main()
