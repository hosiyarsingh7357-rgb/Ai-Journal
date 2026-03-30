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
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Advanced Analysis</h2>
            <p className="text-slate-400 mt-2 max-w-lg">
              Deep-dive into your trading performance metrics. Institutional-grade quantitative analysis of your equity growth and risk management.
            </p>
          </div>
          <div className="flex gap-3 bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-xl">
            {['All Time', 'Last 30D', 'Last 7D'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total P&L</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">${kpiMetrics.equityGrowth.toLocaleString()}</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profit Factor</p>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{kpiMetrics.profitFactor}</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</p>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{kpiMetrics.winRate}%</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Trades</p>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{kpiMetrics.tradesCount}</h3>
          </div>
        </div>

        {/* Main Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cumulative Equity Curve */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h4 className="text-lg font-bold text-white">Cumulative Equity Curve</h4>
                <p className="text-xs text-slate-400">Performance trajectory over {filteredData.trades.length} executed trades</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Equity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Balance</span>
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="trade" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#64748b'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#64748b'}}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#475569" 
                    strokeWidth={2} 
                    fill="transparent" 
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session Performance */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
            <h4 className="text-lg font-bold text-white mb-2">Session Performance</h4>
            <p className="text-xs text-slate-400 mb-8">Win percentage across global markets</p>
            <div className="flex-1 flex flex-col justify-center space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-300">London Open</span>
                  <span className="text-xs font-bold text-emerald-400">68% WR</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[68%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-300">New York Session</span>
                  <span className="text-xs font-bold text-emerald-400">54% WR</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[54%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-300">Asian Session</span>
                  <span className="text-xs font-bold text-red-400">32% WR</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[32%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Strongest edge during <span className="text-emerald-400 font-bold">London overlap</span> with 1.4 RR average.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drawdown Chart */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-bold text-white">Drawdown Relative to Equity</h4>
                <p className="text-xs text-slate-400">Monitoring capital preservation efficiency</p>
              </div>
              <Info className="w-4 h-4 text-slate-500" />
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={drawdownData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#64748b'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#64748b'}}
                    tickFormatter={(value) => `-${value}%`}
                    reversed
                  />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`-${value}%`, 'Drawdown']}
                  />
                  <Bar dataKey="value" radius={[0, 0, 4, 4]}>
                    {drawdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 3 ? '#ef4444' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit Factor by Symbol */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2">Profit Factor by Symbol</h4>
            <p className="text-xs text-slate-400 mb-6">Asset-specific profitability metrics</p>
            <div className="space-y-5">
              {symbolData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-xs font-bold text-slate-300">{item.symbol}</div>
                  <div className="flex-1 h-8 bg-slate-800 rounded-lg flex items-center px-1">
                    <div 
                      className="h-6 rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ 
                        width: `${(item.pf / 3) * 100}%`,
                        backgroundColor: item.color,
                        minWidth: '20%'
                      }}
                    >
                      <span className="text-[10px] font-bold text-white">{item.pf}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden mb-12">
          <div className="p-8 border-b border-white/10">
            <h4 className="text-lg font-bold text-white">Trade Breakdown Insights</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Metric Category</th>
                  <th className="px-8 py-4">Value</th>
                  <th className="px-8 py-4">Confidence Level</th>
                  <th className="px-8 py-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5 font-semibold text-white">Expectancy per Trade</td>
                  <td className="px-8 py-5 text-slate-300">${kpiMetrics.expectancy}</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => <span key={i} className={`w-2 h-2 rounded-full ${parseFloat(kpiMetrics.expectancy) > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>)}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-400">{parseFloat(kpiMetrics.expectancy) > 0 ? 'Maintain current position sizing logic.' : 'Review trade entry criteria.'}</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5 font-semibold text-white">Average Win vs Loss</td>
                  <td className="px-8 py-5 text-slate-300">{kpiMetrics.avgWinLossRatio}:1</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => <span key={i} className={`w-2 h-2 rounded-full ${parseFloat(kpiMetrics.avgWinLossRatio) > 1 ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>)}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-400">{parseFloat(kpiMetrics.avgWinLossRatio) > 1 ? 'Healthy risk-reward ratio.' : 'Focus on cutting losing trades earlier.'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
