import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard'; 
import { SupportPage } from './components/SupportPage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { FeedbackPage } from './components/FeedbackPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { MarketPage } from './pages/MarketPage';
import { AIReportPage } from './components/AIReportPage';
import { PerformancePage } from './pages/PerformancePage';
import { JournalPage } from './pages/JournalPage';
import { TradesPage } from './pages/TradesPage';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { MT5LoginModal } from './components/MT5LoginModal';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { useTrades } from './context/TradeContext';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAppStore } from './store/useAppStore';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

export default function App() {
  const { user, loading, signOut, verificationEmailSent, setVerificationEmailSent } = useAuth();
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    setSidebarOpen, 
    isLoading: isAppLoading, 
    setIsLoading,
    theme,
    setTheme
  } = useAppStore();

  const [isAccountConnected, setIsAccountConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { trades, addTrade, updateTrade, deleteTrade } = useTrades();
  const [accountName, setAccountName] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);

  // Sync theme with document
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
  }, [setTheme]);

  useEffect(() => {
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

  const handleConnectAccount = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAccountConnected(true);
          setIsSyncing(false);
          
          if (trades.length === 0) {
            const mockTrades = [
              { symbol: 'XAUUSD', type: 'BUY', size: '1.00 Lots', entryPrice: '2015.50', exitPrice: '2035.20', pnl: '+$1,970.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 2).toISOString(), exitDate: new Date(Date.now() - 86400000 * 1.9).toISOString() },
              { symbol: 'EURUSD', type: 'SELL', size: '2.50 Lots', entryPrice: '1.0850', exitPrice: '1.0820', pnl: '+$750.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 5).toISOString(), exitDate: new Date(Date.now() - 86400000 * 4.8).toISOString() },
              { symbol: 'GBPUSD', type: 'BUY', size: '0.50 Lots', entryPrice: '1.2650', exitPrice: '1.2610', pnl: '-$200.00', isWinner: false, entryDate: new Date(Date.now() - 86400000 * 10).toISOString(), exitDate: new Date(Date.now() - 86400000 * 9.9).toISOString() },
              { symbol: 'NAS100', type: 'BUY', size: '0.10 Lots', entryPrice: '17850', exitPrice: '18100', pnl: '+$2,500.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 15).toISOString(), exitDate: new Date(Date.now() - 86400000 * 14.5).toISOString() },
              { symbol: 'BTCUSD', type: 'SELL', size: '0.05 Lots', entryPrice: '65000', exitPrice: '63500', pnl: '+$75.00', isWinner: true, entryDate: new Date(Date.now() - 86400000 * 20).toISOString(), exitDate: new Date(Date.now() - 86400000 * 19.8).toISOString() },
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
        return <div className="p-8 text-center body-text">Page Not Found</div>;
    }
  };

  if (loading || isAppLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-text-primary">
        <BackgroundAnimation />
        <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (verificationEmailSent || (user && !user.emailVerified)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-text-primary">
        <BackgroundAnimation />
        <Card className="p-8 flex flex-col items-center gap-6 w-full max-w-sm relative z-10 text-center" hoverable={false}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Ai Journal</h1>
          <p className="text-text-secondary">
            {verificationEmailSent 
              ? `We have sent you a verification email. Please verify it and log in.`
              : `Your email is not verified. Please check your inbox for a verification email.`
            }
          </p>
          <Button 
            onClick={() => {
              setVerificationEmailSent(false);
              signOut();
            }}
            className="w-full h-12 rounded-xl"
          >
            Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-background text-text-primary transition-colors duration-300">
      <div className="absolute inset-0 -z-10">
        <BackgroundAnimation />
      </div>
      <div className="relative z-10 flex h-screen overflow-hidden">
        {isSyncing && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/60 z-50 backdrop-blur-sm">
            <div className="animate-spin w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar 
          currentPage={currentPage} 
          onNavigate={(id) => setCurrentPage(id)}
        />
        
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full min-w-0">
          <Header 
            title={pageTitles[currentPage] || 'Dashboard'}
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

