import pandas as pd
from datetime import date

CUT_OFF_DATE = date(2024, 7, 23)


def parse_amount(val):
    if pd.isna(val):
        return 0.0

    s = str(val).replace(",", "").strip()

    if s.startswith("(") and s.endswith(")"):
        try:
            return -float(s[1:-1])
        except:
            return 0.0

    try:
        return float(s)
    except:
        return 0.0


class GrowwCapitalGainsParser:
    """
    Robust parser for Groww Equity Trades report
    """

    def parse(self, file):
        df = pd.read_excel(file, header=None)

        stcg_before = stcg_after = 0.0
        ltcg_before = ltcg_after = 0.0

        mode = None
        headers = None

        for i in range(len(df)):
            row = df.iloc[i]
            first_cell = str(row[0]).lower()

            # ---------------- Detect STCG section ----------------
            if "short term trades" in first_cell:
                mode = "STCG"
                headers = None
                continue

            # ---------------- Detect LTCG section ----------------
            if "long term trades" in first_cell:
                mode = "LTCG"
                headers = None
                continue

            # ---------------- Detect header row ----------------
            if mode and headers is None:
                headers = [str(x).lower().strip() for x in row]
                continue

            # ---------------- Exit section on TOTAL ----------------
            if mode and "total" in first_cell:
                mode = None
                headers = None
                continue

            # ---------------- Parse trade rows ----------------
            if mode and headers:
                try:
                    pnl_idx = next(
                        i for i, h in enumerate(headers)
                        if "p&l" in h or "pnl" in h
                    )
                    sell_idx = next(
                        i for i, h in enumerate(headers)
                        if "sell" in h and "date" in h
                    )
                except StopIteration:
                    continue

                pnl = parse_amount(row[pnl_idx])
                sell_date = pd.to_datetime(
                    row[sell_idx], dayfirst=True, errors="coerce"
                )

                if pd.isna(sell_date):
                    continue

                is_before = sell_date.date() < CUT_OFF_DATE

                if mode == "STCG":
                    if is_before:
                        stcg_before += pnl
                    else:
                        stcg_after += pnl

                elif mode == "LTCG":
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
