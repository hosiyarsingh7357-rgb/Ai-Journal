import React, { useState } from 'react';
import { Card } from './ui/Card';
import { MessageSquare, Star, Send, Smile, Frown, Meh } from 'lucide-react';
import { cn } from '../lib/utils';

export const FeedbackPage = () => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="p-12 text-center max-w-md w-full shadow-premium border-brand-primary/20">
          <div className="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-premium">
            <Send className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-text-primary mb-4">Thank You!</h2>
          <p className="text-text-secondary font-medium mb-8 leading-relaxed">
            Your feedback helps us build a better trading experience for everyone. 
            We appreciate your time and insights.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full py-4 rounded-2xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-premium"
          >
            Send More Feedback
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">We Value Your <span className="text-brand-primary">Feedback</span></h1>
          <p className="text-xl text-text-secondary font-medium">
            Help us improve AI Journal by sharing your thoughts, suggestions, or reporting issues.
          </p>
        </div>

        <Card className="p-10 shadow-premium border-border">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block text-center">How would you rate your experience?</label>
              <div className="flex justify-center gap-6">
                {[
                  { icon: Frown, value: 1, label: 'Poor', color: 'text-status-danger' },
                  { icon: Meh, value: 2, label: 'Average', color: 'text-status-warning' },
                  { icon: Smile, value: 3, label: 'Great', color: 'text-status-success' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRating(item.value)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border-2",
                      rating === item.value 
                        ? "bg-surface border-brand-primary shadow-premium scale-110" 
                        : "bg-surface-muted border-transparent hover:border-border"
                    )}
                  >
                    <item.icon className={cn("w-10 h-10", rating === item.value ? item.color : "text-text-muted")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", rating === item.value ? "text-text-primary" : "text-text-muted")}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest block">What can we improve?</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience, suggest a feature, or report a bug..."
                className="w-full h-48 bg-surface-muted border border-border rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-text-primary placeholder:text-text-muted/70 resize-none"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={!rating || !feedback}
              className="w-full py-5 rounded-3xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-premium disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              Submit Feedback
            </button>
          </form>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          <div className="p-8 rounded-[2.5rem] bg-surface-muted border border-border flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-text-primary mb-2">Feature Requests</h4>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                Have a great idea? We love hearing from our users about what features would help them most.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-surface-muted border border-border flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-status-danger/10 text-status-danger flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-text-primary mb-2">Bug Reports</h4>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                Found something broken? Let us know and our engineering team will jump on it immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
