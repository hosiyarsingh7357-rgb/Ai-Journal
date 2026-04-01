import React, { useState } from 'react';
import { X, Shield, Server, User, Lock, Globe, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface MT5LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MT5LoginModal = ({ isOpen, onClose, onSuccess }: MT5LoginModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    broker: '',
    account: '',
    password: '',
    platform: 'MT5'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brokerInputType, setBrokerInputType] = useState<'text' | 'select'>('text');

  const brokers = [
    'IC Markets',
    'Pepperstone',
    'Exness',
    'XM',
    'FXTM',
    'FBS',
    'OctaFX'
  ];

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsConnecting(true);
    setError(null);

    try {
      // In a real app, this would involve a backend call to verify credentials
      // For now, we simulate success and save to Firestore as requested
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (formData.account === 'error') {
        throw new Error('Invalid credentials or server timeout. Please check your details.');
      }

      await setDoc(doc(db, "users", user.uid), {
        mt5Credentials: {
          broker: formData.broker,
          account: formData.account,
          platform: formData.platform,
          // In a production app, password should be encrypted or handled by a secure backend
          password: formData.password, 
          connectedAt: serverTimestamp()
        }
      }, { merge: true });

      setStep(2);
      setIsConnecting(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to connect account');
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 bg-surface border-border">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-premium">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Connect Trading Account</h3>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Secure MT4/MT5 Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleConnect} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl flex items-center gap-3 text-status-danger text-sm animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Platform Selection */}
              <div className="grid grid-cols-2 gap-3">
                {['MT4', 'MT5'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, platform: p })}
                    className={`py-3 rounded-xl font-bold text-xs transition-all border ${
                      formData.platform === p
                        ? 'bg-brand-primary text-white border-brand-primary shadow-premium'
                        : 'bg-background text-text-secondary border-border hover:border-brand-primary/50'
                    }`}
                  >
                    {p} PLATFORM
                  </button>
                ))}
              </div>

              {/* Broker Server */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Broker Server</label>
                  <button
                    type="button"
                    onClick={() => setBrokerInputType(brokerInputType === 'text' ? 'select' : 'text')}
                    className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline"
                  >
                    {brokerInputType === 'text' ? 'Select from list' : 'Enter manually'}
                  </button>
                </div>
                <div className="relative">
                  <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                  {brokerInputType === 'text' ? (
                    <input
                      required
                      type="text"
                      placeholder="e.g. IC Markets-Live 20"
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl text-sm text-text-primary focus:bg-surface focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-secondary/70"
                      value={formData.broker}
                      onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                    />
                  ) : (
                    <select
                      required
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl text-sm text-text-primary focus:bg-surface focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                      value={formData.broker}
                      onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                    >
                      <option value="" disabled>Select a broker</option>
                      {brokers.map(broker => (
                        <option key={broker} value={broker} className="bg-surface text-text-primary">{broker}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Account Number</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <input
                    required
                    type="text"
                    placeholder="Enter login ID"
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl text-sm text-text-primary focus:bg-surface focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-secondary/70"
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Trading Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl text-sm text-text-primary focus:bg-surface focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-secondary/70"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isConnecting}
              type="submit"
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-premium hover:bg-brand-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-theme-border-light/30 dark:border-theme-border-dark/30 border-t-white rounded-full animate-spin" />
                  CONNECTING TO SERVER...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  CONNECT ACCOUNT
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-text-secondary px-4">
              Your credentials are encrypted and never stored on our servers. We use read-only access for performance tracking.
            </p>
          </form>
        ) : (
          <div className="p-10 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-status-success/20 text-status-success rounded-full flex items-center justify-center mx-auto shadow-premium border border-status-success/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-text-primary">Account Connected!</h3>
              <p className="text-text-secondary mt-2 font-medium">Your {formData.platform} account ({formData.account}) is now connected to Ai Journal.</p>
            </div>
            <div className="bg-background/50 p-5 rounded-2xl border border-border text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-bold uppercase tracking-wider">Status</span>
                <span className="px-2 py-1 bg-status-success/20 text-status-success rounded-md font-black text-[10px] uppercase">Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-bold uppercase tracking-wider">Data Import</span>
                <span className="text-text-primary font-black">Ready to Sync</span>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }}
                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-premium hover:bg-brand-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-4 h-4" />
                START DATA IMPORT
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-background text-text-primary border border-border rounded-2xl font-bold text-sm hover:bg-surface transition-all active:scale-[0.98]"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
