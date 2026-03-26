import pandas as pd


class MutualFundCapitalGainsParser:
    """
    Parser for Groww Mutual Fund Capital Gains SUMMARY sheet
    (exactly matching rows 11–13 in your Excel)
    """

    def parse(self, file):
        try:
            df = pd.read_excel(file, header=None)
        except Exception as e:
            raise ValueError("Unable to read the uploaded file. Please ensure it's a valid Excel file (.xlsx or .xls).")

        if df.empty or len(df) < 5:
            raise ValueError("The uploaded file appears to be empty or invalid. Please upload a valid mutual fund capital gains report.")

        result = {
            "equity_stcg": 0.0,
            "equity_ltcg": 0.0,
            "debt_stcg": 0.0,
            "debt_ltcg": 0.0,
        }

        header_row_index = None

        # --------------------------------------------------
        # 1. Find the header row: "Asset Class / Category"
        # --------------------------------------------------
        for i, row in df.iterrows():
            cell = str(row[2]).strip().lower()  # column C
            if cell == "asset class / category":
                header_row_index = i
                break

        if header_row_index is None:
            # Header not found → return zeros safely
            raise ValueError("This doesn't appear to be a valid mutual fund capital gains report. Please ensure you've uploaded the correct file with 'Asset Class / Category' column.")

        # --------------------------------------------------
        # 2. Parse rows BELOW header (actual data rows)
        # --------------------------------------------------
        found_data = False
        for _, row in df.iloc[header_row_index + 1:].iterrows():
            label = str(row[2]).strip().lower()  # Column C

            # Stop if table ends
            if not label or label == "nan":
                break

            stcg = self._parse_amount(row[3])  # Column D
            ltcg = self._parse_amount(row[4])  # Column E

            # ---------------- EQUITY ----------------
            if label == "equity":
                result["equity_stcg"] += stcg
                result["equity_ltcg"] += ltcg
                found_data = True

            # ---------------- DEBT ----------------
            elif "debt" in label:
                result["debt_stcg"] += stcg
                result["debt_ltcg"] += ltcg
                found_data = True

        if not found_data:
            raise ValueError("No valid mutual fund data found in the uploaded file. Please ensure you've uploaded a complete capital gains report.")

        return result

    def _parse_amount(self, val):
        if pd.isna(val):
            return 0.0

        try:
            return float(str(val).replace(",", "").strip())
        except:
            return 0.0
