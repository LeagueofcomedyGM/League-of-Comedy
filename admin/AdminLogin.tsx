import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'admin', credential.user.uid));
      if (snap.exists()) {
        window.location.replace('/admin');
      } else {
        await signOut(auth);
        setError('Access denied.');
      }
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code.startsWith('auth/')) {
        setError('Invalid email or password.');
      } else {
        setError('Access denied.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#131b2e] border border-white/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">Admin Access</h1>
          <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-widest mt-1">League of Comedy</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0f1628]/80 border border-white/5 rounded-3xl p-8 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-2">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-[#8892a4]/40 focus:border-amber-500/50 outline-none transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8892a4] mb-2">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm font-bold text-white placeholder:text-[#8892a4]/40 focus:border-amber-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8892a4] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[11px] font-black uppercase tracking-widest text-center pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-[#0a0e1a] py-3 rounded-xl text-sm font-black italic uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
