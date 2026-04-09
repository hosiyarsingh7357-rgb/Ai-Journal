import React from 'react';
import { Card } from './ui/Card';
import { Target, Zap, Clock, PieChart } from 'lucide-react';
import { Trade } from '@shared/types';
import { cn } from '@/utils/cn';

export const QuickStats = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const stats = React.useMemo(() => {
    const closedTrades = trades.filter(t => t.exitPrice);
    if (closedTrades.length === 0) {
      return { rr: '1:0.00', pf: '0.00', duration: '0h', totalTrades: 0 };
    }

    let totalWins = 0;
    let totalLosses = 0;
    let totalDuration = 0;
    let winCount = 0;

    closedTrades.forEach(t => {
      const pnl = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
      if (!isNaN(pnl)) {
        if (pnl > 0) {
          totalWins += pnl;
          winCount++;
        } else {
          totalLosses += Math.abs(pnl);
        }
      }

      if (t.entryDate && t.exitDate) {
        const duration = new Date(t.exitDate).getTime() - new Date(t.entryDate).getTime();
        totalDuration += duration;
      }
    });

    const pf = totalLosses === 0 ? (totalWins > 0 ? '9.99' : '0.00') : (totalWins / totalLosses).toFixed(2);
    const avgDuration = (totalDuration / closedTrades.length / (1000 * 60 * 60)).toFixed(1);
    const winRate = (winCount / closedTrades.length * 100).toFixed(1);

    return {
      rr: `1:${(parseFloat(pf) * 1.2).toFixed(2)}`, // Simplified R:R estimation
      pf,
      duration: `${avgDuration}h`,
      totalTrades: closedTrades.length
    };
  }, [trades]);

  return (
    <Card className="p-8 relative overflow-hidden group">
      {!isConnected && trades.length === 0 && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex items-center justify-center rounded-[2.5rem]">
          <div className="text-center p-4 bg-surface border border-brand-primary/20 shadow-premium rounded-2xl">
            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Connect MT5 to see stats</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-brand-primary rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">Quick Performance Stats</h3>
        </div>
        <PieChart className="w-5 h-5 text-text-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-surface-muted border border-border group/item hover:border-brand-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 group-hover/item:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Avg. R:R</p>
          <p className="text-xl font-black text-text-primary tracking-tight">{stats.rr}</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-muted border border-border group/item hover:border-brand-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center mb-4 group-hover/item:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Profit Factor</p>
          <p className="text-xl font-black text-text-primary tracking-tight">{stats.pf}</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-muted border border-border group/item hover:border-brand-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-status-warning/10 text-status-warning flex items-center justify-center mb-4 group-hover/item:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Avg. Duration</p>
          <p className="text-xl font-black text-text-primary tracking-tight">{stats.duration}</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-muted border border-border group/item hover:border-brand-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 group-hover/item:scale-110 transition-transform">
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Total Trades</p>
          <p className="text-xl font-black text-text-primary tracking-tight">{stats.totalTrades}</p>
        </div>
      </div>
    </Card>
  );
};
