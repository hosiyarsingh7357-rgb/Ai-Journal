import React, { useMemo } from 'react';
import { Trade } from '../types';

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
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Recent Activity</h3>
        <span className="text-xs text-slate-400">{displayActivities.length} trades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase border-b border-white/10">
            <tr>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Instrument</th>
              <th className="py-3 font-medium text-right">P&L</th>
              <th className="py-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayActivities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  No activity recorded
                </td>
              </tr>
            ) : (
              displayActivities.map((activity, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      activity.status === 'profit' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'profit' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </td>
                  <td className="py-3 text-white font-medium">{activity.instrument}</td>
                  <td className={`py-3 text-right font-black ${
                    activity.status === 'profit' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {activity.pnl}
                  </td>
                  <td className="py-3 text-right text-slate-400 text-[10px] font-bold">{activity.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
