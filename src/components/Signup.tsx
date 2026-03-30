import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Lock, ArrowRight, User, ShieldCheck, Github } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebase-errors';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    if (signupMethod === 'phone') {
      toast.error("Phone registration is not implemented yet. Please use Email.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      // Create user document in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          settings: {
            currency: 'USD',
            notifications: true,
            notification_preferences: {
              budget_alerts: true,
              transaction_summaries: true,
              security_alerts: true,
            },
            auto_categorize: true,
            privacy_mode: false,
          }
        });
      } catch (fsError) {
        handleFirestoreError(fsError, OperationType.WRITE, `users/${user.uid}`);
      }

      toast.success("Account created successfully!");
      onSignup();
    } catch (error: any) {
      console.error("Signup Error:", error);
      let message = "Failed to create account";
      
      // Check if it's a JSON error from handleFirestoreError
      try {
        if (error.message && error.message.startsWith('{')) {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            message = `Database Error: ${parsed.error}`;
          }
        } else {
          // Not a JSON error, handle as Auth error
          if (error.code === 'auth/email-already-in-use') message = "This email is already registered.";
          else if (error.code === 'auth/invalid-email') message = "Invalid email format.";
          else if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
          else if (error.code === 'auth/operation-not-allowed') message = "Email/Password sign-in is not enabled in Firebase Console.";
          else if (error.code === 'auth/network-request-failed') message = "Network error. Please check your connection.";
          else if (error.message) message = error.message;
        }
      } catch (e) {
        if (error.message) message = error.message;
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Create user document in Firestore if it doesn't exist
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          settings: {
            currency: 'USD',
            notifications: true,
            notification_preferences: {
              budget_alerts: true,
              transaction_summaries: true,
              security_alerts: true,
            },
            auto_categorize: true,
            privacy_mode: false,
          }
        }, { merge: true });
      } catch (fsError) {
        handleFirestoreError(fsError, OperationType.WRITE, `users/${user.uid}`);
      }

      toast.success("Signed in with Google");
      onSignup();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Registration cancelled. The popup was closed before completion.");
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
        onClick={onSignup}
        className="absolute top-6 right-6 text-xs font-bold text-gray-400 hover:text-white tracking-widest uppercase transition-colors"
      >
        Skip
      </button>

      <header className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 neu-convex rounded-[24px] flex items-center justify-center mx-auto mb-6 text-blue-400"
        >
          <ShieldCheck className="w-10 h-10" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
        <p className="text-gray-300 text-sm font-medium">Start your financial synchronization</p>
      </header>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setSignupMethod('email')}
          className={cn(
            "flex-1 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all",
            signupMethod === 'email' ? "neu-pressed text-blue-400" : "neu-flat text-gray-300"
          )}
        >
          Email
        </button>
        <button 
          onClick={() => setSignupMethod('phone')}
          className={cn(
            "flex-1 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all",
            signupMethod === 'phone' ? "neu-pressed text-blue-400" : "neu-flat text-gray-300"
          )}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-200 tracking-widest uppercase ml-4">FULL NAME</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full neu-pressed rounded-2xl py-4 pl-12 pr-4 text-sm text-white font-medium placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-blue-400/30"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-200 tracking-widest uppercase ml-4">
            {signupMethod === 'email' ? 'EMAIL ADDRESS' : 'PHONE NUMBER'}
          </label>
          <div className="relative">
            {signupMethod === 'email' ? (
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            ) : (
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            )}
            <input 
              type={signupMethod === 'email' ? 'email' : 'tel'}
              placeholder={signupMethod === 'email' ? 'name@example.com' : '+1 (555) 000-0000'}
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

        <div className="flex items-start gap-3 px-2 py-2">
          <button 
            type="button"
            onClick={() => setAgreeTerms(!agreeTerms)}
            className={cn(
              "w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0",
              agreeTerms ? "neu-pressed text-blue-400" : "neu-flat text-gray-500"
            )}
          >
            {agreeTerms && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
          </button>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            I agree to the <span className="text-blue-400 font-bold">Terms of Service</span> and <span className="text-blue-400 font-bold">Privacy Policy</span>.
          </p>
        </div>

        <button 
          type="submit"
          disabled={!agreeTerms || isLoading}
          className={cn(
            "w-full rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            agreeTerms && !isLoading ? "neu-button-blue text-white" : "neu-flat text-gray-600 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#050506]"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-neu-base px-4 text-gray-300">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button" 
            className="neu-flat rounded-2xl py-3 flex items-center justify-center gap-2 text-white hover:text-blue-400 transition-colors"
            onClick={() => toast.info("Github signup coming soon!")}
          >
            <Github className="w-5 h-5" />
            <span className="text-xs font-bold">Github</span>
          </button>
          <button 
            type="button" 
            className="neu-flat rounded-2xl py-3 flex items-center justify-center gap-2 text-white hover:text-blue-400 transition-colors"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <div className="w-5 h-5 flex items-center justify-center font-bold text-lg">G</div>
            <span className="text-xs font-bold">Google</span>
          </button>
        </div>
      </form>

      <footer className="py-8 text-center">
        <p className="text-xs text-gray-300 font-medium">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-400 font-bold hover:underline">Sign In</button>
        </p>
      </footer>
    </div>
  );
}
