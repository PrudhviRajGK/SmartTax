import { useState, useEffect, useRef } from 'react';
import { useITR } from '../contexts/ITRContext';
import api from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const TaxAdvisorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { itr1State, itr2State } = useITR();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildUserContext = () => {
    // Determine which ITR type has data
    const hasITR1 = itr1State.calculated && itr1State.calculationResult;
    const hasITR2 = itr2State.calculated && itr2State.calculationResult;

    if (!hasITR1 && !hasITR2) {
      return null;
    }

    const context: any = {
      itr_type: hasITR2 ? 'ITR-2' : 'ITR-1',
    };

    // Add salary data
    if (hasITR1 && itr1State.salary.data) {
      context.salary = {
        gross_salary: itr1State.salary.data.gross_salary || itr1State.salary.data.salary,
        tds_paid: itr1State.salary.data.tds_paid || itr1State.salary.data.deductions,
      };
    } else if (hasITR2 && itr2State.salary.data) {
      context.salary = {
        gross_salary: itr2State.salary.data.gross_salary || itr2State.salary.data.salary,
        tds_paid: itr2State.salary.data.tds_paid || itr2State.salary.data.deductions,
      };
    }

    // Add ITR-2 specific data
    if (hasITR2) {
      if (itr2State.equity.data) {
        context.equity = {
          stcg_total: (itr2State.equity.data.stcg_before || 0) + (itr2State.equity.data.stcg_after || 0),
          ltcg_total: (itr2State.equity.data.ltcg_before || 0) + (itr2State.equity.data.ltcg_after || 0),
        };
      }

      if (itr2State.mutualFunds.data) {
        context.mutual_funds = {
          equity_stcg: itr2State.mutualFunds.data.equity_stcg || 0,
          equity_ltcg: itr2State.mutualFunds.data.equity_ltcg || 0,
          debt_total: (itr2State.mutualFunds.data.debt_stcg || 0) + (itr2State.mutualFunds.data.debt_ltcg || 0),
        };
      }
    }

    // Add calculation results
    const result = hasITR2 ? itr2State.calculationResult : itr1State.calculationResult;
    if (result) {
      context.calculation = {
        salary_tax: result.finalTaxSummary?.salaryPlusDebtMfTax || 0,
        stock_tax: result.finalTaxSummary?.stockCapitalGainsTax || 0,
        mf_tax: result.finalTaxSummary?.mutualFundEquityTax || 0,
        total_before_cess: result.finalTaxSummary?.totalIncomeTaxBeforeCess || 0,
        cess: result.finalTaxSummary?.cess || 0,
        total_tax: result.finalTaxSummary?.totalTaxLiability || 0,
        net_payable: result.netPayable || 0,
        taxable_income: result.taxableIncome || 0,
      };
    }

    return context;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/message', {
        message: inputMessage,
        user_context: buildUserContext(),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: response.data.data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting. Please make sure Ollama is running with the phi3:mini model installed.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[rgb(var(--color-accent))] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
          aria-label="Open Tax Advisor Chat"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border))] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-[rgb(var(--color-accent))] text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Tax Advisor AI</h3>
                <p className="text-[11px] text-white/80">Powered by Phi-3</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-[14px] text-[rgb(var(--color-text-secondary))] mb-2">
                  Hi! I'm your tax advisor.
                </p>
                <p className="text-[12px] text-[rgb(var(--color-text-tertiary))]">
                  Ask me about your taxes, calculations, or tax-saving tips!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[rgb(var(--color-accent))] text-white'
                      : 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))]'
                  }`}
                >
                  <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[rgb(var(--color-border))]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your taxes..."
                className="flex-1 px-4 py-2.5 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-xl text-[14px] text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2.5 bg-[rgb(var(--color-accent))] text-white rounded-xl hover:bg-[rgb(var(--color-accent-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaxAdvisorChat;
