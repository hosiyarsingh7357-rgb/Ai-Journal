import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Camera, 
  Edit2, 
  Network, 
  RefreshCw, 
  XCircle, 
  Monitor, 
  Moon, 
  Sun, 
  Globe, 
  DollarSign, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { toggleTheme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/utils/cn';

export const SettingsPage = ({ onSync, isSyncing }: { onSync?: () => void, isSyncing?: boolean }) => {
  const { user, signOut } = useAuth();
  const [currency, setCurrency] = useState('USD ($)');
  const [language, setLanguage] = useState('English (US)');
  const [userData, setUserData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const handleToggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    toggleTheme();
  };

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setFullName(data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : '');
          if (data.settings) {
            setTheme(data.settings.theme || 'light');
            setCurrency(data.settings.currency || 'USD ($)');
            setLanguage(data.settings.language || 'English (US)');
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [user]);

  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Apply theme on load
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const names = fullName.split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        settings: {
          theme,
          currency,
          language,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });

      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      setIsEditingName(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus({ type: 'error', message: 'Failed to save settings.' });
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-12 no-scrollbar bg-background relative">
      {saveStatus && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg shadow-premium text-sm font-bold z-50 ${
          saveStatus.type === 'success' ? 'bg-status-success text-white' : 'bg-status-danger text-white'
        }`}>
          {saveStatus.message}
        </div>
      )}
      <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
        {/* Section 1: Profile & Identity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <h3 className="heading-3 mb-1">Profile Identity</h3>
            <p className="body-text leading-relaxed">Manage your public information and architectural workspace presence.</p>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-4 lg:p-6 shadow-premium">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-surface-muted flex items-center justify-center overflow-hidden border-2 border-brand-primary/30">
                    <img 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      src={user?.photoURL || "https://picsum.photos/seed/architect/200/200"} 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-brand-primary text-white p-2 rounded-lg shadow-premium hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <input
                        className="text-xl lg:text-2xl font-black text-text-primary tracking-tight bg-surface-muted border border-border rounded-lg px-2 py-1 outline-none focus:border-brand-primary/50"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <h4 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">{fullName}</h4>
                    )}
                    <button onClick={() => setIsEditingName(!isEditingName)} className="text-text-muted hover:text-text-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-text-secondary">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-status-success/20 text-status-success border border-status-success/30 uppercase tracking-widest">Premium Tier</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="label-text block ml-1">Full Name</label>
                  <input 
                    className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all text-text-primary placeholder-text-muted" 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-text block ml-1">Email Address</label>
                  <input 
                    className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all text-text-primary placeholder-text-muted opacity-70 cursor-not-allowed" 
                    type="email" 
                    readOnly
                    value={user?.email || ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Broker Connection */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <h3 className="heading-3 mb-1">Broker Integration</h3>
            <p className="body-text leading-relaxed">Direct API bridges to your MT4/MT5 trading terminals for real-time journal synchronization.</p>
          </div>
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl shadow-premium overflow-hidden">
              <div className="p-4 lg:p-6 bg-surface-muted border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                    <Network className="w-5 h-5 text-brand-primary" />
                  </div>
                  <span className="text-sm font-black text-text-primary uppercase tracking-widest">MetaTrader Bridge</span>
                </div>
                {userData?.mt5Credentials ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-bold border border-status-success/20">
                    <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-status-danger/10 text-status-danger text-xs font-bold border border-status-danger/20">
                    Disconnected
                  </div>
                )}
              </div>
              <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="label-text">Account ID</p>
                    <p className="font-mono text-sm font-medium text-text-primary">{userData?.mt5Credentials?.account || 'Not Connected'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="label-text">Server</p>
                    <p className="text-sm font-medium text-text-primary">{userData?.mt5Credentials?.broker || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-3">
                  <button 
                    onClick={onSync}
                    disabled={isSyncing || !userData?.mt5Credentials}
                    className="w-full bg-surface-muted hover:bg-surface text-text-primary py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                    {isSyncing ? 'Synchronizing...' : 'Synchronize Data'}
                  </button>
                  <button className="w-full border border-status-danger/30 text-status-danger hover:bg-status-danger/10 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Disconnect Broker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Interface & Experience */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <h3 className="heading-3 mb-1">Visual Architecture</h3>
            <p className="body-text leading-relaxed">Customize your workspace environment for optimal deep work focus.</p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-4 lg:p-6 shadow-premium space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-5 h-5 text-text-muted" />
                <span className="font-bold text-sm text-text-primary">Theme Engine</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleToggleTheme('light')}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${theme === 'light' ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary' : 'bg-surface border-border hover:bg-surface-muted text-text-secondary'}`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Light Mode</span>
                </button>
                <button 
                  onClick={() => handleToggleTheme('dark')}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary' : 'bg-surface border-border hover:bg-surface-muted text-text-secondary'}`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Dark Mode</span>
                </button>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 lg:p-6 shadow-premium space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-text-muted" />
                  <span className="font-bold text-sm text-text-primary">Regional Defaults</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="label-text block ml-1">Base Currency</label>
                    <div className="relative">
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none text-text-primary cursor-pointer"
                      >
                        <option className="bg-surface">USD ($)</option>
                        <option className="bg-surface">EUR (€)</option>
                        <option className="bg-surface">GBP (£)</option>
                        <option className="bg-surface">JPY (¥)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-text block ml-1">Language</label>
                    <div className="relative">
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none text-text-primary cursor-pointer"
                      >
                        <option className="bg-surface">English (US)</option>
                        <option className="bg-surface">German</option>
                        <option className="bg-surface">French</option>
                        <option className="bg-surface">Mandarin</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Security Protocols */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <h3 className="heading-3 mb-1">Security Vault</h3>
            <p className="body-text leading-relaxed">Advanced protection for your trading strategies and financial data.</p>
          </div>
          <div className="lg:col-span-2 glass rounded-2xl shadow-premium overflow-hidden">
            <div className="divide-y divide-border">
              <div className="p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-surface-muted border border-border rounded-xl h-fit shadow-sm">
                    <Lock className="w-5 h-5 text-text-muted" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Account Session</h4>
                    <p className="text-xs text-text-secondary font-medium mt-1">Manage your active session and security preferences.</p>
                  </div>
                </div>
                <button 
                  onClick={signOut}
                  className="text-status-danger text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
              <div className="p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-status-success/10 border border-status-success/20 rounded-xl h-fit shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-status-success" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Two-Factor Authentication</h4>
                    <p className="text-xs text-text-secondary font-medium mt-1">Biometric and Authenticator App verification active.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-status-success uppercase tracking-widest">Active</span>
                  <button className="w-10 h-5 bg-status-success rounded-full relative transition-colors shadow-inner">
                    <div className="w-3 h-3 bg-surface rounded-full absolute top-1 right-1 shadow-sm"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-border">
          <button className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">Discard Changes</button>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
