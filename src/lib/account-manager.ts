import { Session } from '@supabase/supabase-js';

interface StoredAccount {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  session: Session;
  last_active: number;
}

const ACCOUNTS_KEY = 'giga_stream_accounts';
const ACTIVE_ACCOUNT_KEY = 'giga_stream_active_account';

export class AccountManager {
  // Get all stored accounts
  static getAccounts(): StoredAccount[] {
    try {
      const data = localStorage.getItem(ACCOUNTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  // Get active account ID
  static getActiveAccountId(): string | null {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  }

  // Get active account
  static getActiveAccount(): StoredAccount | null {
    const accountId = this.getActiveAccountId();
    if (!accountId) return null;

    const accounts = this.getAccounts();
    return accounts.find(acc => acc.id === accountId) || null;
  }

  // Add or update an account
  static addAccount(session: Session): void {
    const accounts = this.getAccounts();
    const user = session.user;
    
    const account: StoredAccount = {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      avatar_url: user.user_metadata?.avatar_url,
      session: session,
      last_active: Date.now(),
    };

    // Check if account already exists
    const existingIndex = accounts.findIndex(acc => acc.id === user.id);
    
    if (existingIndex >= 0) {
      // Update existing account
      accounts[existingIndex] = account;
    } else {
      // Add new account
      accounts.push(account);
    }

    // Save to localStorage
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    
    // Set as active account
    this.setActiveAccount(user.id);
  }

  // Remove an account
  static removeAccount(accountId: string): void {
    let accounts = this.getAccounts();
    accounts = accounts.filter(acc => acc.id !== accountId);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

    // If the removed account was active, switch to another account or clear
    if (this.getActiveAccountId() === accountId) {
      if (accounts.length > 0) {
        this.setActiveAccount(accounts[0].id);
      } else {
        localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
      }
    }
  }

  // Set active account
  static setActiveAccount(accountId: string): void {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    
    // Update last_active timestamp
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex >= 0) {
      accounts[accountIndex].last_active = Date.now();
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  }

  // Check if an account exists
  static hasAccount(accountId: string): boolean {
    const accounts = this.getAccounts();
    return accounts.some(acc => acc.id === accountId);
  }

  // Get account by ID
  static getAccount(accountId: string): StoredAccount | null {
    const accounts = this.getAccounts();
    return accounts.find(acc => acc.id === accountId) || null;
  }

  // Clear all accounts (logout all)
  static clearAllAccounts(): void {
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }

  // Get accounts count
  static getAccountsCount(): number {
    return this.getAccounts().length;
  }

  // Sort accounts by last active
  static getAccountsSortedByActivity(): StoredAccount[] {
    const accounts = this.getAccounts();
    return accounts.sort((a, b) => b.last_active - a.last_active);
  }
}
