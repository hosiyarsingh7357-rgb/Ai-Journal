import React from 'react';
import { 
  Search, 
  User, 
  RefreshCw, 
  Receipt, 
  Wrench, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Mail, 
  Headphones,
  Users
} from 'lucide-react';
import { Card } from './ui/Card';

const categories = [
  { 
    title: 'Account', 
    description: 'Verification, security settings, and profile management guides.',
    icon: User
  },
  { 
    title: 'MT5 Sync', 
    description: 'Connecting your brokerage, data latency, and sync logs.',
    icon: RefreshCw
  },
  { 
    title: 'Billing', 
    description: 'Subscription plans, invoices, and payout status updates.',
    icon: Receipt
  },
  { 
    title: 'Troubleshooting', 
    description: 'Fixing data gaps, login issues, and performance optimization.',
    icon: Wrench
  },
];

const faqs = [
  'How do I reset my MT5 master password?',
  'What is the minimum balance for withdrawals?',
  'Why is my trade data not syncing in real-time?',
  'How can I export my journal to PDF?',
  'Are my trading strategies encrypted?',
  'How many demo accounts can I link?',
];

export const SupportPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 lg:mb-16 text-center">
          <h2 className="heading-1 mb-4">How can we help you today?</h2>
          <p className="body-text text-base lg:text-lg mb-10 max-w-2xl mx-auto">
            Access our knowledge base, connect with other traders, or reach out to our professional support team.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary w-5 h-5 lg:w-6 lg:h-6" />
            <input 
              className="w-full h-12 lg:h-16 pl-14 pr-6 bg-surface/50 backdrop-blur-xl border border-border rounded-2xl shadow-premium focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all text-text-primary placeholder:text-text-secondary/50 outline-none" 
              placeholder="Search for articles, guides, or troubleshooting..." 
              type="text"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 lg:mb-20">
          {categories.map((cat) => (
            <Card key={cat.title} className="p-6 lg:p-8 cursor-pointer group">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors border border-brand-primary/20">
                <cat.icon className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="heading-3 mb-2">{cat.title}</h3>
              <p className="body-text mb-4">{cat.description}</p>
              <div className="flex items-center text-brand-primary text-xs font-bold uppercase tracking-wider">
                Browse Articles <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Card>
          ))}
        </section>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-2">Frequently Asked Questions</h2>
            <button className="text-brand-primary font-bold text-sm hover:underline">View All FAQ</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
            {faqs.map((faq) => (
              <div key={faq} className="group border-b border-border py-6">
                <div className="flex justify-between items-center cursor-pointer">
                  <span className="font-semibold text-text-secondary group-hover:text-text-primary transition-colors">{faq}</span>
                  <Plus className="w-5 h-5 text-text-secondary/50 group-hover:text-brand-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-brand-primary rounded-3xl p-6 lg:p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-premium">
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h2 className="heading-2 text-white mb-4">Need personalized assistance?</h2>
              <p className="body-text text-white/70 mb-8 max-w-md mx-auto md:mx-0">Our support team is available 24/5 to help you with complex technical issues or account inquiries.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="w-full sm:w-auto bg-white text-brand-primary px-8 py-4 rounded-2xl font-bold hover:bg-surface transition-colors flex items-center justify-center gap-2 shadow-premium">
                  <MessageSquare className="w-5 h-5" />
                  Live Chat Now
                </button>
                <a className="w-full sm:w-auto border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2" href="mailto:support@tradefxbook.com">
                  <Mail className="w-5 h-5" />
                  Email Support
                </a>
              </div>
            </div>
            <div className="relative z-10 hidden md:block">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center p-8 border border-white/20">
                <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                  <Headphones className="text-white w-12 h-12" />
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <Card className="p-6 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#5865F2]/20 border border-[#5865F2]/50 rounded-xl flex items-center justify-center text-[#5865F2]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="heading-3">Traders Lounge</h3>
              </div>
              <p className="body-text mb-6 leading-relaxed">Join 50,000+ traders in our community. Share strategies, report bugs, and learn from veteran architects in real-time.</p>
            </div>
            <a className="w-full py-4 bg-[#5865F2] text-white rounded-2xl font-bold text-center hover:bg-[#5865F2]/90 transition-colors shadow-premium block" href="#">
              Join Community Discord
            </a>
          </Card>
        </section>

        <footer className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary/50 font-medium tracking-wide">
          <p>© 2026 Ai Journal. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-brand-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-brand-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-brand-primary transition-colors" href="#">API Documentation</a>
            <a className="hover:text-brand-primary transition-colors" href="#">System Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
};
