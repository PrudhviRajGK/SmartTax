// import { useState, useEffect, useRef } from 'react';
// import { useITR } from '../contexts/ITRContext';
// import api from '../services/api';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
// }

// const TaxAdvisorChat = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { itr1State, itr2State } = useITR();

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const buildUserContext = () => {
//     // Determine which ITR type has data
//     const hasITR1 = itr1State.calculated && itr1State.calculationResult;
//     const hasITR2 = itr2State.calculated && itr2State.calculationResult;

//     if (!hasITR1 && !hasITR2) {
//       return null;
//     }

//     const context: any = {
//       itr_type: hasITR2 ? 'ITR-2' : 'ITR-1',
//     };

//     // Add salary data
//     if (hasITR1 && itr1State.salary.data) {
//       context.salary = {
//         gross_salary: itr1State.salary.data.gross_salary || itr1State.salary.data.salary,
//         tds_paid: itr1State.salary.data.tds_paid || itr1State.salary.data.deductions,
//       };
//     } else if (hasITR2 && itr2State.salary.data) {
//       context.salary = {
//         gross_salary: itr2State.salary.data.gross_salary || itr2State.salary.data.salary,
//         tds_paid: itr2State.salary.data.tds_paid || itr2State.salary.data.deductions,
//       };
//     }

//     // Add ITR-2 specific data
//     if (hasITR2) {
//       if (itr2State.equity.data) {
//         context.equity = {
//           stcg_total: (itr2State.equity.data.stcg_before || 0) + (itr2State.equity.data.stcg_after || 0),
//           ltcg_total: (itr2State.equity.data.ltcg_before || 0) + (itr2State.equity.data.ltcg_after || 0),
//         };
//       }

//       if (itr2State.mutualFunds.data) {
//         context.mutual_funds = {
//           equity_stcg: itr2State.mutualFunds.data.equity_stcg || 0,
//           equity_ltcg: itr2State.mutualFunds.data.equity_ltcg || 0,
//           debt_total: (itr2State.mutualFunds.data.debt_stcg || 0) + (itr2State.mutualFunds.data.debt_ltcg || 0),
//         };
//       }
//     }

//     // Add calculation results
//     const result = hasITR2 ? itr2State.calculationResult : itr1State.calculationResult;
//     if (result) {
//       context.calculation = {
//         salary_tax: result.finalTaxSummary?.salaryPlusDebtMfTax || 0,
//         stock_tax: result.finalTaxSummary?.stockCapitalGainsTax || 0,
//         mf_tax: result.finalTaxSummary?.mutualFundEquityTax || 0,
//         total_before_cess: result.finalTaxSummary?.totalIncomeTaxBeforeCess || 0,
//         cess: result.finalTaxSummary?.cess || 0,
//         total_tax: result.finalTaxSummary?.totalTaxLiability || 0,
//         net_payable: result.netPayable || 0,
//         taxable_income: result.taxableIncome || 0,
//       };
//     }

//     return context;
//   };

//   const sendMessage = async () => {
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage: Message = {
//       role: 'user',
//       content: inputMessage,
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       const response = await api.post('/chatbot/message', {
//         message: inputMessage,
//         user_context: buildUserContext(),
//       });

//       const assistantMessage: Message = {
//         role: 'assistant',
//         content: response.data.data.message,
//         timestamp: response.data.data.timestamp,
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//     } catch (error) {
//       console.error('Chatbot error:', error);
//       const errorMessage: Message = {
//         role: 'assistant',
//         content: "I apologize, but I'm having trouble connecting. Please make sure Ollama is running with the phi3:mini model installed.",
//         timestamp: new Date().toISOString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <>
//       {/* Floating Chat Button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 w-16 h-16 bg-[rgb(var(--color-accent))] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
//           aria-label="Open Tax Advisor Chat"
//         >
//           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//             <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//           </svg>
//         </button>
//       )}

//       {/* Chat Window */}
//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border))] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
//           {/* Header */}
//           <div className="bg-[rgb(var(--color-accent))] text-white p-4 flex items-center justify-between rounded-t-2xl">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-[15px]">Tax Advisor AI</h3>
//                 <p className="text-[11px] text-white/80">Powered by Phi-3</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-white/80 hover:text-white transition-colors"
//               aria-label="Close chat"
//             >
//               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.length === 0 && (
//               <div className="text-center py-8">
//                 <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                   </svg>
//                 </div>
//                 <p className="text-[14px] text-[rgb(var(--color-text-secondary))] mb-2">
//                   Hi! I'm your tax advisor.
//                 </p>
//                 <p className="text-[12px] text-[rgb(var(--color-text-tertiary))]">
//                   Ask me about your taxes, calculations, or tax-saving tips!
//                 </p>
//               </div>
//             )}

//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
//                     msg.role === 'user'
//                       ? 'bg-[rgb(var(--color-accent))] text-white'
//                       : 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))]'
//                   }`}
//                 >
//                   <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
//                 </div>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-2xl px-4 py-3">
//                   <div className="flex gap-1">
//                     <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                     <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                     <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div className="p-4 border-t border-[rgb(var(--color-border))]">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask about your taxes..."
//                 className="flex-1 px-4 py-2.5 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-xl text-[14px] text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-transparent"
//                 disabled={isLoading}
//               />
//               <button
//                 onClick={sendMessage}
//                 disabled={!inputMessage.trim() || isLoading}
//                 className="px-4 py-2.5 bg-[rgb(var(--color-accent))] text-white rounded-xl hover:bg-[rgb(var(--color-accent-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="Send message"
//               >
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default TaxAdvisorChat;
// import { useState, useEffect, useRef } from 'react';
// import { useITR } from '../contexts/ITRContext';
// import api from '../services/api';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
// }

// const TaxAdvisorChat = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { itr1State, itr2State } = useITR();

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Check Ollama connection on mount
//   useEffect(() => {
//     if (isOpen) {
//       checkOllamaConnection();
//     }
//   }, [isOpen]);

//   const checkOllamaConnection = async () => {
//     try {
//       const response = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
//       if (response.ok) {
//         setOllamaStatus('connected');
//       } else {
//         setOllamaStatus('disconnected');
//       }
//     } catch (error) {
//       setOllamaStatus('disconnected');
//     }
//   };

//   const buildUserContext = () => {
//     // Determine which ITR type has calculated data
//     const hasITR1 = itr1State.calculated && itr1State.calculationResult;
//     const hasITR2 = itr2State.calculated && itr2State.calculationResult;

//     if (!hasITR1 && !hasITR2) {
//       return null;
//     }

//     // Use ITR-2 if available, otherwise ITR-1
//     const activeITR = hasITR2 ? itr2State : itr1State;
//     const itrType = hasITR2 ? 'ITR-2' : 'ITR-1';

//     const context: any = {
//       itr_type: itrType,
//     };

//     // Add salary data (both ITR types have this)
//     if (activeITR.salary.data) {
//       context.salary = {
//         gross_salary: activeITR.salary.data.gross_salary || activeITR.salary.data.salary || 0,
//         tds_paid: activeITR.salary.data.tds_paid || activeITR.salary.data.deductions || 0,
//       };
//     }

//     // Add ITR-2 specific data
//     if (hasITR2) {
//       // Equity stock capital gains
//       if (itr2State.equity.data) {
//         const equityData = itr2State.equity.data;
//         context.equity = {
//           stcg_total: (equityData.stcg_before || 0) + (equityData.stcg_after || 0),
//           ltcg_total: (equityData.ltcg_before || 0) + (equityData.ltcg_after || 0),
//           stcg_before: equityData.stcg_before || 0,
//           stcg_after: equityData.stcg_after || 0,
//           ltcg_before: equityData.ltcg_before || 0,
//           ltcg_after: equityData.ltcg_after || 0,
//         };
//       }

//       // Mutual fund capital gains
//       if (itr2State.mutualFunds.data) {
//         const mfData = itr2State.mutualFunds.data;
//         context.mutual_funds = {
//           equity_stcg: mfData.equity_stcg || 0,
//           equity_ltcg: mfData.equity_ltcg || 0,
//           debt_stcg: mfData.debt_stcg || 0,
//           debt_ltcg: mfData.debt_ltcg || 0,
//           debt_total: (mfData.debt_stcg || 0) + (mfData.debt_ltcg || 0),
//         };
//       }
//     }

//     // Add comprehensive calculation results
//     const result = activeITR.calculationResult;
//     if (result) {
//       const finalTaxSummary = result.finalTaxSummary || result.data?.final_tax || {};
      
//       context.calculation = {
//         // Individual tax components
//         salary_tax: finalTaxSummary.salaryPlusDebtMfTax || 0,
//         stock_tax: finalTaxSummary.stockCapitalGainsTax || 0,
//         mf_tax: finalTaxSummary.mutualFundEquityTax || 0,
        
//         // Tax computation breakdown
//         total_before_cess: finalTaxSummary.totalIncomeTaxBeforeCess || 0,
//         cess: finalTaxSummary.cess || 0,
//         total_tax: finalTaxSummary.totalTaxLiability || result.data?.final_tax?.total_liability || 0,
        
//         // Payment status
//         net_payable: result.netPayable || result.data?.final_tax?.net_payable || 0,
        
//         // Income details
//         taxable_income: result.taxableIncome || 0,
//       };
//     }

//     return context;
//   };

//   const sendMessage = async (quickMessage?: string) => {
//     const messageToSend = quickMessage || inputMessage;
//     if (!messageToSend.trim() || isLoading) return;

//     const userMessage: Message = {
//       role: 'user',
//       content: messageToSend,
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       const response = await api.post('/chatbot/message', {
//         message: messageToSend,
//         user_context: buildUserContext(),
//       });

//       const assistantMessage: Message = {
//         role: 'assistant',
//         content: response.data.data.message,
//         timestamp: response.data.data.timestamp,
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
      
//       // Update Ollama status based on response quality
//       if (!assistantMessage.content.includes('Ollama')) {
//         setOllamaStatus('connected');
//       }
//     } catch (error) {
//       console.error('Chatbot error:', error);
//       setOllamaStatus('disconnected');
      
//       const errorMessage: Message = {
//         role: 'assistant',
//         content: "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please ensure:\n1. Ollama is running (`ollama serve`)\n2. Model is installed (`ollama pull llama3.2:3b-instruct-fp16`)\n3. Backend server is running on port 8000",
//         timestamp: new Date().toISOString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//     api.post('/chatbot/clear').catch(console.error);
//   };

//   // Quick action buttons
//   const quickActions = [
//     { label: '💰 My Tax Liability', message: 'What is my total tax liability?' },
//     { label: '💡 Tax Saving Tips', message: 'Give me tax saving suggestions' },
//     { label: '📊 Explain My Calculation', message: 'Explain my tax calculation in detail' },
//     { label: '📈 LTCG Optimization', message: 'How can I optimize my LTCG?' },
//   ];

//   return (
//     <>
//       {/* Floating Chat Button with Status Indicator */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110 group"
//           aria-label="Open Tax Advisor Chat"
//         >
//           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//             <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//           </svg>
//           {/* Status dot */}
//           <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
//         </button>
//       )}

//       {/* Enhanced Chat Window */}
//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
//           {/* Enhanced Header with Status */}
//           <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
//             <div className="flex items-center gap-3">
//               <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-bold text-[16px]">SmartTax AI</h3>
//                 <div className="flex items-center gap-1.5">
//                   <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'connected' ? 'bg-green-300' : 'bg-yellow-300'} animate-pulse`}></span>
//                   <p className="text-[11px] text-white/90">
//                     {ollamaStatus === 'connected' ? 'Your Personal CA' : 'Checking AI...'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {messages.length > 0 && (
//                 <button
//                   onClick={clearChat}
//                   className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
//                   aria-label="Clear chat"
//                   title="Clear conversation"
//                 >
//                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                   </svg>
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
//                 aria-label="Close chat"
//               >
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Messages Container */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
//             {/* Welcome Message */}
//             {messages.length === 0 && (
//               <div className="space-y-4">
//                 <div className="text-center py-6">
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//                     <svg className="w-10 h-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                     </svg>
//                   </div>
//                   <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">
//                     Namaste! I'm Your Personal CA 🙏
//                   </h4>
//                   <p className="text-[13px] text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
//                     I've analyzed your tax data. Ask me anything about your taxes, savings, or ITR filing!
//                   </p>
//                 </div>

//                 {/* Quick Actions */}
//                 {buildUserContext() && (
//                   <div className="space-y-2">
//                     <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide px-1">
//                       Quick Actions
//                     </p>
//                     <div className="grid grid-cols-2 gap-2">
//                       {quickActions.map((action, idx) => (
//                         <button
//                           key={idx}
//                           onClick={() => sendMessage(action.message)}
//                           className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
//                         >
//                           <span className="text-[13px] text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                             {action.label}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Chat Messages */}
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
//                     msg.role === 'user'
//                       ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
//                       : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
//                   }`}
//                 >
//                   <div className="text-[14px] whitespace-pre-wrap leading-relaxed">
//                     {msg.content.split('\n').map((line, i) => {
//                       // Handle bold markdown
//                       if (line.includes('**')) {
//                         const parts = line.split(/\*\*(.*?)\*\*/g);
//                         return (
//                           <p key={i} className="mb-1">
//                             {parts.map((part, j) => 
//                               j % 2 === 1 ? <strong key={j}>{part}</strong> : part
//                             )}
//                           </p>
//                         );
//                       }
//                       // Handle bullet points
//                       if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
//                         return (
//                           <p key={i} className="mb-1 ml-2">
//                             {line}
//                           </p>
//                         );
//                       }
//                       return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />;
//                     })}
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Loading Animation */}
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-4 shadow-sm">
//                   <div className="flex gap-1.5">
//                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Enhanced Input Area */}
//           <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex gap-2">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask about your taxes, savings, or filing..."
//                 rows={1}
//                 className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 disabled={isLoading}
//                 style={{ maxHeight: '100px', minHeight: '48px' }}
//               />
//               <button
//                 onClick={() => sendMessage()}
//                 disabled={!inputMessage.trim() || isLoading}
//                 className="px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:hover:shadow-sm flex items-center justify-center"
//                 aria-label="Send message"
//               >
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                 </svg>
//               </button>
//             </div>
            
//             {/* Status Footer */}
//             {ollamaStatus === 'disconnected' && (
//               <div className="mt-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//                 <p className="text-[11px] text-yellow-800 dark:text-yellow-200">
//                   ⚠️ AI offline. Basic responses active. Start Ollama for full features.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default TaxAdvisorChat;

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
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { itr1State, itr2State } = useITR();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      checkOllamaConnection();
    }
  }, [isOpen]);

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
      if (response.ok) {
        setOllamaStatus('connected');
      } else {
        setOllamaStatus('disconnected');
      }
    } catch (error) {
      setOllamaStatus('disconnected');
    }
  };

  const buildUserContext = () => {
    // Determine which ITR has been calculated
    const hasITR1 = itr1State.calculated && itr1State.calculationResult;
    const hasITR2 = itr2State.calculated && itr2State.calculationResult;

    if (!hasITR1 && !hasITR2) {
      return null;
    }

    // Use ITR-2 if available (more comprehensive), otherwise ITR-1
    const activeITR = hasITR2 ? itr2State : itr1State;
    const itrType = hasITR2 ? 'ITR-2' : 'ITR-1';

    const context: any = {
      itr_type: itrType,
    };

    // === SALARY DATA (both ITR types) ===
    if (activeITR.salary.data) {
      context.salary = {
        gross_salary: activeITR.salary.data.gross_salary || activeITR.salary.data.salary || 0,
        tds_paid: activeITR.salary.data.tds_paid || activeITR.salary.data.deductions || 0,
      };
    }

    // === ITR-2 SPECIFIC: CAPITAL GAINS ===
    if (hasITR2) {
      // Equity Stock Capital Gains
      if (itr2State.equity.data) {
        const equityData = itr2State.equity.data;
        context.equity = {
          stcg_before: equityData.stcg_before || 0,
          stcg_after: equityData.stcg_after || 0,
          ltcg_before: equityData.ltcg_before || 0,
          ltcg_after: equityData.ltcg_after || 0,
          stcg_total: (equityData.stcg_before || 0) + (equityData.stcg_after || 0),
          ltcg_total: (equityData.ltcg_before || 0) + (equityData.ltcg_after || 0),
        };
      }

      // Mutual Fund Capital Gains (CRITICAL: Include all details)
      if (itr2State.mutualFunds.data) {
        const mfData = itr2State.mutualFunds.data;
        context.mutual_funds = {
          // Equity MF (LTCG has ₹1.25L exemption, 12.5% tax)
          equity_stcg: mfData.equity_stcg || 0,
          equity_ltcg: mfData.equity_ltcg || 0,
          
          // Debt MF (Added to salary income)
          debt_stcg: mfData.debt_stcg || 0,
          debt_ltcg: mfData.debt_ltcg || 0,
          debt_total: (mfData.debt_stcg || 0) + (mfData.debt_ltcg || 0),
        };
      }
    }

    // === TAX CALCULATION RESULTS (CRITICAL: Use actual computed values) ===
    const result = activeITR.calculationResult;
    if (result) {
      const finalTaxSummary = result.finalTaxSummary || result.data?.finalTaxSummary || {};
      
      context.calculation = {
        // Individual tax components (from backend calculation)
        salary_tax: finalTaxSummary.salaryPlusDebtMfTax || 0,
        stock_tax: finalTaxSummary.stockCapitalGainsTax || 0,
        mf_tax: finalTaxSummary.mutualFundEquityTax || 0,
        
        // Tax computation breakdown
        total_before_cess: finalTaxSummary.totalIncomeTaxBeforeCess || 0,
        cess: finalTaxSummary.cess || 0,
        total_tax: finalTaxSummary.totalTaxLiability || 0,
        
        // Payment status
        net_payable: result.netPayable || 0,
        
        // Income details
        taxable_income: result.taxableIncome || 0,
      };
      
      // CRITICAL: Add equity MF specific tax details
      if (result.equityMutualFunds) {
        context.calculation.equity_mf_details = {
          ltcg_amount: result.equityMutualFunds.ltcg || 0,
          ltcg_exemption: result.equityMutualFunds.ltcgExemption || 125000,
          taxable_ltcg: result.equityMutualFunds.taxableLtcg || 0,
          ltcg_tax: result.equityMutualFunds.equityMfTax || 0,
        };
      }
    }

    return context;
  };

  const sendMessage = async (quickMessage?: string) => {
    const messageToSend = quickMessage || inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/message', {
        message: messageToSend,
        user_context: buildUserContext(),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: response.data.data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (!assistantMessage.content.includes('Ollama')) {
        setOllamaStatus('connected');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setOllamaStatus('disconnected');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "⚠️ **Connection Issue**\n\nI'm having trouble connecting. Please ensure:\n1. Ollama is running (`ollama serve`)\n2. Model is installed (`ollama pull llama3.2:1b`)\n3. Backend server is running on port 8000",
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

  const clearChat = () => {
    setMessages([]);
    api.post('/chatbot/clear').catch(console.error);
  };

  const quickActions = [
    { label: '💰 My Tax Liability', message: 'What is my total tax liability?' },
    { label: '💡 Tax Saving Tips', message: 'Give me tax saving suggestions' },
    { label: '📊 Explain Calculation', message: 'Explain my tax calculation' },
    { label: '📈 Capital Gains', message: 'Explain my capital gains tax' },
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110 group"
          aria-label="Open Tax Advisor Chat"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[16px]">SmartTax AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'connected' ? 'bg-green-300' : 'bg-yellow-300'} animate-pulse`}></span>
                  <p className="text-[11px] text-white/90">
                    {ollamaStatus === 'connected' ? 'Your Personal CA' : 'Checking AI...'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  aria-label="Clear chat"
                  title="Clear conversation"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">
                    Namaste! I'm Your Personal CA 🙏
                  </h4>
                  <p className="text-[13px] text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
                    I've analyzed your tax data. Ask me anything about your taxes, savings, or ITR filing!
                  </p>
                </div>

                {buildUserContext() && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide px-1">
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(action.message)}
                          className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                        >
                          <span className="text-[13px] text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="text-[14px] whitespace-pre-wrap leading-relaxed">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.includes('**')) {
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={i} className="mb-1">
                            {parts.map((part, j) => 
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        return (
                          <p key={i} className="mb-1 ml-2">
                            {line}
                          </p>
                        );
                      }
                      return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your taxes, savings, or filing..."
                rows={1}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
                style={{ maxHeight: '100px', minHeight: '48px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:hover:shadow-sm flex items-center justify-center"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {ollamaStatus === 'disconnected' && (
              <div className="mt-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-[11px] text-yellow-800 dark:text-yellow-200">
                  ⚠️ AI offline. Basic responses active. Start Ollama for full features.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TaxAdvisorChat;