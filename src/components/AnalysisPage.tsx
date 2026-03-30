import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Clock, 
  Download,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useTrades } from '../context/TradeContext';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournals } from '../services/journalService';

import { Card } from './ui/Card';

export const AnalysisPage = () => {
  const { trades } = useTrades();
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [activeRange, setActiveRange] = useState('All Time');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToJournals(user.uid, (data) => {
      setJournals(data);
    });
    return unsubscribe;
  }, [user]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let daysToSubtract = 0;
    if (activeRange === 'Last 30D') daysToSubtract = 30;
    if (activeRange === 'Last 7D') daysToSubtract = 7;

    const filterDate = new Date();
    filterDate.setDate(now.getDate() - daysToSubtract);

    const filterFn = (item: any) => {
      if (activeRange === 'All Time') return true;
      const itemDate = new Date(item.date || item.entryDate || item.createdAt?.toDate?.() || item.createdAt);
      return itemDate >= filterDate;
    };

    return {
      trades: trades.filter(filterFn),
      journals: journals.filter(filterFn)
    };
  }, [trades, journals, activeRange]);

  // ... (rest of the component will use filteredData)

  const kpiMetrics = useMemo(() => {
    const { trades } = filteredData;
    const totalPnL = trades.reduce((sum, t) => sum + parseFloat((t.pnl || "0").replace(/[$,+]/g, '')), 0);
    const wins = trades.filter(t => t.isWinner).length;
    const losses = trades.length - wins;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    const profitFactor = trades.reduce((sum, t) => {
      const pnl = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
      return pnl > 0 ? sum + pnl : sum;
    }, 0) / Math.abs(trades.reduce((sum, t) => {
      const pnl = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
      return pnl < 0 ? sum + pnl : sum;
    }, 0) || 1);
    
    const avgWin = wins > 0 ? trades.filter(t => t.isWinner).reduce((sum, t) => sum + parseFloat((t.pnl || "0").replace(/[$,+]/g, '')), 0) / wins : 0;
    const avgLoss = losses > 0 ? Math.abs(trades.filter(t => !t.isWinner).reduce((sum, t) => sum + parseFloat((t.pnl || "0").replace(/[$,+]/g, '')), 0) / losses) : 0;

    return {
      equityGrowth: totalPnL,
      profitFactor: profitFactor.toFixed(2),
      winRate: winRate.toFixed(2),
      tradesCount: trades.length,
      expectancy: trades.length > 0 ? (totalPnL / trades.length).toFixed(2) : "0.00",
      avgWinLossRatio: avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "0.00"
    };
  }, [filteredData]);

  const equityData = useMemo(() => {
    const { trades } = filteredData;
    let balance = 100000; // Assuming starting balance
    return trades.map((t, index) => {
      const pnl = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
      balance += pnl;
      return { trade: index, equity: balance, balance: balance };
    });
  }, [filteredData]);

  const drawdownData = useMemo(() => {
    // Placeholder logic for dynamic drawdown
    return [
      { day: 'Jul 01', value: 1.2 },
      { day: 'Jul 04', value: 2.8 },
      { day: 'Jul 08', value: 0.4 },
      { day: 'Jul 12', value: 1.6 },
      { day: 'Jul 15', value: 4.1 },
    ];
  }, [filteredData]);

  const symbolData = useMemo(() => {
    // Placeholder logic for dynamic symbol data
    return [
      { symbol: 'EUR/USD', pf: 2.42, color: '#3b82f6' },
      { symbol: 'XAU/USD', pf: 1.85, color: '#3b82f6' },
    ];
  }, [filteredData]);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Analysis Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="heading-1">Advanced Analysis</h2>
            <p className="body-text mt-2 max-w-lg">
              Deep-dive into your trading performance metrics. Institutional-grade quantitative analysis of your equity growth and risk management.
            </p>
          </div>
          <div className="flex gap-3 bg-theme-surface-light/50 dark:bg-theme-surface-dark/50 border border-theme-border-light dark:border-theme-border-dark p-1.5 rounded-xl backdrop-blur-sm">
            {['All Time', 'Last 30D', 'Last 7D'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeRange === range
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards Grid */}
变换        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label-text">Total P&L</p>
              <TrendingUp className="w-4 h-4 text-status-success" />
            </div>
            <h3 className="heading-2">${kpiMetrics.equityGrowth.toLocaleString()}</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label-text">Profit Factor</p>
              <Activity className="w-4 h-4 text-brand-primary" />
            </div>
            <h3 className="heading-2">{kpiMetrics.profitFactor}</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label-text">Win Rate</p>
              <ShieldAlert className="w-4 h-4 text-status-danger" />
            </div>
            <h3 className="heading-2">{kpiMetrics.winRate}%</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label-text">Total Trades</p>
              <Clock className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" />
            </div>
            <h3 className="heading-2">{kpiMetrics.tradesCount}</h3>
          </Card>
        </div>

        {/* Main Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cumulative Equity Curve */}
          <Card className="lg:col-span-2 p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h4 className="heading-3">Cumulative Equity Curve</h4>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">Performance trajectory over {filteredData.trades.length} executed trades</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-brand-primary"></span>
                  <span className="label-text">Equity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-theme-border-light dark:bg-theme-border-dark"></span>
                  <span className="label-text">Balance</span>
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-theme-border-light/20 dark:text-theme-border-dark/20" />
                  <XAxis 
                    dataKey="trade" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'currentColor'}}
                    className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'currentColor'}}
                    className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-theme-surface-dark)', borderRadius: '12px', border: '1px solid var(--color-theme-border-dark)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="var(--color-brand-primary)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="var(--color-theme-border-dark)" 
                    strokeWidth={2} 
                    fill="transparent" 
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Session Performance */}
          <Card className="p-8 flex flex-col">
            <h4 className="heading-3 mb-2">Session Performance</h4>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-8">Win percentage across global markets</p>
            <div className="flex-1 flex flex-col justify-center space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">London Open</span>
                  <span className="text-xs font-bold text-status-success">68% WR</span>
                </div>
                <div className="h-2 w-full bg-theme-border-light dark:bg-theme-border-dark rounded-full overflow-hidden">
                  <div className="h-full bg-status-success w-[68%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">New York Session</span>
                  <span className="text-xs font-bold text-status-success">54% WR</span>
                </div>
                <div className="h-2 w-full bg-theme-border-light dark:bg-theme-border-dark rounded-full overflow-hidden">
                  <div className="h-full bg-status-success w-[54%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">Asian Session</span>
                  <span className="text-xs font-bold text-status-danger">32% WR</span>
                </div>
                <div className="h-2 w-full bg-theme-border-light dark:bg-theme-border-dark rounded-full overflow-hidden">
                  <div className="h-full bg-status-danger w-[32%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-theme-border-light dark:border-theme-border-dark text-center">
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Strongest edge during <span className="text-status-success font-bold">London overlap</span> with 1.4 RR average.
              </p>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drawdown Chart */}
          <Card className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="heading-3">Drawdown Relative to Equity</h4>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">Monitoring capital preservation efficiency</p>
              </div>
              <Info className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" />
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={drawdownData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-theme-border-light/20 dark:text-theme-border-dark/20" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'currentColor'}}
                    className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'currentColor'}}
                    className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                    tickFormatter={(value) => `-${value}%`}
                    reversed
                  />
                  <Tooltip 
                    cursor={{fill: 'currentColor', className: 'text-theme-surface-light/20 dark:text-theme-surface-dark/20'}}
                    contentStyle={{ backgroundColor: 'var(--color-theme-surface-dark)', borderRadius: '12px', border: '1px solid var(--color-theme-border-dark)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`-${value}%`, 'Drawdown']}
                  />
                  <Bar dataKey="value" radius={[0, 0, 4, 4]}>
                    {drawdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 3 ? 'var(--color-status-danger)' : 'var(--color-status-danger-light)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Profit Factor by Symbol */}
          <Card className="p-8">
            <h4 className="heading-3 mb-2">Profit Factor by Symbol</h4>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6">Asset-specific profitability metrics</p>
            <div className="space-y-5">
              {symbolData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{item.symbol}</div>
                  <div className="flex-1 h-8 bg-theme-border-light dark:bg-theme-border-dark rounded-lg flex items-center px-1">
                    <div 
                      className="h-6 rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ 
                        width: `${(item.pf / 3) * 100}%`,
                        backgroundColor: 'var(--color-brand-primary)',
                        minWidth: '20%'
                      }}
                    >
                      <span className="text-[10px] font-bold text-white">{item.pf}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="overflow-hidden mb-12 !p-0">
          <div className="p-8 border-b border-theme-border-light dark:border-theme-border-dark">
            <h4 className="heading-3">Trade Breakdown Insights</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-theme-surface-light/50 dark:bg-theme-surface-dark/50 label-text">
                <tr>
                  <th className="px-8 py-4">Metric Category</th>
                  <th className="px-8 py-4">Value</th>
                  <th className="px-8 py-4">Confidence Level</th>
                  <th className="px-6 py-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-theme-border-light dark:divide-theme-border-dark">
                <tr className="hover:bg-theme-surface-light/30 dark:hover:bg-theme-surface-dark/30 transition-colors">
                  <td className="px-8 py-5 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">Expectancy per Trade</td>
                  <td className="px-8 py-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">${kpiMetrics.expectancy}</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => <span key={i} className={`w-2 h-2 rounded-full ${parseFloat(kpiMetrics.expectancy) > 0 ? 'bg-status-success' : 'bg-theme-border-light dark:bg-theme-border-dark'}`}></span>)}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{parseFloat(kpiMetrics.expectancy) > 0 ? 'Maintain current position sizing logic.' : 'Review trade entry criteria.'}</td>
                </tr>
                <tr className="hover:bg-theme-surface-light/30 dark:hover:bg-theme-surface-dark/30 transition-colors">
                  <td className="px-8 py-5 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">Average Win vs Loss</td>
                  <td className="px-8 py-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{kpiMetrics.avgWinLossRatio}:1</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => <span key={i} className={`w-2 h-2 rounded-full ${parseFloat(kpiMetrics.avgWinLossRatio) > 1 ? 'bg-status-success' : 'bg-theme-border-light dark:bg-theme-border-dark'}`}></span>)}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{parseFloat(kpiMetrics.avgWinLossRatio) > 1 ? 'Healthy risk-reward ratio.' : 'Focus on cutting losing trades earlier.'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
