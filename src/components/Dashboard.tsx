import React, { useState, useEffect, useMemo } from 'react';
import { KpiCard } from './KpiCard';
import { PerformanceChart } from './PerformanceChart';
import { OpenPositions } from './OpenPositions';
import { RecentActivity } from './RecentActivity';
import { MonthlyPnL } from './MonthlyPnL';
import { QuickStats } from './QuickStats';
import { Card } from './ui/Card';
import { ArrowUpRight, PieChart, BrainCircuit } from 'lucide-react';
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
      className="flex-1 overflow-y-auto p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Insight Card */}
        {report && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h3 className="text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">AI Insight</h3>
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{report}</p>
            </Card>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <KpiCard 
            title="Total P&L" 
            value={stats.totalTrades > 0 ? stats.formattedPnL : "+$0.00"} 
            subtitle={stats.totalTrades > 0 ? `${stats.totalTrades} trades` : "0 trades"} 
            icon={ArrowUpRight} 
            iconBg="bg-blue-500/20"
            iconColor="text-blue-400"
          />
          <KpiCard 
            title="Win Rate" 
            value={stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : "0%"} 
            subtitle="Based on history" 
            icon={PieChart} 
            iconBg="bg-slate-500/20"
            iconColor="text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <PerformanceChart isConnected={isConnected} trades={trades} />
            <OpenPositions isConnected={isConnected} trades={trades} />
            <RecentActivity isConnected={isConnected} trades={trades} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MonthlyPnL isConnected={isConnected} trades={trades} />
            <QuickStats isConnected={isConnected} trades={trades} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
