import React, { useState } from 'react';
import { 
  Star, 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Code, 
  CloudUpload, 
  CheckCircle2, 
  Zap, 
  Bug, 
  ArrowRight, 
  Award
} from 'lucide-react';

const resolvedBuilds = [
  {
    type: 'Feature Shipped',
    title: 'Enhanced Monte Carlo Simulation API',
    description: 'Integrated high-concurrency request handling for complex risk modeling as suggested by Architect Alpha-9.',
    time: '2 days ago',
    build: 'Build 4.2.0.1',
    icon: Zap,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50'
  },
  {
    type: 'Bug Patched',
    title: 'Z-Index Conflict on Modal Overlays',
    description: 'Fixed an issue where the asset selector was rendering beneath the main chart glassmorphism layer.',
    time: '5 days ago',
    build: 'Hotfix 4.1.9.8',
    icon: Bug,
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  {
    type: 'Optimization',
    title: 'Dark Mode Contrast Ratio Lift',
    description: 'Enhanced readability for low-light trading sessions by adjusting surface elevation tokens.',
    time: '1 week ago',
    build: 'Build 4.1.9.0',
    icon: CheckCircle2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    opacity: 'opacity-70'
  }
];

export const FeedbackPage = () => {
  const [rating, setRating] = useState(4);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-12 no-scrollbar">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 lg:mb-12">
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">Architect's Feedback</h1>
          <p className="text-slate-400 max-w-2xl text-base lg:text-lg">
            Help us refine the blueprint. Your technical insights directly influence the next build of the Financial Architect ecosystem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* Feedback Form Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/10 transition-all">
              <form className="space-y-6 lg:space-y-8" onSubmit={(e) => e.preventDefault()}>
                {/* Category & Rating Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">Category</label>
                    <select className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer outline-none appearance-none">
                      <option className="bg-slate-900 text-white">Feature Request</option>
                      <option className="bg-slate-900 text-white">Bug Report</option>
                      <option className="bg-slate-900 text-white">General Feedback</option>
                      <option className="bg-slate-900 text-white">UI/UX Improvement</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">Experience Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setRating(star)}
                          className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all border ${
                            star <= rating ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                          }`} 
                          type="button"
                        >
                          <Star className="w-5 h-5" fill={star <= rating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment Area */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">Detailed Observations</label>
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-800/30">
                    <div className="flex gap-2 p-2 bg-slate-800/50 border-b border-white/10">
                      <button className="p-1.5 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-white" type="button"><Bold className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-white" type="button"><Italic className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-white" type="button"><LinkIcon className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-all ml-auto text-slate-400 hover:text-white" type="button"><Code className="w-4 h-4" /></button>
                    </div>
                    <textarea 
                      className="w-full bg-transparent border-none p-4 text-white placeholder:text-slate-500 focus:ring-0 outline-none resize-y min-h-[150px]" 
                      placeholder="Provide a detailed architectural breakdown of your suggestion..." 
                    ></textarea>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">Evidence & Screenshots</label>
                  <div className="border-2 border-dashed border-white/20 rounded-2xl bg-white/5 p-6 lg:p-10 flex flex-col items-center justify-center transition-all hover:bg-white/10 hover:border-blue-500/50 group cursor-pointer">
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform border border-blue-500/30">
                      <CloudUpload className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>
                    <p className="font-semibold text-white mb-1 text-center">Drop architectural assets here</p>
                    <p className="text-xs text-slate-400">PNG, JPG or PDF up to 10MB</p>
                    <input className="hidden" id="file-upload" type="file" />
                    <label className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20" htmlFor="file-upload">
                      Browse Files
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                  <button className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/50 hover:scale-[1.02] transition-transform active:scale-95 border border-blue-500/30" type="submit">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Recently Resolved Column */}
          <div className="space-y-8">
            <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 space-y-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-white">Resolved Builds</h3>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-6">
                {resolvedBuilds.map((item, i) => (
                  <div key={i} className={`bg-white/5 rounded-xl p-5 shadow-sm space-y-3 border border-white/10 transition-all hover:bg-white/10 ${item.opacity || ''}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        item.type === 'Bug Patched' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-sm leading-tight text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <div className={`h-5 w-5 rounded-full ${item.type === 'Bug Patched' ? 'bg-red-500/20' : 'bg-emerald-500/20'} flex items-center justify-center`}>
                        <item.icon className={`w-3 h-3 ${item.type === 'Bug Patched' ? 'text-red-400' : 'text-emerald-400'}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{item.build}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-sm font-bold text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-blue-500/30">
                View Full Changelog
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>

            {/* User Trust CTA */}
            <div className="bg-blue-600/20 backdrop-blur-xl p-6 rounded-2xl text-white relative overflow-hidden group border border-blue-500/30 shadow-2xl">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2 text-white">Architect Rewards</h3>
                <p className="text-xs text-blue-200 mb-4 leading-relaxed">Top contributors receive priority access to Alpha builds and custom workspace skins.</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-blue-900 bg-blue-800 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/30/30`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold text-blue-300">+120 Active Contributors</div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform text-blue-400">
                <Award className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
