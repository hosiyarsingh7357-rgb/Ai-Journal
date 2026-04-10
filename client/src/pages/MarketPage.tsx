import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Search, Globe, RefreshCw, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeNews } from '../services/aiService';

const NewsCard: React.FC<{ event: any }> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const targetDate = new Date(`${event.date}T${event.time}:00`);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeDisplay(`${event.date} ${event.time}`);
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes < 9) {
        setTimeDisplay(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      } else {
        setTimeDisplay(`${event.date} ${event.time}`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event.date, event.time]);

  const handleAnalyze = async () => {
    setIsExpanded(!isExpanded);
    if (!analysis && event.impact === 'high') {
      setIsLoading(true);
      try {
        const result = await analyzeNews([event]);
        setAnalysis(result);
      } catch (error: any) {
        console.error("AI Analysis Error:", error);
        if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota')) {
          setAnalysis("AI Quota Exceeded. Please try again in a few minutes.");
        } else {
          setAnalysis("Failed to load analysis.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm rounded-xl bg-surface border-border">
      <div className="p-4 flex items-center gap-6 hover:bg-surface-muted transition-colors cursor-pointer" onClick={handleAnalyze}>
        <div className="w-32 font-bold text-text-primary text-sm">{timeDisplay}</div>
        <div className="w-20 font-bold flex items-center gap-2 text-sm text-text-secondary">{event.country} {event.currency}</div>
        <div className="w-16">
          <div className={`w-12 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-text-primary ${event.impact === 'high' ? 'bg-red-500' : event.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
            {event.impact.toUpperCase()}
          </div>
        </div>
        <div className="flex-1 font-bold text-text-primary text-sm flex items-center gap-2">
          {event.title}
          {event.impact === 'high' && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-black flex items-center gap-0.5"><Sparkles className="w-2 h-2" /> AI</span>}
        </div>
        <div className="w-20 text-right">
          <div className="text-[10px] text-text-muted font-bold uppercase">Actual</div>
          <div className="text-sm font-bold text-text-primary">{event.actual}</div>
        </div>
        <div className="w-20 text-right">
          <div className="text-[10px] text-text-muted font-bold uppercase">Forecast</div>
          <div className="text-sm font-bold text-text-secondary">{event.forecast}</div>
        </div>
        <div className="w-20 text-right">
          <div className="text-[10px] text-text-muted font-bold uppercase">Previous</div>
          <div className="text-sm font-bold text-text-secondary">{event.previous}</div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </div>
      {isExpanded && (
        <div className="p-4 bg-background border-t border-border text-sm text-text-secondary whitespace-pre-line">
          {isLoading ? 'AI Analyzing...' : analysis || 'Click to analyze'}
        </div>
      )}
    </Card>
  );
};

export const MarketPage = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState('Today');
  const timeFilters = ['Upcoming', 'Today', 'Tomorrow', 'This Week', 'All'];
  const [activeImpactFilter, setActiveImpactFilter] = useState('All');
  const impactFilters = ['All', 'High', 'Med', 'Low'];
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const response = await fetch('/api/economic-news');
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Time filter
    let timeMatch = true;
    if (activeTimeFilter === 'Today') timeMatch = event.date === today.toISOString().split('T')[0];
    else if (activeTimeFilter === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      timeMatch = event.date === tomorrow.toISOString().split('T')[0];
    }
    else if (activeTimeFilter === 'Upcoming') timeMatch = eventDate >= today;
    else if (activeTimeFilter === 'This Week') {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      timeMatch = eventDate >= today && eventDate <= endOfWeek;
    }
    
    // Impact filter
    const impactMatch = activeImpactFilter === 'All' || event.impact.toLowerCase() === activeImpactFilter.toLowerCase();
    
    return timeMatch && impactMatch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Economic Calendar</h1>
            <p className="text-text-secondary text-sm">Track high-impact economic events and news that move the markets</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <div className="flex items-center gap-1 px-2 py-1 bg-surface rounded border border-border">
              <Globe className="w-3 h-3" /> UTC GMT
            </div>
            <div className="flex items-center gap-1 text-green-400 bg-green-950 px-2 py-1 rounded border border-green-900">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE
            </div>
            <div className="text-text-muted">Updated 13:58:35</div>
          </div>
        </div>

        {/* Free Plan Banner */}
        <div className="bg-emerald-950 border border-emerald-900 rounded-lg p-3 flex items-center gap-2 text-emerald-200 text-xs mb-6">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          <p className="font-bold">Free plan: Limited to today's US events (High & Medium impact).</p>
        </div>

        {/* Data Disclaimer Note */}
        <div className="bg-yellow-950 border border-yellow-900 rounded-lg p-3 flex items-center gap-2 text-yellow-200 text-xs mb-6">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <p className="font-bold">Note: The data shown here is simulated for demonstration purposes and is not real-time market data.</p>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-lg p-2 flex items-center gap-2 mb-6 text-xs font-bold shadow-sm">
          <div className="flex gap-1">
            {timeFilters.map(f => (
              <button 
                key={f}
                onClick={() => setActiveTimeFilter(f)}
                className={`px-3 py-1.5 rounded transition-colors ${activeTimeFilter === f ? 'bg-white text-background' : 'text-text-secondary hover:bg-surface-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-surface-muted mx-2" />
          <div className="flex gap-1">
            {impactFilters.map(f => (
              <button 
                key={f}
                onClick={() => setActiveImpactFilter(f)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${activeImpactFilter === f ? 'bg-white text-background' : 'text-text-secondary hover:bg-surface-muted'}`}
              >
                {f !== 'All' && <div className={`w-2 h-2 rounded-full ${f === 'High' ? 'bg-red-500' : f === 'Med' ? 'bg-yellow-500' : 'bg-green-500'}`}/>}
                {f}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-surface-muted mx-2" />
          <button className="flex items-center gap-1 px-3 py-1.5 rounded border border-border text-text-secondary">🇺🇸 US Only <ChevronDown className="w-3 h-3"/></button>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 w-3 h-3 text-text-muted" />
            <input type="text" placeholder="Search events..." className="pl-7 pr-2 py-1.5 rounded border border-border bg-background text-text-primary w-full" />
          </div>
          <button className="p-1.5 text-text-secondary hover:bg-surface-muted rounded"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {/* Events List */}
        <div className="space-y-8">
          {activeTimeFilter === 'Today' ? (
            <>
              <div>
                <div className="px-1 text-xs font-bold text-text-muted mb-2">Upcoming Today (08/04/2026)</div>
                <div className="space-y-4">
                  {filteredEvents.filter(e => new Date(`${e.date}T${e.time}:00`) > new Date()).map((e: any) => (
                    <NewsCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
              <div>
                <div className="px-1 text-xs font-bold text-text-muted mb-2">Past Today (08/04/2026)</div>
                <div className="space-y-4">
                  {filteredEvents.filter(e => new Date(`${e.date}T${e.time}:00`) <= new Date()).map((e: any) => (
                    <NewsCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-1 text-xs font-bold text-text-muted">{activeTimeFilter}</div>
              <div className="space-y-4">
                {isLoadingEvents ? (
                  <div className="text-center p-4">Loading events...</div>
                ) : (
                  filteredEvents.map((e: any) => (
                    <NewsCard key={e.id} event={e} />
                  ))
                )}
              </div>
            </>
          )}
          <div className="p-4 text-center text-xs font-bold text-text-secondary">All events loaded</div>
        </div>
      </div>
    </div>
  );
};
