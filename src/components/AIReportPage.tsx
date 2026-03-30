import React, { useState } from 'react';
import { 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  TrendingUp,
  Zap,
  Target,
  BrainCircuit
} from 'lucide-react';
import { generateAIReport } from "../services/ai";

import { Card } from './ui/Card';

export const AIReportPage = ({ tradesList }: { tradesList: any[] }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (tradesList && tradesList.length > 0) {
      handleGenerate(false); // Try to load from cache first
    }
  }, [tradesList]);

  const handleGenerate = async (force = true) => {
    setLoading(true);
    try {
      const res = await generateAIReport(tradesList, force);
      if (res) {
        setReport(JSON.parse(res));
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setReport(null);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded uppercase tracking-widest">Diagnostic Report</span>
              <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs font-medium">AI Analysis</span>
            </div>
            <h2 className="heading-1">AI Performance Intelligence</h2>
            <p className="body-text mt-2 max-w-lg">Advanced algorithmic analysis of your trading behavior.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleGenerate}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-glow-primary"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{loading ? "Analyzing..." : "Generate AI Report"}</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        {report ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Grade Card */}
            <Card className="col-span-12 lg:col-span-4 p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="label-text mb-8">Performance Grade</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-black text-brand-primary tracking-tighter">{report.grade}</span>
                </div>
              </div>
              {/* Abstract Deco */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl opacity-50"></div>
              <div className="mt-12 pt-8 border-t border-theme-border-light dark:border-theme-border-dark border-dashed relative z-10">
                <p className="body-text">
                  {report.summary}
                </p>
              </div>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Strengths Card */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-status-success/20 flex items-center justify-center text-status-success">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="heading-3">Core Strengths</h3>
                </div>
                <ul className="space-y-4">
                  {report.strengths?.map((item: any, i: number) => (
                    <li key={i} className="p-4 bg-theme-surface-light/50 dark:bg-theme-surface-dark/50 rounded-xl flex items-start gap-3 border border-theme-border-light dark:border-theme-border-dark">
                      <CheckCircle2 className="w-5 h-5 text-status-success mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">{item.title}</p>
                        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1 font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Weaknesses Card */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-status-danger/20 flex items-center justify-center text-status-danger">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="heading-3">Growth Areas</h3>
                </div>
                <ul className="space-y-4">
                  {report.weaknesses?.map((item: any, i: number) => (
                    <li key={i} className="p-4 bg-theme-surface-light/50 dark:bg-theme-surface-dark/50 rounded-xl flex items-start gap-3 border border-theme-border-light dark:border-theme-border-dark">
                      <AlertTriangle className="w-5 h-5 text-status-danger mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">{item.title}</p>
                        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1 font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Actionable Tips */}
            <Card className="col-span-12 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="heading-2">Actionable Intelligence Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {report.actionPlan?.map((item: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {(item.priority || '').toLowerCase().includes('immediate') ? <Zap className="w-4 h-4 text-brand-primary" /> : 
                       (item.priority || '').toLowerCase().includes('strategic') ? <TrendingUp className="w-4 h-4 text-brand-primary" /> : 
                       <Target className="w-4 h-4 text-brand-primary" />}
                      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{item.priority || 'General Goal'}</span>
                    </div>
                    <h4 className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">{item.title}</h4>
                    <p className="body-text">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-20">
            <BrainCircuit className="w-16 h-16 text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-4" />
            <h3 className="heading-3 mb-2">No Report Generated</h3>
            <p className="body-text text-center max-w-md">Click the "Generate AI Report" button above to analyze your trading history and receive personalized insights.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
