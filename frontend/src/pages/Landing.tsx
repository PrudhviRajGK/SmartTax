import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 50;
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

const FEATURES = [
  {
    id: "form16", label: "Form-16 Parsing", sublabel: "Automatic extraction",
    desc: "Upload your Form-16 PDF. SmartTax extracts gross salary, TDS paid, and employer details without any manual entry. Supports all employer formats.",
    rows: [["Employer","Infosys Limited"],["Gross Salary","₹18,40,000"],["Standard Deduction","₹75,000"],["Taxable Salary","₹17,65,000"],["TDS Deducted","₹2,18,500"]],
    badge: "Parsed", badgeColor: "#16a34a", badgeBg: "#f0fdf4", title: "Form-16.pdf", subtitle: "Uploaded · 2.3 MB",
  },
  {
    id: "equity", label: "Equity & MF Gains", sublabel: "Groww & Zerodha",
    desc: "Upload your broker capital gains report. STCG and LTCG are split across the July 23, 2024 Budget date. The ₹1.25L exemption is applied automatically.",
    rows: [["STCG (before Jul 23) @ 15%","₹6,750"],["STCG (after Jul 23) @ 20%","₹6,400"],["LTCG (after exemption) @ 12.5%","₹12,063"],["Equity MF Tax @ 20%/12.5%","₹8,125"],["Total Capital Gains Tax","₹33,338"]],
    badge: "Computed", badgeColor: "#7c3aed", badgeBg: "#f5f3ff", title: "Capital Gains — FY 2024-25", subtitle: "Groww trades report",
  },
  {
    id: "hp", label: "House Property", sublabel: "Multi-property support",
    desc: "Add self-occupied, let-out, or deemed let-out properties. SmartTax computes GAV, NAV, Sec 24(a) standard deduction, and Sec 24(b) home loan interest.",
    rows: [["Gross Annual Value (GAV)","₹3,60,000"],["Less: Municipal Taxes","− ₹18,000"],["Net Annual Value (NAV)","₹3,42,000"],["Less: 30% Std Deduction","− ₹1,02,600"],["Less: Home Loan Interest","− ₹2,40,000"]],
    badge: "Let Out", badgeColor: "#0369a1", badgeBg: "#eff6ff", title: "Property 1", subtitle: "HP Loss: carry forward 8 yrs",
  },
  {
    id: "result", label: "Full Tax Waterfall", sublabel: "Row-by-row breakdown",
    desc: "Every number explained — from gross salary to net refund or balance payable. Section 87A rebate auto-applied. Challan 280 instructions if tax is due.",
    rows: [["Salary Tax (slab)","₹2,14,500"],["Equity Stock Tax","₹25,213"],["Equity MF Tax","₹8,125"],["Health & Education Cess 4%","₹9,914"],["Less: TDS Paid","− ₹2,18,500"]],
    badge: "Final", badgeColor: "#b45309", badgeBg: "#fffbeb", title: "Tax Reconciliation", subtitle: "Balance payable: ₹39,252",
  },
];

const TABLE_ROWS = [
  ["Salary income (Form-16)", true, true],
  ["₹75,000 standard deduction", true, true],
  ["Section 87A rebate (income ≤ ₹12L)", true, true],
  ["Health & Education Cess (4%)", true, true],
  ["Equity stock STCG / LTCG", false, true],
  ["Mutual fund gains — Equity & Debt", false, true],
  ["Budget 2024 date split (Jul 23)", false, true],
  ["₹1.25L LTCG annual exemption", true, true],
  ["House property income / loss", false, true],
  ["Multi-property (SOP, LOP, DLOP)", false, true],
  ["HP loss carry-forward (8 years)", false, true],
  ["Debt MF added to income at slab", false, true],
];

const FAQS = [
  { q: "Is SmartTax free?", a: "Yes, completely free. No credit card, no subscription, no hidden charges. SmartTax is a self-service tool built to give salaried professionals and investors accurate ITR computations." },
  { q: "Does it support the old tax regime?", a: "SmartTax is designed exclusively for the New Tax Regime (the default from FY 2024-25 onwards). Old regime support with 80C, HRA, and NPS deductions is on the roadmap." },
  { q: "Which brokers are supported?", a: "Equity capital gains reports from Groww and Zerodha (Excel format) are supported. Mutual fund reports in Groww format (Excel/CSV) are supported. More broker integrations are being added." },
  { q: "What documents do I need?", a: "For ITR-1: your Form-16 PDF from your employer. For ITR-2: Form-16 PDF, plus optionally your equity trades Excel from Groww or Zerodha, and your mutual fund capital gains report." },
  { q: "Is my financial data safe?", a: "Your documents are processed to extract data, then discarded. Tax results are stored in your personal Supabase-backed account. We do not sell, share, or transfer your data to any third parties." },
  { q: "Why can I not set off house property loss against salary?", a: "Under the New Tax Regime, House Property losses cannot offset salary income in the same year. They carry forward for up to 8 years and can only be set off against future HP income (intra-head). SmartTax displays the exact carry-forward amount." },
  { q: "What is the Section 87A rebate?", a: "If your total taxable income is ₹12,00,000 or below under the New Regime, your income tax liability becomes zero. This rebate is applied automatically by SmartTax — including the cess waiver." },
  { q: "How accurate are the calculations?", a: "All computations follow Finance Act 2024 rules, including Budget 2024 STCG/LTCG rate changes effective July 23, 2024. Results are verified against manual calculations. Always review the waterfall breakdown before filing." },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqMounted, setFaqMounted] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [lang, setLang] = useState<'en'|'hi'|'bn'|'or'|'ta'|'te'>('en');
  const [langOpen, setLangOpen] = useState(false);

  const LANGS = [
    { code: 'en', label: 'English',  native: 'English' },
    { code: 'hi', label: 'Hindi',    native: 'हिंदी' },
    { code: 'bn', label: 'Bengali',  native: 'বাংলা' },
    { code: 'or', label: 'Odia',     native: 'ଓଡ଼ିଆ' },
    { code: 'ta', label: 'Tamil',    native: 'தமிழ்' },
    { code: 'te', label: 'Telugu',   native: 'తెలుగు' },
  ] as const;
  const currentLang = LANGS.find(l => l.code === lang)!;

  // Landing page translations (subset — most content stays English for SEO)
  const T: Record<string, Partial<Record<'en'|'hi'|'bn'|'or'|'ta'|'te', string>>> = {
    'nav.features':    { en:'Features', hi:'सुविधाएँ', bn:'বৈশিষ্ট্য', or:'ବୈଶିଷ୍ଟ୍ୟ', ta:'அம்சங்கள்', te:'లక్షణాలు' },
    'nav.howitworks':  { en:'How It Works', hi:'कैसे काम करता है', bn:'কীভাবে কাজ করে', or:'କିପରି କାମ କରେ', ta:'எப்படி செயல்படுகிறது', te:'ఎలా పనిచేస్తుంది' },
    'nav.compare':     { en:'ITR-1 vs ITR-2', hi:'ITR-1 vs ITR-2', bn:'ITR-1 বনাম ITR-2', or:'ITR-1 ବନାମ ITR-2', ta:'ITR-1 எதிர் ITR-2', te:'ITR-1 vs ITR-2' },
    'nav.faq':         { en:'FAQ', hi:'सामान्य प्रश्न', bn:'প্রশ্নোত্তর', or:'ସାଧାରଣ ପ୍ରଶ୍ନ', ta:'அடிக்கடி கேட்கப்படும் கேள்விகள்', te:'తరచు అడిగే ప్రశ్నలు' },
    'nav.support':     { en:'Support', hi:'सहायता', bn:'সহায়তা', or:'ସହାୟତା', ta:'ஆதரவு', te:'మద్దతు' },
    'nav.signin':      { en:'Sign In', hi:'साइन इन', bn:'সাইন ইন', or:'ସାଇନ ଇନ', ta:'உள்நுழை', te:'సైన్ ఇన్' },
    'nav.getstarted':  { en:'Get Started', hi:'शुरू करें', bn:'শুরু করুন', or:'ଆରମ୍ଭ କରନ୍ତୁ', ta:'தொடங்குங்கள்', te:'ప్రారంభించండి' },
    'hero.badge':      { en:'New Tax Regime · AY 2025-26 · ITR-1 and ITR-2', hi:'नई कर व्यवस्था · AY 2025-26 · ITR-1 और ITR-2', bn:'নতুন কর ব্যবস্থা · AY 2025-26', or:'ନୂଆ କର ବ୍ୟବସ୍ଥା · AY 2025-26', ta:'புதிய வரி முறை · AY 2025-26', te:'కొత్త పన్ను విధానం · AY 2025-26' },
    'hero.h1a':        { en:'File Your Income', hi:'अपनी आय', bn:'আপনার আয়', or:'ଆପଣଙ୍କ ଆୟ', ta:'உங்கள் வருமானம்', te:'మీ ఆదాయం' },
    'hero.h1b':        { en:'Tax Return with', hi:'कर रिटर्न', bn:'কর রিটার্ন', or:'ଆୟକର ରିଟର୍ଣ', ta:'வரி தாக்கல்', te:'పన్ను రిటర్న్' },
    'hero.h1c':        { en:'Precision', hi:'सटीकता से', bn:'নির্ভুলতার সাথে', or:'ସଠିକ ଭାବରେ', ta:'துல்லியமாக', te:'నిఖరంగా' },
    'hero.desc':       { en:'Automated tax computation for salaried individuals and investors. Upload Form-16, equity reports, and mutual fund statements — get a complete, explained result in minutes.', hi:'वेतनभोगी व्यक्तियों के लिए स्वचालित कर गणना। Form-16 और निवेश रिपोर्ट अपलोड करें — मिनटों में पूरा परिणाम पाएं।', bn:'বেতনভোগী ব্যক্তিদের জন্য স্বয়ংক্রিয় কর গণনা। Form-16 আপলোড করুন।', or:'ବେତନଭୋଗୀ ବ୍ୟକ୍ତିଙ୍କ ପାଇଁ ସ୍ୱୟଂଚାଳିତ କର ଗଣନା।', ta:'சம்பளதாரர்களுக்கான தானியங்கி வரி கணக்கீடு.', te:'జీతదారులకు స్వయంచాలిత పన్ను లెక్కింపు.' },
    'hero.cta1':       { en:'Start Filing Free', hi:'निःशुल्क दाखिल करें', bn:'বিনামূল্যে শুরু করুন', or:'ମାଗଣାରେ ଆରମ୍ଭ କରନ୍ତୁ', ta:'இலவசமாக தொடங்குங்கள்', te:'ఉచితంగా ప్రారంభించండి' },
    'hero.cta2':       { en:'ITR-1 vs ITR-2', hi:'ITR-1 vs ITR-2', bn:'ITR-1 বনাম ITR-2', or:'ITR-1 ବନାମ ITR-2', ta:'ITR-1 எதிர் ITR-2', te:'ITR-1 vs ITR-2' },
    'cta.title':       { en:'Your accurate ITR is', hi:'आपका सटीक ITR', bn:'আপনার সঠিক ITR', or:'ଆପଣଙ୍କ ସଠିକ ITR', ta:'உங்கள் துல்லியமான ITR', te:'మీ నిఖరమైన ITR' },
    'cta.sub':         { en:'four minutes away', hi:'चार मिनट दूर है', bn:'চার মিনিট দূরে', or:'ଚାରି ମିନିଟ ଦୂରରେ', ta:'நான்கு நிமிடங்கள் தொலைவில்', te:'నాలుగు నిమిషాల దూరంలో' },
    'cta.btn':         { en:'Start Filing Free', hi:'निःशुल्क दाखिल करें', bn:'বিনামূল্যে শুরু করুন', or:'ମାଗଣାରେ ଦାଖଲ କରନ୍ତୁ', ta:'இலவசமாக தாக்கல் செய்யுங்கள்', te:'ఉచితంగా దాఖలు చేయండి' },
  };
  const tl = (key: string) => T[key]?.[lang] ?? T[key]?.['en'] ?? key;

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setFaqMounted(true); }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const { ref: statsRef, inView: statsIn } = useInView();
  const { ref: featRef, inView: featIn } = useInView();
  const { ref: itrRef, inView: itrIn } = useInView();
  const { ref: rulesRef, inView: rulesIn } = useInView();
  const { ref: stepsRef, inView: stepsIn } = useInView();
  const { ref: faqRef, inView: faqIn } = useInView();

  const feat = FEATURES[activeFeature];

  const anim = (inView: boolean, delay = 0) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(22px)",
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  });

  // Dark mode colour tokens for landing page
  const C = {
    bg:        dark ? "#1a1f2e" : "#ffffff",
    bgAlt:     dark ? "#222840" : "#f8fafc",
    bgCard:    dark ? "#252b3b" : "#ffffff",
    text:      dark ? "#e8eaf6" : "#1e293b",
    textSec:   dark ? "#9ba3c0" : "#475569",
    textMuted: dark ? "#6b7494" : "#94a3b8",
    border:    dark ? "#2e3650" : "#e2e8f0",
    borderSub: dark ? "#252b3b" : "#f1f5f9",
    navBg:     dark ? "rgba(26,31,46,0.97)" : "rgba(255,255,255,0.97)",
    accent:    "#1d4ed8",
    heroGrad:  dark ? "linear-gradient(160deg, #1e2240 0%, #1a1f2e 45%, #1a1f2e 100%)" : "linear-gradient(160deg, #eef2ff 0%, #f8faff 40%, #ffffff 70%)",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg, color: C.text, overflowX: "hidden", transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; }

        .nav-a { font-size: 14px; font-weight: 500; transition: color .2s; }
        .nav-a:hover { color: #1d4ed8; }

        .btn-primary { background: #1d4ed8; color: #fff; border: none; padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s, transform .15s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary:hover { background: #1e40af; transform: translateY(-1px); }

        .btn-outline { background: transparent; color: #1d4ed8; border: 1.5px solid #bfdbfe; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .btn-outline:hover { background: rgba(29,78,216,0.08); border-color: #1d4ed8; }

        .container { max-width: 1160px; margin: 0 auto; padding: 0 40px; }

        .feat-tab { padding: 14px 18px; border-left: 3px solid transparent; border-radius: 0 8px 8px 0; cursor: pointer; transition: all .2s; }

        .ticker-wrap { overflow: hidden; background: #111827; padding: 11px 0; border-top: 1px solid #1f2937; border-bottom: 1px solid #1f2937; }
        .ticker-track { display: flex; animation: ticker 28s linear infinite; white-space: nowrap; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .table-row { display: grid; grid-template-columns: 1fr 100px 100px; padding: 13px 20px; border-bottom: 1px solid; font-size: 14px; transition: background .15s; }
        .table-row:hover { background: rgba(99,102,241,0.05); }
        .table-head { display: grid; grid-template-columns: 1fr 100px 100px; padding: 12px 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }

        .preview-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(100,116,139,0.15); font-size: 13px; }
        .preview-row:last-child { border: none; }

        .faq-item { border-bottom: 1px solid; }
        .faq-btn { width: 100%; background: none; border: none; text-align: left; padding: 18px 0; font-size: 15px; font-weight: 600; color: inherit; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: inherit; }
        .faq-ans { font-size: 14px; line-height: 1.78; padding-bottom: 18px; }

        .step-num { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }

        @media (max-width: 900px) {
          .hero-g { grid-template-columns: 1fr !important; }
          .hero-g > div:nth-child(2) { display: none; }
          .two-col { grid-template-columns: 1fr !important; }
          .feat-layout { flex-direction: column !important; }
          .stats-g { grid-template-columns: repeat(2,1fr) !important; }
          .rules-g { grid-template-columns: repeat(2,1fr) !important; }
          .itr-g { grid-template-columns: 1fr !important; }
          .footer-g { grid-template-columns: 1fr 1fr !important; }
        }
        .lang-dd { position:absolute; top:calc(100% + 8px); right:0; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.14); padding:8px; min-width:160px; z-index:400; }
        .lang-opt { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:500; transition:background .15s; border:none; width:100%; text-align:left; font-family:inherit; }
        .lang-opt:hover { background: rgba(29,78,216,0.08); }
        .lang-opt.active { background: rgba(29,78,216,0.12); color: #1d4ed8; font-weight:700; }
        * { transition: background-color 0.25s ease, border-color 0.25s ease, color 0.2s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        .lang-dd { animation: fadeIn 0.18s ease; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 64,
        background: scrollY > 24 ? C.navBg : "transparent",
        backdropFilter: "blur(14px)",
        borderBottom: scrollY > 24 ? `1px solid ${C.border}` : "1px solid transparent",
        display: "flex", alignItems: "center", padding: "0 40px",
        justifyContent: "space-between", transition: "all .3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="36" height="36" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nb-bg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e3a8a"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
              <linearGradient id="nb-sh" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="white" stopOpacity="0.14"/>
                <stop offset="55%" stopColor="white" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="56" height="56" rx="13" fill="url(#nb-bg)"/>
            <rect width="56" height="56" rx="13" fill="url(#nb-sh)"/>
            <g stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
              <line x1="13" y1="13" x2="37" y2="13"/>
              <line x1="13" y1="20" x2="34" y2="20"/>
              <line x1="20" y1="13" x2="20" y2="44"/>
              <line x1="13" y1="20" x2="36" y2="44"/>
            </g>
            <circle cx="43" cy="43" r="9" fill="white"/>
            <circle cx="43" cy="43" r="7.2" fill="#2e7d32"/>
            <polyline points="39.2,43.1 42.0,45.8 46.8,40.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontFamily: "'Montserrat','DM Sans',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px", color: "#1e3a8a" }}>SMART<span style={{ fontWeight: 400, color: "#2563eb" }}>tax</span></span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {([
            [tl('nav.features'),"#features"],
            [tl('nav.howitworks'),"#how-it-works"],
            [tl('nav.compare'),"#compare"],
            [tl('nav.faq'),"#faq"],
          ] as [string,string][]).map(([l,h]) => (
            <a key={l} href={h} className="nav-a" style={{ color: C.textSec }}>{l}</a>
          ))}

          {/* Support dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={e => { const d = e.currentTarget.querySelector('.contact-dd') as HTMLElement; if(d) d.style.display='block'; }}
            onMouseLeave={e => { const d = e.currentTarget.querySelector('.contact-dd') as HTMLElement; if(d) d.style.display='none'; }}>
            <a href="#contact" className="nav-a" style={{ display: "flex", alignItems: "center", gap: 4, color: C.textSec }}>
              {tl('nav.support')}
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke={C.textSec} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <div className="contact-dd" style={{ display: "none", position: "absolute", top: "calc(100% + 8px)", right: -80, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", padding: 20, minWidth: 260, zIndex: 300 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Contact Us</p>
              {[
                { label: "General Enquiries", val: "+91 98765 43210", icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="#1d4ed8" strokeWidth="1.8"/></svg> },
                { label: "Technical Support", val: "+91 98765 43211", icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756 2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="#7c3aed" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="#7c3aed" strokeWidth="1.8"/></svg> },
                { label: "Email", val: "support@smarttax.in", icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: "WhatsApp", val: "+91 98765 43212", icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              ].map(c => (
                <div key={c.label} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, background: dark ? "#1e293b" : "#eff6ff", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{c.label}</p>
                    <p style={{ fontSize: 12, color: C.textSec }}>{c.val}</p>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4 }}>
                <p style={{ fontSize: 11, color: C.textMuted }}>Mon – Fri, 9 AM – 6 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Language + Theme + Auth */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

          {/* Language selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.textSec, transition: "all .2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = dark ? "#1e293b" : "#f1f5f9")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span>{currentLang.native}</span>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                <path d="M6 9l6 6 6-6" stroke={C.textSec} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {langOpen && (
              <div className="lang-dd" style={{ background: C.bgCard, border: `1px solid ${C.border}` }} onMouseLeave={() => setLangOpen(false)}>
                {LANGS.map(l => (
                  <button key={l.code} className={`lang-opt${lang === l.code ? " active" : ""}`}
                    style={{ color: lang === l.code ? "#1d4ed8" : C.text, background: lang === l.code ? (dark ? "rgba(29,78,216,0.18)" : "rgba(29,78,216,0.08)") : "transparent" }}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 28, color: "#1d4ed8" }}>{l.code.toUpperCase()}</span>
                    <span>{l.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? "Switch to Light mode" : "Switch to Dark mode"}
            style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all .2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = dark ? "#1e293b" : "#f1f5f9")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {dark
              ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
          </button>

          <a href="/app/dashboard" className="btn-outline" style={{ padding: "8px 18px", fontSize: 13, color: C.accent, borderColor: dark ? "#3b5bdb" : "#bfdbfe", background: "transparent" }}>{tl('nav.signin')}</a>
          <a href="/app/dashboard" className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>{tl('nav.getstarted')}</a>
        </div>
      </nav>

            {/* ── HERO ── */}
      <section style={{ paddingTop: 64, minHeight: "calc(100vh - 47px)", background: C.heroGrad, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div className="container" style={{ padding: "36px 40px 36px" }}>
          <div className="hero-g" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.8fr 1.0fr", gap: 28, alignItems: "center" }}>

            {/* LEFT — Copy */}
            <div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,3.2vw,46px)", fontWeight: 800, lineHeight: 1.1, color: C.text, marginBottom: 16 }}>
                {tl('hero.h1a')}<br />{tl('hero.h1b')}<br /><span style={{ color: "#1d4ed8" }}>{tl('hero.h1c')}</span>
              </h1>
              <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.72, marginBottom: 24, maxWidth: 420 }}>
                {tl('hero.desc')}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                <a href="/app/dashboard" className="btn-primary" style={{ fontSize: 15, padding: "14px 28px" }}>{tl('hero.cta1')}</a>
                <a href="#compare" className="btn-outline" style={{ fontSize: 15, padding: "14px 28px", color: C.accent, borderColor: dark ? "#3b5bdb" : "#bfdbfe", background: "transparent" }}>{tl('hero.cta2')}</a>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {["No manual data entry", "New Tax Regime accurate", "Completely free"].map(t => (
                  <span key={t} style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#dcfce7"/><path d="M4.5 7l2 2 3-3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CENTRE — Professional photo */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              {/* Background shape behind photo */}
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 230, height: 290, background: "linear-gradient(180deg, #dbeafe 0%, #e0e7ff 100%)", borderRadius: "50% 50% 0 0", zIndex: 0 }} />
              <img
                src="https://www.thestatesman.com/wp-content/uploads/2022/09/03_Merged.jpg"
                alt="Professional in business attire"
                style={{ position: "relative", zIndex: 1, width: 210, height: 290, objectFit: "cover", objectPosition: "top center", borderRadius: "50% 50% 0 0", display: "block" }}
              />

            </div>

            {/* RIGHT — Tax card */}
            <div style={{ position: "relative" }}>
              <div style={{ background: C.bgCard, borderRadius: 18, padding: 18, boxShadow: dark ? "0 20px 56px rgba(0,0,0,0.4)" : "0 20px 56px rgba(0,0,0,0.1)", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Tax Liability · FY 2024-25</p>
                  <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", fontWeight: 700, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>NEW REGIME</span>
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, color: dark ? "#e8eaf6" : "#0f172a", lineHeight: 1, marginBottom: 4 }}>₹2,57,752</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 20 }}>including 4% Health & Education Cess</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
                  {[
                    { label: "Salary Tax", val: "₹2,14,500", pct: 83, color: "#1d4ed8" },
                    { label: "Equity Stock Tax", val: "₹25,213", pct: 10, color: "#4f46e5" },
                    { label: "Mutual Fund Tax", val: "₹8,125", pct: 7, color: "#0ea5e9" },
                  ].map(b => (
                    <div key={b.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: b.color }} />
                          <span style={{ fontSize: 11, color: "#64748b" }}>{b.label}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{b.val}</span>
                      </div>
                      <div style={{ height: 4, background: dark ? "#2e3650" : "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${b.pct}%`, background: b.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#15803d", marginBottom: 3 }}>TDS Deducted</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#166534" }}>₹2,18,500</p>
                    <p style={{ fontSize: 10, color: "#86efac" }}>by employer (Form-16)</p>
                  </div>
                  <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#c2410c", marginBottom: 3 }}>Balance Payable</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#9a3412" }}>₹39,252</p>
                    <p style={{ fontSize: 10, color: "#fb923c" }}>via Challan 280</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MAKE IN INDIA BANNER ── */}
      <div style={{
        background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%, #138808 100%)",
        padding: "0",
        overflow: "hidden",
        position: "relative",
        height: 36,
      }}>
        {/* Overlay to keep text readable */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,20,30,0.82) 0%, rgba(10,10,20,0.75) 50%, rgba(20,20,30,0.82) 100%)", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <style>{`
            @keyframes mib-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .mib-track { display: flex; align-items: center; gap: 48px; animation: mib-scroll 16s linear infinite; white-space: nowrap; padding-left: 30vw; }
            .mib-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="mib-track">
            {["Made in India","Digital India","Atmanirbhar Bharat","Tax Filing Made Simple","Built for Every Indian","SmartTax — Yours, Free"].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <span style={{ color: "#FF9933", fontSize: 10 }}>◆</span>
                {item}
                <span style={{ color: "#ffffff", fontSize: 10, opacity: 0.5 }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...Array(2)].flatMap((_, i) =>
            ["ITR-1 (Sahaj)","ITR-2","Form-16 Parsing","Groww Integration","Zerodha Integration","Equity STCG/LTCG","Mutual Fund Gains","House Property","Section 87A Rebate","Standard Deduction ₹75,000","Budget 2024 Rules","Debt MF as Income","HP Carry Forward"].map(t => (
              <span key={`${i}-${t}`} style={{ fontSize: 12, fontWeight: 500, color: "#cbd5e1", padding: "0 28px", borderRight: "1px solid #374151", display: "inline-block" }}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
        <div className="container">
          <div ref={statsRef} className="stats-g" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
            {[
              { label: "Forms Supported", val: 2, suffix: "", note: "ITR-1 and ITR-2" },
              { label: "FY 2024-25 Compliant", val: 100, suffix: "%", note: "New Tax Regime rules" },
              { label: "Average Completion", val: 4, suffix: " min", note: "Upload to result" },
              { label: "Cost to File", val: 0, prefix: "₹", note: "Always free" },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: "36px 32px", borderRight: i < 3 ? `1px solid ${C.border}` : "none", ...anim(statsIn, i * 0.08) }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 8 }}>
                  {statsIn && <Counter to={s.val} suffix={s.suffix} prefix={s.prefix || ""} />}
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{s.label}</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "88px 0", background: C.bg }}>
        <div className="container">
          <div ref={featRef} style={{ ...anim(featIn), marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Platform Capabilities</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, color: C.text, marginBottom: 10 }}>Everything computed, nothing guessed</h2>
            <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, lineHeight: 1.7 }}>SmartTax handles every income source under ITR-1 and ITR-2. Every number is explained at every step.</p>
          </div>
          <div className="feat-layout" style={{ display: "flex", gap: 52, alignItems: "flex-start" }}>
            <div style={{ minWidth: 240, flexShrink: 0 }}>
              {FEATURES.map((f, i) => (
                <div key={f.id} className="feat-tab" style={{ borderLeftColor: i === activeFeature ? "#1d4ed8" : "transparent", background: i === activeFeature ? (dark ? "rgba(29,78,216,0.15)" : "#eff6ff") : "transparent" }} onClick={() => setActiveFeature(i)}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: i === activeFeature ? "#1d4ed8" : C.textSec, marginBottom: 2 }}>{f.label}</p>
                  <p style={{ fontSize: 12, color: C.textMuted }}>{f.sublabel}</p>
                  {i === activeFeature && <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, marginTop: 10 }}>{f.desc}</p>}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.07)", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", background: C.bgAlt, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["#fca5a5","#fde68a","#bbf7d0"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{feat.title}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>{feat.subtitle}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: feat.badgeColor, background: feat.badgeBg, padding: "3px 10px", borderRadius: 4 }}>{feat.badge}</span>
                </div>
                <div style={{ padding: "18px 18px" }}>
                  {feat.rows.map(([k, v]) => (
                    <div key={k} className="preview-row">
                      <span style={{ color: "#64748b" }}>{k}</span>
                      <span style={{ fontWeight: 600, color: String(v).startsWith("−") ? "#dc2626" : "#1e293b" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 7, marginTop: 16, justifyContent: "center" }}>
                {FEATURES.map((_, i) => (
                  <div key={i} onClick={() => setActiveFeature(i)} style={{ width: i === activeFeature ? 22 : 7, height: 7, borderRadius: 4, background: i === activeFeature ? "#1d4ed8" : "#e2e8f0", cursor: "pointer", transition: "all .3s" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "88px 0", background: C.bgAlt }}>
        <div className="container">
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
            <div ref={stepsRef} style={{ ...anim(stepsIn) }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Simple Process</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 800, color: C.text, marginBottom: 14 }}>From documents to result in 4 steps</h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.78, marginBottom: 32 }}>No prior knowledge of tax rules needed. SmartTax applies FY 2024-25 rules at every step and highlights anything that requires your attention.</p>
              <a href="/app/dashboard" className="btn-primary">Start Now</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", ...anim(stepsIn, 0.12) }}>
              {[
                { n: "01", title: "Choose your ITR form", desc: "Use our eligibility quiz to determine ITR-1 or ITR-2. Takes 30 seconds.", color: "#1d4ed8" },
                { n: "02", title: "Upload your documents", desc: "Form-16 PDF, equity trades Excel, and mutual fund report. Our parser reads them automatically.", color: "#4f46e5" },
                { n: "03", title: "Add house property details", desc: "For ITR-2. Enter each property — self-occupied, let-out, or deemed let-out. Deductions computed automatically.", color: "#0ea5e9" },
                { n: "04", title: "Review your tax summary", desc: "Full waterfall from gross salary to net refund or balance payable. Carry-forward warnings included.", color: "#16a34a" },
              ].map((s, i) => (
                <div key={s.n} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div className="step-num" style={{ background: s.color + "18", color: s.color }}>{s.n}</div>
                    {i < 3 && <div style={{ width: 2, height: 32, background: `linear-gradient(to bottom, ${s.color}40, transparent)` }} />}
                  </div>
                  <div style={{ paddingBottom: i < 3 ? 16 : 0, paddingTop: 9 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{s.title}</p>
                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ITR COMPARE ── */}
      <section id="compare" style={{ padding: "88px 0", background: C.bg }}>
        <div className="container">
          <div ref={itrRef} style={{ ...anim(itrIn), textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Choose Your Form</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, color: C.text, marginBottom: 10 }}>ITR-1 or ITR-2 — which applies to you?</h2>
            <p style={{ fontSize: 16, color: "#64748b" }}>Both forms are fully supported. Use the comparison below to decide.</p>
          </div>
          <div className="itr-g" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32, alignItems: "stretch" }}>
            <div style={{ background: C.bgCard, border: `2px solid ${dark ? "#1e40af" : "#bfdbfe"}`, borderRadius: 14, padding: 32, position: "relative", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "absolute", top: 0, right: 0, background: "#1d4ed8", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: "0 12px 0 10px", letterSpacing: "0.08em" }}>SAHAJ</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>ITR-1</p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 10 }}>For Salaried Individuals</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.72, marginBottom: 24 }}>The simplest form. Upload Form-16 and get an accurate tax computation — standard deduction, slab tax, cess, and Section 87A rebate applied automatically.</p>
              <div style={{ marginBottom: 20, flex: 1 }}>
                {[
                  ["Salary income only", true],
                  ["One house property (optional)", true],
                  ["Form-16 required", true],
                  ["Total income below ₹50 lakh", true],
                  ["LTCG up to ₹1.25L (exempt)", true],
                  ["Equity / MF gains beyond ₹1.25L", false],
                  ["Multiple properties", false],
                ].map(([item, ok]) => (
                  <div key={String(item)} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
                    <span style={{ color: ok ? "#16a34a" : "#cbd5e1", fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ok ? "✓" : "✗"}</span>
                    <span style={{ fontSize: 14, color: ok ? C.text : C.textMuted }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/app/itr-1/salary" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>File ITR-1</a>
            </div>
            <div style={{ background: C.bgCard, border: `2px solid ${dark ? "#4338ca" : "#a5b4fc"}`, borderRadius: 14, padding: 32, position: "relative", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "absolute", top: 0, right: 0, background: "#4f46e5", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: "0 12px 0 10px", letterSpacing: "0.08em" }}>INVESTOR</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>ITR-2</p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 10 }}>For Investors and Traders</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.72, marginBottom: 24 }}>Covers everything in ITR-1, plus equity stocks, mutual funds, and house property income with full Budget 2024 date-split logic and LTCG exemption.</p>
              <div style={{ marginBottom: 20, flex: 1 }}>
                {["Everything in ITR-1","Equity stock STCG and LTCG","Mutual fund gains — Equity and Debt","House property income or loss","Multi-property support","HP loss carry-forward tracking"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 14, color: C.text }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/app/itr-2/salary" style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#4f46e5", color: "white", border: "none", padding: "13px 28px", borderRadius: "8px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", textDecoration: "none", marginTop: "auto" }}>File ITR-2</a>
            </div>
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div className="table-head" style={{ background: C.bgAlt, borderBottomColor: C.border, color: C.textMuted }}>
              <span>Feature</span>
              <span style={{ textAlign: "center", color: "#1d4ed8" }}>ITR-1</span>
              <span style={{ textAlign: "center", color: "#4f46e5" }}>ITR-2</span>
            </div>
            {TABLE_ROWS.map(([feat, a, b]) => (
              <div key={String(feat)} className="table-row" style={{ borderBottomColor: C.borderSub, color: C.textSec }}>
                <span>{feat}</span>
                <span style={{ textAlign: "center", color: a ? "#16a34a" : "#cbd5e1", fontWeight: 700 }}>{a ? "✓" : "—"}</span>
                <span style={{ textAlign: "center", color: b ? "#16a34a" : "#cbd5e1", fontWeight: 700 }}>{b ? "✓" : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TAX RULES ── */}
      <section style={{ padding: "88px 0", background: C.bgAlt }}>
        <div className="container">
          <div ref={rulesRef} style={{ ...anim(rulesIn), textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>FY 2024-25 Compliance</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, color: C.text, marginBottom: 10 }}>Every rule. Built in.</h2>
            <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>SmartTax applies Finance Act 2024 amendments automatically. No manual updates required on your end.</p>
          </div>
          <div className="rules-g" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: C.border, borderRadius: 14, overflow: "hidden" }}>
            {[
              { tag: "Salaried", title: "Standard Deduction", desc: "₹75,000 flat deduction on gross salary under New Tax Regime — revised upward in Budget 2024." },
              { tag: "New Regime", title: "Section 87A Rebate", desc: "Full income tax waiver if total taxable income is ₹12,00,000 or below. Zero cess applies too." },
              { tag: "Budget 2024", title: "STCG / LTCG Date Split", desc: "STCG: 15% before Jul 23, 20% after. LTCG: 10% before Jul 23, 12.5% after. Gains split by sale date." },
              { tag: "Sec 112A", title: "LTCG ₹1.25L Exemption", desc: "Annual exemption on combined equity and equity MF long-term gains. Applied proportionally across date buckets." },
              { tag: "Debt Funds", title: "Debt MF as Income", desc: "Post April 2023, all debt MF gains — STCG and LTCG — are added to income and taxed at slab. No indexation." },
              { tag: "Sec 22-27", title: "House Property Rules", desc: "GAV to NAV to 30% Sec 24(a) to Sec 24(b) interest. SOP gets NAV of zero. HP losses carry forward 8 years (intra-head)." },
              { tag: "All Taxpayers", title: "Health & Education Cess", desc: "4% cess on total income tax applies to all components. Funds government health and education schemes." },
              { tag: "FY 2024-25", title: "New Regime Only", desc: "SmartTax is built for the New Tax Regime — the default from FY 2024-25. No 80C, HRA, or NPS deductions." },
            ].map((r, i) => (
              <div key={r.title} style={{ background: "white", padding: "28px 22px", ...anim(rulesIn, i * 0.05) }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", background: "#eff6ff", padding: "3px 8px", borderRadius: 4, marginBottom: 12, display: "inline-block" }}>{r.tag}</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{r.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section style={{ padding: "88px 0", background: C.bg }}>
        <div className="container">
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Data Protection</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,3vw,38px)", fontWeight: 800, color: C.text, marginBottom: 16 }}>Committed to your privacy</h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.78, marginBottom: 32 }}>We value your financial data as if it were our own. Your documents are processed to extract data, then discarded. Results are stored only in your own account.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  ["Encrypted in transit", "All data transmitted over SSL/TLS encrypted connections."],
                  ["No third-party sharing", "We do not sell, share, or transfer your data to unaffiliated parties."],
                  ["Supabase-backed storage", "Tax results stored in your personal account — not on a shared server."],
                  ["Documents discarded after parsing", "Uploaded PDFs and Excel files are not permanently stored on our servers."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 14 }}>
                    <svg style={{ flexShrink: 0, marginTop: 3 }} width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#eff6ff"/><path d="M7 12l3 3 7-7" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{title}</p>
                      <p style={{ fontSize: 13, color: "#64748b" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "SSL Encrypted", sub: "All connections" },
                { label: "No Data Sharing", sub: "Third-party free" },
                { label: "Supabase Auth", sub: "Secure login" },
                { label: "Documents Purged", sub: "After parsing" },
              ].map(c => (
                <div key={c.label} style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#1d4ed8" strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1d4ed8" strokeWidth="2"/></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{c.label}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "88px 0", background: C.bgAlt, color: C.text }}>
        <div className="container">
          <div ref={faqRef} className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 72, alignItems: "flex-start" }}>
            <div style={{ position: "sticky", top: 88, ...anim(faqIn) }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>FAQ</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, color: C.text, marginBottom: 14 }}>Common questions</h2>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, marginBottom: 28 }}>Everything you need to know about SmartTax, ITR filing, and the rules applied.</p>
              <a href="/app/dashboard" className="btn-primary">Start Filing</a>
            </div>
            <div style={{ ...anim(faqIn, 0.12) }}>
              {FAQS.map((faq, i) => (
                <div key={faq.q} className="faq-item" style={{ borderColor: C.border }}>
                  <button className="faq-btn" style={{ color: C.text }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.q}
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {faqMounted && openFaq === i && <p className="faq-ans" style={{ color: C.textSec }}>{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ORBIT ── */}
      <section id="contact" style={{ padding: "88px 0", background: C.bg }}>
        <div className="container">
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Left — true CSS orbit */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <style>{`
                @keyframes smarttax-orbit {
                  from { transform: rotate(0deg) translateX(115px) rotate(0deg); }
                  to   { transform: rotate(360deg) translateX(115px) rotate(-360deg); }
                }
                .orbit-avatar-0 { animation: smarttax-orbit 12s linear infinite; }
                .orbit-avatar-1 { animation: smarttax-orbit 12s linear infinite; animation-delay: -3s; }
                .orbit-avatar-2 { animation: smarttax-orbit 12s linear infinite; animation-delay: -6s; }
                .orbit-avatar-3 { animation: smarttax-orbit 12s linear infinite; animation-delay: -9s; }
              `}</style>

              <div style={{ position: "relative", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Orbit rings */}
                <div style={{ position: "absolute", width: 260, height: 260, border: "1.5px dashed #dbeafe", borderRadius: "50%" }} />
                <div style={{ position: "absolute", width: 180, height: 180, border: "1.5px dashed #eff6ff", borderRadius: "50%" }} />

                {/* Centre logo — stays fixed */}
                <div style={{ position: "relative", zIndex: 10, width: 78, height: 78, borderRadius: 20, boxShadow: "0 12px 36px rgba(30,58,138,0.38)" }}>
                  <svg width="78" height="78" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="orb-bg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e3a8a"/>
                        <stop offset="100%" stopColor="#2563eb"/>
                      </linearGradient>
                      <linearGradient id="orb-sh" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="white" stopOpacity="0.14"/>
                        <stop offset="55%" stopColor="white" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <rect width="56" height="56" rx="13" fill="url(#orb-bg)"/>
                    <rect width="56" height="56" rx="13" fill="url(#orb-sh)"/>
                    <g stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                      <line x1="13" y1="13" x2="37" y2="13"/>
                      <line x1="13" y1="20" x2="34" y2="20"/>
                      <line x1="20" y1="13" x2="20" y2="44"/>
                      <line x1="13" y1="20" x2="36" y2="44"/>
                    </g>
                    <circle cx="43" cy="43" r="9" fill="white"/>
                    <circle cx="43" cy="43" r="7.2" fill="#2e7d32"/>
                    <polyline points="39.2,43.1 42.0,45.8 46.8,40.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>

                {/* 4 orbiting avatars — each starts at top, staggered by delay */}
                {[
                  { name: "Manya Singh", initials: "MS", color: "#1d4ed8", bg: "#eff6ff" },
                  { name: "Ansh Raj",    initials: "AR", color: "#7c3aed", bg: "#f5f3ff" },
                  { name: "Priyanshu",   initials: "PK$", color: "#0369a1", bg: "#e0f2fe" },
                  { name: "GK",          initials: "GK", color: "#16a34a", bg: "#f0fdf4" },
                ].map((m, i) => (
                  <div key={m.name} className={`orbit-avatar-${i}`} style={{ position: "absolute", top: "50%", left: "50%", marginTop: -28, marginLeft: -28 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: m.bg, border: `2.5px solid ${m.color}40`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${m.color}30` }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.initials}</span>
                      <span style={{ fontSize: 7.5, color: m.color, fontWeight: 600, lineHeight: 1.3, textAlign: "center", padding: "0 2px" }}>{m.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — team info */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>The Team</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,3vw,38px)", fontWeight: 800, color: C.text, marginBottom: 14 }}>Built by engineers who understand tax</h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.78, marginBottom: 28 }}>SmartTax was built to solve a real problem — the Indian tax filing process is opaque, expensive, and stressful. We built the tool we wished existed.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                {[
                  { initials: "MS", name: "Manya Singh", role: "Product & Frontend", color: "#1d4ed8", bg: "#eff6ff" },
                  { initials: "AR", name: "Ansh Raj", role: "Backend & API", color: "#7c3aed", bg: "#f5f3ff" },
                  { initials: "PKS", name: "Priyanshu Sahu", role: "Tax Logic & Rules", color: "#0369a1", bg: "#e0f2fe" },
                  { initials: "GK", name: "GK", role: "Infrastructure & Data", color: "#16a34a", bg: "#f0fdf4" },
                ].map(m => (
                  <div key={m.name} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.initials}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.name}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CONTACT STRIP ── */}
          <div style={{ marginTop: 64, borderTop: "1px solid #e2e8f0", paddingTop: 52 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Get in Touch</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: C.text, marginBottom: 10 }}>We are here to help</h2>
              <p style={{ fontSize: 15, color: "#64748b" }}>Questions about ITR-1 or ITR-2? Our support team is available Mon–Fri, 9 AM to 6 PM IST.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { label: "General Enquiries", val: "+91 98765 43210", sub: "For any general questions", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="#1d4ed8" strokeWidth="1.8"/></svg> },
                { label: "Technical Support", val: "+91 98765 43211", sub: "Filing issues & bugs", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="#7c3aed" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="#7c3aed" strokeWidth="1.8"/></svg> },
                { label: "Email Us", val: "support@smarttax.in", sub: "Response within 24 hours", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: "WhatsApp", val: "+91 98765 43212", sub: "Quick queries via chat", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              ].map(c => (
                <div key={c.label} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, transition: "transform 0.2s", padding: "24px 20px", textAlign: "center", transition: "box-shadow .2s, transform .2s" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 8px 28px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform="translateY(-3px)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow="none"; (e.currentTarget as HTMLElement).style.transform="none"; }}>
                  <div style={{ width: 44, height: 44, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{c.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{c.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 4 }}>{c.val}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 0", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Ready to file?</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: 18 }}>
            {tl('cta.title')}<br /><span style={{ color: "#93c5fd" }}>{tl('cta.sub')}</span>
          </h2>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.75, maxWidth: 500, margin: "0 auto 36px" }}>
            No chartered accountant needed. Upload your documents, review every number, and know exactly what you owe — or what you get back.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/app/dashboard" className="btn-primary" style={{ fontSize: 15, padding: "14px 32px" }}>{tl('cta.btn')}</a>
            <a href="#compare" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, padding: "14px 32px", border: "1.5px solid rgba(255,255,255,0.18)", color: "white", borderRadius: 8, fontWeight: 600 }}>Which form do I need?</a>
          </div>
          <p style={{ fontSize: 12, color: "#334155", marginTop: 20 }}>No sign-up required to start · All calculations reviewable before saving</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0f172a", padding: "52px 0 28px", borderTop: "1px solid #1e293b" }}>
        <div className="container">
          <div className="footer-g" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <svg width="36" height="36" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ft-bg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2563eb"/>
                      <stop offset="100%" stopColor="#5c6bc0"/>
                    </linearGradient>
                    <linearGradient id="ft-sh" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="white" stopOpacity="0.16"/>
                      <stop offset="55%" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <rect width="56" height="56" rx="13" fill="url(#ft-bg)"/>
                  <rect width="56" height="56" rx="13" fill="url(#ft-sh)"/>
                  <g stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                    <line x1="13" y1="13" x2="37" y2="13"/>
                    <line x1="13" y1="20" x2="34" y2="20"/>
                    <line x1="20" y1="13" x2="20" y2="44"/>
                    <line x1="13" y1="20" x2="36" y2="44"/>
                  </g>
                  <circle cx="43" cy="43" r="9" fill="rgba(15,23,42,0.7)"/>
                  <circle cx="43" cy="43" r="7.2" fill="#4caf50"/>
                  <polyline points="39.2,43.1 42.0,45.8 46.8,40.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span style={{ fontFamily: "'Montserrat','DM Sans',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px", color: "white" }}>SMART<span style={{ fontWeight: 400, color: "#60a5fa" }}>tax</span></span>
              </div>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, maxWidth: 280, marginBottom: 22 }}>
                Automated ITR-1 and ITR-2 computation for Indian salaried professionals and investors. New Tax Regime · FY 2024-25.
              </p>
            </div>
            {[
              { title: "File", links: [["ITR-1 (Sahaj)", "/app/itr-1/salary"], ["ITR-2", "/app/itr-2/salary"], ["Eligibility Quiz", "/app/dashboard"], ["Filing History", "/app/history"]] },
              { title: "Learn", links: [["How It Works", "#how-it-works"], ["ITR-1 vs ITR-2", "#compare"], ["Tax Rules FY 2024-25", "#features"], ["FAQ", "#faq"]] },
              { title: "Product", links: [["Dashboard", "/app/dashboard"], ["Tax History", "/app/history"], ["Info & Rules", "/info"], ["Privacy", "#"]] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{col.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <a key={label} href={href} style={{ fontSize: 13, color: "#475569", transition: "color .2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")} onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <p style={{ fontSize: 12, color: "#334155" }}>© 2025 SmartTax. Built for FY 2024-25. Not affiliated with the Income Tax Department of India.</p>
            <p style={{ fontSize: 12, color: "#334155" }}>Educational and self-service tool. Verify with a CA for complex situations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
