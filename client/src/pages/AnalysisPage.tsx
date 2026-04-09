import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Clock, 
  BookOpen, 
  BarChart2, 
  CheckCircle2, 
  Brain, 
  Layers, 
  ArrowUpRight,
  ChevronDown,
  Star,
  Info,
  Zap,
  Play,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournals } from '../services/journalService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { JournalEntry, Trade } from '../types';
import { GoogleGenAI } from "@google/genai";
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

export const AnalysisPage = ({ 
  tradesList = [], 
  onNavigate 
}: { 
  tradesList?: Trade[],
  onNavigate?: (page: string, tradeId?: string) => void
}) => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Winners' | 'Losers'>('All');
  const [timeRange, setTimeRange] = useState<'All Time' | 'Today' | 'This Week' | 'This Month' | '3 Months' | 'This Year'>('All Time');
  const [sortBy, setSortBy] = useState<'By Date' | 'By P&L' | 'By Symbol'>('By Date');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [isSortByOpen, setIsSortByOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = subscribeToJournals(user.uid, (data) => {
      setJournals(data);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const tradesWithJournalData = useMemo(() => {
    return tradesList.map(trade => {
      const journal = journals.find(j => j.tradeId === trade.id);
      return {
        ...trade,
        journal,
        isJournaled: !!journal
      };
    }).sort((a, b) => new Date(b.entryDate || 0).getTime() - new Date(a.entryDate || 0).getTime());
  }, [tradesList, journals]);

  const filteredTrades = useMemo(() => {
    let result = [...tradesWithJournalData];

    // 1. Filter by Win/Loss
    if (activeFilter === 'Winners') result = result.filter(t => t.isWinner);
    if (activeFilter === 'Losers') result = result.filter(t => !t.isWinner);

    // 2. Filter by Time Range
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (timeRange !== 'All Time') {
      result = result.filter(t => {
        if (!t.entryDate) return false;
        const tradeDate = new Date(t.entryDate);
        
        switch (timeRange) {
          case 'Today':
            return tradeDate >= startOfToday;
          case 'This Week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return tradeDate >= startOfWeek;
          }
          case 'This Month': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return tradeDate >= startOfMonth;
          }
          case '3 Months': {
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            return tradeDate >= threeMonthsAgo;
          }
          case 'This Year': {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            return tradeDate >= startOfYear;
          }
          default:
            return true;
        }
      });
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'By Date') {
        return new Date(b.entryDate || 0).getTime() - new Date(a.entryDate || 0).getTime();
      }
      if (sortBy === 'By P&L') {
        const pnlA = parseFloat(a.pnl?.replace(/[^0-9.-]+/g, "") || "0");
        const pnlB = parseFloat(b.pnl?.replace(/[^0-9.-]+/g, "") || "0");
        return pnlB - pnlA;
      }
      if (sortBy === 'By Symbol') {
        return (a.symbol || '').localeCompare(b.symbol || '');
      }
      return 0;
    });

    return result;
  }, [tradesWithJournalData, activeFilter, timeRange, sortBy]);

  const selectedTrade = useMemo(() => {
    if (!selectedTradeId) return filteredTrades.length > 0 ? filteredTrades[0] : null;
    return tradesWithJournalData.find(t => t.id === selectedTradeId) || (filteredTrades.length > 0 ? filteredTrades[0] : null);
  }, [tradesWithJournalData, selectedTradeId, filteredTrades]);

  // Helper: Calculate Price Move %
  const priceMove = useMemo(() => {
    if (!selectedTrade?.entryPrice || !selectedTrade?.exitPrice) return '0.00%';
    const entry = parseFloat(selectedTrade.entryPrice);
    const exit = parseFloat(selectedTrade.exitPrice);
    if (isNaN(entry) || isNaN(exit)) return '0.00%';
    
    let move = 0;
    if (selectedTrade.type === 'BUY') {
      move = ((exit - entry) / entry) * 100;
    } else {
      move = ((entry - exit) / entry) * 100;
    }
    return `${move >= 0 ? '+' : ''}${move.toFixed(2)}%`;
  }, [selectedTrade]);

  // Helper: Calculate Hold Duration
  const holdDuration = useMemo(() => {
    if (!selectedTrade?.entryDate || !selectedTrade?.exitDate) return '---';
    const start = new Date(selectedTrade.entryDate);
    const end = new Date(selectedTrade.exitDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '---';
    
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '---';
    
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    if (totalDays >= 1) {
      const remainingHours = totalHours % 24;
      return `${totalDays}d ${remainingHours}h`;
    } else {
      const remainingMinutes = totalMinutes % 60;
      return `${totalHours}h ${remainingMinutes}m`;
    }
  }, [selectedTrade]);

  // Helper: Calculate Quality Metrics
  const qualityMetrics = useMemo(() => {
    if (!selectedTrade) return { profitability: 0, execution: 0, journal: 0, rating: 0, total: 0 };
    
    // 1. Profitability (30 pts)
    const pnlValue = parseFloat(selectedTrade.pnl?.replace(/[^0-9.-]+/g, "") || "0");
    const profitability = selectedTrade.isWinner ? 30 : (pnlValue === 0 ? 15 : 0);
    
    // 2. Execution (40 pts) - Proportional to checklist completion
    let execution = 0;
    if (selectedTrade.journal?.checklist && selectedTrade.journal.checklist.length > 0) {
      const checkedCount = selectedTrade.journal.checklist.filter(c => c.checked).length;
      execution = Math.round((checkedCount / selectedTrade.journal.checklist.length) * 40);
    }
    
    // 3. Journal (20 pts) - Proportional to detail provided
    let journalScore = 0;
    const j = selectedTrade.journal;
    if (j) {
      let completedSections = 0;
      if ((j.preTradeAnalysis?.trim().length || 0) > 10) completedSections++;
      if ((j.postTradeReview?.trim().length || 0) > 10) completedSections++;
      if ((j.emotions?.trim().length || 0) > 5) completedSections++;
      if ((j.lessonsLearned?.trim().length || 0) > 10) completedSections++;
      
      journalScore = Math.round((completedSections / 4) * 20);
    }
    
    // 4. Rating (10 pts) - Direct from user rating
    const rating = (selectedTrade.journal?.rating || 0);
    
    const total = profitability + execution + journalScore + rating;
    
    return { profitability, execution, journal: journalScore, rating, total };
  }, [selectedTrade]);

  // Helper: Execution Score %
  const executionScore = useMemo(() => {
    // Discipline score: (Execution + Journal + Rating) / 70 * 100
    const disciplinePoints = qualityMetrics.execution + qualityMetrics.journal + qualityMetrics.rating;
    const score = (disciplinePoints / 70) * 100;
    return `${Math.round(score)}%`;
  }, [qualityMetrics]);

  // AI Insights Generation with Caching and Debouncing
  const insightCache = useRef<Record<string, string>>({});
  const { isAiBlocked, aiBlockedUntil, setAiBlocked } = useAppStore();
  
  useEffect(() => {
    let isMounted = true;
    const tradeId = selectedTrade?.id || selectedTrade?._id;
    
    if (!selectedTrade || !selectedTrade.isJournaled || !tradeId) {
      setAiInsight(null);
      return;
    }

    // Check if AI is currently blocked
    if (isAiBlocked && aiBlockedUntil && Date.now() < aiBlockedUntil) {
      setAiInsight("AI is currently busy. Please try again in a few minutes.");
      return;
    }

    // Check cache first
    if (insightCache.current[tradeId]) {
      setAiInsight(insightCache.current[tradeId]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsGeneratingInsight(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
          Analyze this trading performance and provide a very simple, easy-to-understand summary (max 3 sentences). 
          Use normal, everyday language that a beginner trader would understand. Avoid complex financial jargon.
          Explain clearly what went wrong or what was done correctly.
          
          Trade: ${selectedTrade.symbol} ${selectedTrade.type}
          Result: ${selectedTrade.isWinner ? 'WON' : 'LOST'} (${selectedTrade.pnl})
          Pre-Trade Analysis: ${selectedTrade.journal?.preTradeAnalysis}
          Post-Trade Review: ${selectedTrade.journal?.postTradeReview}
          Emotions: ${selectedTrade.journal?.emotions}
          Lessons: ${selectedTrade.journal?.lessonsLearned}
          
          Focus on execution, psychology, and technical discipline. Provide simple, actionable advice.
        `;
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        if (isMounted) {
          const text = response.text || "No insights available.";
          setAiInsight(text);
          insightCache.current[tradeId] = text;
        }
      } catch (error: any) {
        console.error("Error generating AI insight:", error);
        if (isMounted) {
          if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota')) {
            setAiBlocked(true, Date.now() + 5 * 60 * 1000);
            setAiInsight("AI is currently busy. Please try again in a few minutes.");
          } else {
            setAiInsight("Unable to generate AI insights at this time.");
          }
        }
      } finally {
        if (isMounted) setIsGeneratingInsight(false);
      }
    }, 1000); // 1 second debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedTrade, isAiBlocked, aiBlockedUntil]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-background">
      {/* Left Sidebar: Trade Analysis List */}
      <aside className="w-80 flex flex-col bg-surface border-r border-border shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-text-primary">Trade Analysis</h2>
            <div className="px-2 py-1 bg-surface-muted text-text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest">
              {filteredTrades.length} trades
            </div>
          </div>

          <div className="flex p-1 bg-surface-muted rounded-xl border border-border gap-1 mb-4">
            {(['All', 'Winners', 'Losers'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all",
                  activeFilter === filter
                    ? "bg-surface-muted text-status-success shadow-sm border border-border"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {filter} <span className="ml-1 opacity-50">
                  {filter === 'All' ? tradesWithJournalData.length : 
                   filter === 'Winners' ? tradesWithJournalData.filter(t => t.isWinner).length : 
                   tradesWithJournalData.filter(t => !t.isWinner).length}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 relative">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsTimeRangeOpen(!isTimeRangeOpen);
                  setIsSortByOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-xl text-[10px] font-bold text-text-primary hover:border-brand-primary transition-colors"
              >
                {timeRange} <ChevronDown className={cn("w-3 h-3 text-text-secondary transition-transform", isTimeRangeOpen && "rotate-180")} />
              </button>
              {isTimeRangeOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {['All Time', 'Today', 'This Week', 'This Month', '3 Months', 'This Year'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range as any);
                        setIsTimeRangeOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-surface-muted transition-colors",
                        timeRange === range ? "text-status-success bg-status-success/5" : "text-text-primary"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setIsSortByOpen(!isSortByOpen);
                  setIsTimeRangeOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-xl text-[10px] font-bold text-text-primary hover:border-brand-primary transition-colors"
              >
                {sortBy} <ChevronDown className={cn("w-3 h-3 text-text-secondary transition-transform", isSortByOpen && "rotate-180")} />
              </button>
              {isSortByOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {['By Date', 'By P&L', 'By Symbol'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => {
                        setSortBy(sort as any);
                        setIsSortByOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-surface-muted transition-colors",
                        sortBy === sort ? "text-status-success bg-status-success/5" : "text-text-primary"
                      )}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filteredTrades.map((trade, index) => (
            <motion.button
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTradeId(trade.id || null)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden",
                selectedTrade?.id === trade.id 
                  ? "bg-surface-muted border-brand-primary shadow-premium" 
                  : "bg-surface border-border hover:border-border hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center border border-border group-hover:border-border transition-colors">
                    <TrendingUp className={cn("w-4 h-4", trade.type === 'BUY' ? "text-status-success" : "text-status-danger")} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-primary">{trade.symbol}</h4>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{new Date(trade.entryDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                  trade.isJournaled ? "bg-status-success/20 text-status-success" : "bg-status-success/10 text-status-success"
                )}>
                  {trade.isJournaled ? 'Journaled' : 'New'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-black uppercase", trade.type === 'BUY' ? "text-status-success" : "text-status-danger")}>{trade.type === 'BUY' ? 'Long' : 'Short'}</span>
                  <span className="text-[10px] font-bold text-text-secondary">{trade.entryPrice}</span>
                </div>
                <span className={cn(
                  "text-xs font-black",
                  trade.isWinner ? "text-status-success" : "text-status-danger"
                )}>
                  {trade.pnl}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* Main Content: Detailed Analysis */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        <AnimatePresence mode="wait">
          {selectedTrade ? (
            <motion.div
              key={selectedTrade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
                    <TrendingUp className={cn("w-8 h-8", selectedTrade.type === 'BUY' ? "text-brand-primary" : "text-status-danger")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-black text-text-primary tracking-tight">{selectedTrade.symbol}</h1>
                      <span className={cn(
                        "px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-widest",
                        selectedTrade.isWinner ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"
                      )}>
                        {selectedTrade.isWinner ? 'Winner' : 'Loser'}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-surface rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Score:</span>
                        <span className="text-[11px] font-black text-text-primary">{qualityMetrics.total}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] font-black text-text-secondary uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <span className={cn(selectedTrade.type === 'BUY' ? "text-brand-primary" : "text-status-danger")}>
                          {selectedTrade.type === 'BUY' ? 'Long' : 'Short'}
                        </span>
                        • {new Date(selectedTrade.entryDate || '').toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        • Duration: {holdDuration}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">P&L</p>
                  <p className={cn(
                    "text-3xl font-black tracking-tight",
                    selectedTrade.isWinner ? "text-status-success" : "text-status-danger"
                  )}>
                    {selectedTrade.pnl}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Entry Price', value: selectedTrade.entryPrice },
                  { label: 'Exit Price', value: selectedTrade.exitPrice || '---' },
                  { label: 'Quantity', value: selectedTrade.size },
                  { label: 'Price Move', value: priceMove, color: priceMove.startsWith('+') ? 'text-status-success' : 'text-status-danger' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Card className="p-6 border-border bg-surface shadow-sm">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className={cn("text-xl font-black text-text-primary", stat.color)}>{stat.value}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Trade Simulation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden border-border bg-surface shadow-sm">
                  <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-brand-primary" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Trade Simulation</h3>
                    </div>
                  </div>
                  <div className="p-12 bg-background flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                    <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm max-w-md w-full">
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-brand-primary" />
                             </div>
                             <div className="text-left">
                                <p className="text-sm font-black text-text-primary">{selectedTrade.symbol}</p>
                                <span className="text-[10px] font-black text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-lg uppercase">{selectedTrade.type === 'BUY' ? 'Long' : 'Short'}</span>
                             </div>
                          </div>
                          <div className="text-right space-y-1">
                             <div className="flex gap-4 text-[10px] font-bold text-text-secondary uppercase">
                                <span>Entry</span>
                                <span>Exit</span>
                                <span>P&L</span>
                             </div>
                             <div className="flex gap-4 text-xs font-black text-text-primary">
                                <span>{selectedTrade.entryPrice}</span>
                                <span>{selectedTrade.exitPrice || '---'}</span>
                                <span className={cn(selectedTrade.isWinner ? "text-status-success" : "text-status-danger")}>{selectedTrade.pnl}</span>
                             </div>
                          </div>
                       </div>
                       <div className="py-12 flex flex-col items-center gap-4">
                          <BarChart2 className="w-12 h-12 text-text-muted opacity-30" />
                          <div>
                            <p className="text-sm font-black text-text-primary mb-1">Trade Replay Not Available</p>
                            <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                              This trade was added manually. Connect<br />
                              a trading account to view trade replay<br />
                              and simulation features.
                            </p>
                          </div>
                       </div>
                       <Button variant="secondary" size="sm" className="w-full rounded-xl text-[10px] uppercase font-black tracking-widest bg-surface-muted text-text-primary hover:bg-surface-muted">
                          <Edit3 className="w-3 h-3 mr-2" /> Manual Entry
                       </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Middle Row: Journal & Quality */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Journal Entry Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-8 border-border bg-surface shadow-sm h-full">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-brand-primary" />
                        <h3 className="text-sm font-black text-text-primary">Journal Entry</h3>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        selectedTrade.isJournaled ? "bg-status-success/20 text-status-success" : "bg-surface-muted text-text-secondary"
                      )}>
                        {selectedTrade.isJournaled ? 'Journaled' : 'Not Journaled'}
                      </div>
                    </div>

                    {selectedTrade.isJournaled ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {selectedTrade.journal?.checklist?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-status-success/20 bg-status-success/5">
                              <div className={cn(
                                "w-5 h-5 rounded-lg flex items-center justify-center",
                                item.checked ? "bg-status-success text-text-primary" : "bg-surface-muted border border-border"
                              )}>
                                {item.checked && <Check className="w-3 h-3" />}
                              </div>
                              <span className={cn("text-[11px] font-bold", item.checked ? "text-text-primary" : "text-text-secondary")}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-text-secondary mr-2">Rating:</span>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                              <Star 
                                key={s} 
                                className={cn(
                                  "w-3 h-3", 
                                  s <= (selectedTrade.journal?.rating || 0) ? "text-status-success fill-status-success" : "text-surface-muted"
                                )} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-black text-text-primary">{selectedTrade.journal?.rating || 0}/10</span>
                        </div>

                        <div className="space-y-3 mb-8">
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Lessons Learned:</p>
                          <p className="text-sm font-medium text-text-primary leading-relaxed">
                            {selectedTrade.journal?.lessonsLearned || 'No lessons recorded for this trade.'}
                          </p>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest border-border text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          onClick={() => onNavigate?.('journal', selectedTrade.id)}
                        >
                          View Full Journal
                        </Button>
                      </>
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <BookOpen className="w-12 h-12 text-text-muted opacity-20" />
                        <p className="text-sm font-bold text-text-secondary">No journal entry found for this trade.</p>
                        <Button variant="secondary" size="sm" className="rounded-xl px-6 bg-surface-muted text-text-primary hover:bg-surface-muted">
                          Add Journal
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* Trade Quality Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-8 border-border bg-surface shadow-sm h-full">
                    <div className="flex items-center gap-2 mb-8">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                      <h3 className="text-sm font-black text-text-primary">Trade Quality</h3>
                    </div>

                    <div className="flex items-center gap-12 mb-10">
                      <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-muted" />
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * qualityMetrics.total / 100)} className="text-status-success transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-text-primary">{qualityMetrics.total}</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        {[
                          { label: 'Profitability', value: qualityMetrics.profitability, max: 30 },
                          { label: 'Execution', value: qualityMetrics.execution, max: 40 },
                          { label: 'Journal', value: qualityMetrics.journal, max: 20 },
                          { label: 'Rating', value: qualityMetrics.rating, max: 10 }
                        ].map((metric, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                              <span>{metric.label}</span>
                              <span>{metric.value}/{metric.max}</span>
                            </div>
                            <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                              <div className="h-full bg-status-success rounded-full transition-all duration-1000" style={{ width: `${(metric.value / metric.max) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-text-muted" />
                        <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">How is this calculated?</p>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 text-[10px] font-medium text-text-secondary">
                        <div className="flex justify-between pr-4"><span>Profitability (30 pts)</span> <span className="font-bold text-text-primary">Win: 30 | Break-even: 15 | Loss: 0</span></div>
                        <div className="flex justify-between pl-4"><span>Execution (40 pts)</span> <span className="font-bold text-text-primary">Proportional to checklist completion</span></div>
                        <div className="flex justify-between pr-4"><span>Journal (20 pts)</span> <span className="font-bold text-text-primary">Proportional to journal detail</span></div>
                        <div className="flex justify-between pl-4"><span>Rating (10 pts)</span> <span className="font-bold text-text-primary">Your self-rating (1-10)</span></div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t border-border">
                       {['80+ Excellent', '60+ Good', '40+ Average', '<40 Needs Work'].map((label, i) => (
                         <span key={i} className={cn(
                           "text-[9px] font-black uppercase tracking-widest",
                           i === 3 ? "text-status-danger" : i === 2 ? "text-status-warning" : i === 1 ? "text-brand-primary" : "text-status-success"
                         )}>
                           {label}
                         </span>
                       ))}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-8 border-border bg-surface shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-brand-primary" />
                        <h3 className="text-sm font-black text-text-primary">AI Insights</h3>
                      </div>
                      {isGeneratingInsight && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-brand-primary uppercase">Analyzing...</span>
                        </div>
                      )}
                   </div>
                   <div className="flex items-center gap-6 p-8 bg-background rounded-[2rem] border border-dashed border-border">
                      <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center shadow-sm shrink-0">
                         <Zap className={cn("w-6 h-6", aiInsight ? "text-brand-primary" : "text-text-muted opacity-30")} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-text-primary mb-1">AI-Powered Summary</p>
                         <p className="text-xs text-text-secondary font-medium leading-relaxed">
                            {aiInsight || (selectedTrade.isJournaled ? "Generating insights based on your journal data..." : "Journal this trade to get AI-powered insights and analysis.")}
                         </p>
                      </div>
                   </div>
                </Card>
              </motion.div>

              {/* vs Your Average */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-black text-text-primary">vs Your Average</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'VS AVG LOSER', value: selectedTrade.pnl, change: '+8%', changeColor: 'text-status-success' },
                    { label: 'HOLD DURATION', value: holdDuration, change: '-60%', changeColor: 'text-status-danger' },
                    { label: 'EXECUTION SCORE', value: executionScore, change: '+0%', changeColor: 'text-text-muted' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                    >
                      <Card className="p-6 border-border bg-surface shadow-sm">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">{stat.label}</p>
                        <p className="text-xl font-black text-text-primary mb-1">{stat.value}</p>
                        <p className={cn("text-[10px] font-black", stat.changeColor)}>{stat.change}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-surface border border-border flex items-center justify-center shadow-none">
                <BarChart2 className="w-10 h-10 text-text-muted opacity-50" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">Select a trade to analyze</h2>
                <p className="text-sm text-text-secondary max-w-xs mx-auto font-medium">Choose a trade from the left sidebar to see deep performance metrics and quality scores.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
