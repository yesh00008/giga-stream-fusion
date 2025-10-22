import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
  generateRSAKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPublicKey,
  importPrivateKey,
  SecureStorage,
} from './encryption';

interface EncryptionContextType {
  isEncryptionEnabled: boolean;
  enableEncryption: (password: string) => Promise<void>;
  disableEncryption: () => void;
  encrypt: (data: string) => Promise<{ encrypted: string; iv: string } | null>;
  decrypt: (encrypted: string, iv: string) => Promise<string | null>;
  secureStorage: SecureStorage | null;
  publicKey: string | null;
  hasEncryptionKey: boolean;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [secureStorage, setSecureStorage] = useState<SecureStorage | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);

  // Initialize encryption on mount if key exists
  useEffect(() => {
    const initializeEncryption = async () => {
      const storedKey = localStorage.getItem('encryption_key');
      const storedPublicKey = localStorage.getItem('public_key');
      const storedPrivateKey = localStorage.getItem('private_key');

      if (storedKey) {
        try {
          const key = await importKey(storedKey);
          setEncryptionKey(key);
          setIsEncryptionEnabled(true);
        } catch (error) {
          console.error('Failed to restore encryption key:', error);
        }
      }

      if (storedPublicKey && storedPrivateKey) {
        try {
          setPublicKey(storedPublicKey);
          const privKey = await importPrivateKey(storedPrivateKey);
          setPrivateKey(privKey);
        } catch (error) {
          console.error('Failed to restore RSA keys:', error);
        }
      }
    };

    initializeEncryption();
  }, []);

  const enableEncryption = async (password: string) => {
    try {
      // Generate symmetric encryption key
      const key = await generateEncryptionKey();
      const exportedKey = await exportKey(key);
      localStorage.setItem('encryption_key', exportedKey);
      setEncryptionKey(key);

      // Generate RSA key pair for asymmetric encryption
      const keyPair = await generateRSAKeyPair();
      const pubKey = await exportPublicKey(keyPair.publicKey);
      const privKey = await exportPrivateKey(keyPair.privateKey);

      localStorage.setItem('public_key', pubKey);
      localStorage.setItem('private_key', privKey);
      setPublicKey(pubKey);
      setPrivateKey(keyPair.privateKey);

      // Initialize secure storage
      const storage = new SecureStorage();
      await storage.initialize(password);
      setSecureStorage(storage);

      setIsEncryptionEnabled(true);

      console.log('✅ End-to-End Encryption enabled');
    } catch (error) {
      console.error('Failed to enable encryption:', error);
      throw error;
    }
  };

  const disableEncryption = () => {
    localStorage.removeItem('encryption_key');
    localStorage.removeItem('public_key');
    localStorage.removeItem('private_key');
    localStorage.removeItem('encryption_salt');
    setEncryptionKey(null);
    setPublicKey(null);
    setPrivateKey(null);
    setSecureStorage(null);
    setIsEncryptionEnabled(false);
    console.log('🔓 End-to-End Encryption disabled');
  };

  const encrypt = async (data: string): Promise<{ encrypted: string; iv: string } | null> => {
    if (!encryptionKey) {
      console.warn('Encryption not enabled');
      return null;
    }

    try {
      return await encryptData(data, encryptionKey);
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  const decrypt = async (encrypted: string, iv: string): Promise<string | null> => {
    if (!encryptionKey) {
      console.warn('Encryption not enabled');
      return null;
    }

    try {
      return await decryptData(encrypted, iv, encryptionKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  return (
    <EncryptionContext.Provider
      value={{
        isEncryptionEnabled,
        enableEncryption,
        disableEncryption,
        encrypt,
        decrypt,
        secureStorage,
        publicKey,
        hasEncryptionKey: encryptionKey !== null,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within EncryptionProvider');
  }
  return context;
}
