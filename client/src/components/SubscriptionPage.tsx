import React from 'react';
import { Card } from './ui/Card';
import { Check, Zap, Sparkles, Shield, BrainCircuit, Globe } from 'lucide-react';

export const SubscriptionPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Perfect for beginners starting their journey.',
      features: ['Up to 50 trades/month', 'Basic performance analytics', 'Daily AI summary', 'Standard support'],
      button: 'Current Plan',
      isCurrent: true,
      isPopular: false
    },
    {
      name: 'Pro',
      price: '$29',
      desc: 'Advanced tools for serious traders.',
      features: ['Unlimited trades', 'Full psychological analysis', 'Real-time AI suggestions', 'Priority support', 'Custom risk management'],
      button: 'Upgrade to Pro',
      isCurrent: false,
      isPopular: true
    },
    {
      name: 'Elite',
      price: '$99',
      desc: 'The ultimate edge for professional traders.',
      features: ['Everything in Pro', 'Personal AI trading coach', 'Advanced market correlations', 'API access', 'Exclusive webinars'],
      button: 'Go Elite',
      isCurrent: false,
      isPopular: false
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-6xl font-black text-text-primary tracking-tighter">Choose Your <span className="text-brand-primary">Trading Edge</span></h1>
          <p className="text-xl text-text-secondary font-medium max-w-2xl mx-auto">
            Select the plan that fits your trading style and start mastering your psychology today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`p-10 relative flex flex-col ${plan.isPopular ? 'border-brand-primary/50 shadow-premium scale-105 z-10' : 'border-border'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-premium">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text-primary">{plan.price}</span>
                  <span className="text-text-secondary font-bold">/month</span>
                </div>
                <p className="text-text-secondary font-medium mt-4 text-sm leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-status-success/10 text-status-success flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-premium active:scale-95 ${
                  plan.isCurrent 
                    ? 'bg-surface-muted text-text-muted cursor-default' 
                    : 'bg-brand-primary text-white hover:opacity-90'
                }`}
              >
                {plan.button}
              </button>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {[
            { icon: Shield, title: 'Secure Payments', desc: 'All transactions are encrypted and processed securely through Stripe.' },
            { icon: Sparkles, title: 'Cancel Anytime', desc: 'No long-term contracts. You can cancel or change your plan at any time.' },
            { icon: Zap, title: 'Instant Activation', desc: 'Get immediate access to all pro features as soon as you upgrade.' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-3xl bg-surface-muted border border-border">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-text-primary mb-1">{f.title}</h4>
                <p className="text-xs text-text-secondary font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
