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
  BookOpen,
  Pencil,
  Trash2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { generateAIReport } from '../services/ai';

const initialTrades: any[] = [];

export const TradesPage = ({ 
  isConnected = false, 
  onConnect, 
  onSync, 
  onManualTrade,
  isSyncing = false,
  tradesList = [],
  onDeleteTrade,
  onUpdateTrade,
  onNavigate
}: { 
  isConnected?: boolean, 
  onConnect?: () => void,
  onSync?: () => void,
  onManualTrade?: (trade: any) => void,
  isSyncing?: boolean,
  tradesList?: any[],
  onDeleteTrade?: (tradeId: string) => void,
  onUpdateTrade?: (tradeId: string, trade: any) => void,
  onNavigate?: (page: string, tradeId?: string) => void
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
  const [editingTrade, setEditingTrade] = useState<any>(null);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
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
    const formattedPnL = totalPnL >= 0 ? `$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
        pnl: trade.pnl || (pnlValue >= 0 ? `$${pnlValue.toFixed(2)}` : `-$${Math.abs(pnlValue).toFixed(2)}`),
        pnlPercent: trade.pnlPercent || '0.00%',
        isWinner
      };
    });
  }, [tradesList]);

  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving trade, editingTrade:", editingTrade);
    
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
      date: formData.entryDate ? new Date(formData.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      symbol: (formData.symbol || '').toUpperCase(),
      name: (formData.symbol || '').toUpperCase() + ' Asset',
      type: formData.type,
      size: formData.size || '0.00 Lots',
      entry: formData.entry || '0.00000',
      current: formData.exit || formData.entry || '0.00000',
      entryPrice: formData.entry || '0.00000',
      exitPrice: formData.exit || '',
      pnl: pnlValue >= 0 ? `$${pnlValue.toFixed(2)}` : `-$${Math.abs(pnlValue).toFixed(2)}`,
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
    
    console.log("New trade object:", newTrade);

    if (editingTrade && onUpdateTrade) {
      console.log("Calling onUpdateTrade with ID:", editingTrade.id || editingTrade._id);
      onUpdateTrade(editingTrade.id || editingTrade._id, newTrade);
    } else if (onManualTrade) {
      console.log("Calling onManualTrade");
      onManualTrade(newTrade);
    }
    setIsModalOpen(false);
    setEditingTrade(null);
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
    setTradeToDelete(tradeId);
  };

  const confirmDeleteTrade = () => {
    if (tradeToDelete && onDeleteTrade) {
      onDeleteTrade(tradeToDelete);
    }
    setTradeToDelete(null);
  };

  const handleEditTrade = (trade: any) => {
    setEditingTrade(trade);
    setFormData({
      symbol: trade.symbol || '',
      type: trade.type || 'BUY',
      entry: trade.entry?.toString() || '',
      exit: trade.exitPrice?.toString() || trade.current?.toString() || '',
      entryDate: trade.entryDate ? new Date(trade.entryDate).toISOString().slice(0, 16) : '',
      exitDate: trade.exitDate ? new Date(trade.exitDate).toISOString().slice(0, 16) : '',
      size: trade.size?.toString() || '',
      notes: trade.notes || ''
    });
    setScreenshot(trade.screenshot || null);
    setIsModalOpen(true);
  };

  const [report, setReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && !isSyncing) {
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [isConnected, isSyncing]);

  const handleRefreshAnalysis = async () => {
    console.log("Refresh analysis clicked, tradesList:", tradesList);
    if (!tradesList || tradesList.length === 0) {
      console.log("No trades to analyze");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await generateAIReport(tradesList, false, true);
      console.log("AI Report generated:", res);
      if (res) {
        try {
          let cleanRes = res;
          if (typeof res === 'string') {
            // Strip markdown code blocks if present
            cleanRes = res.replace(/```json\n?|```/g, '').trim();
          }
          let parsed;
          if (typeof cleanRes === 'string') {
            // Try to find the first '{' and last '}'
            const firstBrace = cleanRes.indexOf('{');
            const lastBrace = cleanRes.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
              const jsonStr = cleanRes.substring(firstBrace, lastBrace + 1);
              try {
                parsed = JSON.parse(jsonStr);
              } catch (e) {
                parsed = JSON.parse(cleanRes); // Fallback
              }
            } else {
              parsed = JSON.parse(cleanRes);
            }
          } else {
            parsed = cleanRes;
          }
          setReport(parsed);
        } catch (parseErr) {
          console.error("JSON Parse Error:", parseErr, res);
          setAnalysisError("AI returned an invalid format. Please try again.");
        }
      } else {
        setAnalysisError("Failed to generate AI report.");
      }
    } catch (e) {
      console.error(e);
      setAnalysisError("An error occurred while analyzing trades.");
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (tradesList && tradesList.length > 0) {
      handleRefreshAnalysis();
    }
  }, [tradesList]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(processedTrades.length / ITEMS_PER_PAGE);
  const displayTrades = useMemo(() => {
    const start = (currentPageNum - 1) * ITEMS_PER_PAGE;
    return processedTrades.slice(start, start + ITEMS_PER_PAGE);
  }, [processedTrades, currentPageNum]);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 lg:space-y-10 no-scrollbar relative bg-background scroll-smooth overscroll-contain will-change-transform">
      {(isSyncing || (!isConnected && tradesList.length === 0 && !dismissOverlay)) && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
          {isSyncing ? (
            <Card className="p-10 max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-300 border-border bg-surface shadow-premium">
              <div className="w-20 h-20 border-4 border-border border-t-brand-primary rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-black text-text-primary">Syncing History</h3>
                <p className="text-text-secondary mt-2 text-sm font-medium">Fetching your latest trades from MT5...</p>
              </div>
            </Card>
          ) : (
            <Card className="p-10 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300 relative border-border bg-surface shadow-premium">
              <button 
                onClick={() => setDismissOverlay(true)}
                className="absolute top-4 right-4 p-2 hover:bg-surface-muted rounded-xl transition-colors text-text-secondary hover:text-status-danger"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto shadow-premium border border-brand-primary/30">
                <Wallet className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary">No Data Imported</h3>
                <p className="text-text-secondary mt-2 font-medium">Connect your MT4/MT5 account to automatically import your trading history and analyze your performance.</p>
              </div>
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={onConnect}
                  className="w-full py-4 flex items-center justify-center gap-3"
                >
                  <LogIn className="w-4 h-4" />
                  CONNECT MT5 ACCOUNT
                </Button>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">OR</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 flex items-center justify-center gap-3"
                >
                  <Plus className="w-4 h-4" />
                  ADD MANUAL TRADE
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
      {/* Page Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Trades</h1>
          <p className="text-text-secondary mt-1">Review and manage your institutional execution history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <Button 
            onClick={() => {
              setEditingTrade(null);
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
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-status-success hover:bg-status-success/90"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </Button>
          <div className="relative">
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="h-10 px-3 bg-surface border border-border rounded-xl shadow-sm flex items-center gap-2 cursor-pointer hover:bg-surface-muted transition-colors"
            >
              <Calendar className="w-4 h-4 text-text-secondary" />
              <span className="text-xs font-bold text-text-primary">
                {dateRange.start && dateRange.end ? `${dateRange.start} - ${dateRange.end}` : timeframe}
              </span>
              <ChevronRight className={cn("w-4 h-4 text-text-secondary transition-transform", showDatePicker ? "rotate-[-90deg]" : "rotate-90")} />
            </div>

            {showDatePicker && (
              <Card className="absolute right-0 mt-2 p-4 z-[60] w-64 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border-border bg-surface shadow-premium">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Start Date</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">End Date</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setShowDatePicker(false);
                    }}
                    className="flex-1 py-2 text-[10px] font-bold text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <Button 
                    size="sm"
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 text-[10px]"
                  >
                    APPLY
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrade(null);
          setScreenshot(null);
        }}
        title={editingTrade ? "Edit Trade Record" : "New Manual Trade Entry"}
      >
        <form onSubmit={handleSaveTrade} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Instrument Symbol"
              required
              placeholder="e.g. XAUUSD"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Trade Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full h-12 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
              >
                <option value="BUY">BUY / LONG</option>
                <option value="SELL">SELL / SHORT</option>
              </select>
            </div>

            <Input
              label="Entry Price"
              type="number"
              required
              placeholder="0.00000"
              value={formData.entry}
              onChange={(e) => setFormData({...formData, entry: e.target.value})}
            />
            <Input
              label="Exit Price"
              type="number"
              placeholder="0.00000"
              value={formData.exit}
              onChange={(e) => setFormData({...formData, exit: e.target.value})}
            />

            <Input
              label="Entry Date"
              type="datetime-local"
              value={formData.entryDate}
              onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
            />
            <Input
              label="Exit Date"
              type="datetime-local"
              value={formData.exitDate}
              onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
            />

            <Input
              label="Position Size"
              placeholder="e.g. 2.5 Lots"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Trade Notes & Logic</label>
            <textarea 
              rows={3}
              placeholder="Describe your entry logic, emotions, and outcome..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium text-text-primary placeholder:text-text-muted resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Evidence Screenshot</label>
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
                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-border shadow-inner">
                  <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="bg-surface/20 backdrop-blur-md p-3 rounded-full border border-border/30">
                      <Camera className="w-6 h-6 text-text-primary" />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScreenshot(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-status-danger text-text-primary rounded-lg shadow-premium hover:bg-status-danger/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video rounded-2xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center gap-3 group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-surface shadow-sm flex items-center justify-center text-text-secondary group-hover:text-brand-primary transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">Click to upload screenshot</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              variant="ghost"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setScreenshot(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dashboard Analytics Preview */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Volume', value: tradesList.length > 0 ? stats.totalVolume : '0.00', trend: '12%', icon: ArrowUp },
            { label: 'Win Rate', value: tradesList.length > 0 ? stats.winRate : '0%', icon: TrendingUp },
            { label: 'Total P&L', value: tradesList.length > 0 ? stats.totalPnL : '$0.00', isPnL: true }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Card className="p-6 h-full">
                <span className="text-xs font-black text-text-muted tracking-wider uppercase">{stat.label}</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={cn(
                    "text-2xl font-extrabold",
                    stat.isPnL ? (tradesList.length > 0 ? (stats.isPositive ? 'text-status-success' : 'text-status-danger') : 'text-text-primary') : 'text-text-primary'
                  )}>
                    {stat.value}
                  </span>
                  {stat.trend && (
                    <span className="text-xs font-bold text-status-success flex items-center">
                      <stat.icon className="w-3 h-3" /> {stat.trend}
                    </span>
                  )}
                  {!stat.trend && stat.icon && tradesList.length > 0 && (
                    <span className="text-xs font-bold text-status-success flex items-center">
                      <stat.icon className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-4"
        >
          <Card className="h-full rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Sparkles className="w-32 h-32 text-brand-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <span className="text-xs font-black text-brand-primary tracking-widest uppercase">AI Momentum Alert</span>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="w-4 h-4 border-2 border-border border-t-brand-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Analyzing patterns...</span>
                </div>
              ) : analysisError ? (
                <p className="text-sm font-semibold text-status-danger leading-relaxed">
                  {analysisError}
                </p>
              ) : (
                <p className="text-sm font-semibold text-text-primary leading-relaxed">
                  {report?.summary || "Analyzing your trading patterns to provide real-time momentum alerts and risk warnings..."}
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Trade Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-black text-text-primary tracking-tight">AI Trade Insights</h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Behavioral Analysis & Optimization</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={handleRefreshAnalysis}
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? 'ANALYZING...' : 'REFRESH ANALYSIS'}
            </Button>
          </div>

          {analysisError ? (
            <div className="p-6 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-center">
              <p className="text-sm font-bold text-status-danger">{analysisError}</p>
            </div>
          ) : isAnalyzing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <div className="h-4 w-24 bg-surface-muted rounded" />
                  <div className="h-32 bg-surface-muted rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
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
                      <p className="text-sm font-bold text-text-primary leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm font-bold text-text-secondary leading-relaxed">
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
                      <p className="text-sm font-bold text-text-primary leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm font-bold text-text-secondary leading-relaxed">
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
                    <div key={i} className="p-3 bg-background rounded-xl shadow-sm border border-border">
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-tighter mb-1">{item.title}</p>
                      <p className="text-sm font-bold text-text-primary">{item.desc}</p>
                    </div>
                  )) : (
                    <div className="p-3 bg-background rounded-xl shadow-sm border border-border">
                      <p className="text-sm font-bold text-text-primary">No tips available yet. Log more trades.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!tradeToDelete}
        onClose={() => setTradeToDelete(null)}
        title="Delete Trade"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">Are you sure you want to delete this trade? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setTradeToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteTrade}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Main Data Table Container */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase">Date/Time</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase">Instrument</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase text-right">Size</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase text-right">Entry</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase text-right">Current</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase text-right">P&L ($/%)</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted tracking-widest uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayTrades.map((trade, index) => (
                <tr key={index} className={cn(
                  "hover:bg-surface-muted transition-colors group",
                  index % 2 !== 0 ? 'bg-surface-muted/40' : ''
                )}>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary">{trade.date}</span>
                      <span className="text-xs text-text-secondary font-medium">{trade.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center font-bold text-[10px]",
                        trade.isWinner ? 'text-status-success' : 'text-status-danger'
                      )}>
                        {trade.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary">{trade.symbol}</span>
                        <span className="text-[10px] text-text-secondary uppercase font-bold">{trade.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                      trade.type === 'BUY' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'
                    )}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-text-primary">{trade.size}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-text-primary">{trade.entry}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-text-primary">{trade.current}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-sm font-black",
                        trade.isWinner ? 'text-status-success' : 'text-status-danger'
                      )}>{trade.pnl}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 rounded",
                        trade.isWinner ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'
                      )}>
                        {trade.pnlPercent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onNavigate && onNavigate('journal')}
                        title="View in Journal"
                        className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-text-secondary hover:text-status-success transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditTrade(trade)}
                        title="Edit Trade"
                        className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-text-secondary hover:text-status-success transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrade(trade.id || trade._id)}
                        title="Delete Trade"
                        className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-text-secondary hover:text-status-danger transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-4 bg-surface-muted flex items-center justify-between border-t border-border">
          <span className="text-xs font-bold text-text-secondary">Showing {displayTrades.length} of {tradesList.length} Active Trades</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
              disabled={currentPageNum === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-status-success transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Simple pagination logic to show current page and neighbors
              let pageNum = i + 1;
              if (totalPages > 5 && currentPageNum > 3) {
                pageNum = Math.min(currentPageNum - 2 + i, totalPages - 4 + i);
              }
              return (
                <button 
                  key={pageNum}
                  onClick={() => setCurrentPageNum(pageNum)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg border border-border text-xs font-bold transition-colors",
                    currentPageNum === pageNum ? 'bg-status-success text-text-primary border-status-success shadow-premium' : 'text-text-secondary hover:text-status-success'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
              disabled={currentPageNum === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-status-success transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
