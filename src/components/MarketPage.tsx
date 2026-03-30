import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Clock, 
  ChevronRight,
  Search,
  Bell,
  Wallet,
  ArrowUpRight,
  Info
} from 'lucide-react';

const marketPulseData = [
  {
    symbol: 'EUR / USD',
    name: 'Euro / US Dollar',
    price: '1.08422',
    change: '+0.12%',
    isPositive: true,
    trend: [25, 22, 24, 15, 18, 10, 12, 5, 8, 2, 5],
    volume: '124.5B',
    initials: 'EUR',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    symbol: 'GBP / USD',
    name: 'British Pound',
    price: '1.26541',
    change: '-0.41%',
    isPositive: false,
    trend: [5, 8, 5, 15, 12, 22, 18, 25, 22, 28, 25],
    volume: '89.2B',
    initials: 'GBP',
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    symbol: 'GOLD',
    name: 'Gold / US Dollar',
    price: '2,324.45',
    change: '+1.54%',
    isPositive: true,
    trend: [28, 25, 20, 15, 12, 8, 10, 5, 2, 4, 0],
    volume: '45.8B',
    initials: 'XAU',
    color: 'text-slate-900',
    bg: 'bg-slate-100'
  },
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100',
    price: '18,340.2',
    change: '+0.88%',
    isPositive: true,
    trend: [20, 15, 25, 10, 12, 5],
    volume: '312.1B',
    initials: 'NAS',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  }
];

const calendarEvents = [
  {
    time: '14:30',
    timezone: 'EST',
    currency: 'USD',
    event: 'Non-Farm Payrolls (NFP)',
    impact: 'High Impact',
    impactColor: 'text-red-600 bg-red-50',
    actual: '--',
    forecast: '185K',
    previous: '203K',
    flag: '🇺🇸'
  },
  {
    time: '15:45',
    timezone: 'EST',
    currency: 'EUR',
    event: 'CPI Flash Estimate y/y',
    impact: 'Med Impact',
    impactColor: 'text-orange-600 bg-orange-50',
    actual: '2.4%',
    actualColor: 'text-emerald-600',
    forecast: '2.5%',
    previous: '2.6%',
    flag: '🇪🇺'
  },
  {
    time: '18:00',
    timezone: 'EST',
    currency: 'USD',
    event: 'FOMC Member Cook Speaks',
    impact: 'Low Impact',
    impactColor: 'text-slate-500 bg-slate-100',
    flag: '🇺🇸'
  }
];

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const MarketPage = () => {
  const [activeFilter, setActiveFilter] = React.useState('ALL ASSETS');

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Market Overview & Quick Metrics */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Ticker Stream */}
          <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">Market Pulse</h2>
                <p className="text-slate-400 font-medium text-xs lg:text-sm mt-1">Real-time global currency and commodity streams.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['ALL ASSETS', 'FOREX', 'INDICES'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 text-[10px] lg:text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                      activeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* High Density Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4 px-4">
                  <thead>
                    <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                      <th className="px-6 pb-2">Instrument</th>
                      <th className="px-6 pb-2 text-right">Last Price</th>
                      <th className="px-6 pb-2 text-right">24h Change</th>
                      <th className="px-6 pb-2 text-center">Market Trend (7D)</th>
                      <th className="px-6 pb-2 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {marketPulseData.map((item, index) => (
                      <tr key={index} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 first:rounded-l-xl last:rounded-r-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${item.bg.replace('bg-', 'bg-').replace('50', '500/10').replace('100', '500/10')} flex items-center justify-center font-bold ${item.color.replace('900', '100')} text-[10px]`}>
                              {item.initials}
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">{item.symbol}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{item.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-base text-white">{item.price}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded ${item.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} text-xs font-bold`}>
                            {item.change}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-32 mx-auto overflow-hidden">
                            <Sparkline data={item.trend} color={item.isPositive ? '#34d399' : '#f87171'} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 font-medium">{item.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Secondary Row: Market Sentiment Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between h-48 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">USD INDEX (DXY)</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-white">104.18</h3>
                  <p className="text-emerald-400 text-sm font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    Bullish Momentum
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,100 C20,80 40,90 60,60 C80,30 100,40 100,0 L100,100 Z" fill="currentColor" className="text-blue-500" />
                  </svg>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between h-48">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">SENTIMENT SPLIT</p>
                  <div className="mt-6 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-emerald-400">BUY (68%)</span>
                      <span className="text-red-400">SELL (32%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 w-[68%]"></div>
                      <div className="h-full bg-red-500 w-[32%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic text-center">Based on 12k institutional positions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Economic Calendar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Economic Calendar</h2>
              <p className="text-slate-400 font-medium text-xs mt-1">Impact events for the next 24h</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              {calendarEvents.map((event, index) => (
                <div key={index} className={`p-5 group hover:bg-white/5 transition-colors ${index !== calendarEvents.length - 1 ? 'border-b border-white/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="text-center w-10">
                        <p className="text-xs font-extrabold text-white">{event.time}</p>
                        <p className="text-[10px] text-slate-400">{event.timezone}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{event.flag}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{event.currency}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{event.event}</h4>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${event.impactColor.replace('bg-', 'bg-').replace('50', '500/10').replace('100', '500/10').replace('600', '400').replace('500', '400')} tracking-tighter uppercase`}>
                      {event.impact}
                    </span>
                  </div>
                  
                  {event.actual && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="bg-slate-800/50 p-2 rounded">
                        <p className="text-[9px] text-slate-400 font-bold">ACTUAL</p>
                        <p className={`text-xs font-bold ${event.actualColor ? event.actualColor.replace('600', '400') : 'text-white'}`}>{event.actual}</p>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <p className="text-[9px] text-slate-400 font-bold">FORECAST</p>
                        <p className="text-xs font-bold text-white">{event.forecast}</p>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <p className="text-[9px] text-slate-400 font-bold">PREVIOUS</p>
                        <p className="text-xs font-bold text-white">{event.previous}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button className="m-4 py-3 bg-slate-800/50 text-blue-400 text-[11px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors">
                VIEW FULL CALENDAR
              </button>
            </div>

            {/* Breaking News Snippet */}
            <div className="bg-blue-900/40 backdrop-blur-xl border border-blue-500/20 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-blue-300 uppercase">Breaking News</span>
                </div>
                <h3 className="text-lg font-bold leading-tight">Yen plunges to 34-year low as BoJ remains cautious on rate hikes.</h3>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[10px] text-blue-300">2 MINUTES AGO</span>
                  <ChevronRight className="w-4 h-4 text-blue-300 hover:text-white cursor-pointer" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
