import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  email: string | null;
  loading: boolean;
  userId: string | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<string>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }
    const loadIdentity = async () => {
      const { data } = await client.auth.getClaims();
      setUserId(typeof data?.claims?.sub === "string" ? data.claims.sub : null);
      setEmail(typeof data?.claims?.email === "string" ? data.claims.email : null);
      setLoading(false);
    };
    void loadIdentity();
    const { data } = client.auth.onAuthStateChange(() => void loadIdentity());
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    email,
    loading,
    userId,
    async signIn(nextEmail, password) {
      if (!supabase) throw new Error("Connect Supabase to sign in.");
      const { error } = await supabase.auth.signInWithPassword({ email: nextEmail.trim(), password });
      if (error) throw error;
    },
    async signUp(nextEmail, password) {
      if (!supabase) throw new Error("Connect Supabase to create an account.");
      const { data, error } = await supabase.auth.signUp({ email: nextEmail.trim(), password });
      if (error) throw error;
      return data.session ? "Your account is ready." : "Check your email to finish creating your account.";
    },
    async signOut() {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [email, loading, userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
