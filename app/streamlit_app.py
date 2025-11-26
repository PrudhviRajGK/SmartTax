import streamlit as st
from form16_parser import Form16Parser
from utils import calculate_new_regime_tax

st.set_page_config(page_title="SmartTax AI", layout="wide", page_icon="⚡")

def main():
    st.title("⚡ SmartTax: Automated AI Assistant")
    st.caption("Upload Form-16 -> Auto-Extract -> Instant Result")
    
    uploaded_file = st.file_uploader("Upload Form-16 (PDF)", type=["pdf"])

    if uploaded_file:
        with st.spinner("AI is analyzing tables and extracting data..."):
            parser = Form16Parser()
            data = parser.parse(uploaded_file)

            st.success("Document Processed Successfully")
            
            col1, col2, col3 = st.columns(3)
            col1.metric("Employer", data['employer_name'])
            col2.metric("Gross Salary Extracted", f"₹{data['gross_salary']:,.2f}")
            col3.metric("TDS Deducted", f"₹{data['tds_paid']:,.2f}")
            
            st.markdown("---")
            
            # CALCULATION ENGINE
            if data['gross_salary'] > 0:
                res = calculate_new_regime_tax(data['gross_salary'])
                
                st.subheader("New Regime Tax Liability")
                c1, c2 = st.columns([2, 1])
                
                with c1:
                    st.write(f"**Gross Income:** ₹{res['gross_salary']:,.2f}")
                    st.write(f"**(-) Standard Deduction:** ₹{res['standard_deduction']:,.2f}")
                    st.markdown("---")
                    st.write(f"**Taxable Income:** ₹{res['taxable_income']:,.2f}")
                    st.write(f"**Base Tax:** ₹{res['base_tax']:,.2f}")
                    st.write(f"**Cess (4%):** ₹{res['cess']:,.2f}")
                
                with c2:
                    st.markdown("### Final Tax")
                    st.metric(label="Amount to Pay", value=f"₹{res['final_tax']:,.2f}")
                    
                    diff = data['tds_paid'] - res['final_tax']
                    if diff > 0:
                        st.balloons()
                        st.success(f"🎉 **REFUND: ₹{diff:,.2f}**")
                    else:
                        st.error(f"Due: ₹{abs(diff):,.2f}")
            else:
                st.warning("Could not extract salary. Please try a different file.")

if __name__ == "__main__":
    main()