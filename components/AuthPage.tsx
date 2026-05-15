import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, app } from '../firebase';
import { PageType } from '../types';
import { Mail, Lock, AlertCircle, X, MailCheck, ChevronLeft, Loader2 } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();

const fns = getFunctions(app);
const callHandleUserSignup = httpsCallable<
  { userType: string },
  { status: string; userType: string; docId: string }
>(fns, 'handleUserSignup');
const callGetUserProfile = httpsCallable<
  Record<string, never>,
  { found: boolean; userType?: string }
>(fns, 'getUserProfile');

type UserType = 'fan' | 'comedian' | 'organizer';

const USER_TYPE_OPTIONS: { type: UserType; label: string; sub: string }[] = [
  { type: 'fan',       label: 'FAN',       sub: 'Discover shows and follow comedians' },
  { type: 'comedian',  label: 'COMEDIAN',  sub: 'Get booked, manage your profile, grow your audience' },
  { type: 'organizer', label: 'ORGANIZER', sub: 'Post gigs, manage shows, book talent' },
];

interface AuthPageProps {
  initialMode: 'signin' | 'signup';
  onClose: () => void;
  navigateTo: (page: PageType, tab?: string) => void;
  onVerificationPending: (email: string, userType: string) => void;
}

const MODAL_WRAPPER = "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto";
const MODAL_CARD = "relative w-full max-w-md bg-[#0f1628] rounded-[2rem] p-8 border border-white/10 shadow-2xl my-8";

const GoogleSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode,
  onClose,
  navigateTo,
  onVerificationPending,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>(initialMode);
  const [signupStep, setSignupStep] = useState<'type-select' | 'credentials'>('type-select');
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [googleTypeError, setGoogleTypeError] = useState('');
  const [toast, setToast] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (selectedUserType) setGoogleTypeError('');
  }, [selectedUserType]);

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    if (next === 'signup') setSignupStep('type-select');
    setError('');
    setEmailError('');
    setPasswordError('');
    setGoogleTypeError('');
  };

  const validateEmail = (val: string) => {
    if (!val) { setEmailError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) return;
    if (!validatePassword(password)) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        sessionStorage.setItem('loc_pending_user_type', selectedUserType!);
        onVerificationPending(email, selectedUserType!);
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          setPendingEmail(email);
          setPassword('');
          setError('');
          setMode('verify');
          return;
        }
        try { await callGetUserProfile({}); } catch { /* not deployed yet */ }
        navigateTo(PageType.DASHBOARD);
        onClose();
      }
    } catch (err: any) {
      const code = err.code as string;
      if (mode === 'signin') {
        setError('Email or password is incorrect');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (mode === 'signup' && !selectedUserType) {
      setGoogleTypeError('Please select Fan, Comedian, or Organizer first');
      return;
    }
    setError('');
    setGoogleTypeError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);

      if (mode === 'signup') {
        try {
          const profileResult = await callGetUserProfile({});
          if (profileResult.data.found) {
            navigateTo(PageType.DASHBOARD);
            onClose();
            return;
          }
          const signupResult = await callHandleUserSignup({ userType: selectedUserType! });
          sessionStorage.removeItem('loc_pending_user_type');
          if (signupResult.data.status === 'claimed') {
            setToast('Welcome back! We found your existing profile.');
            setTimeout(() => { navigateTo(PageType.DASHBOARD); onClose(); }, 2500);
          } else {
            navigateTo(PageType.DASHBOARD, 'edit-profile');
            onClose();
          }
        } catch {
          navigateTo(PageType.DASHBOARD);
          onClose();
        }
      } else {
        try { await callGetUserProfile({}); } catch { /* not deployed yet */ }
        navigateTo(PageType.DASHBOARD);
        onClose();
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Verification screen (sign-in with unverified email) ──────────────────────
  if (mode === 'verify') {
    return (
      <div className={MODAL_WRAPPER}>
        <div className={MODAL_CARD}>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-[#8892a4] hover:text-white transition-colors hover:bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-8">
            <img
              src="https://leagueofcomedy.com/wp-content/uploads/2024/09/League-of-Comedy-Logo_Classic-2.png"
              alt="League of Comedy"
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <MailCheck className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-4">
              Check Your Inbox
            </h2>
            <p className="text-[#8892a4] text-sm font-medium leading-relaxed mb-8">
              We have sent you a verification email to{' '}
              <span className="text-white font-bold">{pendingEmail}</span>.
              {' '}Please verify it and log in.
            </p>
            <button
              onClick={() => { setMode('signin'); setEmail(pendingEmail); }}
              className="w-full bg-brand-gradient hover:opacity-90 text-white py-4 rounded-xl text-[11px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/20 transition-all active:scale-95"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main modal ───────────────────────────────────────────────────────────────
  const showTypeSelect = mode === 'signup' && signupStep === 'type-select';
  const showCredentials = mode === 'signin' || (mode === 'signup' && signupStep === 'credentials');

  return (
    <div className={MODAL_WRAPPER}>
      <div className={MODAL_CARD}>

        {toast && (
          <div className="absolute top-4 left-4 right-4 bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-[11px] font-bold text-center z-10">
            {toast}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#8892a4] hover:text-white transition-colors hover:bg-white/5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-8">
          <img
            src="https://leagueofcomedy.com/wp-content/uploads/2024/09/League-of-Comedy-Logo_Classic-2.png"
            alt="League of Comedy"
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Tab toggle */}
        <div className="flex bg-[#0a0e1a] p-1 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase italic tracking-widest transition-all ${mode === 'signin' ? 'bg-brand-gradient text-white shadow-lg' : 'text-[#8892a4] hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase italic tracking-widest transition-all ${mode === 'signup' ? 'bg-brand-gradient text-white shadow-lg' : 'text-[#8892a4] hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {/* ── TYPE SELECTION ───────────────────────────────────────────────── */}
        {showTypeSelect && (
          <>
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
              I Am A...
            </h2>
            <p className="text-[#8892a4] text-xs font-bold uppercase tracking-widest mb-5">
              Choose your role to get started
            </p>

            <div className="space-y-3 mb-5">
              {USER_TYPE_OPTIONS.map(({ type, label, sub }) => {
                const isSelected = selectedUserType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedUserType(type)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#e53e3e]/15 to-[#f56500]/15 border-[#f56500]/60 shadow-lg shadow-orange-900/20'
                        : 'bg-[#131b2e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'border-[#f56500] bg-[#f56500]' : 'border-[#8892a4]'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-white text-xs font-black uppercase italic tracking-widest">{label}</div>
                        <div className="text-[#8892a4] text-[11px] font-medium mt-0.5">{sub}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selectedUserType}
              onClick={() => {
                sessionStorage.setItem('loc_pending_user_type', selectedUserType!);
                setSignupStep('credentials');
              }}
              className="w-full bg-brand-gradient hover:opacity-90 text-white py-4 rounded-xl text-[11px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mb-5"
            >
              Continue
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-[#0a0e1a] py-4 rounded-xl text-[11px] font-black uppercase italic tracking-widest transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleSVG />}
              {googleLoading ? 'Please wait...' : 'Continue with Google'}
            </button>

            {googleTypeError && (
              <div className="flex items-center gap-2 px-3 py-2.5 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-red-400 text-[11px] font-bold">{googleTypeError}</p>
              </div>
            )}

            <p className="text-center text-[#8892a4] text-xs font-bold mt-5">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-[#f6a623] hover:text-white transition-colors font-black italic uppercase"
              >
                Sign In
              </button>
            </p>
          </>
        )}

        {/* ── CREDENTIALS ─────────────────────────────────────────────────── */}
        {showCredentials && (
          <>
            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  setSignupStep('type-select');
                  setError('');
                  setEmailError('');
                  setPasswordError('');
                }}
                className="flex items-center gap-1 text-[#8892a4] hover:text-white text-[11px] font-bold transition-colors mb-4"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Change selection
              </button>
            )}

            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
              {mode === 'signin' ? 'Welcome Back' : 'Join the League'}
            </h2>
            <p className="text-[#8892a4] text-xs font-bold uppercase tracking-widest mb-6">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your free account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892a4]" />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    className={`w-full bg-[#131b2e] border rounded-xl pl-11 pr-4 py-4 text-sm font-bold text-white placeholder:text-[#8892a4] focus:outline-none transition-all ${
                      emailError ? 'border-red-500/50' : 'border-white/5 focus:border-[#e53e3e]/50'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-red-400 text-[11px] font-bold mt-1.5 ml-1">{emailError}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892a4]" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                    onBlur={(e) => { if (mode === 'signup') validatePassword(e.target.value); }}
                    className={`w-full bg-[#131b2e] border rounded-xl pl-11 pr-4 py-4 text-sm font-bold text-white placeholder:text-[#8892a4] focus:outline-none transition-all ${
                      passwordError ? 'border-red-500/50' : 'border-white/5 focus:border-[#e53e3e]/50'
                    }`}
                  />
                </div>
                {mode === 'signup' && !passwordError && (
                  <p className="text-[#8892a4] text-[11px] font-medium mt-1.5 ml-1">Minimum 8 characters</p>
                )}
                {passwordError && (
                  <p className="text-red-400 text-[11px] font-bold mt-1.5 ml-1">{passwordError}</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gradient hover:opacity-90 text-white py-4 rounded-xl text-[11px] font-black uppercase italic tracking-widest shadow-xl shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Please wait...
                  </span>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8892a4]">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-[#0a0e1a] py-4 rounded-xl text-[11px] font-black uppercase italic tracking-widest transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#0a0e1a]" /> : <GoogleSVG />}
              {googleLoading ? 'Please wait...' : 'Continue with Google'}
            </button>

            <p className="text-center text-[#8892a4] text-xs font-bold mt-6">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[#f6a623] hover:text-white transition-colors font-black italic uppercase"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
