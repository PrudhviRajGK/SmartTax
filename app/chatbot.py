"""
Tax Advisor Chatbot using local LLM (Phi-3-mini via Ollama)
Provides tax insights, suggestions, and answers based on user's tax data
"""

import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class TaxAdvisorChatbot:
    """
    Tax advisor chatbot that provides insights based on user's tax calculations
    Uses local LLM for privacy and offline capability
    """
    
    def __init__(self):
        self.conversation_history: List[Dict[str, str]] = []
        self.user_context: Dict[str, Any] = {}
        
    def set_user_context(self, context: Dict[str, Any]):
        """
        Set the user's tax context (salary, calculations, documents, etc.)
        """
        self.user_context = context
        
    def build_system_prompt(self) -> str:
        """
        Build a comprehensive system prompt with user's tax context
        """
        context_summary = self._summarize_context()
        
        system_prompt = f"""You are a professional Indian tax advisor AI assistant specializing in Income Tax Returns (ITR-1 and ITR-2) for FY 2024-25 under the New Tax Regime.

Your role:
- Provide accurate tax advice based on Indian tax laws
- Explain tax calculations and suggest optimizations
- Answer questions about Form-16, capital gains, mutual funds
- Help users understand their tax liability and potential savings

Current User Context:
{context_summary}

Tax Rules (FY 2024-25 New Regime):
- Standard Deduction: ₹75,000
- Section 87A Rebate: Full tax rebate if taxable income ≤ ₹12,00,000
- LTCG Exemption: ₹1,25,000 on equity/equity MF
- Health & Education Cess: 4% on total income tax
- Equity STCG (before 23 July): 15%, (after): 20%
- Equity LTCG (before 23 July): 10%, (after): 12.5%
- Equity MF STCG: 20%, LTCG: 12.5%
- Debt MF gains: Added to income, taxed as per slab

Tax Slabs (New Regime):
- Up to ₹4,00,000: 0%
- ₹4,00,001 - ₹8,00,000: 5%
- ₹8,00,001 - ₹12,00,000: 10%
- ₹12,00,001 - ₹16,00,000: 15%
- ₹16,00,001 - ₹20,00,000: 20%
- ₹20,00,001 - ₹24,00,000: 25%
- Above ₹24,00,000: 30%

Guidelines:
- Be concise and practical
- Use Indian currency format (₹)
- Cite specific sections when relevant
- Suggest legal tax-saving strategies
- Never advise tax evasion
"""
        return system_prompt
    
    def _summarize_context(self) -> str:
        """
        Summarize user's tax context for the LLM
        """
        if not self.user_context:
            return "No tax data available yet."
        
        summary_parts = []
        
        # ITR Type
        itr_type = self.user_context.get('itr_type', 'Unknown')
        summary_parts.append(f"Filing Type: {itr_type}")
        
        # Salary Information
        if 'salary' in self.user_context:
            salary = self.user_context['salary']
            summary_parts.append(f"Gross Salary: ₹{salary.get('gross_salary', 0):,.2f}")
            summary_parts.append(f"TDS Paid: ₹{salary.get('tds_paid', 0):,.2f}")
        
        # Capital Gains (ITR-2)
        if 'equity' in self.user_context:
            equity = self.user_context['equity']
            summary_parts.append(f"Equity STCG: ₹{equity.get('stcg_total', 0):,.2f}")
            summary_parts.append(f"Equity LTCG: ₹{equity.get('ltcg_total', 0):,.2f}")
        
        if 'mutual_funds' in self.user_context:
            mf = self.user_context['mutual_funds']
            summary_parts.append(f"Equity MF STCG: ₹{mf.get('equity_stcg', 0):,.2f}")
            summary_parts.append(f"Equity MF LTCG: ₹{mf.get('equity_ltcg', 0):,.2f}")
            summary_parts.append(f"Debt MF Gains: ₹{mf.get('debt_total', 0):,.2f}")
        
        # Tax Calculation Results
        if 'calculation' in self.user_context:
            calc = self.user_context['calculation']
            summary_parts.append(f"\nTax Calculation:")
            summary_parts.append(f"- Salary Tax: ₹{calc.get('salary_tax', 0):,.2f}")
            if 'stock_tax' in calc:
                summary_parts.append(f"- Stock Capital Gains Tax: ₹{calc.get('stock_tax', 0):,.2f}")
            if 'mf_tax' in calc:
                summary_parts.append(f"- MF Tax: ₹{calc.get('mf_tax', 0):,.2f}")
            summary_parts.append(f"- Total Income Tax (before cess): ₹{calc.get('total_before_cess', 0):,.2f}")
            summary_parts.append(f"- Cess (4%): ₹{calc.get('cess', 0):,.2f}")
            summary_parts.append(f"- Total Tax Liability: ₹{calc.get('total_tax', 0):,.2f}")
            summary_parts.append(f"- Net Payable: ₹{calc.get('net_payable', 0):,.2f}")
        
        return "\n".join(summary_parts) if summary_parts else "No tax data available."
    
    def generate_response(self, user_message: str, use_ollama: bool = True) -> str:
        """
        Generate a response to user's question
        
        Args:
            user_message: User's question or message
            use_ollama: If True, use Ollama API; if False, use rule-based responses
        
        Returns:
            AI-generated response
        """
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        if use_ollama:
            response = self._generate_with_ollama(user_message)
        else:
            response = self._generate_rule_based(user_message)
        
        # Add assistant response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return response
    
    def _generate_with_ollama(self, user_message: str) -> str:
        """
        Generate response using Ollama local LLM
        """
        try:
            import requests
            
            # Build messages for Ollama
            messages = [
                {"role": "system", "content": self.build_system_prompt()}
            ]
            
            # Add recent conversation history (last 5 exchanges)
            recent_history = self.conversation_history[-10:] if len(self.conversation_history) > 10 else self.conversation_history
            for msg in recent_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Call Ollama API
            response = requests.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": "phi3:mini",  # Phi-3-mini (3.8B) - excellent at reasoning
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 500
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("message", {}).get("content", "I apologize, but I couldn't generate a response.")
            else:
                return self._generate_rule_based(user_message)
                
        except Exception as e:
            print(f"Ollama error: {e}")
            return self._generate_rule_based(user_message)
    
    def _generate_rule_based(self, user_message: str) -> str:
        """
        Fallback rule-based responses when Ollama is not available
        """
        message_lower = user_message.lower()
        
        # Tax saving suggestions
        if any(word in message_lower for word in ['save', 'reduce', 'lower', 'optimize']):
            return self._get_tax_saving_suggestions()
        
        # Calculation explanation
        if any(word in message_lower for word in ['calculate', 'computation', 'how', 'why']):
            return self._explain_calculation()
        
        # LTCG/STCG questions
        if 'ltcg' in message_lower or 'long term' in message_lower:
            return """**Long Term Capital Gains (LTCG):**

For Equity Shares & Equity MF:
- Holding period: > 12 months
- LTCG exemption: ₹1,25,000 per year
- Tax rate (before 23 July 2024): 10%
- Tax rate (after 23 July 2024): 12.5%

LTCG is calculated on gains above the exemption limit."""
        
        if 'stcg' in message_lower or 'short term' in message_lower:
            return """**Short Term Capital Gains (STCG):**

For Equity Shares:
- Holding period: ≤ 12 months
- Tax rate (before 23 July 2024): 15%
- Tax rate (after 23 July 2024): 20%

For Equity Mutual Funds:
- Holding period: ≤ 12 months
- Tax rate: 20% (flat)

No exemption available for STCG."""
        
        # Cess questions
        if 'cess' in message_lower:
            return """**Health & Education Cess:**

- Rate: 4% of total income tax
- Applied on: Total income tax (salary tax + capital gains tax)
- Not applied on: Individual components separately

Example:
- Salary Tax: ₹1,00,000
- Capital Gains Tax: ₹50,000
- Total Income Tax: ₹1,50,000
- Cess (4%): ₹6,000
- Final Tax Liability: ₹1,56,000"""
        
        # Default response
        return """I'm your tax advisor assistant. I can help you with:

• Understanding your tax calculations
• Explaining STCG/LTCG rules
• Tax-saving suggestions
• Form-16 and capital gains queries
• New Tax Regime rules (FY 2024-25)

What would you like to know about your taxes?"""
    
    def _get_tax_saving_suggestions(self) -> str:
        """
        Generate personalized tax-saving suggestions
        """
        if not self.user_context or 'calculation' not in self.user_context:
            return "Please complete your tax calculation first to get personalized suggestions."
        
        calc = self.user_context['calculation']
        suggestions = ["**Tax Optimization Suggestions:**\n"]
        
        # Check if near Section 87A threshold
        taxable_income = calc.get('taxable_income', 0)
        if 1100000 <= taxable_income <= 1250000:
            suggestions.append("• You're close to the ₹12L threshold for Section 87A rebate. Consider:")
            suggestions.append("  - Maximizing standard deduction claims")
            suggestions.append("  - Reviewing any additional income sources")
        
        # LTCG optimization
        ltcg_total = self.user_context.get('equity', {}).get('ltcg_total', 0) + \
                     self.user_context.get('mutual_funds', {}).get('equity_ltcg', 0)
        if ltcg_total > 125000:
            taxable_ltcg = ltcg_total - 125000
            suggestions.append(f"\n• Your LTCG is ₹{ltcg_total:,.2f} (taxable: ₹{taxable_ltcg:,.2f})")
            suggestions.append("  - Consider spreading sales across financial years")
            suggestions.append("  - Utilize the ₹1.25L exemption annually")
        
        # TDS optimization
        tds_paid = self.user_context.get('salary', {}).get('tds_paid', 0)
        total_tax = calc.get('total_tax', 0)
        if tds_paid > total_tax * 1.1:
            refund = tds_paid - total_tax
            suggestions.append(f"\n• You've overpaid TDS by ₹{refund:,.2f}")
            suggestions.append("  - File ITR to claim refund")
            suggestions.append("  - Consider Form 15G/15H if eligible")
        
        return "\n".join(suggestions) if len(suggestions) > 1 else "Your tax planning looks optimal!"
    
    def _explain_calculation(self) -> str:
        """
        Explain the tax calculation breakdown
        """
        if not self.user_context or 'calculation' not in self.user_context:
            return "No calculation data available. Please complete your tax calculation first."
        
        calc = self.user_context['calculation']
        
        explanation = f"""**Your Tax Calculation Breakdown:**

1. **Income Computation:**
   - Gross Salary: ₹{self.user_context.get('salary', {}).get('gross_salary', 0):,.2f}
   - Less: Standard Deduction: ₹75,000
   - Taxable Salary: ₹{calc.get('taxable_income', 0):,.2f}

2. **Tax Calculation:**
   - Salary Tax (slab rates): ₹{calc.get('salary_tax', 0):,.2f}
"""
        
        if calc.get('stock_tax', 0) > 0:
            explanation += f"   - Stock Capital Gains Tax: ₹{calc.get('stock_tax', 0):,.2f}\n"
        
        if calc.get('mf_tax', 0) > 0:
            explanation += f"   - Mutual Fund Tax: ₹{calc.get('mf_tax', 0):,.2f}\n"
        
        explanation += f"""
3. **Final Liability:**
   - Total Income Tax: ₹{calc.get('total_before_cess', 0):,.2f}
   - Add: Cess (4%): ₹{calc.get('cess', 0):,.2f}
   - **Total Tax Liability: ₹{calc.get('total_tax', 0):,.2f}**
   
4. **Net Payable:**
   - Less: TDS Paid: ₹{self.user_context.get('salary', {}).get('tds_paid', 0):,.2f}
   - **Net Payable: ₹{calc.get('net_payable', 0):,.2f}**
"""
        
        return explanation
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get full conversation history"""
        return self.conversation_history
