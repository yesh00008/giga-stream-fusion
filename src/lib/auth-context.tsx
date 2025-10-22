import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { AccountManager } from './account-manager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  switchAccount: (accountId: string) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  getStoredAccounts: () => any[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  switchAccount: async () => {},
  removeAccount: async () => {},
  getStoredAccounts: () => [],
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to switch between accounts
  const switchAccount = async (accountId: string) => {
    const account = AccountManager.getAccount(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: account.session.access_token,
      refresh_token: account.session.refresh_token,
    });

    if (error) {
      throw error;
    }

    // Update active account
    AccountManager.setActiveAccount(accountId);
    setSession(data.session);
    setUser(data.session?.user ?? null);
  };

  // Function to remove an account
  const removeAccount = async (accountId: string) => {
    AccountManager.removeAccount(accountId);

    // If the removed account was the current one, switch to another or logout
    if (user?.id === accountId) {
      const accounts = AccountManager.getAccounts();
      if (accounts.length > 0) {
        await switchAccount(accounts[0].id);
      } else {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      }
    }
  };

  // Function to get stored accounts
  const getStoredAccounts = () => {
    return AccountManager.getAccountsSortedByActivity();
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Store the session if it exists
      if (session) {
        AccountManager.addAccount(session);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Store the session when user logs in
      if (session) {
        AccountManager.addAccount(session);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, switchAccount, removeAccount, getStoredAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};
