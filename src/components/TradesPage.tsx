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
import { Card } from './ui/Card';

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
        <div className="absolute inset-0 z-50 bg-theme-bg-dark/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
          {isSyncing ? (
            <Card className="p-10 max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-300 border-theme-border-dark bg-theme-surface-dark shadow-premium">
              <div className="w-20 h-20 border-4 border-theme-border-dark border-t-brand-primary rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-black text-theme-text-primary-dark">Syncing History</h3>
                <p className="text-theme-text-secondary-dark mt-2 text-sm font-medium">Fetching your latest trades from MT5...</p>
              </div>
            </Card>
          ) : (
            <Card className="p-10 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300 relative border-theme-border-dark bg-theme-surface-dark shadow-premium">
              <button 
                onClick={() => setDismissOverlay(true)}
                className="absolute top-4 right-4 p-2 hover:bg-theme-border-dark rounded-xl transition-colors text-theme-text-secondary-dark hover:text-status-danger"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto shadow-xl shadow-brand-primary/20 border border-brand-primary/30">
                <Wallet className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-theme-text-primary-dark">No Data Imported</h3>
                <p className="text-theme-text-secondary-dark mt-2 font-medium">Connect your MT4/MT5 account to automatically import your trading history and analyze your performance.</p>
              </div>
              <div className="space-y-3 pt-4">
                <button 
                  onClick={onConnect}
                  className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <LogIn className="w-4 h-4" />
                  CONNECT MT5 ACCOUNT
                </button>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px bg-theme-border-dark flex-1" />
                  <span className="text-[10px] font-bold text-theme-text-secondary-dark uppercase tracking-widest">OR</span>
                  <div className="h-px bg-theme-border-dark flex-1" />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 bg-theme-surface-dark text-theme-text-primary-dark border border-theme-border-dark rounded-2xl font-bold text-sm hover:bg-theme-border-dark transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Plus className="w-4 h-4" />
                  ADD MANUAL TRADE
                </button>
              </div>
            </Card>
          )}
        </div>
      )}
      {/* Page Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="heading-1">Trades</h1>
          <p className="body-text mt-1">Review and manage your institutional execution history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 bg-brand-primary text-white flex items-center gap-2 rounded-xl shadow-md hover:bg-brand-primary/90 transition-all active:scale-95 font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </button>
          <div className="relative">
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="h-10 px-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl shadow-sm flex items-center gap-2 cursor-pointer hover:bg-theme-surface-light/80 dark:hover:bg-theme-surface-dark/80 transition-colors"
            >
              <Calendar className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" />
              <span className="text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {dateRange.start && dateRange.end ? `${dateRange.start} - ${dateRange.end}` : timeframe}
              </span>
              <ChevronRight className={`w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark transition-transform ${showDatePicker ? 'rotate-[-90deg]' : 'rotate-90'}`} />
            </div>

            {showDatePicker && (
              <Card className="absolute right-0 mt-2 p-4 z-[60] w-64 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-light dark:text-theme-text-secondary-dark">Start Date</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full h-10 px-3 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-light dark:text-theme-text-secondary-dark">End Date</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full h-10 px-3 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setShowDatePicker(false);
                    }}
                    className="flex-1 py-2 text-[10px] font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 py-2 bg-brand-primary text-white text-[10px] font-bold rounded-lg shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-colors"
                  >
                    APPLY
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-theme-bg-dark/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <Card className="w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto border-theme-border-dark bg-theme-surface-dark shadow-premium p-0">
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-theme-border-dark flex items-center justify-between bg-theme-surface-dark">
              <div>
                <h2 className="heading-2">New Manual Trade Entry</h2>
                <p className="label-text mt-0.5">Institutional Record</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setScreenshot(null);
                }}
                className="p-2 hover:bg-theme-border-dark rounded-xl transition-colors text-theme-text-secondary-dark hover:text-status-danger shadow-sm border border-transparent hover:border-theme-border-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrade} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symbol & Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Instrument Symbol</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. XAUUSD"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Trade Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark [&>option]:bg-theme-bg-dark"
                  >
                    <option value="BUY">BUY / LONG</option>
                    <option value="SELL">SELL / SHORT</option>
                  </select>
                </div>

                {/* Entry & Exit */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Entry Price</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    placeholder="0.00000"
                    value={formData.entry}
                    onChange={(e) => setFormData({...formData, entry: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Exit Price</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="0.00000"
                    value={formData.exit}
                    onChange={(e) => setFormData({...formData, exit: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50"
                  />
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Entry Date</label>
                  <input 
                    type="date" 
                    value={formData.entryDate}
                    onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Exit Date</label>
                  <input 
                    type="date" 
                    value={formData.exitDate}
                    onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Position Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2.5 Lots"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full h-12 px-4 bg-theme-bg-dark border border-theme-border-dark rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Trade Notes & Logic</label>
                <textarea 
                  rows={3}
                  placeholder="Describe your entry logic, emotions, and outcome..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-4 bg-theme-bg-dark border border-theme-border-dark rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium text-theme-text-primary-dark placeholder:text-theme-text-secondary-dark/50 resize-none"
                ></textarea>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-dark ml-1">Evidence Screenshot</label>
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
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-theme-border-dark shadow-inner">
                      <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-theme-bg-dark/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
                        className="absolute top-3 right-3 p-1.5 bg-status-danger text-white rounded-lg shadow-lg hover:bg-status-danger/90 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl border-2 border-dashed border-theme-border-dark bg-theme-bg-dark flex flex-col items-center justify-center gap-3 group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-theme-surface-dark shadow-sm flex items-center justify-center text-theme-text-secondary-dark group-hover:text-brand-primary transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-theme-text-primary-dark">Click to upload screenshot</p>
                        <p className="text-[10px] font-bold text-theme-text-secondary-dark uppercase tracking-wider mt-1">PNG, JPG up to 10MB</p>
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
                  className="px-6 py-2.5 text-sm font-bold text-theme-text-secondary-dark hover:text-theme-text-primary-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Record
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Dashboard Analytics Preview */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium">
            <span className="text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase">Total Volume</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-theme-text-primary-light dark:text-theme-text-primary-dark">{isConnected ? stats.totalVolume : '0.00'}</span>
              {isConnected && (
                <span className="text-xs font-bold text-status-success flex items-center">
                  <ArrowUp className="w-3 h-3" /> 12%
                </span>
              )}
            </div>
          </Card>
          <Card className="p-6 border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium">
            <span className="text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase">Win Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-theme-text-primary-light dark:text-theme-text-primary-dark">{isConnected ? stats.winRate : '0%'}</span>
              {isConnected && (
                <span className="text-xs font-bold text-status-success flex items-center">
                  <TrendingUp className="w-3 h-3" />
                </span>
              )}
            </div>
          </Card>
          <Card className="p-6 border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium">
            <span className="text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase">Total P&L</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${isConnected ? (stats.isPositive ? 'text-status-success' : 'text-status-danger') : 'text-theme-text-primary-light dark:text-theme-text-primary-dark'}`}>
                {isConnected ? stats.totalPnL : '$0.00'}
              </span>
            </div>
          </Card>
        </div>

        {/* AI Insight */}
        <Card className="col-span-12 lg:col-span-4 rounded-2xl p-6 relative overflow-hidden border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Sparkles className="w-32 h-32 text-brand-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">AI Momentum Alert</span>
            </div>
            <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-relaxed">
              {report?.summary || "Analyzing your trading patterns to provide real-time momentum alerts and risk warnings..."}
            </p>
          </div>
        </Card>
      </div>

      {/* AI Trade Insights Section */}
      <Card className="p-6 lg:p-8 border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-black text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">AI Trade Insights</h2>
              <p className="text-[10px] font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-widest mt-0.5">Behavioral Analysis & Optimization</p>
            </div>
          </div>
          <button 
            onClick={handleRefreshAnalysis}
            disabled={isAnalyzing}
            className={`w-full sm:w-auto px-4 py-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/30 rounded-xl text-xs font-black hover:bg-brand-primary/20 transition-all flex items-center justify-center gap-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? 'ANALYZING...' : 'REFRESH ANALYSIS'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Winning Patterns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-status-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Winning Patterns</span>
            </div>
            <div className="bg-status-success/10 rounded-2xl p-5 border border-status-success/20 space-y-3">
              {report?.strengths ? report.strengths.slice(0, 2).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-status-success/20 flex items-center justify-center text-status-success flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )) : (
                <p className="text-sm font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  Connect your account and log trades to generate AI insights on your winning patterns.
                </p>
              )}
            </div>
          </div>

          {/* Losing Patterns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-status-danger">
              <ArrowUp className="w-4 h-4 rotate-180" />
              <span className="text-xs font-black uppercase tracking-widest">Losing Patterns</span>
            </div>
            <div className="bg-status-danger/10 rounded-2xl p-5 border border-status-danger/20 space-y-3">
              {report?.weaknesses ? report.weaknesses.slice(0, 2).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-status-danger/20 flex items-center justify-center text-status-danger flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )) : (
                <p className="text-sm font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  Connect your account and log trades to generate AI insights on your losing patterns.
                </p>
              )}
            </div>
          </div>

          {/* Actionable Tips */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Actionable Tips</span>
            </div>
            <div className="bg-brand-primary/10 rounded-2xl p-5 border border-brand-primary/20 space-y-4">
              {report?.actionPlan ? report.actionPlan.slice(0, 2).map((item: any, i: number) => (
                <div key={i} className="p-3 bg-theme-bg-light dark:bg-theme-bg-dark rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark">
                  <p className="text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-tighter mb-1">{item.title}</p>
                  <p className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{item.desc}</p>
                </div>
              )) : (
                <div className="p-3 bg-theme-bg-light dark:bg-theme-bg-dark rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark">
                  <p className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">No tips available yet. Log more trades.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Data Table Container */}
      <Card className="overflow-hidden border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-premium p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark">
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase">Date/Time</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase">Instrument</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase">Type</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase text-right">Size</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase text-right">Entry</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase text-right">Current</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase text-right">P&L ($/%)</th>
                <th className="px-6 py-5 text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {displayTrades.map((trade, index) => (
                <tr key={index} className={`hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-colors group ${index % 2 !== 0 ? 'bg-theme-bg-light/40 dark:bg-theme-bg-dark/40' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{trade.date}</span>
                      <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium">{trade.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center font-bold text-[10px] ${trade.isWinner ? 'text-status-success' : 'text-status-danger'}`}>
                        {trade.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{trade.symbol}</span>
                        <span className="text-[10px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase font-bold">{trade.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${trade.type === 'BUY' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{trade.size}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{trade.entry}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{trade.current}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black ${trade.isWinner ? 'text-status-success' : 'text-status-danger'}`}>{trade.pnl}</span>
                      <span className={`text-[10px] font-bold px-1.5 rounded ${trade.isWinner ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
                        {trade.pnlPercent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onNavigate && onNavigate('journal')}
                        className="w-8 h-8 rounded-lg hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark flex items-center justify-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-brand-primary transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark flex items-center justify-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-brand-primary transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="w-8 h-8 rounded-lg hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark flex items-center justify-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-status-danger transition-all"
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
        <div className="px-8 py-4 bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-between border-t border-theme-border-light dark:border-theme-border-dark">
          <span className="text-xs font-bold text-theme-text-secondary-light dark:text-theme-text-secondary-dark">Showing {displayTrades.length} of {isConnected ? tradesList.length : '0'} Active Trades</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-brand-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((num) => (
              <button 
                key={num}
                onClick={() => setCurrentPageNum(num)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border border-theme-border-light dark:border-theme-border-dark text-xs font-bold transition-colors ${currentPageNum === num ? 'bg-brand-primary text-white border-brand-primary' : 'text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-brand-primary'}`}
              >
                {num}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPageNum(Math.min(3, currentPageNum + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-brand-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
