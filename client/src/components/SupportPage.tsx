import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import { HelpCircle, MessageSquare, Mail, Phone, Globe, X, Send, Bot, User } from 'lucide-react';
import { chatWithSupportAI } from '../services/aiService';
import { useTrades } from '../context/TradeContext';

export const SupportPage = () => {
  const { trades } = useTrades();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: 'Hello! I am your AI Trading Assistant. I can help you with support questions or analyze your trading history. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message.trim();
    setMessage('');
    
    // Add user message to history
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newHistory);
    setIsTyping(true);

    try {
      // Call AI with trades data
      const aiResponse = await chatWithSupportAI(userMsg, chatHistory, trades);
      setChatHistory([...newHistory, { role: 'model', content: aiResponse }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: 'model', content: 'Sorry, I am having trouble connecting right now. Please try again later or email us at hosiyarsingh7357@gmail.com.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Support Center</h1>
            <p className="text-text-secondary mt-1">We're here to help you master your trading journey.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 text-center group">
            <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-premium">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Email Support</h3>
            <p className="text-text-secondary font-medium mb-6">Response within 24 hours.</p>
            <a 
              href="mailto:hosiyarsingh7357@gmail.com"
              className="block w-full py-3 rounded-2xl bg-surface-muted text-text-primary font-black text-[10px] uppercase tracking-widest hover:bg-border transition-all text-center"
            >
              Contact Us
            </a>
          </Card>

          <Card className="p-8 text-center group">
            <div className="w-16 h-16 rounded-3xl bg-status-success/10 text-status-success flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-premium">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Live Chat</h3>
            <p className="text-text-secondary font-medium mb-6">Available 24/5 during market hours.</p>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="w-full py-3 rounded-2xl bg-status-success text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-premium"
            >
              Start Chat
            </button>
          </Card>

          <Card className="p-8 text-center group">
            <div className="w-16 h-16 rounded-3xl bg-status-warning/10 text-status-warning flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-premium">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Knowledge Base</h3>
            <p className="text-text-secondary font-medium mb-6">Browse our guides and tutorials.</p>
            <button className="w-full py-3 rounded-2xl bg-surface-muted text-text-primary font-black text-[10px] uppercase tracking-widest hover:bg-border transition-all">
              View Guides
            </button>
          </Card>
        </div>

        <Card className="p-10 border-brand-primary/20 bg-surface shadow-premium text-center">
          <Globe className="w-12 h-12 text-brand-primary mx-auto mb-6" />
          <h2 className="text-2xl font-black text-text-primary mb-4">Join Our Global Community</h2>
          <p className="text-text-secondary font-medium max-w-2xl mx-auto mb-8">
            Connect with thousands of other traders using AI Journal to improve their psychological edge.
            Share strategies, insights, and grow together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 rounded-3xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-premium">
              Join Discord
            </button>
            <button className="px-8 py-4 rounded-3xl bg-surface-muted text-text-primary font-black text-xs uppercase tracking-widest hover:bg-border transition-all">
              Follow on Twitter
            </button>
          </div>
        </Card>
      </div>

      {/* AI Chatbot Modal / Slide-over */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-[350px] md:w-[400px] h-[500px] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Support Bot</h3>
                <p className="text-xs text-status-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-surface-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-surface-muted text-text-secondary' : 'bg-brand-primary/20 text-brand-primary'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-surface border border-border text-text-primary rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-surface border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors"
              />
              <button 
                type="submit"
                disabled={!message.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shrink-0"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
