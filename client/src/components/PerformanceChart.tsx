import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useAppStore } from "../store/useAppStore";

export const PerformanceChart = ({ trades, timePeriod = 'ALL' }: { trades: any[], timePeriod?: string }) => {
  const { theme } = useAppStore();

  const data = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const parsePnL = (pnlStr: string | undefined): number => {
      if (!pnlStr) return 0;
      const clean = pnlStr.replace(/[^0-9.-]/g, '');
      return parseFloat(clean) || 0;
    };

    let filteredTrades = [...trades];
    const now = new Date();
    if (timePeriod !== 'ALL') {
      const cutoff = new Date();
      if (timePeriod === '1D') cutoff.setHours(0, 0, 0, 0);
      else if (timePeriod === '1W') cutoff.setDate(now.getDate() - 7);
      else if (timePeriod === '1M') cutoff.setDate(now.getDate() - 30);
      else if (timePeriod === '3M') cutoff.setMonth(now.getMonth() - 3);
      
      filteredTrades = filteredTrades.filter(t => {
        const tradeDate = new Date(t.exitDate || t.entryDate || '');
        return tradeDate >= cutoff;
      });
    }

    let cumulative = 0;
    const sortedTrades = filteredTrades.sort((a, b) => 
      new Date(a.entryDate || '').getTime() - new Date(b.entryDate || '').getTime()
    );

    // Group by date
    const dailyData: Record<string, number> = {};
    sortedTrades.forEach(trade => {
      const dateKey = new Date(trade.entryDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const pnl = parsePnL(trade.pnl);
      dailyData[dateKey] = (dailyData[dateKey] || 0) + pnl;
    });

    return Object.entries(dailyData).map(([date, dailyPnL]) => {
      cumulative += dailyPnL;
      return {
        name: date,
        pnl: cumulative
      };
    });
  }, [trades, timePeriod]);

  if (!data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-text-secondary">
        No chart data
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke={'rgba(255,255,255,0.05)'} 
          />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            hide={false}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}K`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1D21', 
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
            labelStyle={{ color: '#94A3B8', fontWeight: 'bold', marginBottom: '4px' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total P&L']}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#10B981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPnL)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
