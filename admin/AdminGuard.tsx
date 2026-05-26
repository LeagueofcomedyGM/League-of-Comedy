import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Loader2 } from 'lucide-react';

type Status = 'loading' | 'authorized' | 'unauthorized';

interface Props { children: React.ReactNode; }

export const AdminGuard: React.FC<Props> = ({ children }) => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('unauthorized');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'admin', user.uid));
        if (snap.exists()) {
          setStatus('authorized');
        } else {
          await signOut(auth);
          setStatus('unauthorized');
        }
      } catch {
        setStatus('unauthorized');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (status === 'unauthorized') {
      window.location.replace('/admin/login');
    }
  }, [status]);

  if (status !== 'authorized') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 opacity-60" />
      </div>
    );
  }

  return <>{children}</>;
};
