import React, { useMemo } from 'react';
import { Trade } from '../types';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'Weekly'];

export const MonthlyPnL = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const grid = useMemo(() => {
    const cells = Array.from({ length: 48 }, (_, i) => ({ type: 'empty', day: 0, value: '', trades: '' }));
    
    if ((!isConnected && trades.length === 0) || !trades) return cells;

    // Get closed trades for current month (using exitDate)
    const monthTrades = trades.filter(t => {
      if (!t.exitDate) return false;
      const d = new Date(t.exitDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Group by day
    const dailyPnL: Record<number, number> = {};
    monthTrades.forEach(t => {
      if (!t.exitDate) return;
      const d = new Date(t.exitDate).getDate();
      const pnlVal = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
      dailyPnL[d] = (dailyPnL[d] || 0) + (isNaN(pnlVal) ? 0 : pnlVal);
    });

    // Fill grid
    // This is a simplified calendar grid logic
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const offset = (firstDay === 0 ? 6 : firstDay - 1); // Adjust to Monday start

    let dayCounter = 1;
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < 48; i++) {
      const col = i % 8;
      if (col === 7) {
        // Weekly column
        const weekNum = Math.floor(i / 8);
        const startDay = (weekNum * 7) - offset + 1;
        const endDay = startDay + 6;
        
        let weekPnL = 0;
        let weekTrades = 0;
        for (let d = Math.max(1, startDay); d <= Math.min(lastDay, endDay); d++) {
          const dayTrades = monthTrades.filter(t => t.exitDate && new Date(t.exitDate).getDate() === d);
          weekTrades += dayTrades.length;
          dayTrades.forEach(t => {
            const pnlVal = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
            weekPnL += (isNaN(pnlVal) ? 0 : pnlVal);
          });
        }

        if (weekTrades > 0) {
          cells[i] = {
            type: 'weekly',
            day: 0,
            value: (weekPnL >= 0 ? "+$" : "-$") + Math.abs(weekPnL).toFixed(0),
            trades: `${weekTrades} trades`
          };
        } else {
          cells[i] = { type: 'weekly', day: 0, value: '$0', trades: '0 trades' };
        }
        continue;
      }

      const gridIndex = i - Math.floor(i / 8); // index without weekly columns
      if (gridIndex >= offset && dayCounter <= lastDay) {
        const pnl = dailyPnL[dayCounter];
        cells[i] = {
          type: pnl === undefined ? 'empty' : (pnl > 0 ? 'profit' : (pnl < 0 ? 'loss' : 'neutral')),
          day: dayCounter,
          value: '',
          trades: ''
        };
        dayCounter++;
      }
    }

    return cells;
  }, [trades, isConnected, currentMonth, currentYear]);

  return (
    <div className="glass p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Monthly P&L</h3>
        <span className="text-xs text-slate-400 font-medium">{monthName}</span>
      </div>
      
      <div className="w-full text-center">
        <div className="grid grid-cols-8 gap-1 mb-2">
          {days.map((day, i) => (
            <div key={i} className="text-[10px] font-semibold text-slate-400 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 gap-1 text-sm font-medium">
          {grid.map((cell, i) => {
            if (cell.type === 'empty' && cell.day === 0) {
              return <div key={i} className="aspect-square bg-white/5 rounded flex items-start p-1 text-xs text-slate-400" />;
            }
            if (cell.type === 'weekly') {
              return (
                <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded flex flex-col justify-center items-center text-[9px] p-1">
                  <span className="text-slate-400">WEEKLY</span>
                  <span className="font-bold text-white">{cell.value}</span>
                  <span className="text-slate-400 truncate w-full">{cell.trades}</span>
                </div>
              );
            }
            return (
              <div 
                key={i} 
                className={`aspect-square rounded flex items-start p-1 text-[10px] font-bold ${
                  cell.type === 'profit' ? 'bg-emerald-500/20 text-emerald-400' : 
                  cell.type === 'loss' ? 'bg-red-500/20 text-red-400' : 
                  cell.type === 'neutral' ? 'bg-slate-500/20 text-slate-300' : 'bg-white/5 text-slate-400'
                }`}
              >
                {cell.day}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Profit
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> Loss
          </div>
        </div>
      </div>
    </div>
  );
};
