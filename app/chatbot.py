# """
# Tax Advisor Chatbot using local LLM (Phi-3-mini via Ollama)
# Provides tax insights, suggestions, and answers based on user's tax data
# """

# import json
# from typing import Dict, Any, List, Optional
# from datetime import datetime


# class TaxAdvisorChatbot:
#     """
#     Tax advisor chatbot that provides insights based on user's tax calculations
#     Uses local LLM for privacy and offline capability
#     """
    
#     def __init__(self):
#         self.conversation_history: List[Dict[str, str]] = []
#         self.user_context: Dict[str, Any] = {}
        
#     def set_user_context(self, context: Dict[str, Any]):
#         """
#         Set the user's tax context (salary, calculations, documents, etc.)
#         """
#         self.user_context = context
        
#     def build_system_prompt(self) -> str:
#         """
#         Build a comprehensive system prompt with user's tax context
#         """
#         context_summary = self._summarize_context()
        
#         system_prompt = f"""You are a professional Indian tax advisor AI assistant specializing in Income Tax Returns (ITR-1 and ITR-2) for FY 2024-25 under the New Tax Regime.

# Your role:
# - Provide accurate tax advice based on Indian tax laws
# - Explain tax calculations and suggest optimizations
# - Answer questions about Form-16, capital gains, mutual funds
# - Help users understand their tax liability and potential savings

# Current User Context:
# {context_summary}

# Tax Rules (FY 2024-25 New Regime):
# - Standard Deduction: ₹75,000
# - Section 87A Rebate: Full tax rebate if taxable income ≤ ₹12,00,000
# - LTCG Exemption: ₹1,25,000 on equity/equity MF
# - Health & Education Cess: 4% on total income tax
# - Equity STCG (before 23 July): 15%, (after): 20%
# - Equity LTCG (before 23 July): 10%, (after): 12.5%
# - Equity MF STCG: 20%, LTCG: 12.5%
# - Debt MF gains: Added to income, taxed as per slab

# Tax Slabs (New Regime):
# - Up to ₹4,00,000: 0%
# - ₹4,00,001 - ₹8,00,000: 5%
# - ₹8,00,001 - ₹12,00,000: 10%
# - ₹12,00,001 - ₹16,00,000: 15%
# - ₹16,00,001 - ₹20,00,000: 20%
# - ₹20,00,001 - ₹24,00,000: 25%
# - Above ₹24,00,000: 30%

# Guidelines:
# - Be concise and practical
# - Use Indian currency format (₹)
# - Cite specific sections when relevant
# - Suggest legal tax-saving strategies
# - Never advise tax evasion
# """
#         return system_prompt
    
#     def _summarize_context(self) -> str:
#         """
#         Summarize user's tax context for the LLM
#         """
#         if not self.user_context:
#             return "No tax data available yet."
        
#         summary_parts = []
        
#         # ITR Type
#         itr_type = self.user_context.get('itr_type', 'Unknown')
#         summary_parts.append(f"Filing Type: {itr_type}")
        
#         # Salary Information
#         if 'salary' in self.user_context:
#             salary = self.user_context['salary']
#             summary_parts.append(f"Gross Salary: ₹{salary.get('gross_salary', 0):,.2f}")
#             summary_parts.append(f"TDS Paid: ₹{salary.get('tds_paid', 0):,.2f}")
        
#         # Capital Gains (ITR-2)
#         if 'equity' in self.user_context:
#             equity = self.user_context['equity']
#             summary_parts.append(f"Equity STCG: ₹{equity.get('stcg_total', 0):,.2f}")
#             summary_parts.append(f"Equity LTCG: ₹{equity.get('ltcg_total', 0):,.2f}")
        
#         if 'mutual_funds' in self.user_context:
#             mf = self.user_context['mutual_funds']
#             summary_parts.append(f"Equity MF STCG: ₹{mf.get('equity_stcg', 0):,.2f}")
#             summary_parts.append(f"Equity MF LTCG: ₹{mf.get('equity_ltcg', 0):,.2f}")
#             summary_parts.append(f"Debt MF Gains: ₹{mf.get('debt_total', 0):,.2f}")
        
#         # Tax Calculation Results
#         if 'calculation' in self.user_context:
#             calc = self.user_context['calculation']
#             summary_parts.append(f"\nTax Calculation:")
#             summary_parts.append(f"- Salary Tax: ₹{calc.get('salary_tax', 0):,.2f}")
#             if 'stock_tax' in calc:
#                 summary_parts.append(f"- Stock Capital Gains Tax: ₹{calc.get('stock_tax', 0):,.2f}")
#             if 'mf_tax' in calc:
#                 summary_parts.append(f"- MF Tax: ₹{calc.get('mf_tax', 0):,.2f}")
#             summary_parts.append(f"- Total Income Tax (before cess): ₹{calc.get('total_before_cess', 0):,.2f}")
#             summary_parts.append(f"- Cess (4%): ₹{calc.get('cess', 0):,.2f}")
#             summary_parts.append(f"- Total Tax Liability: ₹{calc.get('total_tax', 0):,.2f}")
#             summary_parts.append(f"- Net Payable: ₹{calc.get('net_payable', 0):,.2f}")
        
#         return "\n".join(summary_parts) if summary_parts else "No tax data available."
    
#     def generate_response(self, user_message: str, use_ollama: bool = True) -> str:
#         """
#         Generate a response to user's question
        
#         Args:
#             user_message: User's question or message
#             use_ollama: If True, use Ollama API; if False, use rule-based responses
        
#         Returns:
#             AI-generated response
#         """
#         # Add user message to history
#         self.conversation_history.append({
#             "role": "user",
#             "content": user_message,
#             "timestamp": datetime.utcnow().isoformat()
#         })
        
#         if use_ollama:
#             response = self._generate_with_ollama(user_message)
#         else:
#             response = self._generate_rule_based(user_message)
        
#         # Add assistant response to history
#         self.conversation_history.append({
#             "role": "assistant",
#             "content": response,
#             "timestamp": datetime.utcnow().isoformat()
#         })
        
#         return response
    
#     def _generate_with_ollama(self, user_message: str) -> str:
#         """
#         Generate response using Ollama local LLM
#         """
#         try:
#             import requests
            
#             # Build messages for Ollama
#             messages = [
#                 {"role": "system", "content": self.build_system_prompt()}
#             ]
            
#             # Add recent conversation history (last 5 exchanges)
#             recent_history = self.conversation_history[-10:] if len(self.conversation_history) > 10 else self.conversation_history
#             for msg in recent_history:
#                 messages.append({
#                     "role": msg["role"],
#                     "content": msg["content"]
#                 })
            
#             # Add current user message
#             messages.append({"role": "user", "content": user_message})
            
#             # Call Ollama API
#             response = requests.post(
#                 "http://localhost:11434/api/chat",
#                 json={
#                     "model": "phi3:mini",  # Phi-3-mini (3.8B) - excellent at reasoning
#                     "messages": messages,
#                     "stream": False,
#                     "options": {
#                         "temperature": 0.7,
#                         "top_p": 0.9,
#                         "num_predict": 500
#                     }
#                 },
#                 timeout=30
#             )
            
#             if response.status_code == 200:
#                 result = response.json()
#                 return result.get("message", {}).get("content", "I apologize, but I couldn't generate a response.")
#             else:
#                 return self._generate_rule_based(user_message)
                
#         except Exception as e:
#             print(f"Ollama error: {e}")
#             return self._generate_rule_based(user_message)
    
#     def _generate_rule_based(self, user_message: str) -> str:
#         """
#         Fallback rule-based responses when Ollama is not available
#         """
#         message_lower = user_message.lower()
        
#         # Tax saving suggestions
#         if any(word in message_lower for word in ['save', 'reduce', 'lower', 'optimize']):
#             return self._get_tax_saving_suggestions()
        
#         # Calculation explanation
#         if any(word in message_lower for word in ['calculate', 'computation', 'how', 'why']):
#             return self._explain_calculation()
        
#         # LTCG/STCG questions
#         if 'ltcg' in message_lower or 'long term' in message_lower:
#             return """**Long Term Capital Gains (LTCG):**

# For Equity Shares & Equity MF:
# - Holding period: > 12 months
# - LTCG exemption: ₹1,25,000 per year
# - Tax rate (before 23 July 2024): 10%
# - Tax rate (after 23 July 2024): 12.5%

# LTCG is calculated on gains above the exemption limit."""
        
#         if 'stcg' in message_lower or 'short term' in message_lower:
#             return """**Short Term Capital Gains (STCG):**

# For Equity Shares:
# - Holding period: ≤ 12 months
# - Tax rate (before 23 July 2024): 15%
# - Tax rate (after 23 July 2024): 20%

# For Equity Mutual Funds:
# - Holding period: ≤ 12 months
# - Tax rate: 20% (flat)

# No exemption available for STCG."""
        
#         # Cess questions
#         if 'cess' in message_lower:
#             return """**Health & Education Cess:**

# - Rate: 4% of total income tax
# - Applied on: Total income tax (salary tax + capital gains tax)
# - Not applied on: Individual components separately

# Example:
# - Salary Tax: ₹1,00,000
# - Capital Gains Tax: ₹50,000
# - Total Income Tax: ₹1,50,000
# - Cess (4%): ₹6,000
# - Final Tax Liability: ₹1,56,000"""
        
#         # Default response
#         return """I'm your tax advisor assistant. I can help you with:

# • Understanding your tax calculations
# • Explaining STCG/LTCG rules
# • Tax-saving suggestions
# • Form-16 and capital gains queries
# • New Tax Regime rules (FY 2024-25)

# What would you like to know about your taxes?"""
    
#     def _get_tax_saving_suggestions(self) -> str:
#         """
#         Generate personalized tax-saving suggestions
#         """
#         if not self.user_context or 'calculation' not in self.user_context:
#             return "Please complete your tax calculation first to get personalized suggestions."
        
#         calc = self.user_context['calculation']
#         suggestions = ["**Tax Optimization Suggestions:**\n"]
        
#         # Check if near Section 87A threshold
#         taxable_income = calc.get('taxable_income', 0)
#         if 1100000 <= taxable_income <= 1250000:
#             suggestions.append("• You're close to the ₹12L threshold for Section 87A rebate. Consider:")
#             suggestions.append("  - Maximizing standard deduction claims")
#             suggestions.append("  - Reviewing any additional income sources")
        
#         # LTCG optimization
#         ltcg_total = self.user_context.get('equity', {}).get('ltcg_total', 0) + \
#                      self.user_context.get('mutual_funds', {}).get('equity_ltcg', 0)
#         if ltcg_total > 125000:
#             taxable_ltcg = ltcg_total - 125000
#             suggestions.append(f"\n• Your LTCG is ₹{ltcg_total:,.2f} (taxable: ₹{taxable_ltcg:,.2f})")
#             suggestions.append("  - Consider spreading sales across financial years")
#             suggestions.append("  - Utilize the ₹1.25L exemption annually")
        
#         # TDS optimization
#         tds_paid = self.user_context.get('salary', {}).get('tds_paid', 0)
#         total_tax = calc.get('total_tax', 0)
#         if tds_paid > total_tax * 1.1:
#             refund = tds_paid - total_tax
#             suggestions.append(f"\n• You've overpaid TDS by ₹{refund:,.2f}")
#             suggestions.append("  - File ITR to claim refund")
#             suggestions.append("  - Consider Form 15G/15H if eligible")
        
#         return "\n".join(suggestions) if len(suggestions) > 1 else "Your tax planning looks optimal!"
    
#     def _explain_calculation(self) -> str:
#         """
#         Explain the tax calculation breakdown
#         """
#         if not self.user_context or 'calculation' not in self.user_context:
#             return "No calculation data available. Please complete your tax calculation first."
        
#         calc = self.user_context['calculation']
        
#         explanation = f"""**Your Tax Calculation Breakdown:**

# 1. **Income Computation:**
#    - Gross Salary: ₹{self.user_context.get('salary', {}).get('gross_salary', 0):,.2f}
#    - Less: Standard Deduction: ₹75,000
#    - Taxable Salary: ₹{calc.get('taxable_income', 0):,.2f}

# 2. **Tax Calculation:**
#    - Salary Tax (slab rates): ₹{calc.get('salary_tax', 0):,.2f}
# """
        
#         if calc.get('stock_tax', 0) > 0:
#             explanation += f"   - Stock Capital Gains Tax: ₹{calc.get('stock_tax', 0):,.2f}\n"
        
#         if calc.get('mf_tax', 0) > 0:
#             explanation += f"   - Mutual Fund Tax: ₹{calc.get('mf_tax', 0):,.2f}\n"
        
#         explanation += f"""
# 3. **Final Liability:**
#    - Total Income Tax: ₹{calc.get('total_before_cess', 0):,.2f}
#    - Add: Cess (4%): ₹{calc.get('cess', 0):,.2f}
#    - **Total Tax Liability: ₹{calc.get('total_tax', 0):,.2f}**
   
# 4. **Net Payable:**
#    - Less: TDS Paid: ₹{self.user_context.get('salary', {}).get('tds_paid', 0):,.2f}
#    - **Net Payable: ₹{calc.get('net_payable', 0):,.2f}**
# """
        
#         return explanation
    
#     def clear_history(self):
#         """Clear conversation history"""
#         self.conversation_history = []
    
#     def get_conversation_history(self) -> List[Dict[str, str]]:
#         """Get full conversation history"""
#         return self.conversation_history
# """
# Enhanced Tax Advisor Chatbot - SmartTax AI
# Optimized for CPU-only systems with Llama 3.2 3B
# """

# import json
# import requests
# from typing import Dict, Any, List, Optional
# from datetime import datetime


# class TaxAdvisorChatbot:
#     """
#     Professional Indian CA chatbot powered by Llama 3.2 3B
#     CPU-optimized for low-resource systems
#     """
    
#     def __init__(self, model: str = "llama3.2:3b"):
#         """
#         Initialize chatbot with Llama 3.2 3B (quantized for speed)
        
#         Args:
#             model: Ollama model name (default: llama3.2:3b)
#         """
#         self.model = model
#         self.conversation_history: List[Dict[str, str]] = []
#         self.user_context: Dict[str, Any] = {}
#         self.ollama_url = "http://localhost:11434/api/chat"
        
#     def set_user_context(self, context: Dict[str, Any]):
#         """Update user's tax context with latest data"""
#         self.user_context = context
        
#     def build_system_prompt(self) -> str:
#         """
#         Build optimized system prompt for Llama 3.2
#         Includes user's actual tax data for personalized advice
#         """
#         ctx = self.user_context
        
#         # Extract calculation results
#         calc = ctx.get('calculation', {})
#         salary_info = ctx.get('salary', {})
#         itr_type = ctx.get('itr_type', 'ITR-1')
        
#         # Format numbers properly
#         gross_salary = salary_info.get('gross_salary', 0)
#         tds_paid = salary_info.get('tds_paid', 0)
#         total_tax = calc.get('total_tax', 0)
#         net_payable = calc.get('net_payable', 0)
#         taxable_income = calc.get('taxable_income', 0)
        
#         # Build ITR-2 specific context
#         cg_context = ""
#         if itr_type == 'ITR-2':
#             equity = ctx.get('equity', {})
#             mf = ctx.get('mutual_funds', {})
            
#             if equity or mf:
#                 cg_context = f"""
# CAPITAL GAINS DATA:
# • Equity STCG: ₹{equity.get('stcg_total', 0):,.0f}
# • Equity LTCG: ₹{equity.get('ltcg_total', 0):,.0f}
# • Equity MF STCG: ₹{mf.get('equity_stcg', 0):,.0f}
# • Equity MF LTCG: ₹{mf.get('equity_ltcg', 0):,.0f}
# • Debt MF Gains: ₹{mf.get('debt_total', 0):,.0f}
# """
        
#         # Determine tax status
#         status = "REFUND" if net_payable < 0 else "PAYABLE"
#         amount = abs(net_payable)
        
#         system_prompt = f"""You are SmartTax AI, a professional Indian Chartered Accountant for FY 2024-25 (New Tax Regime).

# USER TAX PROFILE:
# Filing: {itr_type} | Salary: ₹{gross_salary:,.0f} | Tax: ₹{total_tax:,.0f} | {status}: ₹{amount:,.0f}
# {cg_context}
# TAX RULES: Std Deduction ₹75K | Sec 87A ≤₹12L | LTCG Exemption ₹1.25L | Cess 4%

# SLABS: 0-4L:0% | 4-8L:5% | 8-12L:10% | 12-16L:15% | 16-20L:20% | 20-24L:25% | 24L+:30%

# RESPONSE RULES:
# ✓ Use USER'S exact numbers above
# ✓ Keep under 3-4 sentences (CRITICAL for CPU speed)
# ✓ Be specific, not generic
# ✓ Professional yet friendly tone

# Remember: You know their complete tax situation. Give confident, brief advice."""

#         return system_prompt
    
#     def generate_response(self, user_message: str, use_ollama: bool = True) -> str:
#         """
#         Generate AI response using Llama 3.2 or fallback
#         """
#         # Add user message to history
#         self.conversation_history.append({
#             "role": "user",
#             "content": user_message,
#             "timestamp": datetime.utcnow().isoformat()
#         })
        
#         # Generate response
#         if use_ollama:
#             response = self._generate_with_ollama(user_message)
#         else:
#             response = self._generate_rule_based(user_message)
        
#         # Add assistant response to history
#         self.conversation_history.append({
#             "role": "assistant",
#             "content": response,
#             "timestamp": datetime.utcnow().isoformat()
#         })
        
#         return response
    
#     def _generate_with_ollama(self, user_message: str) -> str:
#         """
#         Generate response using Ollama - CPU OPTIMIZED
#         """
#         try:
#             # Build conversation context (REDUCED for speed)
#             messages = [
#                 {"role": "system", "content": self.build_system_prompt()}
#             ]
            
#             # Add only last 2 messages for context (reduced from 6)
#             recent_history = self.conversation_history[-4:] if len(self.conversation_history) > 4 else self.conversation_history
#             for msg in recent_history[:-1]:
#                 messages.append({
#                     "role": msg["role"],
#                     "content": msg["content"]
#                 })
            
#             # Add current message
#             messages.append({"role": "user", "content": user_message})
            
#             # CRITICAL: CPU-optimized parameters
#             response = requests.post(
#                 self.ollama_url,
#                 json={
#                     "model": self.model,
#                     "messages": messages,
#                     "stream": False,
#                     "options": {
#                         # OPTIMIZED FOR CPU PERFORMANCE
#                         "temperature": 0.3,
#                         "top_p": 0.9,
#                         "top_k": 30,
#                         "num_predict": 150,      # REDUCED from 280 for speed
#                         "repeat_penalty": 1.15,
#                         "num_ctx": 2048,         # REDUCED from 3072 for speed
#                         "num_thread": 8,         # Use more CPU threads
#                         "num_gpu": 0,            # CPU only
#                     }
#                 },
#                 timeout=60  # CRITICAL: Increased from 15 to 60 seconds for CPU
#             )
            
#             if response.status_code == 200:
#                 result = response.json()
#                 ai_response = result.get("message", {}).get("content", "")
#                 ai_response = ai_response.strip()
                
#                 return ai_response if ai_response else self._generate_rule_based(user_message)
#             else:
#                 print(f"Ollama API error: {response.status_code}")
#                 return self._generate_rule_based(user_message)
                
#         except requests.exceptions.Timeout:
#             return "⏱️ CPU is processing slowly. Try a shorter question or restart Ollama."
#         except requests.exceptions.ConnectionError:
#             return self._generate_rule_based(user_message)
#         except Exception as e:
#             print(f"Ollama error: {e}")
#             return self._generate_rule_based(user_message)
    
#     def _generate_rule_based(self, msg: str) -> str:
#         """
#         Intelligent fallback when Ollama is unavailable
#         """
#         msg_lower = msg.lower()
#         ctx = self.user_context
#         calc = ctx.get('calculation', {})
        
#         # Check if we have context
#         if not ctx or not calc:
#             return """🤖 **Ollama Not Connected**

# **Quick Setup:**
# 1. `ollama pull llama3.2:3b`
# 2. Restart Ollama: `ollama serve`
# 3. Refresh this page

# Once connected, I'll give you personalized tax advice!"""
        
#         # Personalized fallback responses
#         total_tax = calc.get('total_tax', 0)
#         net_payable = calc.get('net_payable', 0)
        
#         if any(word in msg_lower for word in ['tax', 'liability', 'how much', 'total']):
#             status = "refund of" if net_payable < 0 else "pay"
#             return f"""**Your Tax Summary:**

# • Total Tax Liability: ₹{total_tax:,.0f}
# • Net {status.title()}: ₹{abs(net_payable):,.0f}

# {"🎉 You'll get a refund after filing!" if net_payable < 0 else "💰 Pay this after TDS adjustment."}

# *Connect Ollama for AI-powered advice!*"""
        
#         if any(word in msg_lower for word in ['save', 'reduce', 'lower', 'optimize', 'tips']):
#             return f"""**Tax Saving Tips (₹{total_tax:,.0f} liability):**

# • Maximize ₹1.25L LTCG exemption
# • Spread capital gains across years
# • Check Form 15G/15H eligibility
# • Optimize TDS declarations

# *Connect Ollama for personalized strategies!*"""
        
#         if any(word in msg_lower for word in ['ltcg', 'stcg', 'capital', 'gains', 'equity']):
#             itr_type = ctx.get('itr_type', 'ITR-1')
#             if itr_type == 'ITR-2':
#                 return """**Capital Gains Rates (FY 2024-25):**

# **Equity:** STCG 15-20% | LTCG 10-12.5%
# **Equity MF:** STCG 20% | LTCG 12.5%
# **Debt MF:** Added to salary (slab rates)

# *Connect Ollama for YOUR gains analysis!*"""
#             else:
#                 return "You're on ITR-1 (salary only). Switch to ITR-2 tab for capital gains!"
        
#         if 'explain' in msg_lower or 'calculation' in msg_lower:
#             return f"""**Your Tax Breakdown:**

# 1. Gross Salary: ₹{ctx.get('salary', {}).get('gross_salary', 0):,.0f}
# 2. Standard Deduction: ₹75,000
# 3. Tax on Salary: ₹{calc.get('salary_tax', 0):,.0f}
# 4. Total Tax + Cess: ₹{total_tax:,.0f}
# 5. After TDS: ₹{abs(net_payable):,.0f} {'refund' if net_payable < 0 else 'payable'}

# *Connect Ollama for detailed analysis!*"""
        
#         # Default
#         return """👋 **I'm Your Tax Advisor!**

# Ask me:
# • "What's my tax liability?"
# • "Give me tax-saving tips"
# • "Explain my calculation"
# • "How to optimize LTCG?"

# **⚠️ Note:** Connect Ollama for AI responses:
# `ollama pull llama3.2:3b` then `ollama serve`"""
    
#     def clear_history(self):
#         """Clear conversation history"""
#         self.conversation_history = []
    
#     def get_conversation_history(self) -> List[Dict[str, str]]:
#         """Get full conversation history"""
#         return self.conversation_history
"""
SmartTax AI Chatbot - LEGALLY CORRECT Tax Advice
Follows Indian Income Tax Act 1961 strictly
"""

import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime


class TaxAdvisorChatbot:
    """
    Professional CA chatbot with CORRECT Indian tax law implementation
    """
    
    def __init__(self, model: str = "llama3.2:1b"):
        self.model = model
        self.conversation_history: List[Dict[str, str]] = []
        self.user_context: Dict[str, Any] = {}
        self.ollama_url = "http://localhost:11434/api/chat"
        
    def set_user_context(self, context: Dict[str, Any]):
        """Update user's tax context"""
        self.user_context = context
        
    def build_system_prompt(self) -> str:
        """
        Build CORRECT system prompt with proper tax classification
        """
        ctx = self.user_context
        calc = ctx.get('calculation', {})
        salary_info = ctx.get('salary', {})
        itr_type = ctx.get('itr_type', 'ITR-1')
        
        # Core numbers from ACTUAL calculation
        total_tax = calc.get('total_tax', 0)
        net_payable = calc.get('net_payable', 0)
        status = "REFUND" if net_payable < 0 else "TAX DUE"
        
        # Breakdown (as calculated by backend)
        salary_tax = calc.get('salary_tax', 0)
        stock_tax = calc.get('stock_tax', 0)
        mf_tax = calc.get('mf_tax', 0)
        
        # ITR-2: Capital Gains Details
        cg_details = ""
        if itr_type == 'ITR-2':
            equity = ctx.get('equity', {})
            mf = ctx.get('mutual_funds', {})
            
            if equity or mf:
                # CRITICAL: Specify correct tax treatment
                eq_stcg = equity.get('stcg_total', 0)
                eq_ltcg = equity.get('ltcg_total', 0)
                mf_eq_ltcg = mf.get('equity_ltcg', 0)
                mf_debt = mf.get('debt_total', 0)
                
                cg_details = f"""
CAPITAL GAINS (CORRECT TAX TREATMENT):
• Equity STCG: ₹{eq_stcg:,.0f} (taxed @ 15-20%, NOT slab)
• Equity LTCG: ₹{eq_ltcg:,.0f} (₹1.25L exempt, then 10-12.5%, NOT slab)
• Equity MF LTCG: ₹{mf_eq_ltcg:,.0f} (₹1.25L exempt, then 12.5%, NOT slab)
• Debt MF: ₹{mf_debt:,.0f} (added to salary, taxed at slab)

TAX COMPUTED:
• Stock CG Tax: ₹{stock_tax:,.0f}
• MF Equity Tax: ₹{mf_tax:,.0f} (NOT slab-taxed!)
• Salary+Debt Tax: ₹{salary_tax:,.0f}
"""
        
        # ULTRA-CONCISE prompt
        return f"""You're a CA. {itr_type}, Total Tax ₹{total_tax:,.0f}, {status} ₹{abs(net_payable):,.0f}.
{cg_details}
CRITICAL RULES:
1. Equity MF LTCG is NEVER taxed at slab rate (it's 12.5% after ₹1.25L exemption)
2. Use the EXACT tax numbers provided above
3. Answer in 2-3 SHORT sentences
4. Don't make up tax calculations - they're already done correctly"""

    def generate_response(self, user_message: str, use_ollama: bool = True) -> str:
        """Generate response"""
        self.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        response = self._generate_with_ollama(user_message) if use_ollama else self._generate_rule_based(user_message)
        
        self.conversation_history.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return response
    
    def _generate_with_ollama(self, user_message: str) -> str:
        """Generate with Ollama - CPU optimized"""
        try:
            messages = [{"role": "system", "content": self.build_system_prompt()}]
            
            if len(self.conversation_history) >= 2:
                messages.append(self.conversation_history[-2])
            
            messages.append({"role": "user", "content": user_message})
            
            response = requests.post(
                self.ollama_url,
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "top_p": 0.8,
                        "top_k": 20,
                        "num_predict": 500,
                        "repeat_penalty": 1.2,
                        "num_ctx": 4096,
                        "num_thread": 8,
                        "stop": ["User:", "Question:"],
                    }
                },
                timeout=50
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get("message", {}).get("content", "").strip()
                
                # Clean incomplete sentences
                if ai_response and not ai_response[-1] in '.!?':
                    last_period = max(ai_response.rfind('.'), ai_response.rfind('!'), ai_response.rfind('?'))
                    if last_period > 20:
                        ai_response = ai_response[:last_period + 1]
                
                return ai_response if ai_response else self._generate_rule_based(user_message)
            else:
                return self._generate_rule_based(user_message)
                
        except requests.exceptions.Timeout:
            return "⏱️ Processing took too long. Try shorter questions!"
        except Exception as e:
            print(f"Ollama error: {e}")
            return self._generate_rule_based(user_message)
    
    def _generate_rule_based(self, msg: str) -> str:
        """LEGALLY CORRECT fallback responses"""
        msg_lower = msg.lower()
        ctx = self.user_context
        calc = ctx.get('calculation', {})
        
        if not ctx or not calc:
            return "🔌 **Connect Ollama:** `ollama pull llama3.2:1b` → `ollama serve`"
        
        total_tax = calc.get('total_tax', 0)
        net_payable = calc.get('net_payable', 0)
        salary = ctx.get('salary', {}).get('gross_salary', 0)
        tds = ctx.get('salary', {}).get('tds_paid', 0)
        
        # Tax liability
        if any(w in msg_lower for w in ['tax', 'liability', 'how much', 'total', 'pay']):
            status = "refund" if net_payable < 0 else "tax due"
            emoji = "🎉" if net_payable < 0 else "💰"
            
            # Show breakdown
            breakdown = f"""
**Breakdown:**
• Salary + Debt MF Tax: ₹{calc.get('salary_tax', 0):,.0f}
• Stock Capital Gains Tax: ₹{calc.get('stock_tax', 0):,.0f}
• MF Equity Tax: ₹{calc.get('mf_tax', 0):,.0f}
• Cess (4%): ₹{calc.get('cess', 0):,.0f}
"""
            
            return f"""{emoji} **Your Tax Summary**

Total Tax Liability: **₹{total_tax:,.0f}**
Less TDS Paid: ₹{tds:,.0f}
Net {status.title()}: **₹{abs(net_payable):,.0f}**
{breakdown}
{f"Great! You'll get ₹{abs(net_payable):,.0f} refund after filing." if net_payable < 0 else f"Pay ₹{abs(net_payable):,.0f} after TDS adjustment."}"""
        
        # Capital gains explanation
        if any(w in msg_lower for w in ['capital', 'gains', 'ltcg', 'stcg', 'equity', 'mutual']):
            if ctx.get('itr_type') == 'ITR-2':
                equity = ctx.get('equity', {})
                mf = ctx.get('mutual_funds', {})
                
                # CRITICAL: Show correct tax treatment
                return f"""📊 **Capital Gains Tax (CORRECT TREATMENT)**

**Equity Stocks:**
• STCG: ₹{equity.get('stcg_total', 0):,.0f}
  → Tax @ 15-20% (NOT slab rate)
  → Tax paid: ₹{calc.get('stock_tax', 0):,.0f}

• LTCG: ₹{equity.get('ltcg_total', 0):,.0f}
  → ₹1.25L exempt, rest @ 10-12.5%
  → Included in stock tax above

**Equity Mutual Funds:**
• LTCG: ₹{mf.get('equity_ltcg', 0):,.0f}
  → ₹1.25L exempt, rest @ 12.5%
  → ❌ NEVER taxed at slab rate
  → Tax paid: ₹{calc.get('mf_tax', 0):,.0f}

**Debt Mutual Funds:**
• Total: ₹{mf.get('debt_total', 0):,.0f}
  → Added to salary income
  → Taxed at slab rate (correct)

**Total CG Tax: ₹{calc.get('stock_tax', 0) + calc.get('mf_tax', 0):,.0f}**"""
            else:
                return "You're filing **ITR-1** (salary only). Capital gains apply to ITR-2."
        
        # Savings tips
        if any(w in msg_lower for w in ['save', 'reduce', 'optimize', 'tips']):
            tips = []
            
            equity = ctx.get('equity', {})
            mf = ctx.get('mutual_funds', {})
            ltcg_total = equity.get('ltcg_total', 0) + mf.get('equity_ltcg', 0)
            
            if ltcg_total > 125000:
                taxable_ltcg = ltcg_total - 125000
                tips.append(f"• **LTCG Optimization:** You have ₹{ltcg_total:,.0f} LTCG (₹{taxable_ltcg:,.0f} taxable after ₹1.25L exemption). Consider spreading sales across FY years to maximize exemption.")
            
            taxable_income = calc.get('taxable_income', 0) or (salary - 75000)
            if 1100000 <= taxable_income <= 1250000:
                tips.append(f"• **Section 87A:** Income is ₹{taxable_income:,.0f}. Stay under ₹12L for full rebate!")
            
            if tds > total_tax * 1.15:
                overpaid = tds - total_tax
                tips.append(f"• **TDS Refund:** You overpaid by ₹{overpaid:,.0f}. File ITR to claim!")
            
            if not tips:
                tips.append("• Your tax planning is optimal!")
                tips.append("• Keep utilizing ₹1.25L LTCG exemption annually")
            
            return "💡 **Tax Saving Strategies**\n\n" + "\n".join(tips[:3])
        
        # Calculation breakdown
        if 'explain' in msg_lower or 'calculate' in msg_lower or 'breakdown' in msg_lower:
            return f"""🧮 **Tax Calculation Explained**

**Income:**
• Gross Salary: ₹{salary:,.0f}
• Less Std. Deduction: -₹75,000
• Taxable Salary: ₹{salary - 75000:,.0f}

**Tax Computation:**
1. Salary + Debt MF Tax: ₹{calc.get('salary_tax', 0):,.0f}
2. Stock CG Tax: ₹{calc.get('stock_tax', 0):,.0f}
3. Equity MF Tax: ₹{calc.get('mf_tax', 0):,.0f}
4. Total before cess: ₹{calc.get('total_before_cess', 0):,.0f}
5. Cess (4%): +₹{calc.get('cess', 0):,.0f}

**Total Tax: ₹{total_tax:,.0f}**
**Less TDS: -₹{tds:,.0f}**
**Net: ₹{abs(net_payable):,.0f}** {"refund 🎉" if net_payable < 0 else "payable 💰"}"""
        
        return """👋 **Hi! I'm your SmartTax CA**

Ask me:
• "What's my tax liability?"
• "Explain capital gains tax"
• "Give tax-saving tips"
• "Break down my calculation"

I know your complete tax situation!"""
    
    def clear_history(self):
        self.conversation_history = []
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        return self.conversation_history