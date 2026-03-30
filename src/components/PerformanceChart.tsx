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
import { Card } from './ui/Card';

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
    <Card className="flex flex-col h-full relative p-8">
      {!isConnected && trades.length === 0 && (
        <div className="absolute inset-0 z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center rounded-[2rem]">
          <div className="text-center p-6 bg-surface border border-brand-primary/20 shadow-premium rounded-2xl">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Connect MT5 to see performance</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-brand-primary rounded-full" />
          <h3 className="label-text">Performance Analytics</h3>
        </div>
        <div className="flex bg-theme-surface-light/50 dark:bg-theme-surface-dark/50 p-1 rounded-2xl label-text">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeRange === range 
                  ? 'bg-brand-primary text-white shadow-premium' 
                  : 'hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-theme-border-light/20 dark:text-theme-border-dark/20" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'currentColor', fontWeight: 700 }}
              className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'currentColor', fontWeight: 700 }}
              className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cumulative P&L']}
              contentStyle={{ 
                borderRadius: '20px', 
                border: '1px solid var(--color-theme-border-dark)', 
                backgroundColor: 'var(--color-theme-surface-dark)',
                backdropFilter: 'blur(12px)',
                color: '#f8fafc',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
                padding: '12px 16px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              itemStyle={{ color: '#6366f1' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#6366F1" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
