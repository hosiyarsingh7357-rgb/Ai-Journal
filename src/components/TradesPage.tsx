import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Wallet, 
  ArrowUp, 
  TrendingUp, 
  Sparkles, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Calendar,
  Building2,
  Plus,
  X,
  Upload,
  Camera,
  CheckCircle2,
  LogIn,
  RefreshCw,
  BookOpen
} from 'lucide-react';

const initialTrades: any[] = [];

export const TradesPage = ({ 
  isConnected = false, 
  onConnect, 
  onSync, 
  onManualTrade,
  isSyncing = false,
  tradesList = [],
  onDeleteTrade,
  onNavigate
}: { 
  isConnected?: boolean, 
  onConnect?: () => void,
  onSync?: () => void,
  onManualTrade?: (trade: any) => void,
  isSyncing?: boolean,
  tradesList?: any[],
  onDeleteTrade?: (tradeId: string) => void,
  onNavigate?: (page: string) => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dismissOverlay, setDismissOverlay] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'BUY',
    entry: '',
    exit: '',
    entryDate: '',
    exitDate: '',
    size: '',
    notes: ''
  });
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [broker, setBroker] = useState('IC Markets Pro');
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const parsePnL = (pnlStr: string | undefined): number => {
    if (!pnlStr) return 0;
    const clean = pnlStr.replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  const stats = useMemo(() => {
    if (!tradesList || tradesList.length === 0) {
      return { totalVolume: '0.00', winRate: '0%', totalPnL: '$0.00', isPositive: true };
    }

    let totalVol = 0;
    let wins = 0;
    let totalPnL = 0;

    tradesList.forEach(trade => {
      // Volume/Size parsing
      const sizeVal = parseFloat(trade.size?.replace(/[^0-9.]/g, '') || trade.volume?.replace(/[^0-9.]/g, '') || '0');
      totalVol += sizeVal;

      // PnL parsing
      const pnl = parsePnL(trade.pnl);
      totalPnL += pnl;

      // Win Rate
      if (pnl > 0 || trade.isWinner) {
        wins++;
      }
    });

    const winRate = ((wins / tradesList.length) * 100).toFixed(1) + '%';
    const formattedPnL = totalPnL >= 0 ? `+$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return {
      totalVolume: totalVol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      winRate,
      totalPnL: formattedPnL,
      isPositive: totalPnL >= 0
    };
  }, [tradesList]);

  const processedTrades = useMemo(() => {
    return tradesList.map(trade => {
      const pnlValue = parsePnL(trade.pnl);
      const isWinner = trade.isWinner !== undefined ? trade.isWinner : pnlValue > 0;
      
      return {
        ...trade,
        date: trade.date || (trade.entryDate ? new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
        time: trade.time || (trade.entryDate ? new Date(trade.entryDate).toLocaleTimeString('en-US', { hour12: false }) : '—'),
        initials: trade.initials || trade.symbol?.substring(0, 3)?.toUpperCase() || 'TRD',
        name: trade.name || `${trade.symbol || 'Unknown'} Asset`,
        size: trade.size || trade.volume || '0.00 Lots',
        entry: trade.entry || trade.entryPrice || '0.00000',
        current: trade.current || trade.exitPrice || trade.entryPrice || '0.00000',
        pnl: trade.pnl || (pnlValue >= 0 ? `+$${pnlValue.toFixed(2)}` : `-$${Math.abs(pnlValue).toFixed(2)}`),
        pnlPercent: trade.pnlPercent || '0.00%',
        isWinner
      };
    });
  }, [tradesList]);

  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryPrice = parseFloat(formData.entry);
    const exitPrice = parseFloat(formData.exit);
    const sizeVal = parseFloat(formData.size.replace(/[^0-9.]/g, '')) || 0;
    
    // Automatic P&L Calculation
    // Simple calculation: (Exit - Entry) * Size for Buy, (Entry - Exit) * Size for Sell
    // We apply a basic multiplier for Forex/Gold if detected
    let multiplier = 1;
    const sym = formData.symbol.toUpperCase();
    if (sym.includes('XAU') || sym.includes('GOLD')) multiplier = 100;
    else if (sym.includes('JPY')) multiplier = 1000;
    else if (formData.entry.includes('.') && formData.entry.split('.')[1].length >= 4) multiplier = 100000;

    let pnlValue = 0;
    if (!isNaN(entryPrice) && !isNaN(exitPrice)) {
      if (formData.type === 'BUY') {
        pnlValue = (exitPrice - entryPrice) * sizeVal * multiplier;
      } else {
        pnlValue = (entryPrice - exitPrice) * sizeVal * multiplier;
      }
    }

    const isWinner = pnlValue > 0;
    
    // Auto-calculate Duration (in days)
    const entryDate = new Date(formData.entryDate);
    const exitDate = new Date(formData.exitDate);
    const durationDays = Math.max(0, Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Auto-calculate RR (simplified: PnL / Risk, assuming risk is 1% of entry for this example)
    const risk = entryPrice * 0.01; 
    const rr = risk !== 0 ? (Math.abs(pnlValue) / risk).toFixed(2) : '0.00';

    const newTrade = {
      date: formData.entryDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      symbol: (formData.symbol || '').toUpperCase(),
      name: (formData.symbol || '').toUpperCase() + ' Asset',
      type: formData.type,
      size: formData.size || '0.00 Lots',
      entry: formData.entry || '0.00000',
      current: formData.exit || formData.entry || '0.00000',
      entryPrice: formData.entry || '0.00000',
      exitPrice: formData.exit || '',
      pnl: pnlValue >= 0 ? `+$${pnlValue.toFixed(2)}` : `-$${Math.abs(pnlValue).toFixed(2)}`,
      pnlPercent: '0.00%',
      isWinner: isWinner,
      initials: (formData.symbol || '').substring(0, 3).toUpperCase() || 'TRD',
      rr: rr,
      duration: `${durationDays} days`,
      volume: formData.size,
      entryDate: formData.entryDate ? new Date(formData.entryDate).toISOString() : new Date().toISOString(),
      exitDate: formData.exitDate ? new Date(formData.exitDate).toISOString() : undefined,
      screenshot: screenshot
    };

    if (onManualTrade) onManualTrade(newTrade);
    setIsModalOpen(false);
    setFormData({
      symbol: '',
      type: 'BUY',
      entry: '',
      exit: '',
      entryDate: '',
      exitDate: '',
      size: '',
      notes: ''
    });
    setScreenshot(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    if (onDeleteTrade) {
      onDeleteTrade(tradeId);
    }
  };

  const [report, setReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isConnected && !isSyncing) {
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [isConnected, isSyncing]);

  const handleRefreshAnalysis = async () => {
    if (!tradesList || tradesList.length === 0) return;
    setIsAnalyzing(true);
    try {
      const { generateAIReport } = await import('../services/ai');
      const res = await generateAIReport(tradesList);
      if (res) {
        setReport(JSON.parse(res));
      }
    } catch (e) {
      console.error(e);
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (tradesList && tradesList.length > 0) {
      handleRefreshAnalysis();
    }
  }, [tradesList]);

  const displayTrades = processedTrades;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 lg:space-y-10 no-scrollbar relative">
      {(isSyncing || (!isConnected && tradesList.length === 0 && !dismissOverlay)) && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          {isSyncing ? (
            <div className="glass p-10 max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 border-4 border-white/10 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-black text-white">Syncing History</h3>
                <p className="text-slate-400 mt-2 text-sm font-medium">Fetching your latest trades from MT5...</p>
              </div>
            </div>
          ) : (
            <div className="glass p-10 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300 relative">
              <button 
                onClick={() => setDismissOverlay(true)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-900/20 border border-blue-500/30">
                <Wallet className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">No Data Imported</h3>
                <p className="text-slate-400 mt-2 font-medium">Connect your MT4/MT5 account to automatically import your trading history and analyze your performance.</p>
              </div>
              <div className="space-y-3 pt-4">
                <button 
                  onClick={onConnect}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <LogIn className="w-4 h-4" />
                  CONNECT MT5 ACCOUNT
                </button>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Plus className="w-4 h-4" />
                  ADD MANUAL TRADE
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Page Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">Trades</h1>
          <p className="text-sm lg:text-base text-slate-400 font-medium mt-1">Review and manage your institutional execution history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 bg-blue-600 text-white flex items-center gap-2 rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95 font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </button>
          <div className="relative">
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="h-10 px-3 glass flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-white">
                {dateRange.start && dateRange.end ? `${dateRange.start} - ${dateRange.end}` : timeframe}
              </span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showDatePicker ? 'rotate-[-90deg]' : 'rotate-90'}`} />
            </div>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 p-4 glass z-[60] w-64 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 [&::-webkit-calendar-picker-indicator]:filter-invert"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 [&::-webkit-calendar-picker-indicator]:filter-invert"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setShowDatePicker(false);
                    }}
                    className="flex-1 py-2 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-colors"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-lg lg:text-xl font-black text-white tracking-tight">New Manual Trade Entry</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institutional Record</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setScreenshot(null);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-red-500 shadow-sm border border-transparent hover:border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrade} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symbol & Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instrument Symbol</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. XAUUSD"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trade Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white [&>option]:bg-slate-900"
                  >
                    <option value="BUY">BUY / LONG</option>
                    <option value="SELL">SELL / SHORT</option>
                  </select>
                </div>

                {/* Entry & Exit */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entry Price</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    placeholder="0.00000"
                    value={formData.entry}
                    onChange={(e) => setFormData({...formData, entry: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Exit Price</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="0.00000"
                    value={formData.exit}
                    onChange={(e) => setFormData({...formData, exit: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entry Date</label>
                  <input 
                    type="date" 
                    value={formData.entryDate}
                    onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-500 [&::-webkit-calendar-picker-indicator]:filter-invert"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Exit Date</label>
                  <input 
                    type="date" 
                    value={formData.exitDate}
                    onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-500 [&::-webkit-calendar-picker-indicator]:filter-invert"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Position Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2.5 Lots"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trade Notes & Logic</label>
                <textarea 
                  rows={3}
                  placeholder="Describe your entry logic, emotions, and outcome..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium text-white placeholder:text-slate-500 resize-none"
                ></textarea>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Evidence Screenshot</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/*"
                  />
                  {screenshot ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-inner">
                      <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScreenshot(null);
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-3 group-hover:border-blue-400 group-hover:bg-blue-500/10 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-300">Click to upload screenshot</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setScreenshot(null);
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Analytics Preview */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Total Volume</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">{isConnected ? stats.totalVolume : '0.00'}</span>
              {isConnected && (
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUp className="w-3 h-3" /> 12%
                </span>
              )}
            </div>
          </div>
          <div className="glass p-6">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Win Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">{isConnected ? stats.winRate : '0%'}</span>
              {isConnected && (
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
          <div className="glass p-6">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Total P&L</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${isConnected ? (stats.isPositive ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
                {isConnected ? stats.totalPnL : '$0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="col-span-12 lg:col-span-4 glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Sparkles className="w-32 h-32 text-blue-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">AI Momentum Alert</span>
            </div>
            <p className="text-sm font-semibold text-slate-300 leading-relaxed">
              {report?.summary || "Analyzing your trading patterns to provide real-time momentum alerts and risk warnings..."}
            </p>
          </div>
        </div>
      </div>

      {/* AI Trade Insights Section */}
      <div className="glass p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-black text-white tracking-tight">AI Trade Insights</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Behavioral Analysis & Optimization</p>
            </div>
          </div>
          <button 
            onClick={handleRefreshAnalysis}
            disabled={isAnalyzing}
            className={`w-full sm:w-auto px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-black hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? 'ANALYZING...' : 'REFRESH ANALYSIS'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Winning Patterns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Winning Patterns</span>
            </div>
            <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 space-y-3">
              {report?.strengths ? report.strengths.slice(0, 2).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )) : (
                <p className="text-sm font-bold text-slate-400 leading-relaxed">
                  Connect your account and log trades to generate AI insights on your winning patterns.
                </p>
              )}
            </div>
          </div>

          {/* Losing Patterns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <ArrowUp className="w-4 h-4 rotate-180" />
              <span className="text-xs font-black uppercase tracking-widest">Losing Patterns</span>
            </div>
            <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20 space-y-3">
              {report?.weaknesses ? report.weaknesses.slice(0, 2).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )) : (
                <p className="text-sm font-bold text-slate-400 leading-relaxed">
                  Connect your account and log trades to generate AI insights on your losing patterns.
                </p>
              )}
            </div>
          </div>

          {/* Actionable Tips */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Actionable Tips</span>
            </div>
            <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-500/20 space-y-4">
              {report?.actionPlan ? report.actionPlan.slice(0, 2).map((item: any, i: number) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl shadow-sm border border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.title}</p>
                  <p className="text-sm font-bold text-slate-200">{item.desc}</p>
                </div>
              )) : (
                <div className="p-3 bg-white/5 rounded-xl shadow-sm border border-white/10">
                  <p className="text-sm font-bold text-slate-300">No tips available yet. Log more trades.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table Container */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Date/Time</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Instrument</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Type</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Size</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Entry</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Current</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">P&L ($/%)</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayTrades.map((trade, index) => (
                <tr key={index} className={`hover:bg-white/5 transition-colors group ${index % 2 !== 0 ? 'bg-white/5' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{trade.date}</span>
                      <span className="text-xs text-slate-400 font-medium">{trade.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] ${trade.isWinner ? 'text-blue-400' : 'text-red-400'}`}>
                        {trade.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{trade.symbol}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{trade.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-white">{trade.size}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-white">{trade.entry}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-white">{trade.current}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black ${trade.isWinner ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl}</span>
                      <span className={`text-[10px] font-bold px-1.5 rounded ${trade.isWinner ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trade.pnlPercent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onNavigate && onNavigate('journal')}
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-4 bg-white/5 flex items-center justify-between border-t border-white/10">
          <span className="text-xs font-bold text-slate-400">Showing {displayTrades.length} of {isConnected ? tradesList.length : '0'} Active Trades</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((num) => (
              <button 
                key={num}
                onClick={() => setCurrentPageNum(num)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  currentPageNum === num ? 'bg-blue-600 text-white border-transparent' : 'border border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {num}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPageNum(Math.min(3, currentPageNum + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-blue-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
