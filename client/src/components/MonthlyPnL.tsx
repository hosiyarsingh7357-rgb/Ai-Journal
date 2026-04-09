import React from 'react';
import { Card } from './ui/Card';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Trade } from '../types';
import { cn } from '../lib/utils';

export const MonthlyPnL = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [showPicker, setShowPicker] = React.useState(false);

  const currentMonthName = selectedDate.toLocaleString('default', { month: 'long' });
  const currentYear = selectedDate.getFullYear();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = React.useMemo(() => {
    const current = new Date().getFullYear();
    const start = current - 5;
    return Array.from({ length: 10 }, (_, i) => start + i);
  }, []);

  const monthlyStats = React.useMemo(() => {
    const currentMonthTrades = trades.filter(t => {
      const d = new Date(t.exitDate || t.entryDate || '');
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    let wins = 0;
    let losses = 0;
    let net = 0;

    currentMonthTrades.forEach(t => {
      const pnl = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
      if (!isNaN(pnl)) {
        net += pnl;
        if (pnl > 0) wins += pnl;
        else losses += Math.abs(pnl);
      }
    });

    return {
      net: (net >= 0 ? "$" : "-$") + Math.abs(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      wins: "$" + wins.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      losses: "-$" + losses.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      isPositive: net >= 0
    };
  }, [trades, selectedDate]);

  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setShowPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
  };

  return (
    <div className="relative overflow-hidden group min-h-[300px]">
      {showPicker && (
        <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm p-6 flex flex-col rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Select Period</h4>
            <button 
              onClick={() => setShowPicker(false)}
              className="text-text-secondary hover:text-brand-primary"
            >
              Close
            </button>
          </div>
          
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {years.map(year => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  currentYear === year 
                    ? "bg-brand-primary text-text-primary" 
                    : "bg-surface hover:bg-surface-muted text-text-secondary"
                )}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 flex-1">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={cn(
                  "p-2 rounded-xl text-[10px] font-bold transition-all",
                  selectedDate.getMonth() === index 
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" 
                    : "bg-surface hover:bg-surface-muted text-text-secondary border border-transparent"
                )}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
      {!isConnected && trades.length === 0 && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex items-center justify-center rounded-[2.5rem]">
          <div className="text-center p-4 bg-surface border border-brand-primary/20 shadow-premium rounded-2xl">
            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Connect MT5 to see P&L</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-brand-primary rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">{currentMonthName} {currentYear} P&L</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-surface-muted rounded-lg transition-colors text-text-secondary"
          >
            <ArrowUpRight className="w-4 h-4 -rotate-135" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-surface-muted rounded-lg transition-colors text-text-secondary"
          >
            <ArrowUpRight className="w-4 h-4 -rotate-45" />
          </button>
          <Calendar 
            className="w-5 h-5 text-text-secondary cursor-pointer hover:text-brand-primary transition-colors" 
            onClick={() => setShowPicker(!showPicker)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-8 rounded-[2.5rem] bg-background border border-border text-center group/item hover:border-brand-primary/30 transition-all">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Net Profit</p>
          <p className={cn(
            "text-4xl font-black tracking-tighter",
            monthlyStats.isPositive ? "text-status-success" : "text-status-danger"
          )}>{monthlyStats.net}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-status-success/5 border border-status-success/10 text-center">
            <p className="text-[9px] font-black text-status-success uppercase tracking-widest mb-1">Wins</p>
            <p className="text-xl font-black text-status-success">{monthlyStats.wins}</p>
          </div>
          <div className="p-6 rounded-3xl bg-status-danger/5 border border-status-danger/10 text-center">
            <p className="text-[9px] font-black text-status-danger uppercase tracking-widest mb-1">Losses</p>
            <p className="text-xl font-black text-status-danger">{monthlyStats.losses}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
