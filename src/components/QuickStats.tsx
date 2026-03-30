import React, { useMemo } from 'react';
import { Trade } from '../types';
import { Card } from './ui/Card';

export const QuickStats = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const displayStats = useMemo(() => {
    if (!isConnected || !trades || trades.length === 0) {
      return [
        { label: 'AVG WIN', value: '+$0.00' },
        { label: 'AVG LOSS', value: '+$0.00' },
        { label: 'BEST TRADE', value: '+$0.00' },
        { label: 'WORST TRADE', value: '+$0.00' },
        { label: 'PROFIT FACTOR', value: '0.00', variant: 'danger', colSpan: true },
      ];
    }

    const winningTrades = trades.filter(t => t.isWinner);
    const losingTrades = trades.filter(t => !t.isWinner);

    const totalWin = winningTrades.reduce((acc, t) => acc + parseFloat((t.pnl || "0").replace(/[$,+]/g, '')), 0);
    const totalLoss = Math.abs(losingTrades.reduce((acc, t) => acc + parseFloat((t.pnl || "0").replace(/[$,+]/g, '')), 0));

    const avgWin = winningTrades.length > 0 ? totalWin / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    
    const bestTrade = Math.max(...trades.map(t => parseFloat((t.pnl || "0").replace(/[$,+]/g, ''))));
    const worstTrade = Math.min(...trades.map(t => parseFloat((t.pnl || "0").replace(/[$,+]/g, ''))));
    
    const profitFactor = totalLoss === 0 ? (totalWin > 0 ? 'MAX' : '0.00') : (totalWin / totalLoss).toFixed(2);

    return [
      { label: 'AVG WIN', value: `+$${avgWin.toFixed(2)}`, variant: 'success' },
      { label: 'AVG LOSS', value: `-$${avgLoss.toFixed(2)}`, variant: 'danger' },
      { label: 'BEST TRADE', value: `+$${bestTrade.toFixed(2)}`, variant: 'success' },
      { label: 'WORST TRADE', value: `${worstTrade < 0 ? '-' : '+'}$${Math.abs(worstTrade).toFixed(2)}`, variant: 'danger' },
      { label: 'PROFIT FACTOR', value: profitFactor, variant: parseFloat(profitFactor) >= 1.5 ? 'success' : 'danger', colSpan: true },
    ];
  }, [trades, isConnected]);

  return (
    <Card className="p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        {displayStats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 ${stat.colSpan ? 'col-span-2' : ''}`}
          >
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className={`font-bold ${stat.variant === 'danger' ? 'text-red-600 dark:text-red-400' : stat.variant === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
