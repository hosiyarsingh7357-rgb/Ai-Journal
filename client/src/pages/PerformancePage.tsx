import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar as CalendarIcon, PieChart, 
  CheckCircle2, Target, Zap, Clock, Activity, ArrowUpRight, 
  ArrowDownRight, Briefcase, Globe, Filter, Info, ChevronLeft, ChevronRight,
  DollarSign, Award, BarChart2, List
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie,
  AreaChart, Area
} from 'recharts';
import { useTrades } from '../context/TradeContext';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Trade } from '../types';

type TimePeriod = 'today' | '7d' | '30d' | '3m' | '1y' | 'all';
type TradeFilter = 'all' | 'winners' | 'losers';

export const PerformancePage = ({ onNavigate }: { onNavigate: (id: string, tradeId?: string) => void }) => {
  const { trades: tradesList } = useTrades();
  const { theme } = useAppStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  const parsePnL = (pnlStr: string | undefined): number => {
    if (!pnlStr) return 0;
    const clean = pnlStr.replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  const filteredTrades = useMemo(() => {
    let filtered = [...tradesList];

    // Time Period Filtering
    const now = new Date();
    if (timePeriod !== 'all') {
      const cutoff = new Date();
      if (timePeriod === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (timePeriod === '7d') cutoff.setDate(now.getDate() - 7);
      else if (timePeriod === '30d') cutoff.setDate(now.getDate() - 30);
      else if (timePeriod === '3m') cutoff.setMonth(now.getMonth() - 3);
      else if (timePeriod === '1y') cutoff.setFullYear(now.getFullYear() - 1);
      
      filtered = filtered.filter(t => {
        const tradeDate = new Date(t.exitDate || t.entryDate || '');
        return tradeDate >= cutoff;
      });
    }

    // Trade Type Filtering
    if (tradeFilter === 'winners') {
      filtered = filtered.filter(t => parsePnL(t.pnl) > 0);
    } else if (tradeFilter === 'losers') {
      filtered = filtered.filter(t => parsePnL(t.pnl) < 0);
    }

    return filtered;
  }, [tradesList, timePeriod, tradeFilter]);

  const stats = useMemo(() => {
    if (!filteredTrades.length) return null;

    let totalPnL = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let largestWin = 0;
    let largestLoss = 0;
    let totalVolume = 0;
    
    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLossStreak = 0;
    let maxLossStreak = 0;

    const symbolStats: Record<string, { pnl: number, trades: number, wins: number }> = {};
    const dayOfWeekStats = [
      { day: 'Mon', pnl: 0, trades: 0 },
      { day: 'Tue', pnl: 0, trades: 0 },
      { day: 'Wed', pnl: 0, trades: 0 },
      { day: 'Thu', pnl: 0, trades: 0 },
      { day: 'Fri', pnl: 0, trades: 0 },
      { day: 'Sat', pnl: 0, trades: 0 },
      { day: 'Sun', pnl: 0, trades: 0 },
    ];

    const sessions = {
      asian: { trades: 0, wins: 0, pnl: 0, volume: 0, losses: 0 },
      london: { trades: 0, wins: 0, pnl: 0, volume: 0, losses: 0 },
      newyork: { trades: 0, wins: 0, pnl: 0, volume: 0, losses: 0 }
    };

    let longTrades = 0, longPnL = 0, longWins = 0;
    let shortTrades = 0, shortPnL = 0, shortWins = 0;

    filteredTrades.forEach(t => {
      const pnl = parsePnL(t.pnl);
      totalPnL += pnl;
      totalVolume += parseFloat(t.size || '0');

      // Symbol Stats
      if (!symbolStats[t.symbol]) symbolStats[t.symbol] = { pnl: 0, trades: 0, wins: 0 };
      symbolStats[t.symbol].pnl += pnl;
      symbolStats[t.symbol].trades++;
      if (pnl > 0) symbolStats[t.symbol].wins++;

      // Day of Week
      const dayIdx = (new Date(t.exitDate || t.entryDate || '').getDay() + 6) % 7;
      dayOfWeekStats[dayIdx].pnl += pnl;
      dayOfWeekStats[dayIdx].trades++;

      // Win/Loss
      if (pnl > 0) {
        winCount++;
        totalWins += pnl;
        largestWin = Math.max(largestWin, pnl);
        currentWinStreak++;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        currentLossStreak = 0;
      } else if (pnl < 0) {
        lossCount++;
        totalLosses += Math.abs(pnl);
        largestLoss = Math.max(largestLoss, Math.abs(pnl));
        currentLossStreak++;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
        currentWinStreak = 0;
      }

      // Long/Short
      if (t.type === 'BUY') {
        longTrades++;
        longPnL += pnl;
        if (pnl > 0) longWins++;
      } else {
        shortTrades++;
        shortPnL += pnl;
        if (pnl > 0) shortWins++;
      }

      // Sessions
      const date = new Date(t.entryDate || '');
      const hour = date.getUTCHours();
      
      if (hour >= 22 || hour < 8) {
        sessions.asian.trades++;
        sessions.asian.pnl += pnl;
        sessions.asian.volume += parseFloat(t.size || '0');
        if (pnl > 0) sessions.asian.wins++; else sessions.asian.losses += Math.abs(pnl);
      } else if (hour >= 8 && hour < 13) {
        sessions.london.trades++;
        sessions.london.pnl += pnl;
        sessions.london.volume += parseFloat(t.size || '0');
        if (pnl > 0) sessions.london.wins++; else sessions.london.losses += Math.abs(pnl);
      } else if (hour >= 13 && hour < 22) {
        sessions.newyork.trades++;
        sessions.newyork.pnl += pnl;
        sessions.newyork.volume += parseFloat(t.size || '0');
        if (pnl > 0) sessions.newyork.wins++; else sessions.newyork.losses += Math.abs(pnl);
      }
    });

    const winRate = (winCount / filteredTrades.length) * 100;
    const pf = totalLosses === 0 ? 99 : totalWins / totalLosses;
    const expectancy = totalPnL / filteredTrades.length;

    return {
      totalPnL,
      winRate,
      pf,
      expectancy,
      avgWin: winCount > 0 ? totalWins / winCount : 0,
      avgLoss: lossCount > 0 ? totalLosses / lossCount : 0,
      largestWin,
      largestLoss,
      maxWinStreak,
      maxLossStreak,
      totalVolume,
      long: { trades: longTrades, pnl: longPnL, winRate: longTrades > 0 ? (longWins / longTrades) * 100 : 0 },
      short: { trades: shortTrades, pnl: shortPnL, winRate: shortTrades > 0 ? (shortWins / shortTrades) * 100 : 0 },
      symbolStats: Object.entries(symbolStats).sort((a, b) => b[1].pnl - a[1].pnl).slice(0, 5),
      dayOfWeekStats,
      sessions,
      grossProfit: totalWins,
      grossLoss: totalLosses
    };
  }, [filteredTrades]);

  const equityData = useMemo(() => {
    let cumulative = 0;
    return [...filteredTrades]
      .sort((a, b) => new Date(a.exitDate || a.entryDate || '').getTime() - new Date(b.exitDate || b.entryDate || '').getTime())
      .map((t, i) => {
        cumulative += parsePnL(t.pnl);
        const date = new Date(t.exitDate || t.entryDate || '');
        return { 
          name: i + 1, 
          pnl: cumulative,
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      });
  }, [filteredTrades]);

  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${val < 0 ? '-' : ''}$${formatted}`;
  };

  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: any[] = [];
    const startOffset = (firstDay.getDay() + 6) % 7; // Adjust to Monday start
    
    // Previous month padding
    for (let i = 0; i < startOffset; i++) {
      days.push({ date: null, pnl: 0, trades: 0, isPadding: true });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayTrades = tradesList.filter(t => {
        const tradeDate = t.exitDate || t.entryDate;
        if (!tradeDate) return false;
        
        // Robust date comparison: parse and get local date parts
        const d = new Date(tradeDate);
        if (isNaN(d.getTime())) return false;
        
        // If the date string doesn't contain a 'T', it might be a simple YYYY-MM-DD
        // which defaults to UTC. We should handle this to avoid timezone shifts.
        if (!tradeDate.includes('T')) {
          const [y, m, day] = tradeDate.split('-').map(Number);
          return y === year && m === (month + 1) && day === i;
        }

        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i;
      });
      const pnl = dayTrades.reduce((acc, t) => acc + parsePnL(t.pnl), 0);
      days.push({ date: dateStr, day: i, pnl, trades: dayTrades.length });
    }

    // Insert Weekly slots
    const finalDays = [];
    for (let i = 0; i < days.length; i++) {
      finalDays.push(days[i]);
      if ((finalDays.length + 1) % 8 === 0) {
        // Calculate weekly summary for the last 7 items
        const weekDays = finalDays.slice(-7);
        const weekPnL = weekDays.reduce((acc, d) => acc + (d.pnl || 0), 0);
        const weekTrades = weekDays.reduce((acc, d) => acc + (d.trades || 0), 0);
        const tradedDays = weekDays.filter(d => d.trades > 0).length;
        
        finalDays.push({ 
          isWeekly: true, 
          pnl: weekPnL, 
          trades: weekTrades,
          tradedDays
        });
      }
    }

    // Add padding for the last row if needed
    while (finalDays.length % 8 !== 0) {
      if ((finalDays.length + 1) % 8 === 0) {
        const weekDays = finalDays.slice(-(finalDays.length % 8));
        // Fill with empty days to make it 7 for the slice
        const paddedWeekDays = [...weekDays];
        while (paddedWeekDays.length < 7) paddedWeekDays.push({ pnl: 0, trades: 0 });
        
        const weekPnL = paddedWeekDays.reduce((acc, d) => acc + (d.pnl || 0), 0);
        const weekTrades = paddedWeekDays.reduce((acc, d) => acc + (d.trades || 0), 0);
        const tradedDays = paddedWeekDays.filter(d => d.trades > 0).length;

        finalDays.push({ 
          isWeekly: true, 
          pnl: weekPnL, 
          trades: weekTrades,
          tradedDays
        });
      } else {
        finalDays.push({ date: null, pnl: 0, trades: 0, isPadding: true });
      }
    }
    
    return finalDays;
  }, [currentCalendarDate, tradesList]);

  const selectedDayTrades = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return tradesList.filter(t => {
      const tradeDate = t.exitDate || t.entryDate;
      if (!tradeDate) return false;
      
      const d = new Date(tradeDate);
      if (isNaN(d.getTime())) return false;

      let dateStr;
      if (!tradeDate.includes('T')) {
        dateStr = tradeDate; // Already YYYY-MM-DD
      } else {
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      
      return dateStr === selectedCalendarDay;
    });
  }, [selectedCalendarDay, tradesList]);

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-brand-primary/20 mx-auto" />
          <p className="text-text-secondary font-medium">No performance data available</p>
          <button onClick={() => setTimePeriod('all')} className="text-brand-primary font-bold hover:underline">View All Time</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-10 space-y-10">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-status-success flex items-center justify-center text-text-primary shadow-lg shadow-status-success/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-text-primary tracking-tight">Performance Analytics</h1>
            </div>
            <p className="text-text-secondary font-medium">Analyze your trading patterns and improve your strategy</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Time Period</span>
              <div className="bg-surface p-1 rounded-xl border border-border flex gap-1 shadow-sm">
                {(['today', '7d', '30d', '3m', '1y', 'all'] as TimePeriod[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setTimePeriod(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      timePeriod === p ? "bg-status-success text-text-primary shadow-md" : "text-text-secondary hover:bg-surface-muted"
                    )}
                  >
                    {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '3m' ? '3 Months' : p === '1y' ? '1 Year' : p === 'all' ? 'All Time' : 'Today'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Filter By</span>
              <div className="bg-surface p-1 rounded-xl border border-border flex gap-1 shadow-sm">
                {(['all', 'winners', 'losers'] as TradeFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setTradeFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      tradeFilter === f ? "bg-status-success text-text-primary shadow-md" : "text-text-secondary hover:bg-surface-muted"
                    )}
                  >
                    {f === 'all' ? 'All Trades' : f === 'winners' ? 'Winners' : 'Losers'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total P&L', value: formatCurrency(stats.totalPnL), icon: DollarSign, color: stats.totalPnL >= 0 ? 'text-status-success' : 'text-status-danger', sub: `From ${filteredTrades.length} closed trades`, bg: 'bg-status-success' },
            { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, icon: Award, color: 'text-text-primary', sub: `${stats.winCount} wins • ${stats.grossLoss === 0 ? 0 : stats.lossCount} losses`, bg: 'bg-status-success' },
            { label: 'Profit Factor', value: stats.pf === 99 ? 'Infinity' : stats.pf.toFixed(2), icon: BarChart2, color: 'text-text-primary', sub: stats.pf > 1.5 ? 'Excellent' : 'Good', bg: 'bg-status-success' },
            { label: 'Expectancy', value: formatCurrency(stats.expectancy), icon: Target, color: stats.expectancy >= 0 ? 'text-status-success' : 'text-status-danger', sub: 'Average per trade', bg: 'bg-status-success' },
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <Card className="p-6 relative overflow-hidden group border-border bg-surface shadow-sm hover:shadow-md transition-shadow">
                <div className={cn("absolute top-0 left-0 w-1 h-full", kpi.bg)} />
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-text-primary", kpi.bg)}>
                    <kpi.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{kpi.label}</span>
                </div>
                <h2 className={cn("text-2xl font-black tracking-tight mb-1", kpi.color)}>{kpi.value}</h2>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{kpi.sub}</p>
                <div className="mt-4 h-1 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", kpi.bg)} style={{ width: '70%' }} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats & Equity Curve */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 space-y-6 h-full bg-surface border-border">
              <div className="flex items-center gap-2 mb-2">
                <List className="w-4 h-4 text-status-success" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Quick Stats</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Avg Winner', value: formatCurrency(stats.avgWin), color: 'text-status-success' },
                  { label: 'Avg Loser', value: `-${formatCurrency(stats.avgLoss)}`, color: 'text-status-danger' },
                  { label: 'Best Trade', value: formatCurrency(stats.largestWin), color: 'text-status-success' },
                  { label: 'Worst Trade', value: `-${formatCurrency(stats.largestLoss)}`, color: 'text-status-danger' },
                  { label: 'Win Streak', value: `${stats.maxWinStreak} trades`, color: 'text-text-primary' },
                  { label: 'Loss Streak', value: `${stats.maxLossStreak} trades`, color: 'text-text-primary' },
                  { label: 'Risk:Reward', value: '1:0.00', color: 'text-text-primary' },
                  { label: 'Open Trades', value: tradesList.filter(t => !t.exitPrice).length, color: 'text-text-primary' },
                ].map((s, i) => (
                  <div key={i} className="bg-surface-muted p-3 rounded-xl border border-border">
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={cn("text-xs font-black", s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-10"
          >
            <Card className="p-6 flex flex-col h-full bg-surface border-border">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-status-success" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Equity Curve</h3>
                </div>
                <div className="flex bg-surface-muted p-1 rounded-lg gap-1">
                  <button className="px-3 py-1 text-[8px] font-black uppercase bg-status-success text-text-primary rounded-md shadow-sm">Equity</button>
                  <button className="px-3 py-1 text-[8px] font-black uppercase text-text-secondary hover:text-text-primary">Drawdown</button>
                </div>
              </div>
              <div className="flex-1 min-h-[400px] relative">
                {equityData.length < 2 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-text-muted" />
                    </div>
                    <p className="text-xs text-text-secondary font-bold max-w-[200px]">Close more trades to see your equity curve</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData}>
                      <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94A3B8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#94A3B8" 
                        fontSize={10} 
                        tickFormatter={(val) => `$${val}`}
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Area type="monotone" dataKey="pnl" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPnL)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Performance Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Long vs Short */}
          <Card className="p-6 space-y-6 bg-surface border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-status-success" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Long vs Short</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-muted border border-border hover:border-brand-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-text-primary">Long</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Trades</p>
                    <p className="text-xs font-bold text-text-primary">{stats.long.trades}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">P&L</p>
                    <p className={cn("text-xs font-bold", stats.long.pnl >= 0 ? "text-status-success" : "text-status-danger")}>{formatCurrency(stats.long.pnl)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Win %</p>
                    <p className="text-xs font-bold text-text-primary">{stats.long.winRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-muted border border-border hover:border-brand-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-text-primary">Short</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Trades</p>
                    <p className="text-xs font-bold text-text-primary">{stats.short.trades}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">P&L</p>
                    <p className={cn("text-xs font-bold", stats.short.pnl >= 0 ? "text-status-success" : "text-status-danger")}>{formatCurrency(stats.short.pnl)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Win %</p>
                    <p className="text-xs font-bold text-text-primary">{stats.short.winRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Day Performance */}
          <Card className="p-6 space-y-6 bg-surface border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-status-success" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Day Performance</h3>
            </div>
            <div className="space-y-3">
              {stats.dayOfWeekStats.map((d, i) => {
                const maxPnL = Math.max(...stats.dayOfWeekStats.map(x => Math.abs(x.pnl)), 1);
                const width = (Math.abs(d.pnl) / maxPnL) * 100;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-text-secondary w-8">{d.day}</span>
                    <div className="flex-1 h-6 bg-surface-muted rounded-md relative overflow-hidden">
                      <div 
                        className={cn("h-full rounded-md transition-all duration-1000", d.pnl >= 0 ? "bg-status-success" : "bg-status-danger")}
                        style={{ width: `${width}%` }}
                      />
                      {d.pnl !== 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-primary">
                          {formatCurrency(d.pnl)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Symbols */}
          <Card className="p-6 space-y-6 bg-surface border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-status-success" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Top Symbols</h3>
            </div>
            <div className="space-y-3">
              {stats.symbolStats.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-10">No data available</p>
              ) : (
                stats.symbolStats.map(([symbol, data], i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border hover:border-brand-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-surface-muted flex items-center justify-center text-[10px] font-black text-text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-text-primary">{symbol}</p>
                        <p className="text-[9px] text-text-secondary font-bold">{data.trades} trades • {((data.wins/data.trades)*100).toFixed(0)}% win</p>
                      </div>
                    </div>
                    <p className={cn("text-xs font-black", data.pnl >= 0 ? "text-status-success" : "text-status-danger")}>
                      {formatCurrency(data.pnl)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Session Performance */}
        <Card className="p-6 space-y-8 bg-surface border-border">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-status-success" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Session Performance</h3>
          </div>
          
          <div className="relative h-4 bg-surface-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-orange-500/50 border-r border-orange-500/30" style={{ width: '33.33%' }} />
            <div className="h-full bg-status-success/20 border-r border-status-success/30" style={{ width: '33.33%' }} />
            <div className="h-full bg-status-success/40" style={{ width: '33.34%' }} />
            <div className="absolute inset-0 flex text-[8px] font-black uppercase tracking-widest text-text-secondary items-center px-4">
              <span style={{ width: '33.33%' }}>Asian</span>
              <span style={{ width: '33.33%' }}>London</span>
              <span>New York</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Asian', time: '22:00 - 08:00 UTC', data: stats.sessions.asian, color: 'bg-orange-500' },
              { name: 'London', time: '08:00 - 13:00 UTC', data: stats.sessions.london, color: 'bg-status-success' },
              { name: 'New York', time: '13:00 - 22:00 UTC', data: stats.sessions.newyork, color: 'bg-status-success' },
            ].map((session, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface-muted border border-border space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-text-primary shadow-sm", session.color)}>
                      {session.name === 'Asian' ? <Globe className="w-5 h-5" /> : session.name === 'London' ? <Briefcase className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-text-primary">{session.name}</h4>
                      <p className="text-[9px] font-bold text-text-secondary">{session.time}</p>
                    </div>
                  </div>
                  <p className={cn("text-sm font-black", session.data.pnl >= 0 ? "text-status-success" : "text-status-danger")}>
                    {formatCurrency(session.data.pnl)}
                  </p>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", session.color)} style={{ width: `${session.data.trades > 0 ? (session.data.wins/session.data.trades)*100 : 0}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Trades</p>
                    <p className="text-xs font-bold text-text-primary">{session.data.trades}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Win Rate</p>
                    <p className="text-xs font-bold text-text-primary">{session.data.trades > 0 ? ((session.data.wins / session.data.trades) * 100).toFixed(0) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Avg Trade</p>
                    <p className="text-xs font-bold text-text-primary">{formatCurrency(session.data.trades > 0 ? session.data.pnl / session.data.trades : 0)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Volume</p>
                    <p className="text-xs font-bold text-text-primary">{stats.totalVolume > 0 ? ((session.data.volume / stats.totalVolume) * 100).toFixed(0) : 0}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trading Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 p-6 space-y-6 bg-surface border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-status-success" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Trading Calendar</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-status-success" /> Profitable Day</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-status-danger" /> Losing Day</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-surface-muted" /> No Trades</div>
                </div>
                <div className="flex items-center gap-2 bg-surface-muted p-1 rounded-lg">
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))} className="p-1 hover:bg-surface-muted text-text-primary rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 text-text-primary">
                    {currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))} className="p-1 hover:bg-surface-muted text-text-primary rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Weekly'].map(d => (
                <div key={d} className="text-center text-[9px] font-black text-text-secondary uppercase tracking-widest py-2">{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                if (day.isWeekly) {
                  const isProfit = day.pnl >= 0;
                  return (
                    <div key={`weekly-${i}`} className={cn(
                      "rounded-xl border p-3 flex flex-col items-center justify-center text-center",
                      isProfit ? "bg-status-success/10 border-status-success/20" : "bg-status-danger/10 border-status-danger/20"
                    )}>
                      <p className={cn("text-[8px] font-black uppercase mb-1", isProfit ? "text-status-success" : "text-status-danger")}>Weekly</p>
                      <p className={cn("text-[10px] font-black", isProfit ? "text-status-success" : "text-status-danger")}>
                        {isProfit ? '+' : ''}{formatCurrency(day.pnl)}
                      </p>
                      <p className={cn("text-[8px] font-bold mt-0.5", isProfit ? "text-status-success/60" : "text-status-danger/60")}>Traded Days {day.tradedDays}</p>
                    </div>
                  );
                }

                if (!day.date) return <div key={`empty-${i}`} className="aspect-square" />;

                return (
                  <button 
                    key={day.date}
                    onClick={() => setSelectedCalendarDay(day.date)}
                    className={cn(
                      "aspect-square rounded-xl border p-2 flex flex-col transition-all group relative overflow-hidden",
                      selectedCalendarDay === day.date ? "border-status-success ring-2 ring-status-success/20 shadow-lg" : "border-border hover:border-brand-primary/30",
                      day.trades > 0 ? (day.pnl >= 0 ? "bg-status-success/10" : "bg-status-danger/10") : "bg-surface"
                    )}
                  >
                    <span className="text-[10px] font-black text-text-secondary mb-auto">{day.day}</span>
                    {day.trades > 0 && (
                      <div className="text-right">
                        <p className={cn("text-[10px] font-black", day.pnl >= 0 ? "text-status-success" : "text-status-danger")}>
                          {formatCurrency(day.pnl)}
                        </p>
                        <p className="text-[8px] font-bold text-text-secondary opacity-60">{day.trades} trade</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 space-y-6 bg-surface border-border">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-status-success" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Day Trades</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-[400px]">
              {selectedDayTrades.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-text-muted" />
                  </div>
                  <p className="text-xs text-text-secondary font-bold max-w-[150px]">Click on a day with trades to view details</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTrades.map((t, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-surface-muted border border-border hover:border-brand-primary/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-black text-text-primary">{t.symbol}</p>
                          <p className="text-[9px] text-text-secondary font-bold">{new Date(t.entryDate || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className={cn("text-xs font-black", parsePnL(t.pnl) >= 0 ? "text-status-success" : "text-status-danger")}>
                          {t.pnl}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase", t.type === 'BUY' ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger")}>{t.type}</span>
                        <span className="text-[8px] font-bold text-text-secondary">{t.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Win/Loss Distribution & Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-8 bg-surface border-border">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Win/Loss Distribution</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative h-4 bg-surface-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-status-success" style={{ width: `${(stats.grossProfit / (stats.grossProfit + stats.grossLoss || 1)) * 100}%` }} />
                <div className="h-full bg-status-danger" style={{ width: `${(stats.grossLoss / (stats.grossProfit + stats.grossLoss || 1)) * 100}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-text-primary uppercase tracking-widest">
                  1W
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-success" />
                    <span className="text-[10px] font-black text-text-secondary uppercase">Gross Profit</span>
                  </div>
                  <span className="text-[10px] font-black text-status-success">{formatCurrency(stats.grossProfit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-danger" />
                    <span className="text-[10px] font-black text-text-secondary uppercase">Gross Loss</span>
                  </div>
                  <span className="text-[10px] font-black text-status-danger">-{formatCurrency(stats.grossLoss)}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] font-black text-text-primary uppercase">Net Result</span>
                  <span className={cn("text-[10px] font-black", stats.totalPnL >= 0 ? "text-status-success" : "text-status-danger")}>{formatCurrency(stats.totalPnL)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 space-y-6 bg-surface border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Recent Trades</h3>
            </div>
            <div className="space-y-3">
              {tradesList.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted border border-border hover:border-brand-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-brand-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-text-primary">{t.symbol}</p>
                      <p className="text-[9px] text-text-secondary font-bold">{new Date(t.exitDate || t.entryDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className={cn("text-sm font-black", parsePnL(t.pnl) >= 0 ? "text-status-success" : "text-status-danger")}>
                    {t.pnl}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Deep Analysis Stats */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Your Stats</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-surface border-border shadow-sm">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Best Month</p>
              <p className="text-2xl font-black text-status-success">{formatCurrency(stats.totalPnL)}</p>
              <p className="text-[9px] font-bold text-text-secondary mt-1">Apr 2026</p>
            </Card>
            <Card className="p-6 bg-surface border-border shadow-sm">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Worst Month</p>
              <p className="text-2xl font-black text-status-danger">{formatCurrency(stats.totalPnL)}</p>
              <p className="text-[9px] font-bold text-text-secondary mt-1">Apr 2026</p>
            </Card>
            <Card className="p-6 bg-surface border-border shadow-sm">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Average</p>
              <p className="text-2xl font-black text-brand-primary">{formatCurrency(stats.totalPnL)}</p>
              <p className="text-[9px] font-bold text-text-secondary mt-1">per Month</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-0 overflow-hidden border-border bg-surface shadow-sm">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-800">
                  {[
                    { label: 'Total P&L', value: formatCurrency(stats.totalPnL) },
                    { label: 'Average daily volume', value: '1.00' },
                    { label: 'Average winning trade', value: formatCurrency(stats.avgWin) },
                    { label: 'Average losing trade', value: formatCurrency(stats.avgLoss) },
                    { label: 'Total number of trades', value: filteredTrades.length },
                    { label: 'Number of winning trades', value: stats.winCount },
                    { label: 'Number of losing trades', value: stats.lossCount },
                    { label: 'Number of break even trades', value: '0' },
                    { label: 'Max consecutive wins', value: stats.maxWinStreak },
                    { label: 'Max consecutive losses', value: stats.maxLossStreak },
                    { label: 'Total commissions', value: '$0.00' },
                    { label: 'Total swap', value: '$0.00' },
                    { label: 'Largest profit', value: formatCurrency(stats.largestWin) },
                    { label: 'Largest loss', value: formatCurrency(stats.largestLoss) },
                    { label: 'Avg hold time (All)', value: '5d 1h' },
                    { label: 'Avg hold time (Winners)', value: '5d 1h' },
                    { label: 'Avg hold time (Losers)', value: '-' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-muted transition-colors">
                      <td className="px-6 py-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">{row.label}</td>
                      <td className={cn("px-6 py-3 text-[10px] font-black text-right", row.label.includes('P&L') || row.label.includes('profit') || row.label.includes('winning') ? "text-status-success" : row.label.includes('loss') || row.label.includes('Losing') ? "text-status-danger" : "text-text-primary")}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="p-0 overflow-hidden border-border bg-surface shadow-sm">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-800">
                  {[
                    { label: 'Open trades', value: '0' },
                    { label: 'Total trading days', value: '1' },
                    { label: 'Winning days', value: '1' },
                    { label: 'Losing days', value: '0' },
                    { label: 'Breakeven days', value: '0' },
                    { label: 'Max consecutive winning days', value: '1' },
                    { label: 'Max consecutive losing days', value: '0' },
                    { label: 'Average daily P&L', value: formatCurrency(stats.totalPnL) },
                    { label: 'Average winning day P&L', value: formatCurrency(stats.totalPnL) },
                    { label: 'Average losing day P&L', value: '$0.00' },
                    { label: 'Largest profitable day', value: formatCurrency(stats.totalPnL) },
                    { label: 'Largest losing day', value: '$0.00' },
                    { label: 'Trade expectancy', value: formatCurrency(stats.expectancy) },
                    { label: 'Max drawdown', value: '$0.00' },
                    { label: 'Max drawdown %', value: '0%' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-muted transition-colors">
                      <td className="px-6 py-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">{row.label}</td>
                      <td className={cn("px-6 py-3 text-[10px] font-black text-right", row.label.includes('P&L') || row.label.includes('profitable') || row.label.includes('winning') ? "text-status-success" : row.label.includes('loss') || row.label.includes('losing') || row.label.includes('drawdown') ? "text-status-danger" : "text-text-primary")}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
