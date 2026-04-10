import React, { useState, useEffect, useMemo } from 'react';
import { KpiCard } from '../components/KpiCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { OpenPositions } from '../components/OpenPositions';
import { RecentActivity } from '../components/RecentActivity';
import { MonthlyPnL } from '../components/MonthlyPnL';
import { QuickStats } from '../components/QuickStats';
import { Card } from '../components/ui/Card';
import { ArrowUpRight, PieChart, BrainCircuit, Sparkles, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useTrades } from '../context/TradeContext';
import { useAppStore } from '../store/useAppStore';
import { generateAIReport } from '../services/aiService';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';

export const Dashboard = ({ isConnected = false, onNavigate }: { isConnected?: boolean, onNavigate: (page: string, tradeId?: string) => void }) => {
  const { trades } = useTrades();
  const { isAiBlocked, aiBlockedUntil, setAiBlocked } = useAppStore();
  const [report, setReport] = useState<string | null>(null);
  const [chartTimePeriod, setChartTimePeriod] = useState('1W');

  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalPnL: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        winRate: 0,
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        topPerformers: []
      };
    }

    const parsePnL = (pnlStr: string | undefined): number => {
      if (!pnlStr) return 0;
      const clean = pnlStr.replace(/[^0-9.-]/g, '');
      return parseFloat(clean) || 0;
    };

    let totalPnL = 0;
    let realizedPnL = 0;
    let unrealizedPnL = 0;
    let openTrades = 0;
    let closedTrades = 0;
    let wins = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let bestTrade = -Infinity;
    let worstTrade = Infinity;

    const symbolStats: Record<string, number> = {};

    trades.forEach(trade => {
      const pnl = parsePnL(trade.pnl);
      totalPnL += pnl;

      if (trade.exitPrice) {
        realizedPnL += pnl;
        closedTrades++;
        if (pnl > 0) {
          wins++;
          totalWinAmount += pnl;
        } else {
          totalLossAmount += Math.abs(pnl);
        }
        if (pnl > bestTrade) bestTrade = pnl;
        if (pnl < worstTrade) worstTrade = pnl;
      } else {
        unrealizedPnL += pnl;
        openTrades++;
      }

      symbolStats[trade.symbol] = (symbolStats[trade.symbol] || 0) + pnl;
    });

    const winRate = closedTrades > 0 ? (wins / closedTrades) * 100 : 0;
    const safeWinRate = isNaN(winRate) ? 0 : winRate;
    const avgWin = wins > 0 ? totalWinAmount / wins : 0;
    const avgLoss = (closedTrades - wins) > 0 ? totalLossAmount / (closedTrades - wins) : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 9.99 : 0;
    const safeProfitFactor = isNaN(profitFactor) ? 0 : profitFactor;

    const topPerformers = Object.entries(symbolStats)
      .map(([symbol, pnl]) => ({ symbol, pnl }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 3);

    return {
      totalPnL,
      unrealizedPnL,
      realizedPnL,
      winRate: safeWinRate,
      totalTrades: trades.length,
      openTrades,
      closedTrades,
      avgWin,
      avgLoss,
      bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
      worstTrade: worstTrade === Infinity ? 0 : worstTrade,
      profitFactor: safeProfitFactor,
      topPerformers
    };
  }, [trades]);

  const formatCurrency = (val: number) => {
    const sign = val >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (trades && trades.length > 0) {
      // Check if AI is currently blocked
      if (isAiBlocked && aiBlockedUntil && Date.now() < aiBlockedUntil) {
        setReport("AI is currently busy. Performance summary will be available shortly.");
        return;
      }

      const timer = setTimeout(() => {
        generateAIReport(trades, false)
          .then((res) => {
            if (res) {
              try {
                const parsed = JSON.parse(res);
                setReport(parsed.summary);
              } catch {
                setReport(null);
              }
            }
          })
          .catch((error: any) => {
            console.error("Dashboard AI Error:", error);
            if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota')) {
              setAiBlocked(true, Date.now() + 5 * 60 * 1000);
              setReport("AI is currently busy. Performance summary will be available shortly.");
            } else {
              setReport("AI Intelligence is temporarily unavailable.");
            }
          });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [trades, isAiBlocked, aiBlockedUntil]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 h-full flex flex-col bg-background overflow-hidden"
    >
      {!trades || trades.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-4">
          <h2 className="text-2xl font-black text-text-primary">No Data Found</h2>
          <button
            onClick={() => onNavigate('trades')}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-premium"
          >
            Add Trade
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth overscroll-contain">
          <div className="max-w-[1600px] mx-auto space-y-6">
            
            {/* AI Insight */}
            {report && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 rounded-2xl border-border bg-surface">
                  <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" />
                    AI Insight
                  </h3>
                  <p className="text-sm font-medium text-text-primary leading-relaxed">{report}</p>
                </Card>
              </motion.div>
            )}

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Total P&L', value: stats.totalPnL, trades: stats.totalTrades, icon: ArrowUpRight, color: 'status-success', type: 'Total' },
                { label: 'Unrealized', value: stats.unrealizedPnL, trades: stats.openTrades, icon: Clock, color: 'yellow-600', type: 'Open' },
                { label: 'Realized', value: stats.realizedPnL, trades: stats.closedTrades, icon: PieChart, color: 'status-success', type: 'Closed' },
                { label: 'Win Rate', value: `${(stats.winRate || 0).toFixed(0)}%`, progress: stats.winRate || 0, icon: PieChart, color: 'status-success', type: 'Rate' }
              ].map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Card className="p-3 lg:p-6 bg-surface border-border shadow-sm h-full flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2 lg:mb-4">
                      <div className={cn("w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center", kpi.color === 'status-success' ? "bg-status-success/10 text-status-success" : "bg-yellow-900/30 text-yellow-500")}>
                        <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <span className={cn("px-1.5 py-0.5 rounded-md text-[8px] lg:text-[10px] font-black uppercase", kpi.color === 'status-success' ? "bg-status-success/10 text-status-success" : "bg-yellow-900/30 text-yellow-500")}>{kpi.type}</span>
                    </div>
                    <div>
                      <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest mb-0.5 lg:mb-1">{kpi.label}</p>
                      <p className={cn("text-lg lg:text-2xl font-black tracking-tight", typeof kpi.value === 'number' ? (kpi.value >= 0 ? "text-status-success" : "text-status-danger") : "text-text-primary")}>
                        {typeof kpi.value === 'number' ? formatCurrency(kpi.value) : kpi.value}
                      </p>
                      {kpi.progress !== undefined ? (
                        <div className="w-full h-1 lg:h-1.5 bg-surface-muted rounded-full mt-2 lg:mt-3 overflow-hidden">
                          <div className="h-full bg-status-success" style={{ width: `${kpi.progress}%` }} />
                        </div>
                      ) : (
                        <p className="text-[8px] lg:text-[10px] font-bold text-text-secondary mt-1 flex items-center gap-1">
                          {kpi.trades} {kpi.type === 'Open' ? 'open' : 'trades'}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Performance Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="p-6 bg-surface border-border shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-text-secondary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Performance</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="md:hidden">
                          <select 
                            value={chartTimePeriod}
                            onChange={(e) => setChartTimePeriod(e.target.value)}
                            className="bg-surface-muted border border-border rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-text-primary outline-none"
                          >
                            {['1D', '1W', '1M', '3M', 'ALL'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden md:flex gap-1 bg-background p-1 rounded-lg">
                          {['1D', '1W', '1M', '3M', 'ALL'].map(t => (
                            <button 
                              key={t} 
                              onClick={() => setChartTimePeriod(t)}
                              className={cn(
                                "px-3 py-1 text-[10px] font-black rounded-md transition-all", 
                                t === chartTimePeriod ? "bg-status-success text-white shadow-sm" : "text-text-secondary hover:bg-surface-muted"
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mb-6">
                      <p className={cn("text-3xl font-black", stats.totalPnL >= 0 ? "text-status-success" : "text-status-danger")}>
                        {formatCurrency(stats.totalPnL)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1",
                          stats.totalPnL >= 0 ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"
                        )}>
                          <ArrowUpRight className={cn("w-3 h-3", stats.totalPnL < 0 && "rotate-180")} /> 
                          {stats.totalTrades > 0 ? Math.abs((stats.totalPnL / (stats.totalTrades * 100)) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <PerformanceChart trades={trades} timePeriod={chartTimePeriod} />
                    </div>
                  </Card>
                </motion.div>

                {/* Open Positions */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="p-6 bg-surface border-border shadow-sm min-h-[200px]">
                    <h3 className="text-xs font-black text-text-primary mb-6">Open Positions</h3>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-text-muted mb-4">
                        <PieChart className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-text-secondary">No open positions</p>
                    </div>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-text-primary">Recent Activity</h3>
                    <span className="text-[10px] font-bold text-text-secondary">{trades.length} trades</span>
                  </div>
                  <div className="space-y-3">
                    {trades.slice(0, 5).map((trade, i) => (
                      <div key={i} className="p-4 bg-surface rounded-xl shadow-sm border border-border border-l-4 border-l-red-500 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-text-primary">{trade.symbol}</span>
                              <span className="px-1.5 py-0.5 rounded bg-status-success/10 text-status-success text-[8px] font-black uppercase">Long</span>
                            </div>
                            <p className="text-[10px] font-bold text-text-secondary mt-0.5">Apr 7</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-text-secondary">0.05 lots</p>
                          <p className={cn("text-xs font-black mt-0.5", trade.pnl?.includes('-') ? "text-status-danger" : "text-status-success")}>
                            {trade.pnl}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Monthly P&L (Calendar) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="p-6 bg-surface border-border shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black text-text-primary">Monthly P&L</h3>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">Monthly: <span className="text-status-success">+$1632.30</span></p>
                        <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">April 2026</p>
                      </div>
                    </div>
                    <MonthlyPnL trades={trades} />
                    <div className="flex justify-center gap-4 mt-6">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-status-success" />
                        <span className="text-[8px] font-black text-text-secondary uppercase">Profit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-status-danger" />
                        <span className="text-[8px] font-black text-text-secondary uppercase">Loss</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Top Performers */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="p-6 bg-surface border-border shadow-sm">
                    <h3 className="text-xs font-black text-text-primary mb-6">Top Performers</h3>
                    <div className="space-y-4">
                      {stats.topPerformers.map((perf, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-text-secondary">#1</span>
                            <div className="w-8 h-8 rounded-lg bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-text-primary uppercase">{perf.symbol}</p>
                              <p className="text-[8px] font-bold text-text-secondary uppercase">2 trades</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-status-success">{formatCurrency(perf.pnl)}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <h3 className="text-xs font-black text-text-primary">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface rounded-xl shadow-sm border border-border">
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Avg Win</p>
                      <p className="text-sm font-black text-status-success">{formatCurrency(stats.avgWin)}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-xl shadow-sm border border-border">
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Avg Loss</p>
                      <p className="text-sm font-black text-status-danger">-{formatCurrency(stats.avgLoss)}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-xl shadow-sm border border-border">
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Best Trade</p>
                      <p className="text-sm font-black text-status-success">{formatCurrency(stats.bestTrade)}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-xl shadow-sm border border-border">
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Worst Trade</p>
                      <p className="text-sm font-black text-status-danger">{formatCurrency(stats.worstTrade)}</p>
                    </div>
                    <div className="col-span-2 p-4 bg-surface rounded-xl shadow-sm border border-border">
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Profit Factor</p>
                      <p className="text-sm font-black text-status-success">{stats.profitFactor.toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* AI Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Card className="p-6 rounded-2xl border-border bg-surface shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-6 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> AI Tips
                    </h3>

                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <p className="text-xs font-bold text-text-primary">Reduce position size after win streak to protect capital.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <p className="text-xs font-bold text-text-primary">Take breaks to avoid overtrading during low volatility.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('performance')}
                      className="mt-6 w-full py-3 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary/30 transition-all"
                    >
                      View Performance Analysis
                    </button>
                  </Card>
                </motion.div>
              </div>
          </div>
        </div>
      </div>
    )}
  </motion.div>
  );
};
