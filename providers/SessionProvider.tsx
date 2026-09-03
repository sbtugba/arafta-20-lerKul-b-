import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { translateAuthError } from '../lib/authErrors';

type AuthResult = { error: string | null };
type SignUpResult = AuthResult & { needsEmailConfirmation: boolean };

type SessionState = {
  session: Session | null;
  userId: string | null;
  loading: boolean;
  signUp: (email: string, password: string, birthdate?: string, username?: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const noop = async () => ({ error: 'SessionProvider hazır değil.', needsEmailConfirmation: false });

const SessionContext = createContext<SessionState>({
  session: null,
  userId: null,
  loading: true,
  signUp: noop,
  signIn: noop,
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) setSession(data.session);
      })
      .catch((err) => {
        console.error('[session] hazırlanamadı:', err?.message ?? err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, birthdate?: string, username?: string): Promise<SignUpResult> => {
    const metadata = { ...(birthdate ? { birthdate } : {}), ...(username ? { username } : {}) };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Kayıt anında henüz oturum/JWT yok, profiles tablosuna yazamayız — doğum
      // tarihi ve kullanıcı adını auth metadata'sına koyup ilk profil
      // oluşturulurken oradan okuyoruz (bkz. hooks/useProfile.ts -> fetchOrCreateProfile).
      options: Object.keys(metadata).length ? { data: metadata } : undefined,
    });
    if (error) return { error: translateAuthError(error.message), needsEmailConfirmation: false };
    // Confirm-email is on for this project when signUp succeeds but returns no session yet.
    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? translateAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    // scope 'local': yalnızca cihazdaki oturumu temizler, sunucudan token
    // iptali beklemez — "Çıkış Yap" anında tepki verir. Diğer cihazlardan
    // çıkış için ayrı bir akış zaten var (bkz. password-security.tsx, scope 'others').
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const value = useMemo<SessionState>(
    () => ({ session, userId: session?.user.id ?? null, loading, signUp, signIn, signOut }),
    [session, loading, signUp, signIn, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
