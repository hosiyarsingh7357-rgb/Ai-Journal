import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Logo } from '../components/Logo';
import dashboardImg from '../assets/dashboard.png';
import executionHistoryImg from '../assets/execution-history.png';
import performanceAnalyticsImg from '../assets/performance-analytics.png';
import aiIntelligenceImg from '../assets/ai-intelligence.png';
import analysisImg from '../assets/analysis.png';
import { 
  BrainCircuit, 
  ArrowRight, 
  Target, 
  Activity, 
  BarChart3, 
  LineChart, 
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Layers,
  PieChart,
  Globe,
  Sparkles,
  Camera
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Spotlight = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.08), transparent 80%)`
      }}
    />
  );
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="relative min-h-screen bg-background text-text-primary overflow-x-hidden font-sans">
      <Spotlight />
      
      {/* Navbar */}
      <nav className="h-20 flex items-center justify-between px-6 lg:px-12 relative z-50 border-b border-border bg-background/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-xl font-black text-text-primary tracking-tight">Ai Journal</h1>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#dashboard" className="text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors">Dashboard</a>
          <a href="#trades" className="text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors">Trades</a>
          <a href="#performance" className="text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors">Performance</a>
          <a href="#ai-report" className="text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors">AI Report</a>
          <a href="#journal" className="text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors">Journal</a>
        </div>

        <Button onClick={onGetStarted} variant="primary" className="rounded-full px-6 font-bold">
          Get Started
        </Button>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-8"
        >
          <Target className="w-4 h-4" />
          The Trading Journal That Works For You
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tighter max-w-5xl mx-auto"
        >
          AI Journal — <span className="text-brand-primary">Institutional-Grade</span> Trading Intelligence
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-xl md:text-2xl text-text-secondary font-medium max-w-3xl mx-auto leading-relaxed"
        >
          Transform your trading performance with AI-driven analytics, behavioral insights, and real-time execution tracking.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button onClick={onGetStarted} size="lg" className="rounded-full px-8 h-14 text-lg font-bold group">
            Connect MT5 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-bold">
            View Platform
          </Button>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs md:text-sm text-text-muted font-bold uppercase tracking-[0.2em]"
        >
          Built for Futures & Forex Traders • Data-Driven • No Guesswork
        </motion.p>

        {/* Hero Dashboard Mockup */}
        <motion.div 
          id="dashboard"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 w-full max-w-6xl relative pt-10"
        >
          <div className="absolute inset-0 bg-brand-primary/10 blur-[100px] rounded-full" />
          <TiltCard className="relative bg-surface border border-border rounded-xl md:rounded-[2rem] p-2 md:p-4 shadow-2xl overflow-hidden">
            <img 
              src={dashboardImg} 
              alt="Dashboard" 
              className="w-full h-auto rounded-lg md:rounded-2xl border border-border object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/1200x800/1e1e2e/10B981?text=Please+upload+dashboard.png+to+client/public';
              }}
            />
          </TiltCard>
        </motion.div>
      </section>

      {/* 2. POSITIONING STRIP */}
      <section className="py-12 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl font-medium text-text-secondary">
            Designed for traders who treat trading like a business — <span className="text-text-primary font-bold">not a gamble.</span>
          </p>
        </div>
      </section>

      {/* 3. CORE VALUE (Zig-Zag 1) */}
      <section id="trades" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto pt-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <TiltCard className="aspect-square md:aspect-[4/3] bg-background border border-border rounded-3xl shadow-premium p-4 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent" />
              {/* Trades Page Mockup */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={executionHistoryImg} 
                  alt="Execution History" 
                  className="w-full h-full object-cover rounded-xl border border-border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/800x600/1e1e2e/10B981?text=Please+upload+execution-history.png+to+client/public';
                  }}
                />
              </div>
            </TiltCard>
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-muted text-text-secondary text-xs font-bold uppercase tracking-widest">
              Trades Page
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Track Every Execution</h2>
            <div className="space-y-6">
              <p className="text-text-secondary text-lg">
                Your complete trading history, automatically synced or manually entered. Review your past trades with deep AI insights to understand your winning and losing patterns.
              </p>
              <div className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-brand-primary" /></div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary">Automatic Sync</h4>
                  <p className="text-text-secondary">Connect your MT5 account to pull trades instantly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-brand-primary" /></div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary">AI Pattern Recognition</h4>
                  <p className="text-text-secondary">AI analyzes your history to find what works.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT SHOWCASE (Zig-Zag 2) */}
      <section id="performance" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto pt-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-muted text-text-secondary text-xs font-bold uppercase tracking-widest">
              Performance Page
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Everything You Need.<br/>Nothing You Don't.</h2>
            <p className="text-lg text-text-secondary">
              A clean, minimal interface designed to give you absolute clarity on your performance without the clutter. Visualize your win rate, profit factor, and Sharpe ratio instantly.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-bold">Real-time data</span>
              <span className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-bold">Clean visualization</span>
              <span className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-bold">Performance clarity</span>
            </div>
          </div>
          <div className="relative">
            <TiltCard className="aspect-square md:aspect-[4/3] bg-background border border-border rounded-3xl shadow-premium p-8 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-brand-primary/5 to-transparent" />
              {/* Performance Analytics Mockup */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={performanceAnalyticsImg} 
                  alt="Performance Analytics" 
                  className="w-full h-full object-cover rounded-xl border border-border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/800x600/1e1e2e/10B981?text=Please+upload+performance-analytics.png+to+client/public';
                  }}
                />
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* 5. AI INTELLIGENCE (Grid) */}
      <section id="ai-report" className="py-24 bg-surface border-y border-border pt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
              AI Report Page
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Turn Data Into Decisions</h2>
            <p className="text-xl text-text-secondary">
              AI Journal doesn't just track your trades — it explains them. Get a comprehensive AI-generated report on your trading behavior.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-background border border-border rounded-3xl p-8 shadow-sm hover:shadow-premium transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">What You Did Right</h3>
              <p className="text-text-secondary">"Excellent risk management on XAUUSD. You cut losses early and let winners run."</p>
            </div>
            <div className="bg-background border border-border rounded-3xl p-8 shadow-sm hover:shadow-premium transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-status-danger/10 text-status-danger flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Where You're Losing Money</h3>
              <p className="text-text-secondary">"Frequent large losses are offsetting your gains. You tend to overtrade during the London session."</p>
            </div>
            <div className="bg-background border border-border rounded-3xl p-8 shadow-sm hover:shadow-premium transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">What To Fix Next</h3>
              <p className="text-text-secondary">"Consider reducing position size during volatile sessions and limit yourself to 2 trades per day."</p>
            </div>
          </div>

          {/* AI Report Mockup */}
          <TiltCard className="max-w-4xl mx-auto bg-background border border-border rounded-[2.5rem] p-4 md:p-8 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <img 
              src="/ai-intelligence.png" 
              alt="AI Intelligence" 
              className="w-full h-auto object-cover rounded-xl border border-border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/1200x800/1e1e2e/10B981?text=Please+upload+ai-intelligence.png+to+client/public';
              }}
            />
          </TiltCard>
        </div>
      </section>

      {/* 6. JOURNAL SECTION (Zig-Zag 3) */}
      <section id="journal" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto pt-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <TiltCard className="aspect-square md:aspect-[4/3] bg-background border border-border rounded-3xl shadow-premium p-6 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent" />
              {/* Journal Mockup */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={analysisImg} 
                  alt="Trade Analysis" 
                  className="w-full h-full object-cover rounded-xl border border-border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/800x600/1e1e2e/10B981?text=Please+upload+analysis.png+to+client/public';
                  }}
                />
              </div>
            </TiltCard>
          </div>
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-muted text-text-secondary text-xs font-bold uppercase tracking-widest">
              Journal Page
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Document Your Edge</h2>
            <div className="space-y-6">
              <p className="text-text-secondary text-lg">
                Go beyond the numbers. Add screenshots, tag your emotions, and document your thought process for every trade to build a comprehensive playbook.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="border-l-2 border-brand-primary pl-4">
                  <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Screenshots</p>
                  <p className="text-xl font-black text-text-primary">Visual Proof</p>
                </div>
                <div className="border-l-2 border-brand-primary pl-4">
                  <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Tags</p>
                  <p className="text-xl font-black text-text-primary">Categorize</p>
                </div>
                <div className="border-l-2 border-brand-primary pl-4">
                  <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xl font-black text-text-primary">Log Logic</p>
                </div>
                <div className="border-l-2 border-brand-primary pl-4">
                  <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Search</p>
                  <p className="text-xl font-black text-text-primary">Find Fast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS & 8. FEATURE GRID */}
      <section className="py-24 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* How it works */}
          <div className="mb-24 text-center">
            <h2 className="text-4xl font-black tracking-tight mb-12">Get Started in Minutes</h2>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-border -z-10" />
              <div className="flex flex-col items-center bg-background p-8 rounded-3xl border border-border">
                <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center text-xl font-black mb-6">1</div>
                <h4 className="text-lg font-bold mb-2">Connect MT5</h4>
                <p className="text-text-secondary text-center text-sm">Link your account securely.</p>
              </div>
              <div className="flex flex-col items-center bg-background p-8 rounded-3xl border border-border">
                <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center text-xl font-black mb-6">2</div>
                <h4 className="text-lg font-bold mb-2">Sync Data</h4>
                <p className="text-text-secondary text-center text-sm">Your trades import automatically.</p>
              </div>
              <div className="flex flex-col items-center bg-background p-8 rounded-3xl border border-border">
                <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center text-xl font-black mb-6">3</div>
                <h4 className="text-lg font-bold mb-2">Let AI Analyze</h4>
                <p className="text-text-secondary text-center text-sm">Get instant performance insights.</p>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Trade Execution Log', icon: Clock },
              { title: 'Performance Analytics Engine', icon: BarChart3 },
              { title: 'AI Insight Module', icon: BrainCircuit },
              { title: 'Trading Journal System', icon: Layers },
              { title: 'Market Sentiment Layer', icon: Globe },
              { title: 'Export & Reporting Suite', icon: Shield },
            ].map((feat, i) => (
              <div key={i} className="p-6 bg-background border border-border rounded-2xl flex items-center gap-4 hover:border-brand-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-primary">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">{feat.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PSYCHOLOGY EDGE (Bottom CTA) */}
      <section className="py-32 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-8">
          The Real Edge
        </div>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-8">
          Your Edge Is Not Strategy — <br className="hidden md:block" />
          <span className="text-brand-primary">It's Behavior.</span>
        </h2>
        <p className="text-xl md:text-2xl text-text-secondary font-medium mb-12 leading-relaxed">
          Most traders fail due to inconsistency, not lack of knowledge. AI Journal identifies behavioral flaws that impact your performance.
        </p>
        <Button onClick={onGetStarted} size="lg" className="rounded-full px-10 h-16 text-xl font-bold shadow-premium hover:scale-105 transition-transform">
          Start Improving Today
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-text-muted text-sm">
        <p>© {new Date().getFullYear()} AI Journal. All rights reserved.</p>
      </footer>

    </div>
  );
};
