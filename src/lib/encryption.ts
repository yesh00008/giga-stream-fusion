/**
 * End-to-End Encryption Utilities
 * Provides client-side encryption/decryption for sensitive data
 */

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

// Import key from storage
export async function importKey(keyData: string): Promise<CryptoKey> {
  const jwk = JSON.parse(keyData);
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Derive key from password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate random salt
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// Encrypt data
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  return {
    encrypted: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
  };
}

// Decrypt data
export async function decryptData(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedBuffer = base64ToBuffer(encryptedData);
  const ivBuffer = base64ToBuffer(iv);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Helper: Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate RSA key pair for asymmetric encryption
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export RSA public key
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return bufferToBase64(exported);
}

// Import RSA public key
export async function importPublicKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(keyData);
  return await window.crypto.subtle.importKey(
    'spki',
    buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

// Export RSA private key
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key);
  return bufferToBase64(exported);
}

// Import RSA private key
export async function importPrivateKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(keyData);
  return await window.crypto.subtle.importKey(
    'pkcs8',
    buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}

// Encrypt with RSA public key
export async function encryptWithPublicKey(
  data: string,
  publicKey: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    dataBuffer
  );

  return bufferToBase64(encryptedBuffer);
}

// Decrypt with RSA private key
export async function decryptWithPrivateKey(
  encryptedData: string,
  privateKey: CryptoKey
): Promise<string> {
  const encryptedBuffer = base64ToBuffer(encryptedData);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Hash data using SHA-256
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  return bufferToBase64(hashBuffer);
}

// Generate random token
export function generateToken(length: number = 32): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return bufferToBase64(array.buffer);
}

// Secure storage wrapper with encryption
export class SecureStorage {
  private key: CryptoKey | null = null;

  async initialize(password: string) {
    const salt = this.getSalt();
    this.key = await deriveKeyFromPassword(password, salt);
  }

  private getSalt(): Uint8Array {
    const stored = localStorage.getItem('encryption_salt');
    if (stored) {
      return new Uint8Array(base64ToBuffer(stored));
    }
    const salt = generateSalt();
    localStorage.setItem('encryption_salt', bufferToBase64(salt.buffer as ArrayBuffer));
    return salt;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.key) throw new Error('SecureStorage not initialized');
    const { encrypted, iv } = await encryptData(value, this.key);
    localStorage.setItem(key, JSON.stringify({ encrypted, iv }));
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.key) throw new Error('SecureStorage not initialized');
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      const { encrypted, iv } = JSON.parse(stored);
      return await decryptData(encrypted, iv, this.key);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
