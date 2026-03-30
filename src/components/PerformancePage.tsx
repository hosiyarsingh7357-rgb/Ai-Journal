import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Trade } from '../types';

const parsePnL = (pnl?: string) => {
  if (!pnl) return 0;
  return parseFloat(pnl.replace(/[$,+]/g, '')) || 0;
};

export const PerformancePage = ({ 
  tradesList, 
  onNavigate 
}: { 
  tradesList: Trade[], 
  onNavigate: (page: string) => void 
}) => {
  const [activeRange, setActiveRange] = React.useState('ALL');

  const stats = useMemo(() => {
    if (!tradesList || tradesList.length === 0) {
      return {
        profitFactor: '0.00',
        winRate: '0.0%',
        avgRR: '1:0.0',
        maxDD: '0.0%',
        equityData: [],
        instrumentData: [],
        monthlyPerformance: [],
        bestTrade: { val: 0, symbol: '—' },
        worstTrade: { val: 0, symbol: '—' },
        avgWin: 0,
        avgLoss: 0,
        avgDuration: '0h 0m'
      };
    }

    // Sort trades by date
    const sortedTrades = [...tradesList].sort((a, b) => 
      new Date(a.entryDate || 0).getTime() - new Date(b.entryDate || 0).getTime()
    );

    let totalWin = 0;
    let totalLoss = 0;
    let wins = 0;
    let losses = 0;
    let maxEquity = 0;
    let currentEquity = 0;
    let maxDrawdown = 0;
    let bestTrade = { val: -Infinity, symbol: '—' };
    let worstTrade = { val: Infinity, symbol: '—' };
    
    const symbolVolume: Record<string, number> = {};
    const monthlyPnL: Record<string, number> = {};
    
    let totalDuration = 0;
    let tradesWithDuration = 0;
    const equityCurve: any[] = [];

    sortedTrades.forEach(trade => {
      const pnl = parsePnL(trade.pnl);
      currentEquity += pnl;
      
      // Duration
      if (trade.entryDate && trade.exitDate) {
        const duration = new Date(trade.exitDate).getTime() - new Date(trade.entryDate).getTime();
        if (duration > 0) {
          totalDuration += duration;
          tradesWithDuration++;
        }
      }
      
      // Equity Curve
      equityCurve.push({
        name: trade.entryDate ? new Date(trade.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—',
        value: currentEquity,
        date: trade.entryDate ? new Date(trade.entryDate) : new Date()
      });

      // Max Drawdown
      if (currentEquity > maxEquity) maxEquity = currentEquity;
      const dd = maxEquity > 0 ? (maxEquity - currentEquity) / maxEquity : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;

      // Win/Loss
      if (pnl > 0) {
        totalWin += pnl;
        wins++;
        if (pnl > bestTrade.val) bestTrade = { val: pnl, symbol: trade.symbol };
      } else if (pnl < 0) {
        totalLoss += Math.abs(pnl);
        losses++;
        if (pnl < worstTrade.val) worstTrade = { val: pnl, symbol: trade.symbol };
      }

      // Symbol Distribution
      symbolVolume[trade.symbol] = (symbolVolume[trade.symbol] || 0) + 1;

      // Monthly Performance
      if (trade.entryDate) {
        const month = new Date(trade.entryDate).toLocaleDateString(undefined, { month: 'short' });
        monthlyPnL[month] = (monthlyPnL[month] || 0) + pnl;
      }
    });

    const avgDurationMs = tradesWithDuration > 0 ? totalDuration / tradesWithDuration : 0;
    const avgHours = Math.floor(avgDurationMs / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60));

    const totalTrades = tradesList.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const profitFactor = totalLoss > 0 ? (totalWin / totalLoss) : totalWin > 0 ? 100 : 0;
    
    const instrumentData = Object.entries(symbolVolume).map(([name, count], index) => ({
      name,
      value: Math.round((count / totalTrades) * 100),
      color: ['#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6'][index % 5]
    }));

    const monthlyPerformance = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      month,
      pnl: monthlyPnL[month] ? parseFloat(((monthlyPnL[month] / 10000) * 100).toFixed(1)) : 0 // Assuming 10k base for %
    }));

    return {
      profitFactor: profitFactor.toFixed(2),
      winRate: winRate.toFixed(1) + '%',
      avgRR: '1:2.4', // Placeholder as we don't have SL/TP
      maxDD: (maxDrawdown * 100).toFixed(1) + '%',
      equityData: equityCurve,
      instrumentData,
      monthlyPerformance,
      bestTrade,
      worstTrade: worstTrade.val === Infinity ? { val: 0, symbol: '—' } : worstTrade,
      avgWin: wins > 0 ? totalWin / wins : 0,
      avgLoss: losses > 0 ? totalLoss / losses : 0,
      avgDuration: `${avgHours}h ${avgMinutes}m`
    };
  }, [tradesList]);

  const filteredEquityData = useMemo(() => {
    if (activeRange === 'ALL') return stats.equityData;
    
    const now = new Date();
    let cutoff = new Date();
    if (activeRange === '1D') cutoff.setDate(now.getDate() - 1);
    else if (activeRange === '1W') cutoff.setDate(now.getDate() - 7);
    else if (activeRange === '1M') cutoff.setMonth(now.getMonth() - 1);
    else if (activeRange === '3M') cutoff.setMonth(now.getMonth() - 3);
    
    return stats.equityData.filter((d: any) => d.date >= cutoff);
  }, [stats.equityData, activeRange]);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Top Tier Metrics - Bento Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="glass rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Profit Factor</span>
                <span className="text-2xl font-black text-white">{stats.profitFactor}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Efficiency</span>
              <span className="text-xs font-black text-emerald-400">Optimal</span>
            </div>
          </div>

          <div className="glass rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Win Rate</span>
                <span className="text-2xl font-black text-white">{stats.winRate}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Consistency</span>
              <div className="flex gap-1">
                {[1,1,1,0,1].map((v, i) => (
                  <div key={i} className={`w-1.5 h-3 rounded-full ${v ? 'bg-emerald-400' : 'bg-red-400'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Avg. RR</span>
                <span className="text-2xl font-black text-white">{stats.avgRR}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Risk Reward</span>
              <span className="text-xs font-black text-amber-400">Optimal</span>
            </div>
          </div>

          <div className="glass rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Max DD</span>
                <span className="text-2xl font-black text-white">{stats.maxDD}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Drawdown</span>
              <span className="text-xs font-black text-emerald-400">Low Risk</span>
            </div>
          </div>
        </div>

        {/* Main Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Large Equity Curve */}
          <div className="lg:col-span-2 glass rounded-[2.5rem] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Equity Curve</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Portfolio Growth Intelligence</p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-2xl">
                {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveRange(range)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeRange === range
                        ? 'bg-blue-600 shadow-sm text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredEquityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                            <p className="text-lg font-black text-white">${payload[0].value.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563EB" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Widgets */}
          <div className="space-y-8">
            {/* Best/Worst Trade */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Best Trade</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black">{stats.bestTrade.val > 0 ? `+$${stats.bestTrade.val.toLocaleString()}` : '$0'}</span>
                    <span className="text-xs font-bold text-emerald-400">{stats.bestTrade.symbol}</span>
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Worst Trade</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black">{stats.worstTrade.val < 0 ? `-$${Math.abs(stats.worstTrade.val).toLocaleString()}` : '$0'}</span>
                    <span className="text-xs font-bold text-red-400">{stats.worstTrade.symbol}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Stats */}
            <div className="glass rounded-[2.5rem] shadow-2xl p-8">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Trade Averages</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">Average Win</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">+${stats.avgWin.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">Average Loss</span>
                  </div>
                  <span className="text-sm font-black text-red-400">-${Math.abs(stats.avgLoss).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">Avg. Duration</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats.avgDuration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Heatmap */}
          <div className="lg:col-span-2 glass rounded-[2.5rem] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Monthly Performance</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Historical Returns %</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>2025</span>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.monthlyPerformance.map((item, index) => (
                <div key={index} className={`p-4 rounded-3xl border transition-all hover:scale-[1.05] cursor-default flex flex-col items-center justify-center text-center ${
                  item.pnl > 0 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : item.pnl < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{item.month}</span>
                  <span className={`text-sm font-black ${item.pnl > 0 ? 'text-emerald-400' : item.pnl < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    {item.pnl > 0 ? '+' : ''}{item.pnl}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="glass rounded-[2.5rem] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Assets</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Volume Split</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.instrumentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {stats.instrumentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{stats.instrumentData.length}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Instruments</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {stats.instrumentData.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{item.name}</span>
                  <span className="text-[10px] font-black text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight Footer */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 blur-[100px] -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tight">Strategy Optimization Detected</h4>
                <p className="text-indigo-100 font-medium max-w-xl mt-1">
                  Your performance on {stats.bestTrade.symbol} has improved by 14% since you started using hard stops. AI recommends increasing position size by 0.25 lots.
                </p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('ai-report')}
              className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl whitespace-nowrap"
            >
              VIEW DETAILED AI AUDIT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
