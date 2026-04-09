import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { BrainCircuit, Sparkles, Zap, Shield, Globe, ArrowRight, RefreshCw } from 'lucide-react';
import { generateAIReport } from '../services/ai';
import { Trade } from '../types';

interface AIReportData {
  sahi: string;
  galt: string;
  dhyan: string;
}

export const AIReportPage = ({ tradesList = [] }: { tradesList?: Trade[] }) => {
  const [report, setReport] = useState<AIReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (tradesList.length === 0) return;
    setIsLoading(true);
    try {
      const res = await generateAIReport(tradesList, true, true);
      if (res && res.trim()) {
        try {
          let cleanRes = res;
          if (typeof res === 'string') {
            // Strip markdown code blocks if present
            cleanRes = res.replace(/```json\n?|```/g, '').trim();
          }
          const parsed = typeof cleanRes === 'string' ? JSON.parse(cleanRes) : cleanRes;
          setReport({
            sahi: parsed.sahi || "",
            galt: parsed.galt || "",
            dhyan: parsed.dhyan || ""
          });
        } catch (e) {
          console.error("Failed to parse AI report JSON:", e);
          // Fallback if AI returns plain text despite instructions
          setReport({
            sahi: res,
            galt: "",
            dhyan: ""
          });
        }
      }
    } catch (error) {
      console.error("AI Report Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tradesList.length > 0 && !report) {
      handleGenerateReport();
    }
  }, [tradesList]);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter">AI Performance <span className="text-status-success">Intelligence</span></h1>
            <p className="text-xl text-text-secondary font-medium mt-2">Advanced psychological analysis and pattern detection.</p>
          </div>
          <button 
            onClick={handleGenerateReport}
            disabled={isLoading || tradesList.length === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-status-success text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-premium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            REGENERATE ANALYSIS
          </button>
        </div>

        {tradesList.length === 0 ? (
          <Card className="p-20 text-center space-y-6 border-dashed border-2">
            <div className="w-24 h-24 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto shadow-premium">
              <BrainCircuit className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-primary">No Data to Analyze</h3>
              <p className="text-text-secondary font-medium max-w-md mx-auto">
                Add some trades to your journal to unlock AI-powered psychological insights and performance intelligence.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <Card className="p-12 relative overflow-hidden group border-status-success/30 bg-surface shadow-premium">
                <div className="absolute top-0 right-0 w-96 h-96 bg-status-success/5 blur-[120px] -mr-48 -mt-48 rounded-full group-hover:bg-status-success/10 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-status-success text-white flex items-center justify-center shadow-premium">
                      <BrainCircuit className="w-7 h-7" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-status-success">Executive Summary</h3>
                  </div>
                  {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                      <div className="h-6 w-full bg-surface-muted rounded-full" />
                      <div className="h-6 w-5/6 bg-surface-muted rounded-full" />
                      <div className="h-6 w-4/6 bg-surface-muted rounded-full" />
                    </div>
                  ) : report ? (
                    <div className="space-y-8">
                      <div className="p-6 rounded-2xl bg-status-success/5 border border-status-success/20">
                        <h4 className="text-sm font-black text-status-success uppercase tracking-widest mb-3">KYA SAHI HUAA</h4>
                        <p className="text-lg font-bold text-text-primary leading-relaxed">
                          {report.sahi || "No specific strengths identified for this period."}
                        </p>
                      </div>
                      
                      <div className="p-6 rounded-2xl bg-status-danger/5 border border-status-danger/20">
                        <h4 className="text-sm font-black text-status-danger uppercase tracking-widest mb-3">KYA GALT HUAA</h4>
                        <p className="text-lg font-bold text-text-primary leading-relaxed">
                          {report.galt || "No specific mistakes identified for this period."}
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/20">
                        <h4 className="text-sm font-black text-brand-primary uppercase tracking-widest mb-3">KIS PAR DHYAN DENA CHAHIYE</h4>
                        <p className="text-lg font-bold text-text-primary leading-relaxed">
                          {report.dhyan || "Continue following your current trading plan."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-text-primary leading-relaxed">
                      Analyzing your trading data... This may take a few moments.
                    </p>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 group hover:border-status-success/30">
                  <div className="w-12 h-12 rounded-2xl bg-status-success/10 text-status-success flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-text-primary mb-2">Strengths</h4>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    Your execution on XAUUSD during New York session shows exceptional discipline and high win-rate.
                  </p>
                </Card>
                <Card className="p-8 group hover:border-status-danger/30">
                  <div className="w-12 h-12 rounded-2xl bg-status-danger/10 text-status-danger flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-text-primary mb-2">Risks</h4>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    Tendency to over-leverage after a loss. Risk management protocols are often ignored in recovery mode.
                  </p>
                </Card>
              </div>
            </div>

            <div className="space-y-8">
              <Card className="p-8 bg-surface border border-status-success/20 shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-status-success/5 blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-status-success" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Actionable Steps</h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      'Implement a 30-minute cooling-off period after any loss.',
                      'Reduce position size by 50% on Fridays.',
                      'Set a daily maximum loss limit of 2% of account equity.',
                      'Review your journal entries before every trading session.'
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center text-[10px] font-black flex-shrink-0 group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <p className="text-xs font-bold text-text-primary leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-10 py-4 rounded-2xl bg-status-success text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-premium">
                    Download PDF Report
                  </button>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Market Sentiment</h3>
                </div>
                <div className="space-y-4">
                  {['XAUUSD', 'EURUSD', 'NAS100'].map((symbol) => (
                    <div key={symbol} className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted border border-border">
                      <span className="text-xs font-black text-text-primary">{symbol}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-status-success w-2/3" />
                        </div>
                        <span className="text-[10px] font-black text-status-success">BULLISH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
