import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageSquareText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/utils/cn';
import { useTrades } from '../context/TradeContext';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournals } from '../services/journalService';
import { JournalEntry } from '@shared/types';

// Audio constants
const SAMPLE_RATE = 24000;
const CHUNK_SIZE = 2048;

export const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { trades } = useTrades();
  const { user } = useAuth();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  
  useEffect(() => {
    if (!user) {
      setJournals([]);
      return;
    }
    const unsubscribe = subscribeToJournals(user.uid, (data) => {
      setJournals(data);
    });
    return unsubscribe;
  }, [user]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize Audio Context
  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  // Convert Float32Array to Int16Array (PCM)
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  // Play PCM audio chunks
  const playNextChunk = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current || !audioContextRef.current) {
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const pcmData = audioQueueRef.current.shift()!;
    
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, SAMPLE_RATE);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x8000;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      isPlayingRef.current = false;
      playNextChunk();
    };
    
    source.start();
  }, []);

  const stopAssistant = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
  }, []);

  const startAssistant = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await initAudio();

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setError("Gemini API Key is missing. Please check your environment variables.");
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Calculate overall stats for context
      const parsePnL = (pnlStr: string | undefined): number => {
        if (!pnlStr) return 0;
        const clean = pnlStr.replace(/[^0-9.-]/g, '');
        return parseFloat(clean) || 0;
      };

      let totalPnL = 0;
      let wins = 0;
      let losses = 0;
      let winCount = 0;
      let lossCount = 0;
      let closedTrades = 0;
      let bestTrade = 0;
      let worstTrade = 0;

      trades.forEach(t => {
        const pnl = parsePnL(t.pnl);
        totalPnL += pnl;
        if (t.exitPrice) {
          closedTrades++;
          if (pnl > 0) {
            wins += pnl;
            winCount++;
            bestTrade = Math.max(bestTrade, pnl);
          } else if (pnl < 0) {
            losses += Math.abs(pnl);
            lossCount++;
            worstTrade = Math.min(worstTrade, pnl);
          }
        }
      });

      const winRate = closedTrades > 0 ? (winCount / closedTrades) * 100 : 0;
      const profitFactor = losses === 0 ? (wins > 0 ? 99 : 0) : wins / losses;
      const expectancy = closedTrades > 0 ? totalPnL / closedTrades : 0;
      const avgWin = winCount > 0 ? wins / winCount : 0;
      const avgLoss = lossCount > 0 ? losses / lossCount : 0;

      // Prepare context about trades and journals for the AI
      const tradeContext = trades.map(t => {
        const journal = journals.find(j => j.tradeId === t.id);
        return {
          symbol: t.symbol,
          type: t.type,
          pnl: t.pnl,
          entryDate: t.entryDate,
          exitDate: t.exitDate,
          status: t.exitPrice ? 'Closed' : 'Open',
          hasJournal: !!journal,
          journalDetails: journal ? {
            notes: journal.tradeNotes,
            emotions: journal.emotions,
            lessons: journal.lessonsLearned,
            rating: journal.rating,
            preAnalysis: journal.preTradeAnalysis,
            postReview: journal.postTradeReview
          } : null
        };
      });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction: `You are a helpful Trading AI Assistant for "Ai Journal". 
          Speak in natural, friendly Hindi (Hinglish is okay). 
          Use a warm, professional female voice.
          
          WEBSITE STRUCTURE & SECTIONS:
          1. Dashboard:
             - Top KPIs: Total P&L, Win Rate, Profit Factor, Expectancy.
             - Equity Curve: Balance growth chart.
             - Open Positions: Active trades.
             - Recent Activity: Last 5 trades.
             - Monthly P&L: Calendar view of the current month.
             - Top Performers: Best symbols (e.g., XAUUSD).
             - Quick Stats: Avg Win/Loss, Best/Worst trades.
             - AI Tips: Behavioral suggestions.
          
          2. Performance Analytics:
             - Equity & Drawdown: Growth vs Risk charts.
             - Session Analysis: Performance in Asian, London, and New York sessions.
             - Trading Calendar: Monthly P&L distribution.
             - Day Analysis: Performance by day of the week (Mon-Fri).
             - Symbol Breakdown: Profit/Loss per instrument.
          
          3. Trades & Journal:
             - Execution History: List of all trades with entry/exit prices, size, and P&L.
             - Journaling: Detailed notes, Emotions (Fear, Greed, Neutral, etc.), Lessons Learned, Ratings (1-5 stars), and Pre-trade/Post-trade reviews.
             - Analysis: AI-driven discipline scores (0-100) and quality metrics (Profitability, Execution, Journaling).

          4. Market:
             - Economic Calendar: High, Medium, and Low impact news events.
             - TradingView Charts: Real-time price action.

          5. AI Performance Intelligence:
             - Deep analysis of trading behavior and patterns.

          USER PERFORMANCE SUMMARY:
          - Total Trades: ${trades.length}
          - Total PnL: $${totalPnL.toFixed(2)}
          - Win Rate: ${winRate.toFixed(1)}%
          - Profit Factor: ${profitFactor.toFixed(2)}
          - Expectancy: $${expectancy.toFixed(2)}
          - Avg Win: $${avgWin.toFixed(2)}
          - Avg Loss: $${avgLoss.toFixed(2)}
          - Best Trade: $${bestTrade.toFixed(2)}
          - Worst Trade: $${worstTrade.toFixed(2)}
          - Closed Trades: ${closedTrades}
          - Open Positions: ${trades.length - closedTrades}

          FULL TRADE & JOURNAL DATA: ${JSON.stringify(tradeContext)}.
          
          Help the user analyze their performance across the entire website. You have access to ALL their trades and journal entries.
          If they ask about their journal, you can tell them exactly what they wrote on a specific day or for a specific trade.
          Identify patterns in their emotions (e.g., "You seem to get frustrated after a loss") or lessons learned. 
          Tell them which days or sessions they perform best in based on the trade history.
          Identify which symbols are their "money makers" and which are losing them money.
          Identify if they are following their checklists (discipline).
          Identify their best and worst trading days from the data.
          Keep responses concise, conversational, and deeply insightful.
          Always respond in natural Hindi/Hinglish as a warm, professional female assistant named Kore.`,
        },
        callbacks: {
          onopen: async () => {
            console.log("Live API Connection Opened");
            setIsConnecting(false);
            setIsActive(true);
            
            // Start capturing microphone
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              
              const source = audioContextRef.current!.createMediaStreamSource(stream);
              const processor = audioContextRef.current!.createScriptProcessor(CHUNK_SIZE, 1, 1);
              processorRef.current = processor;

              processor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = floatTo16BitPCM(inputData);
                const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
                });
              };

              source.connect(processor);
              processor.connect(audioContextRef.current!.destination);
            } catch (micErr) {
              console.error("Microphone Error:", micErr);
              setError("Could not access microphone. Please check permissions.");
              stopAssistant();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const pcmData = new Int16Array(bytes.buffer);
              audioQueueRef.current.push(pcmData);
              if (!isPlayingRef.current) playNextChunk();
            }

            // Handle transcription
            const text = message.serverContent?.modelTurn?.parts[0]?.text;
            if (text) setTranscript(prev => prev + ' ' + text);

            // Handle interruption
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setIsSpeaking(false);
            }
          },
          onerror: (err: any) => {
            console.error("Live API Error Details:", err);
            const errorMessage = err?.message || "Connection error. Please try again.";
            setError(errorMessage.includes("Permission denied") 
              ? "Permission denied: Please check your API key and microphone permissions." 
              : `Live API Error: ${errorMessage}`);
            stopAssistant();
          },
          onclose: () => {
            stopAssistant();
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start voice assistant:", err);
      setError("Could not access microphone or connect to AI.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => stopAssistant();
  }, [stopAssistant]);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-surface border border-brand-primary/20 p-4 rounded-2xl shadow-premium w-64 mb-2"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isSpeaking ? "bg-brand-primary" : "bg-status-success"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  {isSpeaking ? "AI Speaking..." : "Listening..."}
                </span>
              </div>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 hover:bg-surface-muted rounded-lg transition-colors text-text-secondary"
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="h-12 overflow-y-auto scrollbar-hide">
              <p className="text-xs text-text-primary italic">
                {transcript || "Sawal poochiye..."}
              </p>
            </div>

            {isSpeaking && (
              <div className="flex items-center justify-center gap-1 mt-3 h-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 16, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-brand-primary rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={isActive ? stopAssistant : startAssistant}
        disabled={isConnecting}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-premium transition-all duration-300 relative group",
          isActive 
            ? "bg-status-danger hover:bg-status-danger/90 scale-110" 
            : "bg-brand-primary hover:bg-brand-primary/90 hover:scale-110"
        )}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : isActive ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
        
        {!isActive && !isConnecting && (
          <div className="absolute right-full mr-4 px-3 py-1 bg-surface border border-brand-primary/20 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Voice Assistant</p>
          </div>
        )}

        {isActive && !isSpeaking && !isMuted && (
          <div className="absolute inset-0 rounded-full border-2 border-brand-primary animate-ping opacity-20" />
        )}
      </button>

      {error && (
        <div className="bg-status-danger/10 border border-status-danger/20 px-3 py-1 rounded-lg">
          <p className="text-[10px] font-bold text-status-danger">{error}</p>
        </div>
      )}
    </div>
  );
};
