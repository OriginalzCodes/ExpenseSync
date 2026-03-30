import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, Lock, ArrowRight, Fingerprint, Github, X } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

export default function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'phone') {
      toast.error("Phone login is not implemented yet. Please use Email.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, identifier, password);
      toast.success("Welcome back!");
      onLogin();
    } catch (error: any) {
      console.error(error);
      let message = "Failed to sign in";
      if (error.code === 'auth/user-not-found') message = "No account found with this email.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      if (error.code === 'auth/invalid-email') message = "Invalid email format.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetModal(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google");
      onLogin();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in cancelled. The popup was closed before completion.");
      } else {
        toast.error(error.message || "Failed to sign in with Google");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neu-base pt-12 px-6 flex flex-col relative">
      <button 
        onClick={onLogin}
        className="absolute top-6 right-6 text-xs font-bold text-gray-400 hover:text-white tracking-widest uppercase transition-colors"
      >
        Skip
      </button>

      <header className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 neu-convex rounded-[24px] flex items-center justify-center mx-auto mb-6 text-blue-400"
        >
          <Fingerprint className="w-10 h-10" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
        <p className="text-gray-300 text-sm font-medium">Sign in to synchronize your capital</p>
      </header>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setLoginMethod('email')}
          className={cn(
            "flex-1 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all",
            loginMethod === 'email' ? "neu-pressed text-blue-400" : "neu-flat text-gray-300"
          )}
        >
          Email
        </button>
        <button 
          onClick={() => setLoginMethod('phone')}
          className={cn(
            "flex-1 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all",
            loginMethod === 'phone' ? "neu-pressed text-blue-400" : "neu-flat text-gray-300"
          )}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-200 tracking-widest uppercase ml-4">
            {loginMethod === 'email' ? 'EMAIL ADDRESS' : 'PHONE NUMBER'}
          </label>
          <div className="relative">
            {loginMethod === 'email' ? (
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            ) : (
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            )}
            <input 
              type={loginMethod === 'email' ? 'email' : 'tel'}
              placeholder={loginMethod === 'email' ? 'name@example.com' : '+1 (555) 000-0000'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full neu-pressed rounded-2xl py-4 pl-12 pr-4 text-sm text-white font-medium placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-blue-400/30"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-200 tracking-widest uppercase ml-4">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full neu-pressed rounded-2xl py-4 pl-12 pr-4 text-sm text-white font-medium placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-blue-400/30"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={() => {
              setResetEmail(identifier);
              setShowResetModal(true);
            }}
            className="text-[10px] font-bold text-blue-400 tracking-wider uppercase hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full neu-button-blue text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#050506]"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-neu-base px-4 text-gray-300">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button" 
            className="neu-flat rounded-2xl py-3 flex items-center justify-center gap-2 text-white hover:text-blue-400 transition-colors"
            onClick={() => toast.info("Github login coming soon!")}
          >
            <Github className="w-5 h-5" />
            <span className="text-xs font-bold">Github</span>
          </button>
          <button 
            type="button" 
            className="neu-flat rounded-2xl py-3 flex items-center justify-center gap-2 text-white hover:text-blue-400 transition-colors"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <div className="w-5 h-5 flex items-center justify-center font-bold text-lg">G</div>
            <span className="text-xs font-bold">Google</span>
          </button>
        </div>
      </form>

      <footer className="py-8 text-center">
        <p className="text-xs text-gray-300 font-medium">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-blue-400 font-bold hover:underline">Create one</button>
        </p>
      </footer>

      <AnimatePresence>
        {showResetModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm neu-flat rounded-[32px] p-8 relative"
            >
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 neu-pressed rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                <p className="text-xs text-gray-400">We'll send a recovery link to your email.</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-200 tracking-widest uppercase ml-4">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      type="email"
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full neu-pressed rounded-2xl py-4 pl-12 pr-4 text-sm text-white font-medium placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full neu-button-blue text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send Recovery Link"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
