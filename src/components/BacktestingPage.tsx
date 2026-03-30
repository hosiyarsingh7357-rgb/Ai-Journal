import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Settings2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  FastForward, 
  Rewind, 
  Camera, 
  Maximize2, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown,
  Download,
  Activity,
  Target
} from 'lucide-react';

export const BacktestingPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState({
    symbol: 'EURUSD - Euro / US Dollar',
    timeframe: '15m',
    tickSpeed: '1x',
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  });
  const [activeConfig, setActiveConfig] = useState(config);
  const [replay, setReplay] = useState({
    currentPrice: 1.0852,
    floatingPnL: 0,
    rMultiple: 0,
    trades: [] as any[]
  });
  const [order, setOrder] = useState({
    size: 1.00,
    stopLoss: '',
    takeProfit: ''
  });

  const handleScreenshot = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `chart-screenshot-${activeConfig.symbol.split(' - ')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const speed = config.tickSpeed === '1x' ? 1 : config.tickSpeed === '5x' ? 5 : config.tickSpeed === '10x' ? 10 : 1;
      interval = setInterval(() => {
        setReplay(prev => ({
          ...prev,
          currentPrice: prev.currentPrice + (Math.random() - 0.5) * 0.0010
        }));
      }, 1000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, config.tickSpeed]);

  const handleInitialize = () => {
    setIsPlaying(false);
    setActiveConfig(config);
    setReplay({
      currentPrice: 1.0852,
      floatingPnL: 0,
      rMultiple: 0,
      trades: []
    });
  };

  const handleOrder = (type: 'BUY' | 'SELL') => {
    const newTrade = {
      symbol: config.symbol,
      type: type,
      entry: replay.currentPrice.toFixed(4),
      size: order.size,
      pnl: (Math.random() - 0.5) * 1000,
      rr: (Math.random() * 3).toFixed(2)
    };
    
    setReplay(prev => ({
      ...prev,
      trades: [...prev.trades, newTrade]
    }));
  };

  return (
    <div className={`flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 lg:p-8 gap-6 bg-transparent no-scrollbar ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
      <section className={`w-full lg:w-80 flex flex-col gap-6 shrink-0 ${isFullscreen ? 'hidden' : ''}`}>
        {/* Test Settings */}
        <div className="glass p-5">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
            <Settings2 className="w-5 h-5 text-blue-400" />
            Replay Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symbol</label>
              <div className="relative">
                <select 
                  value={config.symbol}
                  onChange={(e) => setConfig({...config, symbol: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none text-white"
                >
                  <optgroup label="Forex" className="bg-slate-800 text-white">
                    <option>EURUSD - Euro / US Dollar</option>
                    <option>GBPUSD - British Pound / US Dollar</option>
                    <option>USDJPY - US Dollar / Japanese Yen</option>
                  </optgroup>
                  <optgroup label="Crypto" className="bg-slate-800 text-white">
                    <option>BTCUSD - Bitcoin / US Dollar</option>
                    <option>ETHUSD - Ethereum / US Dollar</option>
                  </optgroup>
                  <optgroup label="Commodities" className="bg-slate-800 text-white">
                    <option>XAUUSD - Gold / US Dollar</option>
                    <option>XAGUSD - Silver / US Dollar</option>
                    <option>USOIL - Crude Oil</option>
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timeframe</label>
                <select 
                  value={config.timeframe}
                  onChange={(e) => setConfig({...config, timeframe: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-white"
                >
                  <option>15m</option>
                  <option>1h</option>
                  <option>4h</option>
                  <option>1D</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tick Speed</label>
                <select 
                  value={config.tickSpeed}
                  onChange={(e) => setConfig({...config, tickSpeed: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-white"
                >
                  <option>1x</option>
                  <option>5x</option>
                  <option>10x</option>
                  <option>Real-time</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date Range</label>
              <div className="space-y-2">
                <input className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-white" type="date" defaultValue="2023-01-01"/>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-white" type="date" defaultValue="2023-12-31"/>
              </div>
            </div>
            <button 
              onClick={handleInitialize}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 border border-blue-500/30"
            >
              INITIALIZE REPLAY
            </button>
          </div>
        </div>

        {/* Manual Entry Panel */}
        <div className="glass p-5 flex-1">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-emerald-400" />
            Order Entry
          </h2>
          <div className="flex gap-2 mb-6">
            <button onClick={() => handleOrder('BUY')} className="flex-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 py-2 rounded-xl font-bold text-sm tracking-tight hover:bg-emerald-600/30 transition-colors">BUY</button>
            <button onClick={() => handleOrder('SELL')} className="flex-1 bg-red-600/20 border border-red-500/30 text-red-400 py-2 rounded-xl font-bold text-sm tracking-tight hover:bg-red-600/30 transition-colors">SELL</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Position Size (Lots)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm font-bold text-blue-400 outline-none" 
                step="0.01" 
                type="number" 
                value={order.size}
                onChange={(e) => setOrder({...order, size: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stop Loss</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-red-400 placeholder:text-red-400/50 outline-none" 
                  placeholder="1.08540" 
                  type="text"
                  value={order.stopLoss}
                  onChange={(e) => setOrder({...order, stopLoss: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Take Profit</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-emerald-400 placeholder:text-emerald-400/50 outline-none" 
                  placeholder="1.09210" 
                  type="text"
                  value={order.takeProfit}
                  onChange={(e) => setOrder({...order, takeProfit: e.target.value})}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Replay Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400">Floating P&L</p>
                  <p className={`text-lg font-bold ${replay.floatingPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {replay.floatingPnL >= 0 ? '+' : ''}${Math.abs(replay.floatingPnL).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">R-Multiple</p>
                  <p className="text-lg font-bold text-white">{replay.rMultiple.toFixed(2)}R</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chart & Terminal Center */}
      <section className="flex-1 flex flex-col gap-6 h-full">
        {/* Main Chart Area */}
        <div ref={chartRef} className="flex-1 glass relative overflow-hidden flex flex-col">
          {/* Chart Header */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xl font-bold text-white">{activeConfig.symbol.split(' - ')[0]}</span>
                <span className="text-sm font-medium text-slate-400 ml-2">{activeConfig.timeframe}</span>
              </div>
              <div className="flex gap-4 text-sm font-medium">
                <span className="text-emerald-400">O: {(replay.currentPrice - 0.0005).toFixed(4)}</span>
                <span className="text-red-400">H: {(replay.currentPrice + 0.0005).toFixed(4)}</span>
                <span className="text-red-400">L: {(replay.currentPrice - 0.0010).toFixed(4)}</span>
                <span className="text-emerald-400">C: {replay.currentPrice.toFixed(4)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleScreenshot} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"><Camera className="w-5 h-5" /></button>
              <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"><Maximize2 className="w-5 h-5" /></button>
              <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
              <button className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide">INDICATORS</button>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="flex-1 w-full bg-transparent relative min-h-[400px]">
            <iframe
              src={`https://s.tradingview.com/embed-widget/advanced-chart/?symbol=${activeConfig.symbol.split(' - ')[0]}&theme=dark&autosize=true`}
              className="w-full h-full"
              title="TradingView Chart"
            />
          </div>

          {/* Playback Controls */}
          <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:gap-4 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl w-[90%] sm:w-auto justify-center">
            <button onClick={() => setReplay(prev => ({...prev, currentPrice: 1.0852}))} className="p-1.5 lg:p-2 text-slate-300 hover:text-blue-400 transition-colors"><SkipBack className="w-4 lg:w-5 h-4 lg:h-5" /></button>
            <button onClick={() => setReplay(prev => ({...prev, currentPrice: prev.currentPrice - 0.0010}))} className="p-1.5 lg:p-2 text-slate-300 hover:text-blue-400 transition-colors"><Rewind className="w-4 lg:w-5 h-4 lg:h-5" /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-5 lg:w-6 h-5 lg:h-6 fill-current" /> : <Play className="w-5 lg:w-6 h-5 lg:h-6 fill-current" />}
            </button>
            <button onClick={() => setReplay(prev => ({...prev, currentPrice: prev.currentPrice + 0.0010}))} className="p-1.5 lg:p-2 text-slate-300 hover:text-blue-400 transition-colors"><FastForward className="w-4 lg:w-5 h-4 lg:h-5" /></button>
            <button onClick={() => setReplay(prev => ({...prev, currentPrice: 1.1000}))} className="p-1.5 lg:p-2 text-slate-300 hover:text-blue-400 transition-colors"><SkipForward className="w-4 lg:w-5 h-4 lg:h-5" /></button>
            <div className="h-6 w-[1px] bg-white/20 mx-1 lg:mx-2"></div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-slate-400">Date Replay</span>
              <span className="text-[10px] lg:text-xs font-bold text-white whitespace-nowrap">OCT 24, 2023</span>
            </div>
          </div>
        </div>

        {/* Trades Log Bento Area */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 mb-4 lg:mb-0 ${isFullscreen ? 'hidden' : ''}`}>
          {/* Session Performance */}
          <div className="col-span-1 lg:col-span-4 glass p-5 flex flex-col justify-between h-40 lg:h-48">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Backtest Session ROI</span>
            <div>
              <p className="text-2xl lg:text-3xl font-extrabold text-emerald-400">+12.4%</p>
              <p className="text-xs text-slate-400 mt-1">Winning Streak: 4 Trades</p>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[70%]"></div>
            </div>
          </div>

          {/* Manual Trade Log */}
          <div className="col-span-1 lg:col-span-8 glass overflow-hidden flex flex-col h-48 lg:h-48">
            <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-sm uppercase tracking-wide text-white">Recorded Session Trades</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 no-scrollbar">
              {replay.trades.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium text-center py-4">No trades recorded in this session.</p>
              ) : (
                replay.trades.map((trade, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${trade.pnl >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {trade.pnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{trade.symbol} {trade.type} @ {trade.entry}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{config.timeframe} TF • {trade.size} Lots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">RR: {trade.rr}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
