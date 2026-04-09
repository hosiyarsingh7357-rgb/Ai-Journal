import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  X,
  RotateCcw,
  BarChart2,
  Plus,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournals, addJournalToFirebase, updateJournalInFirebase, deleteJournalFromFirebase } from '../services/journalService';
import { uploadImage } from '../services/storageService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '@/utils/cn';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, Trade } from '@shared/types';

export const JournalPage = ({ 
  tradesList = [], 
  onUpdateTrade,
  onNavigate,
  initialSelectedTradeId
}: { 
  tradesList?: Trade[], 
  onUpdateTrade?: (id: string, updates: any) => Promise<void>,
  onNavigate?: (page: string, tradeId?: string) => void,
  initialSelectedTradeId?: string | null
}) => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(initialSelectedTradeId || null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Journaled' | 'Pending'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    preTradeAnalysis: '',
    postTradeReview: '',
    riskReward: { risk: 1, reward: 2 },
    emotions: '',
    lessonsLearned: '',
    tags: [],
    rating: 5,
    checklist: [
      { label: 'Followed Plan', checked: false },
      { label: 'Proper Risk', checked: false },
      { label: 'Good Entry', checked: false },
      { label: 'Patient Exit', checked: false },
      { label: 'High Timeframe Sync', checked: false },
    ],
    screenshots: []
  });

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

  const tradesWithJournalStatus = useMemo(() => {
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
    if (activeFilter === 'Journaled') return tradesWithJournalStatus.filter(t => t.isJournaled);
    if (activeFilter === 'Pending') return tradesWithJournalStatus.filter(t => !t.isJournaled);
    return tradesWithJournalStatus;
  }, [tradesWithJournalStatus, activeFilter]);

  const selectedTrade = useMemo(() => {
    if (!selectedTradeId) return filteredTrades.length > 0 ? filteredTrades[0] : null;
    return tradesWithJournalStatus.find(t => t.id === selectedTradeId) || (filteredTrades.length > 0 ? filteredTrades[0] : null);
  }, [tradesWithJournalStatus, selectedTradeId, filteredTrades]);

  useEffect(() => {
    if (initialSelectedTradeId) {
      setSelectedTradeId(initialSelectedTradeId);
    }
  }, [initialSelectedTradeId]);

  useEffect(() => {
    if (selectedTrade) {
      if (selectedTrade.journal) {
        setFormData({
          ...selectedTrade.journal,
          checklist: selectedTrade.journal.checklist || [
            { label: 'Risk within limits', checked: false },
            { label: 'Checked higher timeframe', checked: false },
            { label: 'Fits my trading plan', checked: false },
            { label: 'Key levels identified', checked: false },
            { label: 'Economic calendar checked', checked: false },
          ],
          screenshots: selectedTrade.journal.screenshots || []
        });
      } else {
        setFormData({
          preTradeAnalysis: '',
          postTradeReview: '',
          riskReward: { risk: 1, reward: 2 },
          emotions: '',
          lessonsLearned: '',
          tags: [],
          rating: 5,
          checklist: [
            { label: 'Risk within limits', checked: false },
            { label: 'Checked higher timeframe', checked: false },
            { label: 'Fits my trading plan', checked: false },
            { label: 'Key levels identified', checked: false },
            { label: 'Economic calendar checked', checked: false },
          ],
          screenshots: []
        });
      }
    }
  }, [selectedTrade]);

  const handleSave = async () => {
    if (!user || !selectedTrade) return;
    setIsSaving(true);
    try {
      const journalData: any = {
        ...formData,
        tradeId: selectedTrade.id,
        instrument: selectedTrade.symbol,
        tradeType: selectedTrade.type,
        volume: selectedTrade.size,
        pnl: selectedTrade.pnl,
        entryPrice: selectedTrade.entryPrice,
        exitPrice: selectedTrade.exitPrice || '',
        entryDate: selectedTrade.entryDate,
        exitDate: selectedTrade.exitDate || '',
        status: selectedTrade.isWinner ? 'won' : 'lost',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        title: `${selectedTrade.symbol} Journal`
      };

      if (selectedTrade.journal?.id) {
        await updateJournalInFirebase(user.uid, selectedTrade.journal.id, journalData);
      } else {
        await addJournalToFirebase(user.uid, journalData);
      }
    } catch (error) {
      console.error("Error saving journal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const url = await uploadImage(file, user.uid);
      setFormData(prev => ({
        ...prev,
        screenshots: [...(prev.screenshots || []), url]
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const toggleChecklist = (index: number) => {
    setFormData(prev => {
      const newChecklist = [...(prev.checklist || [])];
      newChecklist[index] = { ...newChecklist[index], checked: !newChecklist[index].checked };
      return { ...prev, checklist: newChecklist };
    });
  };

  const addCustomChecklistItem = (label: string) => {
    if (!label.trim()) return;
    setFormData(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), { label, checked: false }]
    }));
  };

  const [showMobileDetail, setShowMobileDetail] = useState(false);

  useEffect(() => {
    if (selectedTradeId) {
      setShowMobileDetail(true);
    }
  }, [selectedTradeId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-background relative">
      {/* Left Sidebar: Trade List */}
      <aside className={cn(
        "w-full lg:w-80 flex flex-col bg-surface border-r border-border shrink-0 transition-all duration-300",
        showMobileDetail ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-text-primary">Trade Journal</h2>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 px-2 py-1 bg-surface-muted rounded-lg border border-border">
                  <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Live</span>
               </div>
               <div className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                 {tradesWithJournalStatus.filter(t => t.isJournaled).length} entries
               </div>
            </div>
          </div>

          <div className="flex p-1 bg-surface-muted rounded-xl border border-border gap-1">
            {(['All', 'Journaled', 'Pending'] as const).map((filter) => (
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
                  {filter === 'All' ? tradesWithJournalStatus.length : 
                   filter === 'Journaled' ? tradesWithJournalStatus.filter(t => t.isJournaled).length : 
                   tradesWithJournalStatus.filter(t => !t.isJournaled).length}
                </span>
              </button>
            ))}
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
                  ? "bg-status-success/10 border-status-success shadow-none" 
                  : "bg-status-success/5 border-border hover:border-status-success/30 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center border border-border group-hover:border-status-success/20 transition-colors">
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
                  <span className={cn("text-[10px] font-black uppercase", trade.type === 'BUY' ? "text-status-success" : "text-status-danger")}>{trade.type}</span>
                  <span className="text-[10px] font-bold text-text-secondary">{trade.size}</span>
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

      {/* Main Content: Journal Form */}
      <main className={cn(
        "flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-12 transition-all duration-300",
        !showMobileDetail ? "hidden lg:block" : "block"
      )}>
        <AnimatePresence mode="wait">
          {selectedTrade ? (
            <motion.div
              key={selectedTrade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-6 lg:space-y-8"
            >
              {/* Mobile Back Button */}
              <button 
                onClick={() => setShowMobileDetail(false)}
                className="lg:hidden flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 font-bold text-xs uppercase tracking-widest"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Trades
              </button>

              {/* Form Header */}
              <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-border shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-surface-muted flex items-center justify-center border border-border">
                    <TrendingUp className={cn("w-5 h-5 lg:w-6 lg:h-6", selectedTrade.type === 'BUY' ? "text-brand-primary" : "text-status-danger")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">{selectedTrade.symbol}</h1>
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest",
                        selectedTrade.isWinner ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"
                      )}>
                        {selectedTrade.isWinner ? 'Winner' : 'Loser'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] lg:text-[11px] font-black text-text-secondary uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedTrade.type} • Entry {selectedTrade.entryPrice}</span>
                      <span>• Size {selectedTrade.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <button className="p-2 lg:p-2.5 rounded-xl border border-border hover:bg-surface-muted transition-all text-text-secondary hover:text-text-primary">
                    <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button 
                    onClick={() => onNavigate?.('analysis')}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border border-border hover:bg-surface-muted transition-all text-text-primary font-bold text-xs lg:text-sm"
                  >
                    <BarChart2 className="w-4 h-4" /> <span className="hidden sm:inline">Analytics</span>
                  </button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 lg:px-8 py-2 lg:py-2.5 rounded-xl bg-status-success hover:bg-status-success/90 text-text-primary"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </header>

              <div className="grid grid-cols-1 gap-8">
                {/* Analysis Sections */}
                <div className="space-y-6">
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-text-secondary">
                      <BookOpen className="w-4 h-4 text-brand-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Pre-Trade Analysis</h3>
                    </div>
                    <textarea 
                      value={formData.preTradeAnalysis}
                      onChange={(e) => setFormData(prev => ({ ...prev, preTradeAnalysis: e.target.value }))}
                      placeholder="What did you see? Plan, thesis, levels, risk..."
                      className="w-full min-h-[120px] p-6 rounded-[2rem] bg-surface border border-border focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium leading-relaxed placeholder:text-text-muted text-text-primary"
                    />
                  </motion.section>

                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Post-Trade Review</h3>
                    </div>
                    <textarea 
                      value={formData.postTradeReview}
                      onChange={(e) => setFormData(prev => ({ ...prev, postTradeReview: e.target.value }))}
                      placeholder="What happened? Execution, slippage, improvements..."
                      className="w-full min-h-[120px] p-6 rounded-[2rem] bg-surface border border-border focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium leading-relaxed placeholder:text-text-muted text-text-primary"
                    />
                  </motion.section>
                </div>

                {/* Middle Row: R:R and other metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <motion.section
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="space-y-3"
                   >
                      <div className="flex items-center gap-2 text-text-secondary">
                        <TrendingUp className="w-4 h-4 text-brand-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Risk : Reward</h3>
                      </div>
                      <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
                         <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary">Risk</span>
                            <input 
                              type="number" 
                              value={formData.riskReward?.risk}
                              onChange={(e) => setFormData(prev => ({ ...prev, riskReward: { ...prev.riskReward!, risk: Number(e.target.value) } }))}
                              className="w-full bg-surface-muted border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-center text-text-primary"
                            />
                         </div>
                         <span className="text-lg font-black text-text-secondary">:</span>
                         <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary">Reward</span>
                            <input 
                              type="number" 
                              value={formData.riskReward?.reward}
                              onChange={(e) => setFormData(prev => ({ ...prev, riskReward: { ...prev.riskReward!, reward: Number(e.target.value) } }))}
                              className="w-full bg-surface-muted border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-center text-text-primary"
                            />
                         </div>
                      </div>
                   </motion.section>

                   <motion.section
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 }}
                     className="space-y-3"
                   >
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Brain className="w-4 h-4 text-brand-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Emotions</h3>
                      </div>
                      <textarea 
                        value={formData.emotions}
                        onChange={(e) => setFormData(prev => ({ ...prev, emotions: e.target.value }))}
                        placeholder="Calm, anxious, FOMO, confident..."
                        className="w-full h-[68px] p-4 rounded-2xl bg-surface border border-border focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium placeholder:text-text-muted text-text-primary"
                      />
                   </motion.section>
                </div>

                {/* Bottom Row: Lessons and Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <motion.section
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.5 }}
                     className="space-y-3"
                   >
                      <div className="flex items-center gap-2 text-text-secondary">
                        <BookOpen className="w-4 h-4 text-brand-secondary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Lessons Learned</h3>
                      </div>
                      <textarea 
                        value={formData.lessonsLearned}
                        onChange={(e) => setFormData(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                        placeholder="Key takeaways to repeat or avoid..."
                        className="w-full h-[100px] p-4 rounded-2xl bg-surface border border-border focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium placeholder:text-text-muted text-text-primary"
                      />
                   </motion.section>

                   <div className="space-y-8">
                      <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <TrendingUp className="w-4 h-4 text-brand-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Rating</h3>
                          </div>
                          <span className="text-xs font-black text-text-primary">{formData.rating}/10</span>
                        </div>
                        <div className="px-2">
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="1"
                            value={formData.rating}
                            onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                            className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-status-success"
                          />
                          <div className="flex justify-between mt-2 text-[8px] font-black text-text-secondary uppercase tracking-widest">
                            <span>1</span>
                            <span>5</span>
                            <span>10</span>
                          </div>
                        </div>
                      </motion.section>

                      <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Layers className="w-4 h-4 text-brand-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Tags</h3>
                        </div>
                        <input 
                          type="text" 
                          value={formData.tags?.join(', ')}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                          placeholder="breakout, trend, news (comma separated)"
                          className="w-full p-4 rounded-2xl bg-surface border border-border focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-sm font-medium placeholder:text-text-muted text-text-primary"
                        />
                      </motion.section>
                   </div>
                </div>

                {/* Execution Checklist */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Execution Checklist</h3>
                    </div>
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                      {formData.checklist?.filter(c => c.checked).length}/{formData.checklist?.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {formData.checklist?.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleChecklist(idx)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group",
                          item.checked 
                            ? "bg-surface-muted border-status-success shadow-none" 
                            : "bg-surface border-border hover:border-status-success/30"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                          item.checked ? "bg-status-success border-status-success" : "border-border group-hover:border-status-success/30"
                        )}>
                          {item.checked && <Check className="w-3 h-3 text-text-primary" />}
                        </div>
                        <span className={cn(
                          "text-[11px] font-bold transition-colors",
                          item.checked ? "text-text-primary" : "text-text-secondary"
                        )}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                    <button 
                      onClick={() => {
                        const label = prompt('Enter custom checklist item:');
                        if (label) addCustomChecklistItem(label);
                      }}
                      className="flex items-center justify-center p-4 rounded-2xl border border-dashed border-border hover:border-brand-primary/30 hover:bg-surface-muted transition-all text-text-secondary hover:text-brand-primary group"
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold">Add custom item...</span>
                    </button>
                  </div>
                </motion.section>

                {/* Screenshots */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-text-secondary">
                    <ImageIcon className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Screenshots</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {formData.screenshots?.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-border shadow-none">
                        <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, screenshots: prev.screenshots?.filter((_, i) => i !== idx) }))}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-status-danger"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-brand-primary/30 hover:bg-surface-muted transition-all text-text-secondary hover:text-brand-primary group"
                    >
                      <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                  </div>
                </motion.section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-surface border border-border flex items-center justify-center shadow-none">
                <BookOpen className="w-10 h-10 text-text-muted opacity-50" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">Select a trade to journal</h2>
                <p className="text-sm text-text-secondary max-w-xs mx-auto font-medium">Choose a trade from the left sidebar to start your analysis and psychological review.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
