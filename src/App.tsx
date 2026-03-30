import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard'; 
import { SupportPage } from './components/SupportPage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { FeedbackPage } from './components/FeedbackPage';
import { SettingsPage } from './components/SettingsPage';
import { AnalysisPage } from './components/AnalysisPage';
import { MarketPage } from './components/MarketPage';
import { AIReportPage } from './components/AIReportPage';
import { PerformancePage } from './components/PerformancePage';
import { JournalPage } from './components/JournalPage';
import { TradesPage } from './components/TradesPage';
import { LandingPage } from './components/LandingPage';
import { MT5LoginModal } from './components/MT5LoginModal';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { useTrades } from './context/TradeContext';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  PieChart,
  RefreshCw,
  X
} from 'lucide-react';

import { useAuth } from './context/AuthContext';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const { user, loading, signIn, signUp, signInWithGoogle, signOut, verificationEmailSent, setVerificationEmailSent } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountConnected, setIsAccountConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { trades, addTrade, updateTrade, deleteTrade } = useTrades();
  const [accountName, setAccountName] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const account = doc.data().mt5Credentials?.account || '';
          setAccountName(account);
          setIsAccountConnected(!!account);
        }
      });
      return unsubscribe;
    }
  }, [user]);

  // Auto-connect if trades exist
  React.useEffect(() => {
    // Removed auto-connect logic
  }, []);

  const pageTitles: any = {
    dashboard: 'Dashboard',
    performance: 'Performance Analytics',
    trades: 'Execution History',
    journal: 'Trading Journal',
    analysis: 'Analysis',
    market: 'Market',
    'ai-report': 'AI Performance Intelligence',
    support: 'Support',
    subscription: 'Subscription',
    feedback: 'Feedback',
    settings: 'Settings'
  };

  // Removed theme logic

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleConnectAccount = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAccountConnected(true);
          setIsSyncing(false);
          
          // Add mock trades if none exist to simulate MT5 import
          if (trades.length === 0) {
            const mockTrades = [
              { symbol: 'XAUUSD', type: 'BUY', size: '1.00 Lots', entryPrice: '2015.50', exitPrice: '2035.20', pnl: '+$1,970.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 2).toISOString(), exitDate: new Date(Date.now() - 86400000 * 1.9).toISOString() },
              { symbol: 'EURUSD', type: 'SELL', size: '2.50 Lots', entryPrice: '1.0850', exitPrice: '1.0820', pnl: '+$750.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 5).toISOString(), exitDate: new Date(Date.now() - 86400000 * 4.8).toISOString() },
              { symbol: 'GBPUSD', type: 'BUY', size: '0.50 Lots', entryPrice: '1.2650', exitPrice: '1.2610', pnl: '-$200.00', isWinner: false, entryDate: new Date(Date.now() - 86400000 * 10).toISOString(), exitDate: new Date(Date.now() - 86400000 * 9.9).toISOString() },
              { symbol: 'NAS100', type: 'BUY', size: '0.10 Lots', entryPrice: '17850', exitPrice: '18100', pnl: '+$2,500.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 15).toISOString(), exitDate: new Date(Date.now() - 86400000 * 14.5).toISOString() },
              { symbol: 'BTCUSD', type: 'SELL', size: '0.05 Lots', entryPrice: '65000', exitPrice: '63500', pnl: '+$75.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 20).toISOString(), exitDate: new Date(Date.now() - 86400000 * 19.8).toISOString() },
              // Open Trades (Live)
              { symbol: 'ETHUSD', type: 'BUY', size: '1.00 Lots', entryPrice: '3500.00', pnl: '+$120.00', entryDate: new Date(Date.now() - 3600000).toISOString() },
              { symbol: 'SOLUSD', type: 'SELL', size: '10.00 Lots', entryPrice: '145.50', pnl: '-$45.00', entryDate: new Date(Date.now() - 7200000).toISOString() },
            ];
            mockTrades.forEach(t => addTrade(t as any));
          }
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard isConnected={isAccountConnected} />;
      case 'trades':
        return <TradesPage 
          isConnected={isAccountConnected} 
          onConnect={() => setIsLoginModalOpen(true)}
          onSync={handleConnectAccount}
          onManualTrade={(newTrade: any) => {
            addTrade(newTrade);
            setIsAccountConnected(true);
          }}
          isSyncing={isSyncing}
          tradesList={trades}
          onDeleteTrade={deleteTrade}
        />;
      case 'performance':
        return <PerformancePage tradesList={trades} onNavigate={setCurrentPage} />;
      case 'journal':
        return <JournalPage tradesList={trades} onUpdateTrade={updateTrade} />;
      case 'analysis':
        return <AnalysisPage tradesList={trades} />;
      case 'market':
        return <MarketPage />;
      case 'ai-report':
        return <AIReportPage tradesList={trades} />;
      case 'support':
        return <SupportPage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark">
        <BackgroundAnimation />
        <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (verificationEmailSent || (user && !user.emailVerified)) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark">
        <BackgroundAnimation />
        <div className="glass rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 w-full max-w-sm relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Ai Journal</h1>
          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-center text-sm">
            {verificationEmailSent 
              ? `We have sent you a verification email to ${email}. Please verify it and log in.`
              : `Your email is not verified. Please check your inbox for a verification email.`
            }
          </p>
          <button 
            onClick={() => {
              setVerificationEmailSent(false);
              setIsSignUp(false);
              signOut();
            }}
            className="bg-brand-primary hover:bg-brand-primary/90 transition-colors px-8 py-3 rounded-xl font-bold w-full shadow-lg shadow-brand-primary/20"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark overflow-hidden relative">
        <BackgroundAnimation />
        
        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-8 left-8 text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark flex items-center gap-2 font-bold transition-colors z-20"
        >
          <X className="w-5 h-5" /> Back to Home
        </button>

        <div className="glass rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center gap-8 w-full max-w-md relative z-10 border border-theme-border-light dark:border-theme-border-dark backdrop-blur-3xl">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Ai Journal</h1>
            <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-sm font-medium">{isSignUp ? 'Create your professional trading account' : 'Welcome back, Master your mind'}</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-status-danger/10 border border-status-danger/20 text-status-danger p-4 rounded-2xl text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-light dark:text-theme-text-secondary-dark ml-4">Email Address</label>
              <input
                type="email"
                placeholder="trader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-2xl px-5 py-4 text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder-theme-text-secondary-light dark:placeholder-theme-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-light dark:text-theme-text-secondary-dark ml-4">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-2xl px-5 py-4 text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder-theme-text-secondary-light dark:placeholder-theme-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-light dark:text-theme-text-secondary-dark ml-4">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-2xl px-5 py-4 text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder-theme-text-secondary-light dark:placeholder-theme-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleAuth}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-2xl font-black w-full shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
          </button>

          <div className="w-full flex items-center gap-4 py-2">
            <div className="h-px bg-theme-border-light dark:bg-theme-border-dark flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary-light dark:text-theme-text-secondary-dark">OR</span>
            <div className="h-px bg-theme-border-light dark:bg-theme-border-dark flex-1" />
          </div>

          <button
            onClick={signInWithGoogle}
            className="bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-all px-8 py-4 rounded-2xl font-black w-full shadow-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] border border-theme-border-light dark:border-theme-border-dark"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.3-4.74 3.3-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs font-bold hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New to AJ Journal? Create an account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark transition-colors duration-300">
      <div className="absolute inset-0 -z-10">
        <BackgroundAnimation />
      </div>
      <div className="relative z-10 flex h-screen overflow-hidden">
        {isSyncing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
            <div className="animate-spin w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-theme-bg-dark/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar 
          currentPage={currentPage} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={(id) => setCurrentPage(id)}
        />
        
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full min-w-0">
          <Header 
            title={pageTitles[currentPage] || 'Dashboard'}
            onMenuClick={toggleSidebar}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSync={handleConnectAccount}
            isSyncing={isSyncing}
            isAccountConnected={isAccountConnected}
            accountName={accountName}
            onLogout={signOut}
          />
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {renderPage()}
          </motion.div>
        </main>

        <MT5LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onSuccess={handleConnectAccount}
        />
      </div>
    </div>
  );
}

