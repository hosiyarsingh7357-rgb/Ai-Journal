import React, { useState, useEffect, useMemo } from 'react';
import { KpiCard } from './KpiCard';
import { PerformanceChart } from './PerformanceChart';
import { OpenPositions } from './OpenPositions';
import { RecentActivity } from './RecentActivity';
import { MonthlyPnL } from './MonthlyPnL';
import { QuickStats } from './QuickStats';
import { Card } from './ui/Card';
import { ArrowUpRight, PieChart, BrainCircuit, Flame, Smile, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useTrades } from '../context/TradeContext';
import { Trade } from '../types';
import { generateAIReport } from '../services/ai';
import { motion } from 'motion/react';

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
      const pnlStr = trade.pnl || "$0.00";
      const pnlVal = parseFloat(pnlStr.replace(/[$,+]/g, ''));
      return acc + (isNaN(pnlVal) ? 0 : pnlVal);
    }, 0);

    const wins = trades.filter(t => t.isWinner).length;
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
      className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-transparent"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Welcome back, Trader</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your psychological edge is being analyzed in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-2xl flex items-center gap-2 border border-orange-500/20">
              <Flame className="w-5 h-5 fill-orange-500" />
              <span className="font-black text-sm">12 DAY STREAK</span>
            </div>
            <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-500/20">
              <Calendar className="w-5 h-5" />
              <span className="font-black text-sm">MAR 30</span>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        {report && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-blue-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px]">AI Intelligence Summary</h3>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed max-w-4xl">{report}</p>
                <div className="mt-6 flex items-center gap-4">
                  <button className="text-xs font-black text-blue-500 flex items-center gap-1 hover:gap-2 transition-all">
                    VIEW FULL PSYCHOLOGY REPORT <ArrowRight className="w-3 h-3" />
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
                iconBg="bg-blue-500/10"
                iconColor="text-blue-500"
              />
              <KpiCard 
                title="Win Rate" 
                value={stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : "0%"} 
                subtitle="Historical accuracy" 
                icon={PieChart} 
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-500"
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
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Current Mood</h3>
                <Smile className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex justify-between items-center mb-6">
                {['😫', '😕', '😐', '🙂', '🤩'].map((emoji, i) => (
                  <button 
                    key={i} 
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 ${i === 3 ? 'bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-medium text-center italic">"Your mood is 15% more positive than last week."</p>
            </Card>

            {/* AI Suggestions */}
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl shadow-blue-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-200" />
                <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-100">AI Suggestions</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs font-bold leading-relaxed">
                  Reduce position size on GBPUSD. Your win rate drops significantly after 3 consecutive wins.
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs font-bold leading-relaxed">
                  Take a 15-minute break. You've been staring at the charts for 4 hours.
                </div>
              </div>
              <button className="w-full mt-6 py-3 rounded-xl bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                Unlock Pro Insights
              </button>
            </Card>

            <OpenPositions isConnected={isConnected} trades={trades} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
