# SmartTax - Enterprise Tax Filing Platform

**Production-grade Indian Income Tax Return (ITR) filing application for FY 2024-25**

SmartTax is a privacy-first, enterprise-level tax filing platform that handles salary income, equity stock trading, and mutual fund investments. Built with React + TypeScript frontend and Python FastAPI backend.

[![Deploy Backend](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat&logo=render)](https://render.com)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**🚀 Quick Deploy**: [15-Minute Deployment Guide](DEPLOYMENT_QUICKSTART.md)

---

## 🎯 Features

### Core Functionality
- **ITR-1 Filing**: Salary income with Form-16 parsing
- **ITR-2 Filing**: Salary + Capital gains (equity stocks & mutual funds)
- **Automated Parsing**: 
  - Form-16 PDF (OCR + table extraction)
  - Groww/Zerodha equity trade reports (Excel)
  - Mutual fund capital gains statements (Excel)
- **Tax Calculation**: FY 2024-25 New Tax Regime with 4% cess
- **AI Tax Advisor**: Local LLM-powered chatbot (Phi-3-mini via Ollama)

### Enterprise Features
- **Privacy-First**: All data stays local, no cloud uploads
- **Supabase Auth**: Secure email/password authentication
- **Dark Mode**: Professional light/dark theme system
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliant
- **State Persistence**: LocalStorage-based data retention

---

## 🏗️ Architecture

```
SmartTax/
├── app/                          # Python backend (FastAPI)
│   ├── main.py                   # API endpoints
│   ├── utils.py                  # Tax calculation engine
│   ├── chatbot.py                # AI tax advisor
│   ├── form16_parser.py          # PDF parsing
│   ├── groww_parser.py           # Equity trades parsing
│   └── mutual_fund_parser.py     # MF gains parsing
│
├── frontend/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── app/                  # App setup & routing
│   │   ├── auth/                 # Authentication
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # React Context (state management)
│   │   ├── pages/                # Page components
│   │   ├── services/             # API client
│   │   ├── styles/               # Global CSS
│   │   ├── theme/                # Theme management
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helper functions
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
│
├── requirements.txt              # Python dependencies
├── CHATBOT_SETUP.md             # AI chatbot setup guide
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **Ollama** (for AI chatbot, optional)

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

Backend will run at: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your Supabase credentials

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

### 3. AI Chatbot Setup (Optional)

See [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for detailed instructions.

```bash
# Install Ollama
# Download from: https://ollama.ai/download

# Pull Phi-3-mini model
ollama pull phi3:mini

# Chatbot will automatically connect to Ollama
```

---

## 📊 Tax Calculation Rules (FY 2024-25)

### New Tax Regime Slabs
| Income Range | Tax Rate |
|--------------|----------|
| Up to ₹4,00,000 | 0% |
| ₹4,00,001 - ₹8,00,000 | 5% |
| ₹8,00,001 - ₹12,00,000 | 10% |
| ₹12,00,001 - ₹16,00,000 | 15% |
| ₹16,00,001 - ₹20,00,000 | 20% |
| ₹20,00,001 - ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

### Key Provisions
- **Standard Deduction**: ₹75,000
- **Section 87A Rebate**: Full tax waiver if income ≤ ₹12,00,000
- **LTCG Exemption**: ₹1,25,000 on equity/equity MF
- **Health & Education Cess**: 4% on total income tax

### Capital Gains Tax Rates

**Equity Shares:**
- STCG (before July 23, 2024): 15%
- STCG (after July 23, 2024): 20%
- LTCG (before July 23, 2024): 10%
- LTCG (after July 23, 2024): 12.5%

**Equity Mutual Funds:**
- STCG: 20%
- LTCG: 12.5% (after ₹1.25L exemption)

**Debt Mutual Funds:**
- All gains added to income, taxed as per slab

---

## 🔐 Security & Privacy

### Data Privacy
- **100% Local**: All processing happens on your machine
- **No Cloud Storage**: Documents never leave your computer
- **No Analytics**: No tracking or telemetry
- **Open Source**: Full code transparency

### Authentication
- Supabase email/password authentication
- Session-based auth with automatic refresh
- Protected routes with React Router guards

### File Handling
- File type validation (PDF, Excel only)
- Size limits enforced
- Temporary processing only (not stored)

---

## 🧪 Testing

### Backend Tests
```bash
# Run tax calculation tests
python test_tax_calc.py

# Test chatbot
python test_chatbot.py
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 📝 API Documentation

### Calculate Tax
```http
POST /calculate/tax
Content-Type: application/json

{
  "gross_salary": 1500000,
  "tds_paid": 50000,
  "stcg_before": 0,
  "stcg_after": 0,
  "ltcg_before": 0,
  "ltcg_after": 0,
  "equity_stcg": 0,
  "equity_ltcg": 0,
  "debt_stcg": 0,
  "debt_ltcg": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "finalTaxSummary": {
      "salaryPlusDebtMfTax": 97500.0,
      "stockCapitalGainsTax": 0.0,
      "mutualFundEquityTax": 0.0,
      "totalIncomeTaxBeforeCess": 97500.0,
      "cess": 3900.0,
      "totalTaxLiability": 101400.0
    },
    "netPayable": 51400.0,
    "isRefund": false,
    "calculatedAt": "2024-01-19T12:00:00Z"
  }
}
```

### Parse Form-16
```http
POST /parse/form16
Content-Type: multipart/form-data

file: <PDF file>
```

### AI Chatbot
```http
POST /chatbot/message
Content-Type: application/json

{
  "message": "How can I save tax?",
  "user_context": {
    "itr_type": "ITR-1",
    "salary": { "gross_salary": 1500000, "tds_paid": 50000 },
    "calculation": { "total_tax": 101400, "net_payable": 51400 }
  }
}
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Supabase** - Authentication
- **Axios** - HTTP client

### Backend
- **FastAPI** - Web framework
- **Pydantic** - Data validation
- **PDFPlumber** - PDF parsing
- **Pandas** - Excel processing
- **Ollama** - Local LLM inference

### AI/ML
- **Phi-3-mini (3.8B)** - Tax advisor chatbot
- **Ollama** - Local model serving

---

## 📦 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Backend:**
```bash
# Use production ASGI server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Environment Variables

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🤝 Contributing

This is a production fintech application. Code quality standards:

1. **Code Style**: Follow existing patterns
2. **Documentation**: Add docstrings and comments
3. **Testing**: Write tests for new features
4. **Security**: Never log sensitive data
5. **Privacy**: No external API calls without consent

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

### Common Issues

**Backend won't start:**
- Check Python version: `python --version` (need 3.9+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is free: `lsof -i :8000`

**Frontend won't start:**
- Check Node version: `node --version` (need 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check .env file exists and has correct values

**Chatbot not responding:**
- Verify Ollama is running: `ollama list`
- Check phi3:mini is installed: `ollama pull phi3:mini`
- Test Ollama API: `curl http://localhost:11434/api/tags`

### Getting Help
- Check [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for AI setup
- Review API documentation above
- Check browser console for frontend errors
- Check terminal for backend errors

---

## 🚀 Deployment

### Quick Deploy (15 minutes)

See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) for step-by-step guide.

**Backend**: Deploy to [Render](https://render.com) (free tier available)
**Frontend**: Deploy to [Vercel](https://vercel.com) (free tier available)

### Deployment Files

- `render.yaml` - Render configuration for backend
- `frontend/vercel.json` - Vercel configuration for frontend
- `deploy.sh` / `deploy.bat` - Pre-deployment check scripts

### Full Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment documentation including:
- Step-by-step instructions for Render and Vercel
- Environment variable configuration
- CORS setup
- Supabase configuration
- Troubleshooting guide
- Cost estimates

### Production Considerations

⚠️ **Important**: The AI chatbot (Ollama) will NOT work on Render's free/starter tiers. Options:
1. Disable chatbot for production deployment
2. Use cloud-based LLM APIs (OpenAI, Anthropic)
3. Deploy chatbot separately on VPS with Ollama

**Free Tier Limitations**:
- Render: Sleeps after 15 min inactivity (30-60s cold start)
- Upgrade to Starter ($7/month) for always-on service

---

## 🎯 Roadmap

- [ ] ITR-3 support (business income)
- [ ] Old tax regime calculations
- [ ] PDF export of tax summary
- [ ] Multi-year comparison
- [ ] Tax planning recommendations
- [ ] Integration with income tax e-filing portal
- [ ] Cloud-based LLM for chatbot (production-ready)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with ❤️ for Indian taxpayers**

*Last Updated: January 2026*
