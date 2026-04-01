import React, { useState, useEffect, useMemo } from 'react';
import { KpiCard } from '../components/KpiCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { OpenPositions } from '../components/OpenPositions';
import { RecentActivity } from '../components/RecentActivity';
import { MonthlyPnL } from '../components/MonthlyPnL';
import { QuickStats } from '../components/QuickStats';
import { Card } from '../components/ui/Card';
import { ArrowUpRight, PieChart, BrainCircuit, Flame, Smile, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { TradeForm } from '../components/TradeForm';
import { useTrades } from '../context/TradeContext';
import { Trade } from '../types';
import { generateAIReport } from '../services/ai';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Dashboard = ({ isConnected = false }: { isConnected?: boolean }) => {
  const { trades } = useTrades();
  const [report, setReport] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        formattedPnL: "+$0.00"
      };
    }

    const totalPnL = trades.reduce((acc, trade) => {
      if (trade.profit !== undefined) return acc + trade.profit;
      const pnlStr = trade.pnl || "$0.00";
      const pnlVal = parseFloat(pnlStr.replace(/[$,+]/g, ''));
      return acc + (isNaN(pnlVal) ? 0 : pnlVal);
    }, 0);

    const wins = trades.filter(t => {
      if (t.profit !== undefined) return t.profit > 0;
      return t.isWinner;
    }).length;
    const winRate = (wins / trades.length) * 100;

    return {
      totalPnL,
      winRate,
      totalTrades: trades.length,
      formattedPnL: (totalPnL >= 0 ? "+$" : "-$") + Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  }, [trades]);

  useEffect(() => {
    if (trades && trades.length > 0) {
      // Debounce the AI report generation to avoid hitting quota during rapid updates
      const timer = setTimeout(() => {
        generateAIReport(trades, false).then((res) => {
          if (res) {
            try {
              const parsed = JSON.parse(res);
              setReport(parsed.summary);
            } catch (e) {
              setReport(null);
            }
          }
        }).catch(err => {
          console.error("Dashboard AI Error:", err);
          setReport("AI Intelligence is temporarily unavailable.");
        });
      }, 5000); // 5 second debounce

      return () => clearTimeout(timer);
    }
  }, [trades]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background"
    >
      {(!trades || trades.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
          <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto shadow-premium border border-brand-primary/30">
            <PieChart className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-text-primary">Welcome to Your Dashboard</h3>
            <p className="text-text-secondary mt-2 font-medium max-w-md mx-auto">
              You don't have any trades yet. Connect your broker or add a trade manually to start seeing your analytics.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Welcome back, <span className="text-brand-primary">Trader</span></h1>
            <p className="text-text-secondary mt-1">Your psychological edge is being analyzed in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface text-status-warning px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-status-warning/20 shadow-premium">
              <Flame className="w-5 h-5 fill-status-warning" />
              <span className="font-black text-xs uppercase tracking-widest">12 DAY STREAK</span>
            </div>
            <div className="bg-surface text-brand-primary px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-brand-primary/20 shadow-premium">
              <Calendar className="w-5 h-5" />
              <span className="font-black text-xs uppercase tracking-widest">MAR 30</span>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        {report && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-10 relative overflow-hidden group border-brand-primary/30 bg-surface shadow-premium">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-brand-primary/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-premium">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary">AI Intelligence Summary</h3>
                </div>
                <p className="text-xl font-bold text-text-primary leading-relaxed max-w-4xl">{report}</p>
                <div className="mt-8 flex items-center gap-4">
                  <button className="text-[10px] font-black text-brand-primary flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest">
                    VIEW FULL PSYCHOLOGY REPORT <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KpiCard 
                title="Total P&L" 
                value={stats.totalTrades > 0 ? stats.formattedPnL : "+$0.00"} 
                subtitle={stats.totalTrades > 0 ? `${stats.totalTrades} trades executed` : "0 trades executed"} 
                icon={ArrowUpRight} 
                iconBg="bg-brand-primary/20"
                iconColor="text-brand-primary"
              />
              <KpiCard 
                title="Win Rate" 
                value={stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : "0%"} 
                subtitle="Historical accuracy" 
                icon={PieChart} 
                iconBg="bg-status-success/20"
                iconColor="text-status-success"
              />
            </div>

            <PerformanceChart isConnected={isConnected} trades={trades} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MonthlyPnL isConnected={isConnected} trades={trades} />
              <QuickStats isConnected={isConnected} trades={trades} />
            </div>

            <RecentActivity isConnected={isConnected} trades={trades} />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            {/* Mood Tracker */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Current Mood</h3>
                <Smile className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="flex justify-between items-center mb-6">
                {['😫', '😕', '😐', '🙂', '🤩'].map((emoji, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95",
                      i === 3 
                        ? "bg-brand-primary text-white shadow-premium" 
                        : "bg-surface-muted hover:bg-border"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-secondary font-medium text-center italic">"Your mood is 15% more positive than last week."</p>
            </Card>

            {/* AI Suggestions */}
            <Card className="p-6 bg-brand-primary text-white border-none shadow-premium relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-white/70" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">AI Suggestions</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold leading-relaxed">
                    Reduce position size on GBPUSD. Your win rate drops significantly after 3 consecutive wins.
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold leading-relaxed">
                    Take a 15-minute break. You've been staring at the charts for 4 hours.
                  </div>
                </div>
                <button className="w-full mt-6 py-3 rounded-xl bg-white text-brand-primary font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-premium">
                  Unlock Pro Insights
                </button>
              </div>
            </Card>

            <OpenPositions isConnected={isConnected} trades={trades} />
          </div>
        </div>
      </div>
      )}
    </motion.div>
  );
};
