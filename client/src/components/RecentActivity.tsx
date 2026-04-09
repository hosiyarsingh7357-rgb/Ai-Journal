import React from 'react';
import { Card } from './ui/Card';
import { History, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Trade } from '../types';
import { cn } from '../lib/utils';

export const RecentActivity = ({ isConnected = false, trades = [], onNavigate }: { isConnected?: boolean, trades?: Trade[], onNavigate: (page: string) => void }) => {
  const recentTrades = trades.slice(0, 5);

  return (
    <Card className="p-8 relative overflow-hidden group">
      {!isConnected && trades.length === 0 && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex items-center justify-center rounded-[2.5rem]">
          <div className="text-center p-4 bg-surface border border-brand-primary/20 shadow-premium rounded-2xl">
            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Connect MT5 to see activity</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-brand-primary rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Recent Execution History</h3>
        </div>
        <button 
          onClick={() => onNavigate('trades')}
          className="text-[10px] font-black text-brand-primary hover:underline uppercase tracking-widest"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentTrades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-text-muted italic">No recent activity found.</p>
          </div>
        ) : (
          recentTrades.map((trade, i) => (
            <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-surface-muted border border-border group/item hover:border-brand-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black shadow-premium", trade.isWinner ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger')}>
                  {trade.isWinner ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-lg font-black text-text-primary tracking-tight">{trade.symbol}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(trade.exitDate || trade.entryDate || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-lg font-black tracking-tight", trade.isWinner ? 'text-status-success' : 'text-status-danger')}>
                  {trade.pnl || '$0.00'}
                </p>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{trade.type} • {trade.size}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
