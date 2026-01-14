⚡ SmartTax AI

Automated Income Tax Computation from Form-16 & Capital Gains Reports

SmartTax AI is an end-to-end tax automation tool that extracts salary and capital gains information from real financial documents (PDFs & Excel reports) and computes accurate tax liability under the Indian New Tax Regime.

It combines PDF parsing, OCR fallback, structured Excel analysis, and rule-based tax computation into a single Streamlit application that delivers one-click tax results.

🚀 What Problem Does SmartTax Solve?

Filing taxes in India often involves:

Manually reading Form-16 PDFs

Copying salary & TDS values

Parsing capital gains reports from brokers

Applying changing tax rules correctly

SmartTax automates this entire workflow by:

Extracting salary & TDS directly from Form-16 PDFs

Parsing capital gains from broker reports (Groww)

Applying updated tax slab & capital gains rules

Producing final tax payable or refund instantly

🧠 Core Capabilities
1️⃣ Intelligent Form-16 Parsing (PDF)

SmartTax extracts structured financial data from unstructured PDFs, handling multiple real-world formats.

Extraction Strategy (Robust by Design):

Table-based extraction using pdfplumber

Regex-based text parsing as a fallback

OCR (Tesseract + PyMuPDF) for scanned/image PDFs

Key Fields Extracted

Employer Name

Gross Salary (Section 17(1))

TDS / Tax Deducted

Special safeguards are implemented to:

Avoid misreading income totals as tax

Prefer “Tax Deducted” over ambiguous totals

Handle comma-formatted and noisy numeric values

2️⃣ Capital Gains Parsing (Groww Reports)

SmartTax parses Groww capital gains Excel reports without relying on fixed column positions.

Logic Highlights

Automatically detects STCG vs LTCG sections

Extracts:

Realised P&L

Sell dates

Splits gains before & after 23 July 2024

Correctly handles:

Losses

Negative values

Mixed date formats

This enables accurate application of revised capital gains tax rules.

3️⃣ Accurate Tax Computation Engine
🧾 Salary Tax (New Regime – FY 2024+)

Applies ₹75,000 standard deduction

Implements slab-wise progressive taxation

Applies full rebate up to ₹12,00,000

Adds 4% health & education cess

📈 Capital Gains Tax

STCG

15% before 23 Jul 2024

20% after

LTCG

₹1,25,000 exemption

10% before

12.5% after

Automatically tracks LTCG losses available for set-off

4️⃣ Unified Tax Summary

SmartTax combines:

Salary tax

Capital gains tax

TDS already paid

to compute:

Final tax payable or

Refund amount

All results are presented in a clean Streamlit dashboard.

🖥️ Application Interface

Built with Streamlit, the UI provides:

File upload for Form-16 (PDF)

File upload for Capital Gains report (Excel)

Clear metric cards

Automatic refund / payable indicators

Real-time computation

📂 Project Structure
SmartTax/
├── app.py                      # Streamlit application entry point
├── form16_parser.py            # PDF + OCR salary & TDS extraction
├── groww_parser.py             # Capital gains Excel parser
├── utils.py                    # Tax calculation logic
├── requirements.txt            # Dependencies
└── README.md                   # Project documentation

🛠️ Tech Stack

Python

Streamlit – UI & app framework

pdfplumber – Table extraction from PDFs

PyMuPDF (fitz) – PDF image rendering

Tesseract OCR – Scanned PDF fallback

Pandas – Excel parsing & data handling

Regex – Pattern-based text extraction

▶️ How to Run Locally
git clone https://github.com/PrudhviRajGK/SmartTax.git
cd SmartTax
pip install -r requirements.txt
streamlit run app.py


⚠️ If using OCR, ensure Tesseract OCR is installed and the path is configured.

📌 Why This Project Stands Out

✔ Handles real financial documents, not toy datasets
✔ Uses multi-layer extraction logic (tables → text → OCR)
✔ Implements real Indian tax rules correctly
✔ Demonstrates:

Data parsing

Rule-based systems

Edge-case handling

Production-style defensive coding

This is the kind of project that shows engineering thinking, not just scripting.

🔮 Possible Extensions

Support for additional brokers (Zerodha, Upstox)

Old vs New tax regime comparison

Export tax summary as PDF

API version for integration with fintech apps

👤 Author

Prudhvi Raj
GitHub: https://github.com/PrudhviRajGK

⚡ Final honest take

This README + your code makes SmartTax look like a serious internship-level project, especially for:

Data Analyst (FinTech)

Data Engineering Intern

Applied ML / Automation Intern

If you want next:

resume bullet points from this

interview questions from this code

or a LinkedIn project description

Just say the word.
