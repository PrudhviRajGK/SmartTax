import { Navbar } from '../components/layout/Navbar';

const Info = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-[40px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-4">
              How tax is calculated
            </h1>
            <p className="text-[17px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
              A clear explanation of how SmartTax computes your tax under the New Tax Regime (FY 2024–25).
            </p>
          </div>

          <div className="space-y-16">
            {/* Salary Income */}
            <section>
              <h2 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-6">
                Salary income
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Standard deduction
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    A flat deduction of ₹75,000 is applied to your gross salary.
                  </p>
                </div>

                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Tax slabs
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed mb-4">
                    The remaining income is taxed using the new regime slabs:
                  </p>
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-6 border border-[rgb(var(--color-border-subtle))]">
                    <div className="space-y-3 text-[15px]">
                      <div className="flex justify-between py-2">
                        <span className="text-[rgb(var(--color-text-secondary))]">Up to ₹4,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">Nil</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">₹4,00,001 – ₹8,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">5%</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">₹8,00,001 – ₹12,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">10%</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">₹12,00,001 – ₹16,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">15%</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">₹16,00,001 – ₹20,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">20%</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">₹20,00,001 – ₹24,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">25%</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">Above ₹24,00,000</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">30%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Section 87A rebate
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    If your taxable income is ₹12,00,000 or less, your tax becomes zero (including cess).
                  </p>
                </div>

                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Health & education cess
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    A 4% cess is applied on the final tax amount.
                  </p>
                </div>
              </div>
            </section>

            {/* Equity Stocks */}
            <section className="pt-8 border-t border-[rgb(var(--color-border-subtle))]">
              <h2 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-6">
                Equity stocks
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Short term capital gains (STCG)
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed mb-3">
                    Shares sold within 1 year
                  </p>
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-5 border border-[rgb(var(--color-border-subtle))]">
                    <div className="space-y-2 text-[15px]">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">15%</span>
                        <span className="text-[rgb(var(--color-text-secondary))]">for sales before 23 July 2024</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">20%</span>
                        <span className="text-[rgb(var(--color-text-secondary))]">for sales on or after 23 July 2024</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Long term capital gains (LTCG)
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed mb-3">
                    Shares held for more than 1 year
                  </p>
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-5 border border-[rgb(var(--color-border-subtle))]">
                    <div className="space-y-3 text-[15px]">
                      <p className="text-[rgb(var(--color-text-secondary))]">
                        First ₹1,25,000 is tax-free
                      </p>
                      <p className="text-[rgb(var(--color-text-secondary))]">
                        Amount above exemption:
                      </p>
                      <div className="ml-4 space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">10%</span>
                          <span className="text-[rgb(var(--color-text-secondary))]">before 23 July 2024</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">12.5%</span>
                          <span className="text-[rgb(var(--color-text-secondary))]">after 23 July 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Equity Mutual Funds */}
            <section className="pt-8 border-t border-[rgb(var(--color-border-subtle))]">
              <h2 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-6">
                Equity mutual funds
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Short term (less than 1 year)
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    Taxed at 20%
                  </p>
                </div>

                <div>
                  <h3 className="text-[17px] font-medium text-[rgb(var(--color-text-primary))] mb-3">
                    Long term (more than 1 year)
                  </h3>
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-5 border border-[rgb(var(--color-border-subtle))]">
                    <div className="space-y-2 text-[15px]">
                      <p className="text-[rgb(var(--color-text-secondary))]">
                        First ₹1,25,000 is exempt
                      </p>
                      <p className="text-[rgb(var(--color-text-secondary))]">
                        Remaining amount taxed at <span className="font-medium text-[rgb(var(--color-text-primary))]">12.5%</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Debt Mutual Funds */}
            <section className="pt-8 border-t border-[rgb(var(--color-border-subtle))]">
              <h2 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-6">
                Debt mutual funds
              </h2>
              
              <div className="space-y-6">
                <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                  Post April 2023, all debt mutual fund gains are treated as normal income, regardless of holding period.
                </p>

                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-5 border border-[rgb(var(--color-border-subtle))]">
                  <ul className="space-y-2 text-[15px] text-[rgb(var(--color-text-secondary))]">
                    <li>• No LTCG benefit</li>
                    <li>• No indexation</li>
                    <li>• No exemption</li>
                    <li>• Added directly to salary income</li>
                    <li>• Taxed as per your slab rate</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[15px] font-medium text-[rgb(var(--color-text-primary))] mb-3">Example</p>
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-5 border border-[rgb(var(--color-border-subtle))]">
                    <div className="space-y-2 text-[15px]">
                      <div className="flex justify-between">
                        <span className="text-[rgb(var(--color-text-secondary))]">Salary</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">₹5,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[rgb(var(--color-text-secondary))]">Debt MF gain</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">₹40,000</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[rgb(var(--color-border-subtle))]">
                        <span className="text-[rgb(var(--color-text-secondary))]">Total income</span>
                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">₹5,40,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final Tax Summary */}
            <section className="pt-8 border-t border-[rgb(var(--color-border-subtle))]">
              <h2 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-6">
                Final tax summary
              </h2>
              
              <div className="space-y-6">
                <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                  Your final tax is the sum of:
                </p>

                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl p-5 border border-[rgb(var(--color-border-subtle))]">
                  <ul className="space-y-2 text-[15px] text-[rgb(var(--color-text-secondary))]">
                    <li>• Salary tax (including debt MF income)</li>
                    <li>• Equity stock capital gains tax</li>
                    <li>• Equity mutual fund tax</li>
                  </ul>
                </div>

                <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                  From this total, any TDS already deducted is subtracted.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[rgb(var(--color-success-bg))] rounded-xl p-5 border border-[rgb(var(--color-success))]">
                    <p className="text-[13px] text-[rgb(var(--color-success))] mb-1">If TDS &gt; total tax</p>
                    <p className="text-[17px] font-semibold text-[rgb(var(--color-success))]">Refund due</p>
                  </div>
                  <div className="bg-[rgb(var(--color-error-bg))] rounded-xl p-5 border border-[rgb(var(--color-error))]">
                    <p className="text-[13px] text-[rgb(var(--color-error))] mb-1">If TDS &lt; total tax</p>
                    <p className="text-[17px] font-semibold text-[rgb(var(--color-error))]">Tax payable</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="pt-8 border-t border-[rgb(var(--color-border-subtle))]">
              <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
                <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                  SmartTax follows the latest available income tax rules. This explanation is for clarity and education. 
                  Final liability may vary based on personal circumstances.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Info;
