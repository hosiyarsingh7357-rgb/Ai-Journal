import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Download, 
  Edit2, 
  Plus, 
  UserMinus, 
  MessageSquare,
  CreditCard
} from 'lucide-react';

const plans = [
  {
    name: 'Foundation',
    title: 'Free',
    price: '$0',
    period: '/year',
    features: [
      { text: '3 Active Portfolios', included: true },
      { text: 'Basic Performance Metrics', included: true },
      { text: 'AI Performance Reporting', included: false },
    ],
    buttonText: 'Downgrade',
    variant: 'outline'
  },
  {
    name: 'Architect',
    title: 'Pro',
    price: '$240',
    period: '/year',
    features: [
      { text: 'Unlimited Portfolios', included: true },
      { text: 'Advanced Risk Analytics', included: true },
      { text: 'Weekly AI Wealth Reports', included: true },
    ],
    buttonText: 'Current Active Plan',
    variant: 'primary',
    current: true
  },
  {
    name: 'Elite Master',
    title: 'Elite',
    price: '$590',
    period: '/year',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Custom Strategy Builder', included: true },
      { text: '24/7 Dedicated Alpha Support', included: true },
    ],
    buttonText: 'Upgrade Now',
    variant: 'dark'
  }
];

const billingHistory = [
  { date: 'Oct 12, 2023', description: 'Architect Pro Plan (Yearly)', amount: '$240.00' },
  { date: 'Oct 12, 2022', description: 'Architect Pro Plan (Yearly)', amount: '$240.00' },
  { date: 'Oct 12, 2021', description: 'Standard Starter Plan (Monthly)', amount: '$29.00' },
];

import { Card } from './ui/Card';

export const SubscriptionPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
        
        {/* Header & Toggle */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="heading-1 mb-2">Manage Subscription</h1>
              <p className="body-text">Refine your architectural workspace and scaling capabilities.</p>
            </div>
            <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-1.5 rounded-full flex items-center shadow-inner">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                  billingCycle === 'monthly' 
                    ? "bg-brand-primary text-white shadow-premium" 
                    : "text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                  billingCycle === 'yearly' 
                    ? "bg-brand-primary text-white shadow-premium" 
                    : "text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark"
                )}
              >
                Yearly 
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  billingCycle === 'yearly' ? "bg-brand-primary/20 text-brand-primary" : "bg-success/10 text-success border border-success/20"
                )}>Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <Card 
                key={i} 
                className={cn(
                  "flex flex-col relative overflow-hidden transition-all duration-500 p-6 lg:p-8",
                  plan.variant === 'primary' 
                    ? "border-brand-primary/50 shadow-premium scale-105 z-10" 
                    : "shadow-premium"
                )}
              >
                {plan.current && (
                  <div className="absolute top-0 right-0 bg-brand-primary text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg border-l border-b border-brand-primary/30">
                    Current Plan
                  </div>
                )}
                <div className="flex-1">
                  <span className={cn(
                    "label-text mb-4 block",
                    plan.variant === 'primary' ? "text-brand-primary" : "text-text-muted dark:text-text-muted-dark"
                  )}>
                    {plan.name}
                  </span>
                  <h3 className="heading-2 mb-2">{plan.title}</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-text-primary dark:text-text-primary-dark tracking-tight">{plan.price}</span>
                    <span className="text-text-muted font-medium text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={cn(
                        "flex items-center gap-3 text-sm transition-colors",
                        feature.included 
                          ? "text-text-secondary dark:text-text-secondary-dark" 
                          : "text-text-muted dark:text-text-muted-dark opacity-50"
                      )}>
                        {feature.included ? (
                          <CheckCircle2 className={cn(
                            "w-4 h-4",
                            plan.variant === 'primary' ? "text-brand-primary" : "text-success"
                          )} />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant={plan.variant === 'primary' ? 'primary' : 'outline'}
                  className="w-full py-3 mt-auto"
                  disabled={plan.current}
                >
                  {plan.buttonText}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Billing History & Payment Method */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-10">
            <Card className="p-8 shadow-premium">
              <h2 className="heading-3 mb-8">Billing History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border dark:border-border-dark">
                    <tr className="label-text">
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Description</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-border-dark">
                    {billingHistory.map((item, i) => (
                      <tr key={i} className="group hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors">
                        <td className="py-5 text-sm font-medium text-text-primary dark:text-text-primary-dark">{item.date}</td>
                        <td className="py-5 text-sm text-text-secondary dark:text-text-secondary-dark">{item.description}</td>
                        <td className="py-5 text-sm font-bold text-text-primary dark:text-text-primary-dark">{item.amount}</td>
                        <td className="py-5 text-right">
                          <button className="text-brand-primary hover:text-indigo-600 hover:underline text-sm font-semibold inline-flex items-center gap-1 transition-colors">
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8 shadow-premium">
              <h2 className="heading-3 mb-6">Payment Method</h2>
              <div className="bg-background dark:bg-background-dark rounded-xl p-5 mb-6 flex items-start gap-4 border border-border dark:border-border-dark group hover:border-brand-primary/30 transition-all">
                <div className="w-12 h-8 bg-surface dark:bg-surface-dark rounded flex items-center justify-center text-[8px] font-bold text-text-primary dark:text-text-primary-dark tracking-widest uppercase border border-border dark:border-border-dark">
                  Visa
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary dark:text-text-primary-dark tracking-tight">•••• •••• •••• 8842</p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted-dark uppercase font-medium mt-0.5">Expires 09/26</p>
                </div>
                <button className="text-brand-primary hover:bg-brand-primary/10 p-1.5 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border dark:border-border-dark text-text-muted dark:text-text-muted-dark font-bold text-sm hover:border-brand-primary hover:text-brand-primary transition-all rounded-xl hover:bg-brand-primary/5">
                <Plus className="w-4 h-4" />
                Add New Method
              </button>
            </Card>

            <Card className="p-8 shadow-premium">
              <h3 className="heading-3 mb-4">Subscription Security</h3>
              <p className="body-text mb-6">Changes to your subscription take effect immediately. Billing occurs at the start of each cycle.</p>
              <a className="text-danger text-xs font-bold uppercase tracking-widest hover:text-danger/80 hover:underline flex items-center gap-2 transition-colors" href="#">
                <UserMinus className="w-4 h-4" />
                Cancel Subscription
              </a>
            </Card>
          </div>
        </section>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="h-14 w-14 rounded-full bg-brand-primary text-white shadow-premium flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative border border-brand-primary/30">
          <MessageSquare className="w-6 h-6" fill="currentColor" />
          <span className="absolute right-full mr-4 px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none border border-border dark:border-border-dark shadow-premium">
            Contact Concierge
          </span>
        </button>
      </div>
    </div>
  );
};
