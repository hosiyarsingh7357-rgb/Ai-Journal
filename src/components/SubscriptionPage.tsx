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
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">Manage Subscription</h1>
              <p className="text-slate-400 font-medium">Refine your architectural workspace and scaling capabilities.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-full flex items-center shadow-inner">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center ${
                  billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly 
                <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`p-6 lg:p-8 rounded-2xl flex flex-col relative overflow-hidden transition-all hover:shadow-2xl ${
                  plan.variant === 'primary' 
                    ? 'bg-blue-900/20 backdrop-blur-xl border-2 border-blue-500 shadow-blue-900/20' 
                    : plan.variant === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-white shadow-xl'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-sm text-white'
                }`}
              >
                {plan.current && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
                    Current Plan
                  </div>
                )}
                <div className="flex-1">
                  <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${
                    plan.variant === 'primary' ? 'text-blue-400' : plan.variant === 'dark' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {plan.name}
                  </span>
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.title}</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className={`${plan.variant === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center gap-3 text-sm ${
                        feature.included 
                          ? 'text-slate-300' 
                          : 'text-slate-600'
                      }`}>
                        {feature.included ? (
                          <CheckCircle2 className={`w-4 h-4 ${plan.variant === 'dark' ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-700" />
                        )}
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-auto ${
                  plan.variant === 'primary'
                    ? 'bg-blue-600/20 text-blue-400 cursor-default border border-blue-500/30'
                    : plan.variant === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                    : 'border border-white/20 text-slate-300 hover:bg-white/10'
                }`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Billing History & Payment Method */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold mb-8 text-white">Billing History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10">
                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Description</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {billingHistory.map((item, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="py-5 text-sm font-medium text-slate-300">{item.date}</td>
                        <td className="py-5 text-sm text-slate-400">{item.description}</td>
                        <td className="py-5 text-sm font-bold text-white">{item.amount}</td>
                        <td className="py-5 text-right">
                          <button className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-semibold inline-flex items-center gap-1 transition-colors">
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-white">Payment Method</h2>
              <div className="bg-white/5 rounded-xl p-5 mb-6 flex items-start gap-4 border border-white/10">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-[8px] font-bold text-white tracking-widest uppercase border border-white/20">
                  Visa
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white tracking-tight">•••• •••• •••• 8842</p>
                  <p className="text-[10px] text-slate-500 uppercase font-medium mt-0.5">Expires 09/26</p>
                </div>
                <button className="text-blue-400 hover:bg-blue-500/20 p-1.5 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 text-slate-400 font-bold text-sm hover:border-blue-500 hover:text-blue-400 transition-all rounded-xl hover:bg-blue-500/10">
                <Plus className="w-4 h-4" />
                Add New Method
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 text-white">Subscription Security</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">Changes to your subscription take effect immediately. Billing occurs at the start of each cycle.</p>
              <a className="text-red-400 text-xs font-bold uppercase tracking-widest hover:text-red-300 hover:underline flex items-center gap-2 transition-colors" href="#">
                <UserMinus className="w-4 h-4" />
                Cancel Subscription
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/50 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative border border-blue-400/30">
          <MessageSquare className="w-6 h-6" fill="currentColor" />
          <span className="absolute right-full mr-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none border border-white/10">
            Contact Concierge
          </span>
        </button>
      </div>
    </div>
  );
};
