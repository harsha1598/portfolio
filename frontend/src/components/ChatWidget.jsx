import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function ChatWidget({ isOpen: controlledIsOpen, setIsOpen: controlledSetIsOpen }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Harsha's AI Agent. Ask me anything about his work at Deloitte & PwC, Azure data pipelines, or technical skills!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      setMessages([...newMessages, { role: 'assistant', text: res.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: "I'm having trouble connecting right now. Please feel free to email Harsha directly at harshareddy1598@gmail.com!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    "Tell me about Harsha's experience",
    "What is his Azure & Big Data stack?",
    "How can I get in touch with him?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Harsha's AI Agent Chat"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 border-2 border-emerald-500/60 hover:border-emerald-400 text-white shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Bot className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-mono font-bold text-slate-100 tracking-wide">
            Ask Harsha's AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] max-h-[80vh] bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Harsha's AI Agent
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Powered by Gemini & FastAPI
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="text-[11px] font-mono">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompts */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-900 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 border border-slate-800 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
