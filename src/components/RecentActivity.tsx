import React, { useMemo } from 'react';
import { Trade } from '../types';
import { Card } from './ui/Card';

export const RecentActivity = ({ isConnected = false, trades = [] }: { isConnected?: boolean, trades?: Trade[] }) => {
  const displayActivities = useMemo(() => {
    if ((!isConnected && trades.length === 0) || !trades) return [];
    
    // Sort by date descending and take top 5
    return [...trades]
      .sort((a, b) => new Date(b.entryDate || 0).getTime() - new Date(a.entryDate || 0).getTime())
      .slice(0, 5)
      .map(t => {
        const pnlVal = parseFloat((t.pnl || "0").replace(/[$,+]/g, ''));
        return {
          status: pnlVal >= 0 ? 'profit' : 'loss',
          instrument: t.symbol,
          pnl: t.pnl || "$0.00",
          time: t.entryDate ? new Date(t.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'
        };
      });
  }, [trades, isConnected]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">Recent Activity</h3>
        <span className="text-xs text-text-secondary">{displayActivities.length} trades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-text-secondary uppercase border-b border-border">
            <tr>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Instrument</th>
              <th className="py-3 font-medium text-right">P&L</th>
              <th className="py-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayActivities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-text-secondary text-xs font-bold uppercase tracking-widest">
                  No activity recorded
                </td>
              </tr>
            ) : (
              displayActivities.map((activity, index) => (
                <tr key={index} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      activity.status === 'profit' ? 'bg-status-success/10' : 'bg-status-danger/10'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'profit' ? 'bg-status-success' : 'bg-status-danger'
                      }`} />
                    </div>
                  </td>
                  <td className="py-3 text-text-primary font-medium">{activity.instrument}</td>
                  <td className={`py-3 text-right font-black ${
                    activity.status === 'profit' ? 'text-status-success' : 'text-status-danger'
                  }`}>
                    {activity.pnl}
                  </td>
                  <td className="py-3 text-right text-text-secondary text-[10px] font-bold">{activity.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
