import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface AuthPageProps {
  onBack: () => void;
}

export const AuthPage = ({ onBack }: AuthPageProps) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text-primary overflow-hidden relative">
      <BackgroundAnimation />
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-text-secondary hover:text-text-primary flex items-center gap-2 font-bold transition-colors z-20"
      >
        <X className="w-5 h-5" /> Back to Home
      </button>

      <Card className="w-full max-w-md relative z-10 border border-border backdrop-blur-3xl p-10 rounded-3xl" hoverable={false}>
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Ai Journal</h1>
          <p className="text-text-secondary font-medium">
            {isSignUp ? 'Create your professional trading account' : 'Welcome back, Master your mind'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-status-danger/10 border border-status-danger/20 text-status-danger p-4 rounded-2xl text-xs font-bold text-center mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="trader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignUp && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <Button 
            type="submit"
            className="w-full h-12 rounded-2xl"
            isLoading={isLoading}
          >
            {isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
          </Button>
        </form>

        <div className="w-full flex items-center gap-4 py-6">
          <div className="h-px bg-border flex-1" />
          <span className="text-text-muted text-xs font-bold uppercase tracking-widest">OR</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <Button
          variant="outline"
          onClick={signInWithGoogle}
          className="w-full h-12 rounded-2xl flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.3-4.74 3.3-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 text-text-secondary text-xs font-bold hover:text-text-primary transition-colors w-full text-center"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'New to AJ Journal? Create an account'}
        </button>
      </Card>
    </div>
  );
};
