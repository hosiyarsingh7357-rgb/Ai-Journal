import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BackgroundAnimation } from '../components/BackgroundAnimation';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, signUp, signInWithGoogle, forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isForgotPassword) {
        await forgotPassword(email);
        setSuccess('Password reset email sent. Please check your inbox.');
      } else if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* <BackgroundAnimation /> */}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface/40 backdrop-blur-2xl border border-border rounded-[3rem] p-8 lg:p-12 shadow-premium">
          <div className="flex flex-col items-center text-center mb-10">
            <Logo size="lg" className="mb-6" />
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
              {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h1>
            <p className="text-text-secondary font-black uppercase tracking-widest text-[10px]">
              {isForgotPassword ? 'Enter your email to receive reset instructions.' : (isLogin ? 'Access your psychological trading edge.' : 'Start your journey to disciplined execution.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isForgotPassword && (
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      label="Full Name"
                      placeholder="Enter your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {!isForgotPassword && (
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            {error && (
              <p className="text-xs font-bold text-status-danger text-center bg-status-danger/10 p-3 rounded-xl border border-status-danger/20">
                {error}
              </p>
            )}
            
            {success && (
              <p className="text-xs font-bold text-status-success text-center bg-status-success/10 p-3 rounded-xl border border-status-success/20">
                {success}
              </p>
            )}

            <Button type="submit" className="w-full h-14 text-sm tracking-widest" disabled={loading}>
              {loading ? 'PROCESSING...' : (isForgotPassword ? 'SEND RESET EMAIL' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'))}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {!isForgotPassword && (
            <div className="mt-8">
              <div className="relative flex items-center gap-4 mb-8">
                <div className="h-px bg-border flex-1" />
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">OR CONTINUE WITH</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 bg-white/5"
                onClick={() => signInWithGoogle()}
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-3" alt="Google" />
                GOOGLE ACCOUNT
              </Button>
            </div>
          )}

          <div className="mt-10 text-center text-sm font-medium text-text-secondary">
            {isForgotPassword ? (
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-brand-primary font-black uppercase tracking-widest hover:underline"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {isLogin ? (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setIsForgotPassword(true)}
                      className="text-text-secondary hover:text-brand-primary text-xs uppercase tracking-widest"
                    >
                      Forgot Password?
                    </button>
                    <div>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-brand-primary font-black uppercase tracking-widest hover:underline"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-brand-primary font-black uppercase tracking-widest hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-text-secondary" />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">SECURE</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-text-secondary" />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">REAL-TIME</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-text-secondary" />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">AI POWERED</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
