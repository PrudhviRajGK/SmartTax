import pandas as pd
from datetime import date

CUT_OFF_DATE = date(2024, 7, 23)

def parse_amount(val):
    if pd.isna(val):
        return 0.0

    s = str(val).replace(",", "").strip()
    if s.startswith("(") and s.endswith(")"):
        return -float(s[1:-1])

    try:
        return float(s)
    except:
        return 0.0


class GrowwCapitalGainsParser:
    def parse(self, file):
        df = pd.read_excel(file, header=None)

        stcg_before = stcg_after = 0.0
        ltcg_before = ltcg_after = 0.0

        current_section = None
        headers = None

        for i in range(len(df)):
            first_cell = str(df.iloc[i, 0]).lower()

            # ---- Detect section ----
            if "short term trades" in first_cell:
                current_section = "STCG"
                headers = [str(x).lower().strip() for x in df.iloc[i + 1]]
                continue

            if "long term trades" in first_cell:
                current_section = "LTCG"
                headers = [str(x).lower().strip() for x in df.iloc[i + 1]]
                continue

            # ---- Stop on totals or new section ----
            if "total" in first_cell or "term trades" in first_cell:
                current_section = None
                headers = None
                continue

            # ---- Parse trades ----
            if current_section and headers:
                row = df.iloc[i]

                try:
                    pnl_idx = headers.index("realised p&l")
                    sell_idx = headers.index("sell date")
                except ValueError:
                    continue

                pnl = parse_amount(row[pnl_idx])
                sell_date = pd.to_datetime(
                    row[sell_idx], dayfirst=True, errors="coerce"
                )

                if pd.isna(sell_date):
                    continue

                is_before = sell_date.date() < CUT_OFF_DATE

                if current_section == "STCG":
                    if is_before:
                        stcg_before += pnl
                    else:
                        stcg_after += pnl

                elif current_section == "LTCG":
                    if is_before:
                        ltcg_before += pnl
                    else:
                        ltcg_after += pnl

        return {
            "stcg_before": round(stcg_before, 2),
            "stcg_after": round(stcg_after, 2),
            "ltcg_before": round(ltcg_before, 2),
            "ltcg_after": round(ltcg_after, 2),
        }
