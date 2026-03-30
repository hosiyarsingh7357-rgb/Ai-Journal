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
        <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{displayActivities.length} trades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Instrument</th>
              <th className="py-3 font-medium text-right">P&L</th>
              <th className="py-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayActivities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                  No activity recorded
                </td>
              </tr>
            ) : (
              displayActivities.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      activity.status === 'profit' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'profit' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'
                      }`} />
                    </div>
                  </td>
                  <td className="py-3 text-gray-900 dark:text-white font-medium">{activity.instrument}</td>
                  <td className={`py-3 text-right font-black ${
                    activity.status === 'profit' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {activity.pnl}
                  </td>
                  <td className="py-3 text-right text-gray-500 dark:text-gray-400 text-[10px] font-bold">{activity.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
