import React from 'react';
import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Star,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Lock
} from 'lucide-react';

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="min-h-screen bg-theme-bg-dark text-theme-text-primary-dark selection:bg-brand-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-theme-border-dark bg-theme-bg-dark/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <span className="italic font-black text-brand-primary text-2xl">AJ</span>
            <span className="font-bold text-theme-text-primary-dark">Ai Journal</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-theme-text-secondary-dark">
            <a href="#features" className="hover:text-theme-text-primary-dark transition-colors">Features</a>
            <a href="#demo" className="hover:text-theme-text-primary-dark transition-colors">AI Demo</a>
            <a href="#pricing" className="hover:text-theme-text-primary-dark transition-colors">Pricing</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
              The Future of Trading Psychology
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8">
              Stop Trading with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Emotions</span>. Start Trading with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-brand-primary">Intelligence</span>.
            </h1>
            <p className="text-xl text-theme-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
              AJ Ai Journal is your personal trading companion. We analyze your trades and thoughts to uncover the psychological patterns holding you back from consistent profitability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-theme-text-primary-dark text-theme-bg-dark px-10 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-theme-text-primary-dark/90 transition-all hover:scale-105 active:scale-95 group"
            >
              Try AI Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-theme-surface-dark/50 hover:bg-theme-surface-dark border border-theme-border-dark px-10 py-4 rounded-2xl font-bold text-lg transition-all">
              Watch Demo
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-12 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Joined by <span className="text-white font-bold">1,200+ profitable traders</span> this month
            </p>
          </motion.div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section id="demo" className="py-24 px-6 bg-theme-surface-dark/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              See the <span className="text-brand-primary">AI Intelligence</span> in Action
            </h2>
            <p className="text-lg text-theme-text-secondary-dark leading-relaxed">
              Our AI doesn't just look at numbers. It reads your journal entries, analyzes your entry/exit timing, and identifies emotional triggers like FOMO or Revenge Trading.
            </p>
            <div className="space-y-4">
              {[
                "Identify hidden psychological patterns",
                "Get personalized coaching based on your data",
                "Uncover why you're missing winning setups"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="font-medium text-theme-text-primary-dark/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-primary to-brand-secondary blur-2xl opacity-20 rounded-[2rem]" />
            <div className="relative bg-theme-surface-dark border border-theme-border-dark rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-theme-border-dark bg-theme-bg-dark/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-theme-text-primary-dark">AJ Intelligence</p>
                    <p className="text-[10px] text-brand-primary uppercase tracking-widest font-black">Active Analysis</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-theme-border-dark" />
                  <div className="w-2 h-2 rounded-full bg-theme-border-dark" />
                  <div className="w-2 h-2 rounded-full bg-theme-border-dark" />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-brand-primary text-white px-4 py-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-lg">
                    I felt really anxious before this XAUUSD trade. I was worried about missing the move after the news release.
                  </div>
                  <span className="text-[10px] text-theme-text-secondary-dark font-bold uppercase">Trader • 2m ago</span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="bg-theme-bg-dark text-theme-text-primary-dark px-4 py-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] border border-theme-border-dark shadow-lg">
                    <p className="mb-2">I've detected a pattern of <span className="text-brand-primary font-bold">FOMO-driven entries</span> in your last 5 gold trades.</p>
                    <p className="text-theme-text-secondary-dark text-xs italic">Recommendation: Wait for the 5-minute candle closure after news before executing. Your win rate increases by 24% when you wait.</p>
                  </div>
                  <span className="text-[10px] text-brand-primary font-bold uppercase">AJ AI • Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-black text-white mb-2">1.2M+</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Trades Analyzed</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white mb-2">85%</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Trader Retention</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white mb-2">24/7</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">AI Monitoring</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white mb-2">4.9/5</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">User Rating</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">Everything you need to <span className="text-blue-500">Master</span> your Mind</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Powerful tools designed for professional traders who take their psychology as seriously as their technicals.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "Deep Analytics", desc: "Advanced metrics that go beyond simple P&L. Track expectancy, drawdown, and risk-adjusted returns." },
              { icon: MessageSquare, title: "Emotional Journaling", desc: "Tag your trades with emotions and let AI find the correlation between your mood and your performance." },
              { icon: Zap, title: "Instant AI Insights", desc: "Get immediate feedback on your trading day with our proprietary AJ Intelligence engine." },
              { icon: Shield, title: "Bank-Grade Security", desc: "Your data is encrypted and private. We never share your trading data or strategies with anyone." },
              { icon: Lock, title: "MT5 Integration", desc: "Seamlessly sync your MetaTrader 5 account for automatic trade importing and analysis." },
              { icon: TrendingUp, title: "Growth Tracking", desc: "Monitor your progress over time with visual heatmaps and performance equity curves." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-blue-600/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent <span className="text-blue-500">Pricing</span></h2>
            <p className="text-slate-400">Choose the plan that fits your trading journey.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/10 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-slate-400 text-sm mb-6">For beginners starting out.</p>
              <div className="text-4xl font-black mb-8">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
              <div className="space-y-4 mb-8 flex-1">
                {["Manual Trade Logging", "Basic Performance Stats", "Limited AI Insights", "1 Trading Account"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-[2rem] bg-blue-600 border border-blue-500 flex flex-col relative scale-105 shadow-2xl shadow-blue-500/20">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-blue-100 text-sm mb-6">For serious active traders.</p>
              <div className="text-4xl font-black mb-8">$29<span className="text-lg text-blue-200 font-normal">/mo</span></div>
              <div className="space-y-4 mb-8 flex-1">
                {["Unlimited AI Intelligence", "MT5 Auto-Sync", "Advanced Psychology Reports", "Unlimited Accounts", "Priority Support"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span className="text-blue-50">{f}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 rounded-xl bg-white text-blue-600 font-black text-lg transition-all hover:scale-105 shadow-xl"
              >
                Start Pro Trial
              </button>
            </div>

            {/* Pro+ Plan */}
            <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/10 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Pro+</h3>
              <p className="text-slate-400 text-sm mb-6">For professional fund managers.</p>
              <div className="text-4xl font-black mb-8">$99<span className="text-lg text-slate-500 font-normal">/mo</span></div>
              <div className="space-y-4 mb-8 flex-1">
                {["Everything in Pro", "1-on-1 AI Coaching", "Custom Risk Algorithms", "Team Collaboration", "White-label Reports"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Alex Rivera", role: "Prop Firm Trader", text: "AJ Journal literally changed my trading. I realized I was revenge trading every Tuesday. AI caught it, I fixed it, now I'm funded." },
              { name: "Sarah Chen", role: "Forex Specialist", text: "The emotional tagging is genius. Seeing the correlation between my stress levels and my win rate was a wake-up call." },
              { name: "Marcus Thorne", role: "Crypto Scalper", text: "Fast, intuitive, and the AI insights are actually actionable. Not just random stats, but real coaching." }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 italic text-slate-300 relative">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 not-italic">
                  <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                    <img src={`https://picsum.photos/seed/test${i}/100/100`} alt={t.name} referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-blue-600 to-purple-700 p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight">Ready to master your <br />trading psychology?</h2>
          <p className="text-xl text-blue-100 max-w-xl mx-auto">Join thousands of traders who are using AI to build consistent profitability.</p>
          <button 
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Get Started For Free
          </button>
          <p className="text-sm text-blue-200 font-medium">No credit card required • 14-day Pro trial included</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="italic font-black text-blue-500 text-xl">AJ</span>
            <span className="font-bold text-white">Ai Journal</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 AJ Ai Journal. All rights reserved. Trading involves risk.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
