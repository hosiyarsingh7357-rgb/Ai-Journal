import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Trade } from '../types';

export const PerformanceChart = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const [activeRange, setActiveRange] = React.useState('ALL');

  const ranges = ['1D', '1W', '1M', '3M', 'ALL'];

  const chartData = useMemo(() => {
    if ((!isConnected && trades.length === 0) || !trades || trades.length === 0) {
      return [
        { name: 'Mon', value: 0 },
        { name: 'Tue', value: 0 },
        { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 },
        { name: 'Fri', value: 0 },
      ];
    }

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = new Date(a.entryDate || 0).getTime();
      const dateB = new Date(b.entryDate || 0).getTime();
      return dateA - dateB;
    });

    // Calculate cumulative P&L
    let cumulativePnL = 0;
    const data = sortedTrades.map(trade => {
      const pnlStr = trade.pnl || "$0.00";
      const pnlVal = parseFloat(pnlStr.replace(/[$,+]/g, ''));
      cumulativePnL += (isNaN(pnlVal) ? 0 : pnlVal);
      
      const date = new Date(trade.entryDate || 0);
      return {
        name: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: cumulativePnL,
        fullDate: date
      };
    });

    // Filter based on activeRange
    const now = new Date();
    let filteredData = data;
    if (activeRange === '1D') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredData = data.filter(d => d.fullDate >= oneDayAgo);
    } else if (activeRange === '1W') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = data.filter(d => d.fullDate >= oneWeekAgo);
    } else if (activeRange === '1M') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = data.filter(d => d.fullDate >= oneMonthAgo);
    } else if (activeRange === '3M') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filteredData = data.filter(d => d.fullDate >= threeMonthsAgo);
    }

    return filteredData.length > 0 ? filteredData : data;
  }, [trades, isConnected, activeRange]);

  return (
    <div className="glass p-6 flex flex-col h-full relative">
      {!isConnected && trades.length === 0 && (
        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <div className="text-center p-4">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Connect MT5 to see performance</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white">Performance</h3>
        <div className="flex bg-white/10 p-1 rounded-lg text-xs font-medium text-slate-300">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRange === range 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'hover:bg-white/10 hover:shadow-sm'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' 
              }}
              itemStyle={{ color: '#3B82F6' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
