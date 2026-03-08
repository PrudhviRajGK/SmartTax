import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';

const SectionAnchor = ({ id }: { id: string }) => <div id={id} style={{ scrollMarginTop: 96 }} />;

const InfoCard = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "rgb(var(--color-bg-primary))", border: "1px solid rgb(var(--color-border-subtle))", borderRadius: 14, padding: "20px 24px", marginTop: 14 }}>
    {children}
  </div>
);

const RuleRow = ({ label, value, last = false }: { label: string; value: string; last?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", borderBottom: last ? "none" : "1px solid rgb(var(--color-border-subtle))" }}>
    <span style={{ fontSize: 14, color: "rgb(var(--color-text-secondary))" }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: "rgb(var(--color-text-primary))" }}>{value}</span>
  </div>
);

const Tag = ({ children, color = "blue" }: { children: React.ReactNode; color?: "blue"|"purple"|"green"|"orange"|"red" }) => {
  const map = { blue:{bg:"#eff6ff",text:"#1d4ed8"}, purple:{bg:"#f5f3ff",text:"#7c3aed"}, green:{bg:"#f0fdf4",text:"#16a34a"}, orange:{bg:"#fff7ed",text:"#c2410c"}, red:{bg:"#fef2f2",text:"#b91c1c"} };
  const c = map[color];
  return <span style={{ display:"inline-block", background:c.bg, color:c.text, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>{children}</span>;
};

const NAV_LINKS = [
  { id:"overview",      label:"Overview" },
  { id:"eligibility",   label:"ITR-1 vs ITR-2 Eligibility" },
  { id:"salary",        label:"Salary Income" },
  { id:"equity",        label:"Equity Stock Gains" },
  { id:"equity-mf",     label:"Equity Mutual Funds" },
  { id:"debt-mf",       label:"Debt Mutual Funds" },
  { id:"house-property",label:"House Property" },
  { id:"final",         label:"Final Tax Computation" },
  { id:"filing",        label:"Filing Your ITR" },
  { id:"glossary",      label:"Glossary" },
];

const Info = () => {
  const [active, setActive] = useState("overview");
  return (
    <>
      <Navbar />
      <div style={{ minHeight:"100vh", background:"rgb(var(--color-bg-secondary))", paddingTop:88, paddingBottom:80 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"grid", gridTemplateColumns:"220px 1fr", gap:48, alignItems:"flex-start" }}>

          {/* SIDEBAR */}
          <aside style={{ position:"sticky", top:96 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"rgb(var(--color-text-tertiary))", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>On this page</p>
            <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {NAV_LINKS.map(l => (
                <a key={l.id} href={`#${l.id}`} onClick={()=>setActive(l.id)} style={{ padding:"7px 12px", fontSize:13, fontWeight:active===l.id?600:400, color:active===l.id?"rgb(var(--color-accent))":"rgb(var(--color-text-secondary))", textDecoration:"none", borderLeft:`2.5px solid ${active===l.id?"rgb(var(--color-accent))":"transparent"}`, borderRadius:"0 6px 6px 0", background:active===l.id?"rgb(var(--color-bg-primary))":"transparent", transition:"all 0.15s" }}>{l.label}</a>
              ))}
            </nav>
            <div style={{ marginTop:24, padding:16, background:"rgb(var(--color-bg-primary))", border:"1px solid rgb(var(--color-border-subtle))", borderRadius:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgb(var(--color-text-tertiary))", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Quick Actions</p>
              <a href="/app/itr-1/salary" style={{ display:"block", fontSize:13, fontWeight:600, color:"#1d4ed8", textDecoration:"none", marginBottom:8 }}>File ITR-1 →</a>
              <a href="/app/itr-2/salary" style={{ display:"block", fontSize:13, fontWeight:600, color:"#7c3aed", textDecoration:"none", marginBottom:8 }}>File ITR-2 →</a>
              <a href="/app/dashboard" style={{ display:"block", fontSize:13, color:"rgb(var(--color-text-secondary))", textDecoration:"none" }}>Go to Dashboard</a>
            </div>
          </aside>

          {/* MAIN */}
          <main style={{ minWidth:0 }}>
            {/* Header */}
            <div style={{ marginBottom:40 }}>
              <Tag color="blue">FY 2024-25 · New Tax Regime</Tag>
              <h1 style={{ fontSize:38, fontWeight:700, color:"rgb(var(--color-text-primary))", marginTop:14, marginBottom:10, lineHeight:1.15, letterSpacing:"-0.01em" }}>Complete Guide to Indian Income Tax</h1>
              <p style={{ fontSize:16, color:"rgb(var(--color-text-secondary))", lineHeight:1.75, maxWidth:620 }}>Everything you need to understand how SmartTax computes your tax for FY 2024-25 under the New Tax Regime — from gross salary to final refund or balance payable.</p>
            </div>

            {/* OVERVIEW */}
            <SectionAnchor id="overview" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Overview</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:12 }}>India's Income Tax Act requires individuals to file an ITR if their income exceeds the basic exemption limit. SmartTax supports ITR-1 (salaried) and ITR-2 (investors) under the <strong>New Tax Regime</strong> — the default regime from FY 2024-25 onwards.</p>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:12 }}>The New Tax Regime offers lower slab rates but does not allow most exemptions (80C, HRA, NPS, LTA). It still provides the ₹75,000 standard deduction on salary and the Section 87A rebate for income up to ₹12 lakh.</p>
              <InfoCard>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
                  {[["Assessment Year","AY 2025-26"],["Financial Year","FY 2024-25"],["Regime","New Tax Regime"],["Filing Deadline","31 July 2025"],["Standard Deduction","₹75,000"],["87A Rebate Limit","₹12,00,000"]].map(([k,v]) => (
                    <div key={k}><p style={{ fontSize:11, fontWeight:700, color:"rgb(var(--color-text-tertiary))", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>{k}</p><p style={{ fontSize:15, fontWeight:600, color:"rgb(var(--color-text-primary))" }}>{v}</p></div>
                  ))}
                </div>
              </InfoCard>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* ELIGIBILITY */}
            <SectionAnchor id="eligibility" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>ITR-1 vs ITR-2 Eligibility</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:14 }}>Choosing the wrong form results in a defective return. Use the comparison below to determine which applies to you.</p>
              <InfoCard>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px" }}>
                  {["Condition","ITR-1","ITR-2"].map((h,j) => <div key={h} style={{ padding:"10px 0", fontSize:11, fontWeight:700, color: j===1?"#1d4ed8":j===2?"#7c3aed":"rgb(var(--color-text-tertiary))", textTransform:"uppercase", letterSpacing:"0.07em", textAlign: j>0?"center":"left", borderBottom:"1px solid rgb(var(--color-border-subtle))" }}>{h}</div>)}
                  {[
                    ["Salary income only",true,true],
                    ["Total income ≤ ₹50 lakh",true,true],
                    ["Standard deduction ₹75,000",true,true],
                    ["Section 87A rebate (income ≤ ₹12L)",true,true],
                    ["LTCG within ₹1.25L exemption",true,true],
                    ["One house property (SOP)",true,true],
                    ["Equity stock capital gains (taxable)",false,true],
                    ["Mutual fund capital gains",false,true],
                    ["House property income (Let Out / DLOP)",false,true],
                    ["Multiple house properties",false,true],
                    ["Foreign income or assets",false,true],
                    ["Business / professional income",false,false],
                  ].map(([cond,a,b])=>(
                    <div key={String(cond)} style={{ display:"contents" }}>
                      <div style={{ padding:"10px 0", fontSize:14, color:"rgb(var(--color-text-secondary))", borderBottom:"1px solid rgb(var(--color-border-subtle))" }}>{cond}</div>
                      <div style={{ padding:"10px 0", textAlign:"center", borderBottom:"1px solid rgb(var(--color-border-subtle))", fontSize:15, color:a?"#16a34a":"#cbd5e1", fontWeight:700 }}>{a?"✓":"—"}</div>
                      <div style={{ padding:"10px 0", textAlign:"center", borderBottom:"1px solid rgb(var(--color-border-subtle))", fontSize:15, color:b===true?"#16a34a":"#cbd5e1", fontWeight:700 }}>{b===true?"✓":b===false&&!a?"✗":"—"}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))", marginTop:12 }}>✗ means neither form supports this income type — you may need ITR-3 or ITR-4 (not currently supported by SmartTax).</p>
              </InfoCard>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* SALARY */}
            <SectionAnchor id="salary" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Salary Income</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:20 }}>Salary income is declared using data from your Form-16. SmartTax parses the PDF automatically — extracting gross salary, standard deduction, and TDS deducted.</p>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6 }}>Standard Deduction — ₹75,000</h3>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:14 }}>Every salaried individual under the New Tax Regime for FY 2024-25 receives a flat ₹75,000 deduction on gross salary (Budget 2024 revised this from ₹50,000). SmartTax applies it automatically — you do not need to enter it.</p>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6 }}>New Tax Regime Slabs — FY 2024-25</h3>
              <InfoCard>
                {[
                  ["Up to ₹4,00,000","Nil"],["₹4,00,001 – ₹8,00,000","5%"],["₹8,00,001 – ₹12,00,000","10%"],
                  ["₹12,00,001 – ₹16,00,000","15%"],["₹16,00,001 – ₹20,00,000","20%"],
                  ["₹20,00,001 – ₹24,00,000","25%"],["Above ₹24,00,000","30%"],
                ].map(([range,rate],i,arr) => <RuleRow key={range} label={range} value={rate} last={i===arr.length-1} />)}
                <p style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))", marginTop:12 }}>All income tax is subject to 4% Health and Education Cess in addition to the rates above.</p>
              </InfoCard>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6, marginTop:24 }}>Section 87A Rebate</h3>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:12 }}>If your total taxable income (all sources combined) is ₹12,00,000 or below under the New Regime, your entire income tax and cess is waived under Section 87A. SmartTax checks this and applies it automatically.</p>
              <InfoCard>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:14 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#15803d", marginBottom:3 }}>Rebate applies if</p>
                    <p style={{ fontSize:14, color:"#166534", marginBottom:4 }}>Total taxable income ≤ ₹12,00,000</p>
                    <p style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>Tax = ₹0 (incl. cess)</p>
                  </div>
                  <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:14 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#c2410c", marginBottom:3 }}>Rebate does not apply if</p>
                    <p style={{ fontSize:14, color:"#9a3412", marginBottom:4 }}>Total taxable income {'>'} ₹12,00,000</p>
                    <p style={{ fontSize:13, color:"#c2410c" }}>Full slab tax applies</p>
                  </div>
                </div>
              </InfoCard>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6, marginTop:24 }}>Health and Education Cess — 4%</h3>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78 }}>A 4% cess on total income tax (after all rebates) funds India's health and education initiatives. Added as the final step in tax computation.</p>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* EQUITY */}
            <SectionAnchor id="equity" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Equity Stock Gains</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:20 }}>Gains from selling listed equity shares are taxed under Section 111A (STCG) and Section 112A (LTCG). Budget 2024 changed both rates from July 23, 2024. SmartTax splits your trades by date using your Groww or Zerodha Excel report.</p>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6 }}>Short-Term Capital Gains (STCG) — held less than 12 months</h3>
              <InfoCard>
                <RuleRow label="Sale before July 23, 2024" value="15%" />
                <RuleRow label="Sale on or after July 23, 2024" value="20%" last />
                <p style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))", marginTop:12 }}>Plus 4% cess. No basic exemption limit applies to equity STCG.</p>
              </InfoCard>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6, marginTop:24 }}>Long-Term Capital Gains (LTCG) — held 12 months or more</h3>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:10 }}>The ₹1,25,000 annual exemption is shared between equity stocks and equity mutual funds combined.</p>
              <InfoCard>
                <div style={{ padding:"11px 0", borderBottom:"1px solid rgb(var(--color-border-subtle))", fontSize:14, color:"rgb(var(--color-text-secondary))" }}>First ₹1,25,000 of combined equity + equity MF LTCG — <strong style={{ color:"rgb(var(--color-text-primary))" }}>fully exempt</strong></div>
                <RuleRow label="Gains above exemption — sale before July 23, 2024" value="10%" />
                <RuleRow label="Gains above exemption — sale on or after July 23, 2024" value="12.5%" last />
                <p style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))", marginTop:12 }}>No indexation benefit under Section 112A. Plus 4% cess.</p>
              </InfoCard>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6, marginTop:24 }}>Budget 2024 Date-Split Logic</h3>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78 }}>Every taxpayer who sold equity during FY 2024-25 potentially has two buckets — pre and post July 23, 2024 — each taxed at different rates. SmartTax reads the sale date from every row of your Excel file and assigns each trade to the correct rate bucket automatically.</p>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* EQUITY MF */}
            <SectionAnchor id="equity-mf" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Equity Mutual Funds</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:16 }}>Equity-oriented mutual funds (more than 65% equity allocation) are taxed similarly to equity stocks. The ₹1.25L LTCG exemption is shared with equity stock LTCG.</p>
              <InfoCard>
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><Tag color="orange">STCG</Tag><span style={{ fontSize:13, color:"rgb(var(--color-text-secondary))" }}>Held less than 12 months</span></div>
                  <RuleRow label="All equity MF STCG (both date periods)" value="20%" last />
                </div>
                <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", paddingTop:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><Tag color="purple">LTCG</Tag><span style={{ fontSize:13, color:"rgb(var(--color-text-secondary))" }}>Held 12 months or more</span></div>
                  <div style={{ fontSize:14, color:"rgb(var(--color-text-secondary))", padding:"10px 0", borderBottom:"1px solid rgb(var(--color-border-subtle))" }}>First ₹1,25,000 combined with equity stock LTCG — <strong style={{ color:"rgb(var(--color-text-primary))" }}>fully exempt</strong></div>
                  <RuleRow label="Gains above exemption — sale before July 23, 2024" value="10%" />
                  <RuleRow label="Gains above exemption — sale on or after July 23, 2024" value="12.5%" last />
                </div>
                <p style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))", marginTop:12 }}>Equity MF STCG rate is 20% for both date periods (Budget 2024 only changed equity stock STCG). Plus 4% cess.</p>
              </InfoCard>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* DEBT MF */}
            <SectionAnchor id="debt-mf" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Debt Mutual Funds</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:14 }}>The Finance Act 2023 fundamentally changed debt MF taxation. For all debt MF units purchased on or after April 1, 2023, <strong>both STCG and LTCG are added to your taxable income and taxed at slab rates</strong>. No flat rate, no indexation, no exemption.</p>
              <InfoCard>
                {[["LTCG rate (post April 2023 purchase)","Slab rate"],["STCG rate","Slab rate"],["Indexation benefit","Not available"],["₹1.25L exemption","Not applicable"],["Separate LTCG holding period","Not relevant"]].map(([k,v],i,a) => <RuleRow key={k} label={k} value={v} last={i===a.length-1} />)}
                <p style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))", marginTop:12 }}>Debt MF gains are added to gross total income before slab tax computation.</p>
              </InfoCard>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6, marginTop:24 }}>Worked Example</h3>
              <InfoCard>
                {[["Gross salary (after std. deduction)","₹17,65,000"],["Add: Debt MF gains","₹40,000"],["Total taxable income","₹18,05,000"],["Tax on ₹18,05,000 at slab","₹2,90,500"],["Add: 4% cess","₹11,620"],["Total tax liability","₹3,02,120"]].map(([k,v],i,a) => <RuleRow key={k} label={k} value={v} last={i===a.length-1} />)}
              </InfoCard>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* HOUSE PROPERTY */}
            <SectionAnchor id="house-property" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>House Property Income</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:16 }}>SmartTax supports all three property types under ITR-2: Self-Occupied (SOP), Let-Out (LOP), and Deemed Let-Out (DLOP). Multiple properties can be added.</p>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6 }}>Step-by-Step Computation</h3>
              <InfoCard>
                {[
                  {n:"1",title:"Gross Annual Value (GAV)",desc:"LOP/DLOP: higher of actual rent and expected market rent. SOP: always ₹0."},
                  {n:"2",title:"Less: Municipal Taxes Paid",desc:"Only taxes actually paid during the year are deductible from GAV."},
                  {n:"3",title:"Net Annual Value (NAV)",desc:"GAV minus municipal taxes paid."},
                  {n:"4",title:"Less: Sec 24(a) — 30% Standard Deduction",desc:"Flat 30% of NAV for repairs. Applies only to LOP/DLOP. No proof required."},
                  {n:"5",title:"Less: Sec 24(b) — Home Loan Interest",desc:"Fully deductible for LOP/DLOP. SOP gets ₹0 under New Regime (not allowed)."},
                  {n:"6",title:"Net HP Income or Loss",desc:"NAV minus Sec 24(a) minus Sec 24(b). Negative result = HP loss."},
                ].map((s,i)=>(
                  <div key={s.n} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:i<5?"1px solid rgb(var(--color-border-subtle))":"none" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"#eff6ff", color:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>{s.n}</div>
                    <div><p style={{ fontSize:14, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:2 }}>{s.title}</p><p style={{ fontSize:13, color:"rgb(var(--color-text-secondary))", lineHeight:1.6 }}>{s.desc}</p></div>
                  </div>
                ))}
              </InfoCard>

              <h3 style={{ fontSize:17, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:6, marginTop:24 }}>HP Loss — New Regime Rules</h3>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78 }}>Under the New Tax Regime, a House Property loss <strong>cannot be set off against salary income</strong> in the same year. The loss carries forward for up to 8 assessment years and can only be set off against future HP income (intra-head). SmartTax tracks and displays the exact carry-forward amount.</p>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* FINAL */}
            <SectionAnchor id="final" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Final Tax Computation</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:14 }}>SmartTax computes tax from each income source separately, then adds them to arrive at the total tax before cess. After cess, TDS paid is subtracted to get the net amount.</p>
              <InfoCard>
                {["Salary Tax (slab rate on taxable salary)","Equity STCG Tax (15% or 20% by date)","Equity LTCG Tax (10% or 12.5% above ₹1.25L)","Equity MF STCG Tax (20%)","Equity MF LTCG Tax (10% or 12.5%)","Debt MF gains (added to slab income)","HP net income (if positive)","Sub-total before cess","Add: Health & Education Cess 4%","Total Tax Liability","Less: TDS Already Paid","Net Refund Due / Balance Payable"].map((label,i,a)=>(
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<a.length-1?"1px solid rgb(var(--color-border-subtle))":"none" }}>
                    <span style={{ fontSize:14, fontWeight:[7,9,11].includes(i)?600:400, color:[7,9,11].includes(i)?"rgb(var(--color-text-primary))":"rgb(var(--color-text-secondary))" }}>{label}</span>
                    <span style={{ fontSize:12, color:"rgb(var(--color-text-tertiary))" }}>computed</span>
                  </div>
                ))}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:14 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#15803d", marginBottom:3 }}>TDS paid {'>'} Liability</p>
                    <p style={{ fontSize:14, fontWeight:600, color:"#166534", marginBottom:4 }}>Refund Due</p>
                    <p style={{ fontSize:12, color:"#4ade80" }}>Credited to bank account — typically 30–45 days after ITR processing</p>
                  </div>
                  <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:14 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#c2410c", marginBottom:3 }}>Liability {'>'} TDS paid</p>
                    <p style={{ fontSize:14, fontWeight:600, color:"#9a3412", marginBottom:4 }}>Balance Payable</p>
                    <p style={{ fontSize:12, color:"#fb923c" }}>Pay via Challan 280 at tin.nsdl.com before filing</p>
                  </div>
                </div>
              </InfoCard>
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* FILING */}
            <SectionAnchor id="filing" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Filing Your ITR</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:20 }}>SmartTax computes your tax breakdown. Actual filing is done on the Income Tax e-filing portal — incometax.gov.in.</p>
              {[
                {n:"01",title:"Pay balance tax via Challan 280",desc:"If your liability exceeds TDS, pay the difference via Challan 280 on tin.nsdl.com or net banking. Note the BSR code and challan serial number — required while filing."},
                {n:"02",title:"Log in to the e-filing portal",desc:"Visit incometax.gov.in and log in with your PAN. Go to e-File → File Income Tax Return → AY 2025-26 → Online mode."},
                {n:"03",title:"Select the correct ITR form",desc:"Choose ITR-1 or ITR-2 based on your income sources. Refer to the eligibility section above if unsure."},
                {n:"04",title:"Cross-check pre-filled data",desc:"The portal pre-fills from Form-16 and AIS. Compare with SmartTax values. Enter capital gains and house property details from your SmartTax result."},
                {n:"05",title:"e-Verify your return",desc:"Verify using Aadhaar OTP, net banking, bank ATM, or Demat account within 30 days of filing. Alternatively, send a signed physical copy to CPC Bengaluru."},
              ].map((s,i)=>(
                <div key={s.n} style={{ display:"flex", gap:18, marginBottom:20, paddingBottom:20, borderBottom:i<4?"1px solid rgb(var(--color-border-subtle))":"none" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"#eff6ff", color:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>{s.n}</div>
                  <div><p style={{ fontSize:15, fontWeight:600, color:"rgb(var(--color-text-primary))", marginBottom:3 }}>{s.title}</p><p style={{ fontSize:14, color:"rgb(var(--color-text-secondary))", lineHeight:1.65 }}>{s.desc}</p></div>
                </div>
              ))}
            </section>

            <div style={{ borderTop:"1px solid rgb(var(--color-border-subtle))", marginBottom:48 }} />

            {/* GLOSSARY */}
            <SectionAnchor id="glossary" />
            <section style={{ marginBottom:52 }}>
              <h2 style={{ fontSize:26, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:8 }}>Glossary</h2>
              <p style={{ fontSize:15, color:"rgb(var(--color-text-secondary))", lineHeight:1.78, marginBottom:14 }}>Key terms used in tax computation and in SmartTax.</p>
              <InfoCard>
                {[
                  ["AY (Assessment Year)","The year in which income earned in the previous FY is assessed. AY 2025-26 corresponds to FY 2024-25."],
                  ["BSR Code","7-digit bank branch code identifying where Challan 280 tax was paid. Required while filing."],
                  ["Challan 280","Official form for paying advance or self-assessment tax at tin.nsdl.com."],
                  ["Form-16","TDS certificate from employer — contains gross salary, standard deduction, and TDS deducted."],
                  ["GAV (Gross Annual Value)","Annual rent receivable or expected market rent, whichever is higher. Nil for SOP."],
                  ["LTCG (Long-Term Capital Gains)","Gains from assets held more than the prescribed period — 12 months for equity shares and equity MFs."],
                  ["NAV (Net Annual Value)","GAV minus municipal taxes actually paid. Base for HP deduction calculation."],
                  ["Section 24(a)","Flat 30% deduction on NAV for property repairs. No proof required."],
                  ["Section 24(b)","Home loan interest deduction — fully allowed for LOP/DLOP. Not allowed for SOP under New Regime."],
                  ["Section 87A Rebate","Full tax rebate for income ≤ ₹12,00,000 under New Regime. Total tax = ₹0."],
                  ["STCG (Short-Term Capital Gains)","Gains from assets held less than the prescribed period. Flat rate for equity."],
                  ["TDS (Tax Deducted at Source)","Tax deducted by employer before paying salary. Reflected in Form-16 and Form 26AS/AIS."],
                ].map(([term,def],i,a)=>(
                  <div key={String(term)} style={{ padding:"13px 0", borderBottom:i<a.length-1?"1px solid rgb(var(--color-border-subtle))":"none" }}>
                    <p style={{ fontSize:14, fontWeight:700, color:"rgb(var(--color-text-primary))", marginBottom:2 }}>{term}</p>
                    <p style={{ fontSize:13, color:"rgb(var(--color-text-secondary))", lineHeight:1.65 }}>{def}</p>
                  </div>
                ))}
              </InfoCard>
            </section>

            {/* DISCLAIMER */}
            <div style={{ background:"rgb(var(--color-bg-primary))", border:"1px solid rgb(var(--color-border))", borderRadius:14, padding:"20px 24px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgb(var(--color-text-tertiary))", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Disclaimer</p>
              <p style={{ fontSize:14, color:"rgb(var(--color-text-secondary))", lineHeight:1.78 }}>SmartTax is an educational and self-service tax computation tool. All computations are based on the Finance Act 2024 and CBDT notifications. This tool does not constitute professional tax advice. For complex situations — foreign income, business income, or significant capital gains — please consult a Chartered Accountant. Always verify computed figures against your Form 26AS and AIS before filing.</p>
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

export default Info;
