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
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase tracking-widest">Diagnostic Report</span>
              <span className="text-slate-400 text-xs font-medium">AI Analysis</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">AI Performance Intelligence</h2>
            <p className="text-slate-400 mt-2 max-w-lg font-medium text-sm lg:text-base">Advanced algorithmic analysis of your trading behavior.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleGenerate}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
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
            <div className="col-span-12 lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-[0.15em] mb-8">Performance Grade</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-black text-blue-500 tracking-tighter">{report.grade}</span>
                </div>
              </div>
              {/* Abstract Deco */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
              <div className="mt-12 pt-8 border-t border-white/10 border-dashed relative z-10">
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  {report.summary}
                </p>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Strengths Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Core Strengths</h3>
                </div>
                <ul className="space-y-4">
                  {report.strengths?.map((item: any, i: number) => (
                    <li key={i} className="p-4 bg-slate-800/50 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-white">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Growth Areas</h3>
                </div>
                <ul className="space-y-4">
                  {report.weaknesses?.map((item: any, i: number) => (
                    <li key={i} className="p-4 bg-slate-800/50 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-white">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Tips */}
            <div className="col-span-12 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Actionable Intelligence Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {report.actionPlan?.map((item: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {(item.priority || '').toLowerCase().includes('immediate') ? <Zap className="w-4 h-4 text-blue-400" /> : 
                       (item.priority || '').toLowerCase().includes('strategic') ? <TrendingUp className="w-4 h-4 text-blue-400" /> : 
                       <Target className="w-4 h-4 text-blue-400" />}
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.priority || 'General Goal'}</span>
                    </div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <BrainCircuit className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Report Generated</h3>
            <p className="text-slate-400 text-center max-w-md">Click the "Generate AI Report" button above to analyze your trading history and receive personalized insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};
