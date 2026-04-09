import React from 'react';
import { Card } from './ui/Card';
import { LayoutList, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Trade } from '../types';
import { cn } from '../lib/utils';

export const OpenPositions = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const openTrades = trades.filter(t => !t.exitPrice);

  return (
    <Card className="p-6 relative overflow-hidden group">
      {!isConnected && trades.length === 0 && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex items-center justify-center rounded-[2.5rem]">
          <div className="text-center p-4 bg-surface border border-brand-primary/20 shadow-premium rounded-2xl">
            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Connect MT5 to see positions</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-brand-primary rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Open Positions</h3>
        </div>
        <LayoutList className="w-4 h-4 text-text-secondary" />
      </div>

      <div className="space-y-4">
        {openTrades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs font-bold text-text-muted italic">No open positions found.</p>
          </div>
        ) : (
          openTrades.map((trade, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted border border-border group/item hover:border-brand-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-premium", trade.type === 'BUY' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger')}>
                  {trade.type === 'BUY' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-black text-text-primary">{trade.symbol}</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{trade.size}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-black", (trade.pnl || '').includes('+') ? 'text-status-success' : 'text-status-danger')}>
                  {trade.pnl || '$0.00'}
                </p>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Entry: {trade.entryPrice}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
