import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Edit3, 
  Share2, 
  Verified, 
  Brain, 
  TrendingUp, 
  Clock, 
  Layers, 
  ArrowUpRight,
  Maximize2,
  MoreVertical,
  ChevronLeft,
  Trash2,
  BookOpen,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournals, addJournal, updateJournal, deleteJournal } from '../services/journalService';
import { uploadImage } from '../services/storageService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

export const JournalPage = ({ tradesList = [], onUpdateTrade }: { tradesList?: any[], onUpdateTrade?: (id: string, updates: any) => Promise<void> }) => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('TRADES');
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToJournals(user.uid, (data) => {
      setJournals(data);
    });
    return unsubscribe;
  }, [user]);

  const filteredEntries = useMemo(() => {
    // Merge real journal entries with ALL trades
    const journalEntries = journals.map(j => ({ ...j, type: 'journal' }));
    
    const tradeEntries = tradesList
      .map(t => ({
        id: t.id || `trade-${t.symbol}-${t.entryDate}`,
        instrument: t.symbol,
        tradeNotes: t.notes || '',
        title: 'Trade Execution Note',
        status: t.isWinner ? 'won' : (parseFloat((t.pnl || "0").replace(/[$,+]/g, '')) < 0 ? 'lost' : 'neutral'),
        pnl: t.pnl,
        date: t.date || (t.entryDate ? new Date(t.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
        time: t.time || (t.entryDate ? new Date(t.entryDate).toLocaleTimeString('en-US', { hour12: false }) : '—'),
        confidence: 'High (Executed)',
        logic: `${t.type} ${t.size}`,
        rr: t.rr || 'N/A',
        volume: t.size,
        duration: t.duration || 'N/A',
        emotionalCheck: t.notes ? 'Note captured during trade execution.' : 'No notes captured.',
        type: 'trade-note',
        tradeType: t.type,
        entryPrice: t.entryPrice || t.entry,
        exitPrice: t.exitPrice || t.current,
        entryDateRaw: t.entryDate,
        exitDateRaw: t.exitDate,
        screenshot: t.screenshot,
        pricePoints: {
          entryAvg: t.entryPrice || t.entry,
          exitAvg: t.exitPrice || t.current
        },
        tags: ['#trade-note', `#${t.symbol}`]
      }));

    let combined = [...journalEntries, ...tradeEntries];
    
    // Sort by date/time descending
    combined.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return dateB - dateA;
    });

    // Apply Date Filter
    if (selectedDate) {
      combined = combined.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        return d.toLocaleDateString('en-CA') === selectedDate;
      });
    }

    // Apply Status Filter (Winners/Losses)
    if (activeFilter === 'Winners') combined = combined.filter(e => e.status === 'won');
    if (activeFilter === 'Losses') combined = combined.filter(e => e.status === 'lost');
    
    return combined;
  }, [journals, tradesList, activeFilter, selectedDate]);

  const filteredTrades = useMemo(() => {
    let filtered = [...tradesList];

    // Filter by Date
    if (selectedDate) {
      filtered = filtered.filter(t => {
        const dateToUse = t.entryDate || t.date;
        if (!dateToUse) return false;
        const d = new Date(dateToUse);
        if (isNaN(d.getTime())) return false;
        // Compare YYYY-MM-DD
        return d.toLocaleDateString('en-CA') === selectedDate;
      });
    }

    // Filter by Status
    if (activeFilter === 'Winners') filtered = filtered.filter(t => t.isWinner === true || parseFloat((t.pnl || "0").replace(/[$,+]/g, '')) > 0);
    if (activeFilter === 'Losses') filtered = filtered.filter(t => t.isWinner === false || parseFloat((t.pnl || "0").replace(/[$,+]/g, '')) < 0);
    
    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.entryDate || 0).getTime() - new Date(a.entryDate || 0).getTime());
  }, [tradesList, activeFilter, selectedDate]);

  const selectedEntry = useMemo(() => {
    if (!selectedId) return filteredEntries.length > 0 ? filteredEntries[0] : null;
    return filteredEntries.find(e => e.id === selectedId) || (filteredEntries.length > 0 ? filteredEntries[0] : null);
  }, [filteredEntries, selectedId]);

  const handleSelectEntry = (id: string) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  const handleEditEntry = () => {
    setEditingEntry(selectedEntry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    if (!user) return;
    try {
      await deleteJournal(user.uid, id);
      if (selectedId === id) {
        setSelectedId(null);
        setShowDetail(false);
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleSaveEntry = async (updatedData: any) => {
    if (!user) return;
    
    try {
      if (editingEntry?.type === 'trade-note') {
        if (onUpdateTrade) {
          await onUpdateTrade(editingEntry.id, { 
            symbol: updatedData.instrument,
            type: updatedData.tradeType,
            size: updatedData.volume,
            pnl: updatedData.pnl,
            entryPrice: updatedData.entryPrice,
            exitPrice: updatedData.exitPrice,
            entryDate: updatedData.entryDate,
            exitDate: updatedData.exitDate,
            notes: updatedData.tradeNotes,
            screenshot: updatedData.screenshot
          });
        }
      } else {
        const journalData = {
          instrument: updatedData.instrument,
          tradeNotes: updatedData.tradeNotes,
          title: updatedData.instrument + ' Analysis',
          status: 'neutral', // Default or derived from trade if linked
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          confidence: 'Medium',
          logic: 'Manual Entry',
          emotionalCheck: 'Calm',
          emotions: {
            confidence: 50,
            fear: 0,
            greed: 0
          },
          tags: ['#manual'],
          // Add extra fields if needed for manual journal entries too
          tradeType: updatedData.tradeType,
          volume: updatedData.volume,
          pnl: updatedData.pnl,
          entryPrice: updatedData.entryPrice,
          exitPrice: updatedData.exitPrice,
          entryDate: updatedData.entryDate,
          exitDate: updatedData.exitDate,
          screenshot: updatedData.screenshot
        };

        if (editingEntry) {
          await updateJournal(user.uid, editingEntry.id, journalData);
        } else {
          await addJournal(user.uid, journalData);
        }
      }
      setIsModalOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background relative">
      {/* Left Pane: Master List */}
      <aside className={cn(
        "absolute inset-0 lg:relative lg:inset-auto lg:w-96 flex flex-col bg-background border-r border-border shrink-0 transition-transform duration-300 z-20",
        showDetail ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
      )}>
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-2">Ai Journal</h2>
            <div className="relative group">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <button className="p-2 bg-secondary border border-border rounded-xl text-muted-foreground hover:text-brand-primary transition-all shadow-sm">
                <CalendarIcon className="w-4 h-4" />
              </button>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-status-danger text-white rounded-full flex items-center justify-center text-[8px] font-bold z-20 shadow-glow"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['TRADES', 'JOURNAL'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'JOURNAL') setActiveFilter('All');
                }}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all",
                  activeTab === tab
                    ? "bg-brand-primary text-white shadow-glow"
                    : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {activeTab === 'TRADES' && (
            <>
              <div className="h-px bg-border my-4" />
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Winners', 'Losses'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded uppercase transition-all",
                      activeFilter === filter
                        ? "bg-brand-primary text-white shadow-glow"
                        : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'JOURNAL' ? (
            filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center mb-2">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Your journal is waiting...</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">"The first step to mastery is awareness. Start writing your first thought about the markets today."</p>
                <button 
                  onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
                  className="text-xs font-black text-brand-primary uppercase tracking-widest hover:text-brand-secondary transition-colors"
                >
                  + Create First Entry
                </button>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div 
                  key={entry.id}
                  onClick={() => handleSelectEntry(entry.id)}
                  className={cn(
                    "p-4 lg:p-5 cursor-pointer transition-all border-b border-border hover:bg-secondary",
                    selectedId === entry.id ? "bg-secondary shadow-premium border-l-4 border-l-brand-primary" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-sm font-bold",
                      selectedId === entry.id ? "text-brand-primary" : "text-foreground"
                    )}>
                      {entry.instrument}
                    </span>
                    <span className={cn(
                      "text-xs font-bold",
                      entry.status === 'won' ? "text-status-success" : 
                      entry.status === 'lost' ? "text-status-danger" : "text-muted-foreground"
                    )}>
                      {entry.pnl || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-muted-foreground font-medium">{entry.date} • {entry.time}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-[9px] font-bold rounded uppercase",
                      entry.status === 'won' ? "bg-status-success/10 text-status-success" : 
                      entry.status === 'lost' ? "bg-status-danger/10 text-status-danger" : "bg-secondary text-muted-foreground border border-border"
                    )}>
                      {entry.status === 'won' ? 'Trade Won' : entry.status === 'lost' ? 'Trade Lost' : 'No Trade'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">"{entry.tradeNotes || 'No notes provided.'}"</p>
                </div>
              ))
            )
          ) : (
            filteredTrades.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No trades recorded yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Sync your account or manually add your first trade to see the analysis.</p>
              </div>
            ) : (
              filteredTrades.map((trade, index) => (
              <div 
                key={trade.id || index}
                onClick={() => handleSelectEntry(trade.id)}
                className={cn(
                  "p-4 lg:p-5 border-b border-border hover:bg-secondary transition-all cursor-pointer",
                  selectedId === trade.id ? "bg-secondary shadow-premium border-l-4 border-l-brand-primary" : ""
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-sm font-bold",
                    selectedId === trade.id ? "text-brand-primary" : "text-foreground"
                  )}>{trade.symbol}</span>
                  <span className={cn(
                    "text-xs font-bold",
                    trade.isWinner ? "text-status-success" : "text-status-danger"
                  )}>
                    {trade.pnl}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {trade.date || (trade.entryDate ? new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')} • 
                    {trade.time || (trade.entryDate ? new Date(trade.entryDate).toLocaleTimeString('en-US', { hour12: false }) : '—')}
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[9px] font-bold rounded uppercase",
                    trade.isWinner || parseFloat((trade.pnl || "0").replace(/[$,+]/g, '')) > 0 ? "bg-status-success/10 text-status-success" : 
                    trade.isWinner === false || parseFloat((trade.pnl || "0").replace(/[$,+]/g, '')) < 0 ? "bg-status-danger/10 text-status-danger" : "bg-secondary text-muted-foreground border border-border"
                  )}>
                    {trade.type} {trade.size}
                  </span>
                </div>
                <div className="bg-background p-2 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                    {trade.notes || 'No notes added yet...'}
                  </p>
                </div>
              </div>
            ))
          ))}
        </div>
      </aside>

      {/* Right Pane: Detail View */}
      <section className={cn(
        "absolute inset-0 lg:relative lg:inset-auto flex-1 overflow-y-auto custom-scrollbar bg-background transition-transform duration-300 z-30 lg:z-10",
        showDetail ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="max-w-5xl mx-auto p-4 lg:p-10">
          {selectedEntry ? (
            <>
              {/* Detail Header */}
              <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 lg:mb-10 pb-6 lg:pb-8 border-b border-border">
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                      onClick={() => setShowDetail(false)}
                      className="lg:hidden p-1.5 -ml-1.5 hover:bg-secondary rounded-lg text-muted-foreground"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded uppercase",
                      selectedEntry?.status === 'won' ? "bg-status-success/20 text-status-success" : 
                      selectedEntry?.status === 'lost' ? "bg-status-danger/20 text-status-danger" : "bg-secondary text-muted-foreground border border-border"
                    )}>
                      {selectedEntry?.status?.toUpperCase() || 'N/A'}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{selectedEntry?.date}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
                    {selectedEntry?.instrument} - {selectedEntry?.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] lg:text-xs font-bold rounded-lg border border-brand-primary/20">
                      <Verified className="w-4 h-4" /> Confidence: {selectedEntry?.confidence}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-[10px] lg:text-xs font-bold rounded-lg border border-brand-secondary/20">
                      <Brain className="w-4 h-4" /> Logic: {selectedEntry?.logic}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleEditEntry}
                    className="p-2 border border-border rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-brand-primary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {selectedEntry.type !== 'trade-note' && (
                    <button 
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="p-2 border border-border rounded-lg hover:bg-status-danger/10 transition-all text-muted-foreground hover:text-status-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 border border-border rounded-lg hover:bg-secondary transition-all text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                {/* Left/Main Column */}
                <div className="lg:col-span-2 space-y-10 lg:space-y-12">
                  {/* Execution Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                    <Card className="p-4 rounded-2xl">
                      <p className="label-text mb-1">Symbol</p>
                      <p className="text-lg font-black text-foreground">{selectedEntry?.instrument}</p>
                    </Card>
                    <Card className="p-4 rounded-2xl">
                      <p className="label-text mb-1">Type</p>
                      <p className={cn(
                        "text-lg font-black",
                        selectedEntry?.tradeType?.includes('BUY') ? "text-brand-primary" : "text-status-danger"
                      )}>
                        {selectedEntry?.tradeType}
                      </p>
                    </Card>
                    <Card className="p-4 rounded-2xl">
                      <p className="label-text mb-1">Size</p>
                      <p className="text-lg font-black text-foreground">{selectedEntry?.volume}</p>
                    </Card>
                    <Card className="p-4 rounded-2xl">
                      <p className="label-text mb-1">Net P&L</p>
                      <p className={cn(
                        "text-lg font-black",
                        selectedEntry?.pnl?.startsWith('+') ? "text-status-success" : "text-status-danger"
                      )}>
                        {selectedEntry?.pnl}
                      </p>
                    </Card>
                  </div>

                  {/* Price & Date Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="p-6 rounded-3xl space-y-4">
                      <h3 className="label-text flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-brand-primary" /> Entry Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Entry Price</span>
                          <span className="text-xs font-black text-foreground">{selectedEntry?.entryPrice || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Entry Date</span>
                          <span className="text-xs font-black text-foreground">
                            {selectedEntry?.entryDateRaw ? new Date(selectedEntry.entryDateRaw).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 rounded-3xl space-y-4">
                      <h3 className="label-text flex items-center gap-2">
                        <ArrowUpRight className="w-3 h-3 text-brand-secondary" /> Exit Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Exit Price</span>
                          <span className="text-xs font-black text-foreground">{selectedEntry?.exitPrice || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Exit Date</span>
                          <span className="text-xs font-black text-foreground">
                            {selectedEntry?.exitDateRaw ? new Date(selectedEntry.exitDateRaw).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* AI Analysis Section */}
                  <section className="relative overflow-hidden rounded-[2rem] border border-brand-primary/20 bg-secondary p-6 lg:p-8 shadow-premium">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Brain className="w-24 h-24 text-brand-primary" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                          <Brain className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-foreground uppercase tracking-widest">AI Psychological Analysis</h3>
                          <p className="text-[10px] text-brand-primary/60 font-bold uppercase tracking-tighter">Powered by Gemini Pro</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <p className="label-text">Emotional State</p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-status-success/10 text-status-success text-[10px] font-bold rounded-lg border border-status-success/20">
                                Disciplined
                              </span>
                              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-lg border border-brand-primary/20">
                                Rational
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="label-text">Risk Assessment</p>
                            <p className="text-xs text-foreground font-medium leading-relaxed">
                              Your execution was precise. However, notice the slight hesitation before entry. This suggests a minor lack of confidence in your setup.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <p className="label-text mb-3">AI Recommendation</p>
                          <div className="bg-secondary rounded-2xl p-4 border border-border shadow-sm">
                            <p className="text-xs text-foreground italic leading-relaxed">
                              "You're performing well under pressure. To improve, try reducing your position size by 20% on the next trade to eliminate that entry hesitation."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Notes Section */}
                  <section>
                    <h3 className="label-text mb-4 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-brand-primary" /> Trade Notes & Logic
                    </h3>
                    <div className="bg-secondary p-6 rounded-[2rem] border border-border shadow-premium">
                      <p className="text-sm text-foreground leading-relaxed">
                        {selectedEntry?.tradeNotes || 'No notes provided.'}
                      </p>
                    </div>
                  </section>

                  {/* Screenshot Section */}
                  {selectedEntry?.screenshot && (
                    <section>
                      <h3 className="label-text mb-4 flex items-center gap-2">
                        <Eye className="w-3 h-3 text-brand-primary" /> Evidence Screenshot
                      </h3>
                      <Card className="relative group aspect-video rounded-[2rem] overflow-hidden p-0">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          src={selectedEntry.screenshot} 
                          alt="Trade Evidence" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-zoom-in">
                          <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Maximize2 className="w-4 h-4" /> View Full Context
                          </span>
                        </div>
                      </Card>
                    </section>
                  )}
                </div>

                {/* Right Sidebar: Metadata (Empty but kept for layout consistency) */}
                <div className="space-y-8">
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-center shadow-premium">
                <BookOpen className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <div>
                <h2 className="heading-2 mb-2">Select an entry</h2>
                <p className="body-text max-w-xs mx-auto">Choose a trade or journal entry from the list to view detailed analysis and AI insights.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-primary text-white rounded-full shadow-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Edit3 className="w-6 h-6" />
      </button>

      {/* New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 p-0 rounded-[2.5rem]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background">
              <h3 className="heading-3">{editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}</h3>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingEntry(null); }} 
                className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-secondary">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Instrument Symbol"
                  placeholder="e.g. XAUUSD" 
                  defaultValue={editingEntry?.instrument || ''}
                  id="instrument-input"
                />
                <div className="w-full space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Trade Type</label>
                  <select 
                    id="trade-type-input"
                    defaultValue={editingEntry?.tradeType || 'BUY'}
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-200 text-sm font-medium"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Position Size"
                  placeholder="e.g. 1.00 Lots" 
                  defaultValue={editingEntry?.volume || ''}
                  id="volume-input"
                />
                <Input 
                  label="Net P&L"
                  placeholder="e.g. +$1,200.00" 
                  defaultValue={editingEntry?.pnl || ''}
                  id="pnl-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Entry Price"
                  placeholder="e.g. 2015.50" 
                  defaultValue={editingEntry?.entryPrice || ''}
                  id="entry-price-input"
                />
                <Input 
                  label="Entry Date"
                  type="datetime-local" 
                  defaultValue={editingEntry?.entryDateRaw ? new Date(editingEntry.entryDateRaw).toISOString().slice(0, 16) : ''}
                  id="entry-date-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Exit Price"
                  placeholder="e.g. 2035.20" 
                  defaultValue={editingEntry?.exitPrice || ''}
                  id="exit-price-input"
                />
                <Input 
                  label="Exit Date"
                  type="datetime-local" 
                  defaultValue={editingEntry?.exitDateRaw ? new Date(editingEntry.exitDateRaw).toISOString().slice(0, 16) : ''}
                  id="exit-date-input"
                />
              </div>

              <div className="w-full space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Trade Notes & Logic</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe your trade logic and emotions..." 
                  defaultValue={editingEntry?.tradeNotes || ''}
                  id="trade-notes-textarea"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all resize-none text-sm text-foreground placeholder:text-muted-foreground/70"
                ></textarea>
              </div>
              <div className="w-full space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block ml-1">Evidence Screenshot</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploading(true);
                      try {
                        const url = await uploadImage(e.target.files[0], user!.uid);
                        (document.getElementById('screenshot-input') as HTMLInputElement).value = url;
                      } catch (error) {
                        console.error("Upload failed", error);
                      } finally {
                        setUploading(false);
                      }
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all text-sm text-foreground" 
                />
                <input 
                  type="hidden" 
                  defaultValue={editingEntry?.screenshot || ''}
                  id="screenshot-input"
                />
                {uploading && <p className="text-xs text-brand-primary mt-1 font-bold">Uploading...</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  onClick={() => { setIsModalOpen(false); setEditingEntry(null); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const instrument = (document.getElementById('instrument-input') as HTMLInputElement).value;
                    const tradeType = (document.getElementById('trade-type-input') as HTMLSelectElement).value;
                    const volume = (document.getElementById('volume-input') as HTMLInputElement).value;
                    const pnl = (document.getElementById('pnl-input') as HTMLInputElement).value;
                    const entryPrice = (document.getElementById('entry-price-input') as HTMLInputElement).value;
                    const entryDate = (document.getElementById('entry-date-input') as HTMLInputElement).value;
                    const exitPrice = (document.getElementById('exit-price-input') as HTMLInputElement).value;
                    const exitDate = (document.getElementById('exit-date-input') as HTMLInputElement).value;
                    const tradeNotes = (document.getElementById('trade-notes-textarea') as HTMLTextAreaElement).value;
                    const screenshot = (document.getElementById('screenshot-input') as HTMLInputElement).value;
                    
                    handleSaveEntry({ 
                      instrument, 
                      tradeType,
                      volume,
                      pnl,
                      entryPrice,
                      entryDate,
                      exitPrice,
                      exitDate,
                      tradeNotes,
                      screenshot
                    });
                  }}
                  className="flex-1"
                >
                  Save Entry
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
