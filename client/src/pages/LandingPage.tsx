import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { Button } from '../components/ui/Button';

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="relative min-h-screen bg-background text-text-primary overflow-hidden">
      {/* <BackgroundAnimation /> */}
      
      <nav className="h-24 flex items-center justify-between px-8 lg:px-16 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-status-success rounded-2xl flex items-center justify-center text-white shadow-premium">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-text-primary tracking-tight">Ai Journal</h1>
        </div>
        <Button onClick={onGetStarted} variant="primary" className="rounded-2xl">
          Sign In
        </Button>
      </nav>

      <main className="relative z-10 pt-20 pb-32 px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest"
            >
              <Sparkles className="w-4 h-4" />
              Revolutionizing Trading Psychology
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter"
            >
              Master Your <br />
              <span className="text-brand-primary">Trading Edge</span> <br />
              With AI.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary font-medium max-w-lg leading-relaxed"
            >
              The world's first AI-powered trading journal that analyzes your psychology, 
              detects patterns, and helps you eliminate emotional mistakes.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button onClick={onGetStarted} size="lg" className="rounded-3xl group">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-3xl">
                View Demo
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-primary/20 blur-[120px] rounded-full" />
            <div className="relative bg-surface border border-border rounded-[3rem] p-8 shadow-premium transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-danger/40" />
                  <div className="w-3 h-3 rounded-full bg-status-warning/40" />
                  <div className="w-3 h-3 rounded-full bg-status-success/40" />
                </div>
                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">AI ANALYSIS ACTIVE</div>
              </div>
              <div className="space-y-6">
                <div className="h-4 w-3/4 bg-surface-muted rounded-full" />
                <div className="h-4 w-full bg-surface-muted rounded-full" />
                <div className="h-32 w-full bg-brand-primary/5 rounded-3xl border border-brand-primary/20 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-brand-primary animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-surface-muted rounded-2xl" />
                  <div className="h-20 bg-surface-muted rounded-2xl" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: Shield, title: 'Secure Data', desc: 'Your trading data is encrypted and protected with enterprise-grade security.' },
            { icon: BrainCircuit, title: 'AI Insights', desc: 'Advanced algorithms detect psychological patterns in your trading behavior.' },
            { icon: Globe, title: 'Multi-Asset', desc: 'Support for Forex, Crypto, Stocks, and Indices across all major platforms.' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-surface border border-border hover:border-brand-primary/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-text-secondary font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
