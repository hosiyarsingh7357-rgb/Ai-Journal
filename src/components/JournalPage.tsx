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
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournals, addJournal, updateJournal, deleteJournal } from '../services/journalService';
import { uploadImage } from '../services/storageService';

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
        status: t.isWinner ? 'won' : (t.pnl?.startsWith('-') ? 'lost' : 'neutral'),
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
    <div className="flex-1 flex overflow-hidden bg-transparent relative">
      {/* Left Pane: Master List */}
      <aside className={`absolute inset-0 lg:relative lg:inset-auto lg:w-96 flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10 shrink-0 transition-transform duration-300 z-20 ${
        showDetail ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      }`}>
        <div className="p-4 lg:p-6 border-b border-white/10 bg-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-headline text-white">Ai Journal</h2>
            <div className="relative group">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <CalendarIcon className="w-4 h-4" />
              </button>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold z-20"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['TRADES'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Reset filter when switching to Journal as per request (hide buttons logic)
                  if (tab === 'JOURNAL') setActiveFilter('All');
                }}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {activeTab === 'TRADES' && (
            <>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Winners', 'Losses'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase shadow-sm whitespace-nowrap transition-all ${
                      activeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                    }`}
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
            filteredEntries.map((entry) => (
              <div 
                key={entry.id}
                onClick={() => handleSelectEntry(entry.id)}
                className={`p-4 lg:p-5 cursor-pointer transition-all border-b border-white/10 hover:bg-white/10 ${
                  selectedId === entry.id ? 'bg-white/10 shadow-md border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold font-headline ${selectedId === entry.id ? 'text-blue-400' : 'text-white'}`}>
                    {entry.instrument}
                  </span>
                  <span className={`text-xs font-bold ${
                    entry.status === 'won' ? 'text-emerald-400' : 
                    entry.status === 'lost' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {entry.pnl || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-slate-400 font-medium">{entry.date} • {entry.time}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                    entry.status === 'won' ? 'bg-emerald-500/10 text-emerald-400' : 
                    entry.status === 'lost' ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-slate-400'
                  }`}>
                    {entry.status === 'won' ? 'Trade Won' : entry.status === 'lost' ? 'Trade Lost' : 'No Trade'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 italic">"{entry.tradeNotes || 'No notes provided.'}"</p>
              </div>
            ))
          ) : (
            filteredTrades.map((trade, index) => (
              <div 
                key={trade.id || index}
                onClick={() => handleSelectEntry(trade.id)}
                className={`p-4 lg:p-5 border-b border-white/10 hover:bg-white/10 transition-all cursor-pointer ${
                  selectedId === trade.id ? 'bg-white/10 shadow-md border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${selectedId === trade.id ? 'text-blue-400' : 'text-white'}`}>{trade.symbol}</span>
                  <span className={`text-xs font-bold ${trade.isWinner ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.pnl}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {trade.date || (trade.entryDate ? new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')} • 
                    {trade.time || (trade.entryDate ? new Date(trade.entryDate).toLocaleTimeString('en-US', { hour12: false }) : '—')}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                    trade.isWinner || parseFloat((trade.pnl || "0").replace(/[$,+]/g, '')) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 
                    trade.isWinner === false || parseFloat((trade.pnl || "0").replace(/[$,+]/g, '')) < 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-slate-400'
                  }`}>
                    {trade.type} {trade.size}
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                  <p className="text-[10px] text-slate-400 italic line-clamp-2">
                    {trade.notes || 'No notes added yet...'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right Pane: Detail View */}
      <section className={`absolute inset-0 lg:relative lg:inset-auto flex-1 overflow-y-auto custom-scrollbar bg-transparent transition-transform duration-300 z-30 lg:z-10 ${
        showDetail ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="max-w-5xl mx-auto p-4 lg:p-10">
          {/* Detail Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 lg:mb-10 pb-6 lg:pb-8 border-b border-white/10">
            <div className="w-full">
              <div className="flex items-center gap-3 mb-2">
                <button 
                  onClick={() => setShowDetail(false)}
                  className="lg:hidden p-1.5 -ml-1.5 hover:bg-white/10 rounded-lg text-slate-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                  selectedEntry?.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' : 
                  selectedEntry?.status === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-slate-400'
                }`}>
                  {selectedEntry?.status?.toUpperCase() || 'N/A'}
                </span>
                <span className="text-sm font-medium text-slate-400">{selectedEntry?.date}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black font-headline text-white tracking-tight">
                {selectedEntry?.instrument} - {selectedEntry?.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] lg:text-xs font-bold rounded-lg border border-blue-500/30">
                  <Verified className="w-4 h-4" /> Confidence: {selectedEntry?.confidence}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] lg:text-xs font-bold rounded-lg border border-amber-500/30">
                  <Brain className="w-4 h-4" /> Logic: {selectedEntry?.logic}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
              {selectedEntry && (
                <>
                  <button 
                    onClick={handleEditEntry}
                    className="p-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-slate-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {selectedEntry.type !== 'trade-note' && (
                    <button 
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="p-2 border border-white/10 rounded-lg hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
              <button className="p-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-slate-400">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Left/Main Column */}
            <div className="lg:col-span-2 space-y-10 lg:space-y-12">
              {/* Execution Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                <div className="glass p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Instrument Symbol</p>
                  <p className="text-lg font-black text-white">{selectedEntry?.instrument}</p>
                </div>
                <div className="glass p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Trade Type</p>
                  <p className={`text-lg font-black ${selectedEntry?.tradeType?.includes('BUY') ? 'text-blue-400' : 'text-red-400'}`}>
                    {selectedEntry?.tradeType}
                  </p>
                </div>
                <div className="glass p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Position Size</p>
                  <p className="text-lg font-black text-white">{selectedEntry?.volume}</p>
                </div>
                <div className="glass p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Net P&L</p>
                  <p className={`text-lg font-black ${selectedEntry?.pnl?.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedEntry?.pnl}
                  </p>
                </div>
              </div>

              {/* Price & Date Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass p-6 space-y-4">
                  <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Entry Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Entry Price</span>
                      <span className="text-xs font-black text-white">{selectedEntry?.entryPrice || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Entry Date</span>
                      <span className="text-xs font-black text-white">
                        {selectedEntry?.entryDateRaw ? new Date(selectedEntry.entryDateRaw).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="glass p-6 space-y-4">
                  <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                    <ArrowUpRight className="w-3 h-3" /> Exit Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Exit Price</span>
                      <span className="text-xs font-black text-white">{selectedEntry?.exitPrice || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Exit Date</span>
                      <span className="text-xs font-black text-white">
                        {selectedEntry?.exitDateRaw ? new Date(selectedEntry.exitDateRaw).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <section>
                <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Trade Notes & Logic
                </h3>
                <div className="prose prose-sm max-w-none text-slate-300 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
                  <p>{selectedEntry?.tradeNotes || 'No notes provided.'}</p>
                </div>
              </section>

              {/* Screenshot Section */}
              {selectedEntry?.screenshot && (
                <section>
                  <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Evidence Screenshot
                  </h3>
                  <div className="relative group aspect-video rounded-2xl overflow-hidden border border-white/10 glass">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={selectedEntry.screenshot} 
                      alt="Trade Evidence" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-zoom-in">
                      <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" /> View Full Context
                      </span>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar: Metadata (Empty but kept for layout consistency) */}
            <div className="space-y-8">
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Edit3 className="w-6 h-6" />
      </button>

      {/* New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingEntry(null); }} className="text-slate-400 hover:text-white">
                <MoreVertical className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Instrument Symbol</label>
                  <input 
                    type="text" 
                    placeholder="e.g. XAUUSD" 
                    defaultValue={editingEntry?.instrument || ''}
                    id="instrument-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Trade Type</label>
                  <select 
                    id="trade-type-input"
                    defaultValue={editingEntry?.tradeType || 'BUY'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white"
                  >
                    <option value="BUY" className="bg-slate-900">BUY</option>
                    <option value="SELL" className="bg-slate-900">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Position Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1.00 Lots" 
                    defaultValue={editingEntry?.volume || ''}
                    id="volume-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Net P&L</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +$1,200.00" 
                    defaultValue={editingEntry?.pnl || ''}
                    id="pnl-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Entry Price</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2015.50" 
                    defaultValue={editingEntry?.entryPrice || ''}
                    id="entry-price-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Entry Date</label>
                  <input 
                    type="datetime-local" 
                    defaultValue={editingEntry?.entryDateRaw ? new Date(editingEntry.entryDateRaw).toISOString().slice(0, 16) : ''}
                    id="entry-date-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Exit Price</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2035.20" 
                    defaultValue={editingEntry?.exitPrice || ''}
                    id="exit-price-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Exit Date</label>
                  <input 
                    type="datetime-local" 
                    defaultValue={editingEntry?.exitDateRaw ? new Date(editingEntry.exitDateRaw).toISOString().slice(0, 16) : ''}
                    id="exit-date-input"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Trade Notes & Logic</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe your trade logic and emotions..." 
                  defaultValue={editingEntry?.tradeNotes || ''}
                  id="trade-notes-textarea"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm text-white placeholder-slate-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Evidence Screenshot</label>
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-500" 
                />
                <input 
                  type="hidden" 
                  defaultValue={editingEntry?.screenshot || ''}
                  id="screenshot-input"
                />
                {uploading && <p className="text-xs text-blue-400 mt-1">Uploading...</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingEntry(null); }}
                  className="flex-1 py-3 bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
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
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-colors text-sm"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
