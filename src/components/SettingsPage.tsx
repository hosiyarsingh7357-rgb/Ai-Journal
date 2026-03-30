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
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const SettingsPage = ({ theme, setTheme }: { theme: string, setTheme: (theme: string) => void }) => {
  const { user, signOut } = useAuth();
  const [currency, setCurrency] = useState('USD ($)');
  const [language, setLanguage] = useState('English (US)');
  const [userData, setUserData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setFullName(data.displayName || user?.displayName || '');
        if (data.settings) {
          setTheme(data.settings.theme || 'light');
          setCurrency(data.settings.currency || 'USD ($)');
          setLanguage(data.settings.language || 'English (US)');
        }
      }
    };
    fetchUserData();
  }, [user]);

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
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: fullName,
        settings: {
          theme,
          currency,
          language,
          updatedAt: serverTimestamp()
        }
      }, { merge: true });
      alert('Settings saved successfully!');
      setIsEditingName(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-12 no-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
        {/* Section 1: Profile & Identity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-1">Profile Identity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Manage your public information and architectural workspace presence.</p>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-4 lg:p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-blue-500/30">
                    <img 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      src={user?.photoURL || "https://picsum.photos/seed/architect/200/200"} 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <input
                        className="text-xl font-bold text-white bg-white/5 border border-white/10 rounded-lg px-2 py-1"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    ) : (
                      <h4 className="text-xl font-bold text-white">{fullName}</h4>
                    )}
                    <button onClick={() => setIsEditingName(!isEditingName)} className="text-slate-400 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">Premium Tier</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder-slate-500" 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder-slate-500" 
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
            <h3 className="text-lg font-bold text-white mb-1">Broker Integration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Direct API bridges to your MT4/MT5 trading terminals for real-time journal synchronization.</p>
          </div>
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 lg:p-6 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <Network className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-bold text-white">MetaTrader Bridge</span>
                </div>
                {userData?.mt5Credentials ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                    Disconnected
                  </div>
                )}
              </div>
              <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account ID</p>
                    <p className="font-mono text-sm font-medium text-white">{userData?.mt5Credentials?.account || 'Not Connected'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server</p>
                    <p className="text-sm font-medium text-white">{userData?.mt5Credentials?.broker || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-3">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/10">
                    <RefreshCw className="w-4 h-4" />
                    Synchronize Data
                  </button>
                  <button className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
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
            <h3 className="text-lg font-bold text-white mb-1">Visual Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Customize your workspace environment for optimal deep work focus.</p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-4 lg:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-sm text-white">Theme Engine</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/20 border border-blue-500/50">
                  <Sun className="w-6 h-6 text-slate-500" />
                  <span className="text-xs font-bold text-slate-300">Light Mode (Default)</span>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 lg:p-6 shadow-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-sm text-white">Regional Defaults</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Currency</label>
                    <div className="relative">
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-white"
                      >
                        <option className="bg-slate-900">USD ($)</option>
                        <option className="bg-slate-900">EUR (€)</option>
                        <option className="bg-slate-900">GBP (£)</option>
                        <option className="bg-slate-900">JPY (¥)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Language</label>
                    <div className="relative">
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none text-white"
                      >
                        <option className="bg-slate-900">English (US)</option>
                        <option className="bg-slate-900">German</option>
                        <option className="bg-slate-900">French</option>
                        <option className="bg-slate-900">Mandarin</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
            <h3 className="text-lg font-bold text-white mb-1">Security Vault</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Advanced protection for your trading strategies and financial data.</p>
          </div>
          <div className="lg:col-span-2 glass rounded-2xl shadow-2xl overflow-hidden">
            <div className="divide-y divide-white/10">
              <div className="p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-xl h-fit">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Account Session</h4>
                    <p className="text-xs text-slate-400 mt-1">Manage your active session and security preferences.</p>
                  </div>
                </div>
                <button 
                  onClick={signOut}
                  className="text-red-400 text-xs font-bold hover:underline flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
              <div className="p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl h-fit">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 mt-1">Biometric and Authenticator App verification active.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative transition-colors">
                    <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/10">
          <button className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Discard Changes</button>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
