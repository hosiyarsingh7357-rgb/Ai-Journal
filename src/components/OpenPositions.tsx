import React, { useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Trade } from '../types';
import { Card } from './ui/Card';

export const OpenPositions = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const openPositions = useMemo(() => {
    if ((!isConnected && trades.length === 0) || !trades) return [];
    // Filter trades that don't have an exit price or are explicitly marked as open
    // For this app, we'll assume empty exitPrice or exitDate means open
    return trades.filter(t => {
      const hasExitPrice = t.exitPrice && t.exitPrice !== '—' && t.exitPrice !== '';
      const hasExitDate = t.exitDate && t.exitDate !== '—' && t.exitDate !== '';
      return !hasExitPrice && !hasExitDate;
    });
  }, [trades, isConnected]);

  return (
    <Card className="flex flex-col min-h-[220px]">
      <h3 className="heading-3 mb-4">Open Positions</h3>
      {(!isConnected && trades.length === 0) || openPositions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
          <Clock className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">{!isConnected ? 'Connect MT5 to see positions' : 'No active positions'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {openPositions.map((pos, i) => {
            const pnlVal = parseFloat((pos.pnl || "0").replace(/[$,+]/g, ''));
            const isWinner = pnlVal >= 0;
            
            return (
              <div key={pos.id || i} className="flex items-center justify-between p-3 bg-surface-muted rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isWinner ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
                    {isWinner ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{pos.symbol}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{pos.type} • {pos.size} Lots</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${isWinner ? 'text-status-success' : 'text-status-danger'}`}>{pos.pnl || "$0.00"}</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Floating</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
