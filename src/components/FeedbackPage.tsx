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
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

const resolvedBuilds = [
  {
    type: 'Feature Shipped',
    title: 'Enhanced Monte Carlo Simulation API',
    description: 'Integrated high-concurrency request handling for complex risk modeling as suggested by Architect Alpha-9.',
    time: '2 days ago',
    build: 'Build 4.2.0.1',
    icon: Zap,
    color: 'text-status-success',
    bgColor: 'bg-status-success/10'
  },
  {
    type: 'Bug Patched',
    title: 'Z-Index Conflict on Modal Overlays',
    description: 'Fixed an issue where the asset selector was rendering beneath the main chart glassmorphism layer.',
    time: '5 days ago',
    build: 'Hotfix 4.1.9.8',
    icon: Bug,
    color: 'text-status-danger',
    bgColor: 'bg-status-danger/10'
  },
  {
    type: 'Optimization',
    title: 'Dark Mode Contrast Ratio Lift',
    description: 'Enhanced readability for low-light trading sessions by adjusting surface elevation tokens.',
    time: '1 week ago',
    build: 'Build 4.1.9.0',
    icon: CheckCircle2,
    color: 'text-theme-accent',
    bgColor: 'bg-theme-accent/10',
    opacity: 'opacity-70'
  }
];

export const FeedbackPage = () => {
  const [rating, setRating] = useState(4);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-12 no-scrollbar">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 lg:mb-12">
          <h1 className="heading-1 mb-2">Architect's Feedback</h1>
          <p className="body-text max-w-2xl text-base lg:text-lg">
            Help us refine the blueprint. Your technical insights directly influence the next build of the Financial Architect ecosystem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* Feedback Form Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <Card className="p-6 lg:p-8 shadow-premium">
              <form className="space-y-6 lg:space-y-8" onSubmit={(e) => e.preventDefault()}>
                {/* Category & Rating Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-3">
                    <label className="label-text block ml-1">Category</label>
                    <select className="w-full bg-background border border-border rounded-xl p-3 text-text-primary focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none appearance-none cursor-pointer transition-all">
                      <option className="bg-background text-text-primary">Feature Request</option>
                      <option className="bg-background text-text-primary">Bug Report</option>
                      <option className="bg-background text-text-primary">General Feedback</option>
                      <option className="bg-background text-text-primary">UI/UX Improvement</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="label-text block ml-1">Experience Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setRating(star)}
                          className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all border ${
                            star <= rating 
                              ? 'bg-brand-primary border-brand-primary text-white shadow-premium' 
                              : 'bg-surface border-border text-text-muted hover:bg-surface-muted'
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
                  <label className="label-text block ml-1">Detailed Observations</label>
                  <div className="relative rounded-xl overflow-hidden border border-border bg-background">
                    <div className="flex gap-2 p-2 bg-surface-muted border-b border-border">
                      <button className="p-1.5 hover:bg-background rounded transition-all text-text-secondary hover:text-text-primary" type="button"><Bold className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-background rounded transition-all text-text-secondary hover:text-text-primary" type="button"><Italic className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-background rounded transition-all text-text-secondary hover:text-text-primary" type="button"><LinkIcon className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-background rounded transition-all ml-auto text-text-secondary hover:text-text-primary" type="button"><Code className="w-4 h-4" /></button>
                    </div>
                    <textarea 
                      className="w-full bg-transparent border-none p-4 text-text-primary placeholder:text-text-muted/50 focus:ring-0 outline-none resize-y min-h-[150px]" 
                      placeholder="Provide a detailed architectural breakdown of your suggestion..." 
                    ></textarea>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-3">
                  <label className="label-text block ml-1">Evidence & Screenshots</label>
                  <div className="border-2 border-dashed border-border rounded-2xl bg-background p-6 lg:p-10 flex flex-col items-center justify-center transition-all hover:bg-surface hover:border-brand-primary/50 group cursor-pointer">
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform border border-brand-primary/20">
                      <CloudUpload className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>
                    <p className="font-semibold text-text-primary mb-1 text-center">Drop architectural assets here</p>
                    <p className="text-xs text-text-muted">PNG, JPG or PDF up to 10MB</p>
                    <input className="hidden" id="file-upload" type="file" />
                    <label className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold text-sm rounded-xl cursor-pointer hover:opacity-90 transition-colors shadow-premium" htmlFor="file-upload">
                      Browse Files
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                  <button className="w-full sm:w-auto bg-brand-primary text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-premium hover:scale-[1.02] transition-transform active:scale-95 border border-brand-primary/30" type="submit">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Recently Resolved Column */}
          <div className="space-y-8">
            <Card className="p-6 space-y-6 shadow-premium">
              <div className="flex items-center justify-between">
                <h3 className="heading-3">Resolved Builds</h3>
                <CheckCircle2 className="w-5 h-5 text-status-success" />
              </div>
              <div className="space-y-6">
                {resolvedBuilds.map((item) => (
                  <div key={item.build} className={cn(
                    "bg-background rounded-xl p-5 shadow-sm space-y-3 border border-border transition-all hover:bg-surface-muted",
                    item.opacity
                  )}>
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                        item.type === 'Bug Patched' 
                          ? 'bg-status-danger/10 text-status-danger border-status-danger/20' 
                          : 'bg-status-success/10 text-status-success border-status-success/20'
                      )}>
                        {item.type}
                      </span>
                      <span className="text-xs text-text-muted font-medium">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-sm leading-tight text-text-primary">{item.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center",
                        item.type === 'Bug Patched' ? 'bg-status-danger/10' : 'bg-status-success/10'
                      )}>
                        <item.icon className={cn(
                          "w-3 h-3",
                          item.type === 'Bug Patched' ? 'text-status-danger' : 'text-status-success'
                        )} />
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{item.build}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-sm font-bold text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-brand-primary/30">
                View Full Changelog
                <ArrowRight className="w-4 h-4" />
              </button>
            </Card>

            {/* User Trust CTA */}
            <div className="bg-brand-primary/10 p-6 rounded-2xl text-text-primary relative overflow-hidden group border border-brand-primary/20 shadow-premium">
              <div className="relative z-10">
                <h3 className="heading-3 mb-2">Architect Rewards</h3>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">Top contributors receive priority access to Alpha builds and custom workspace skins.</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-surface overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/30/30`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold text-brand-primary">+120 Active Contributors</div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-brand-primary">
                <Award className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
