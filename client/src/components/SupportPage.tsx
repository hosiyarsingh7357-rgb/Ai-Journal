import React from 'react';
import { Card } from './ui/Card';
import { HelpCircle, MessageSquare, Mail, Phone, Globe } from 'lucide-react';

export const SupportPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background">
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
            <button className="w-full py-3 rounded-2xl bg-surface-muted text-text-primary font-black text-[10px] uppercase tracking-widest hover:bg-border transition-all">
              Contact Us
            </button>
          </Card>

          <Card className="p-8 text-center group">
            <div className="w-16 h-16 rounded-3xl bg-status-success/10 text-status-success flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-premium">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Live Chat</h3>
            <p className="text-text-secondary font-medium mb-6">Available 24/5 during market hours.</p>
            <button className="w-full py-3 rounded-2xl bg-status-success text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-premium">
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
    </div>
  );
};
