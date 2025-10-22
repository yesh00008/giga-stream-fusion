# 🔐 End-to-End Encryption System

## Overview

This application includes a comprehensive end-to-end encryption (E2EE) system that protects sensitive user data with client-side encryption. All encryption happens in the browser using the Web Crypto API - **encryption keys never leave the user's device**.

## 🔒 Security Features

### Encryption Algorithms
- **AES-256-GCM**: Symmetric encryption for data at rest
- **RSA-2048-OAEP**: Asymmetric encryption for key exchange
- **PBKDF2**: Password-based key derivation (100,000 iterations, SHA-256)
- **SHA-256**: Data hashing and integrity verification

### Key Features
✅ Client-side encryption - keys never sent to server
✅ Zero-knowledge architecture - server can't decrypt data
✅ Authenticated encryption (AES-GCM prevents tampering)
✅ Secure key derivation from user passwords
✅ Public/private key pairs for secure messaging
✅ Encrypted local storage wrapper
✅ Random IV (Initialization Vector) for each encryption

## 🚀 Getting Started

### Enable Encryption

1. Navigate to **Settings** → **Privacy** tab
2. Find the **End-to-End Encryption** card
3. Enter a strong encryption password (min 8 characters)
4. Confirm the password
5. Click **"Enable End-to-End Encryption"**

⚠️ **IMPORTANT**: Store your encryption password securely! It cannot be recovered if lost.

### Disable Encryption

1. Go to **Settings** → **Privacy** tab
2. Scroll to **End-to-End Encryption** section
3. Click **"Disable Encryption"**
4. Confirm the action

⚠️ **WARNING**: Disabling encryption will remove all encryption keys. Previously encrypted data will become inaccessible.

## 📚 How It Works

### 1. Key Generation

When you enable encryption:
```typescript
// Symmetric key for encrypting your data
const symmetricKey = await generateEncryptionKey();

// Asymmetric key pair for secure messaging
const { publicKey, privateKey } = await generateRSAKeyPair();

// Password-derived key for secure storage
const storageKey = await deriveKeyFromPassword(password, salt);
```

### 2. Data Encryption

```typescript
// Encrypt sensitive data
const { encrypted, iv } = await encrypt(sensitiveData);

// Data is encrypted with AES-256-GCM
// IV ensures same data produces different ciphertext
```

### 3. Data Decryption

```typescript
// Decrypt when needed
const decrypted = await decrypt(encrypted, iv);

// Only possible with the correct encryption key
```

### 4. Key Storage

- **Symmetric Key**: Stored in localStorage (encrypted with password)
- **Public Key**: Shareable, stored in localStorage
- **Private Key**: Stored in localStorage (encrypted with password)
- **Password**: Never stored, only used to derive encryption keys

## 🔧 Usage in Code

### Import the Encryption Context

```typescript
import { useEncryption } from '@/lib/encryption-context';

function MyComponent() {
  const {
    isEncryptionEnabled,
    encrypt,
    decrypt,
    publicKey,
    secureStorage
  } = useEncryption();
  
  // Your code here
}
```

### Encrypt Data

```typescript
// Check if encryption is enabled
if (isEncryptionEnabled) {
  // Encrypt sensitive message
  const result = await encrypt('Secret message');
  
  if (result) {
    const { encrypted, iv } = result;
    
    // Store both encrypted data and IV
    await saveToDatabase({
      data: encrypted,
      iv: iv,
      encrypted: true
    });
  }
}
```

### Decrypt Data

```typescript
// Retrieve encrypted data
const { data, iv } = await getFromDatabase();

// Decrypt if encryption is enabled
if (isEncryptionEnabled && data && iv) {
  const decrypted = await decrypt(data, iv);
  console.log('Original message:', decrypted);
}
```

### Secure Storage

```typescript
// Use secure storage for sensitive data
if (secureStorage) {
  // Store encrypted
  await secureStorage.setItem('api_key', 'sk-1234567890');
  
  // Retrieve and decrypt
  const apiKey = await secureStorage.getItem('api_key');
  
  // Remove
  secureStorage.removeItem('api_key');
}
```

### Share Public Key

```typescript
// Get your public key to share with others
const myPublicKey = publicKey;

// Others can use it to encrypt messages for you
const encrypted = await encryptWithPublicKey(message, theirPublicKey);

// Only you can decrypt with your private key
const decrypted = await decryptWithPrivateKey(encrypted, myPrivateKey);
```

## 🎯 Use Cases

### 1. Encrypted Messaging
```typescript
// Sender encrypts with recipient's public key
const encrypted = await encryptWithPublicKey(
  'Hello!',
  recipientPublicKey
);

// Only recipient can decrypt with their private key
const message = await decryptWithPrivateKey(
  encrypted,
  myPrivateKey
);
```

### 2. Encrypted Notes
```typescript
// Save encrypted note
const { encrypted, iv } = await encrypt(noteContent);
await saveNote({ content: encrypted, iv, encrypted: true });

// Load and decrypt
const note = await loadNote();
const content = await decrypt(note.content, note.iv);
```

### 3. Secure API Keys
```typescript
// Store API keys securely
await secureStorage.setItem('openai_key', apiKey);

// Retrieve when needed
const key = await secureStorage.getItem('openai_key');
```

### 4. Private Posts
```typescript
// Encrypt post content
const { encrypted, iv } = await encrypt(postContent);

await createPost({
  content: encrypted,
  iv: iv,
  encrypted: true,
  visibility: 'encrypted'
});
```

## 📊 API Reference

### Encryption Functions

#### `generateEncryptionKey()`
Generates a new AES-256-GCM key for symmetric encryption.

```typescript
const key = await generateEncryptionKey();
```

#### `encryptData(data, key)`
Encrypts data using AES-256-GCM.

```typescript
const { encrypted, iv } = await encryptData('secret', key);
```

#### `decryptData(encrypted, iv, key)`
Decrypts data using AES-256-GCM.

```typescript
const original = await decryptData(encrypted, iv, key);
```

#### `generateRSAKeyPair()`
Generates RSA-2048 key pair for asymmetric encryption.

```typescript
const { publicKey, privateKey } = await generateRSAKeyPair();
```

#### `deriveKeyFromPassword(password, salt)`
Derives encryption key from password using PBKDF2.

```typescript
const key = await deriveKeyFromPassword('myPassword', salt);
```

#### `hashData(data)`
Hashes data using SHA-256.

```typescript
const hash = await hashData('data to hash');
```

### Encryption Context

#### `isEncryptionEnabled`
Boolean indicating if encryption is active.

#### `enableEncryption(password)`
Enables encryption with the given password.

```typescript
await enableEncryption('strongPassword123');
```

#### `disableEncryption()`
Disables encryption and removes all keys.

```typescript
disableEncryption();
```

#### `encrypt(data)`
Encrypts data and returns `{ encrypted, iv }`.

```typescript
const result = await encrypt('sensitive data');
```

#### `decrypt(encrypted, iv)`
Decrypts data using the IV.

```typescript
const original = await decrypt(encrypted, iv);
```

#### `secureStorage`
Encrypted localStorage wrapper.

```typescript
await secureStorage.setItem('key', 'value');
const value = await secureStorage.getItem('key');
```

#### `publicKey`
Your RSA public key (Base64 encoded).

#### `hasEncryptionKey`
Boolean indicating if encryption key is loaded.

## 🛡️ Security Best Practices

### Do's ✅
- Use strong encryption passwords (12+ characters)
- Store encryption password in a password manager
- Enable encryption for sensitive data
- Verify encryption status before sending sensitive info
- Keep your private key secure
- Use unique IVs for each encryption operation

### Don'ts ❌
- Don't share your encryption password
- Don't store password in code or databases
- Don't reuse IVs for different data
- Don't disable encryption without backing up data
- Don't send private keys to anyone
- Don't assume server-side encryption is E2EE

## 🔍 Technical Details

### Encryption Flow

```
User Password
    ↓
PBKDF2 (100k iterations)
    ↓
Master Key
    ↓
├─ Symmetric Key (AES-256) → Encrypt/Decrypt Data
├─ Public Key (RSA-2048)   → Share for receiving messages
└─ Private Key (RSA-2048)  → Decrypt received messages
```

### Data Structure

```typescript
interface EncryptedData {
  encrypted: string;  // Base64 encoded ciphertext
  iv: string;         // Base64 encoded initialization vector
  encrypted: boolean; // Flag indicating data is encrypted
}
```

### Storage Schema

```
localStorage:
├─ encryption_key      → Exported symmetric key (JWK)
├─ public_key          → RSA public key (Base64)
├─ private_key         → RSA private key (Base64)
├─ encryption_salt     → PBKDF2 salt (Base64)
└─ encrypted_*         → User data encrypted with derived key
```

## 🧪 Testing Encryption

### Test Basic Encryption

```typescript
// 1. Enable encryption
await enableEncryption('test-password-123');

// 2. Encrypt test data
const { encrypted, iv } = await encrypt('Hello, World!');
console.log('Encrypted:', encrypted);
console.log('IV:', iv);

// 3. Decrypt test data
const decrypted = await decrypt(encrypted, iv);
console.log('Decrypted:', decrypted); // Should be "Hello, World!"
```

### Test Secure Storage

```typescript
// 1. Initialize
await secureStorage.initialize('test-password-123');

// 2. Store data
await secureStorage.setItem('test', 'sensitive value');

// 3. Retrieve data
const value = await secureStorage.getItem('test');
console.log('Retrieved:', value); // Should be "sensitive value"
```

## ⚠️ Important Notes

1. **Password Recovery**: There is NO way to recover your encryption password. If lost, encrypted data is permanently inaccessible.

2. **Key Management**: Keep your private key secure. Anyone with access to it can decrypt your messages.

3. **Browser Storage**: Keys are stored in localStorage. Clearing browser data will delete them.

4. **Cross-Device**: Encryption keys are device-specific. To access encrypted data on multiple devices, you'll need to export/import keys (feature coming soon).

5. **Performance**: Encryption/decryption has minimal performance impact for text data but may be noticeable for large files.

## 🚧 Limitations

- Keys are stored in localStorage (vulnerable to XSS attacks)
- No automatic key backup/recovery
- No cross-device synchronization yet
- Large files may take time to encrypt/decrypt
- No hardware security module (HSM) support

## 📈 Future Enhancements

- [ ] Hardware security key support (WebAuthn)
- [ ] Secure key backup and recovery
- [ ] Cross-device key synchronization
- [ ] File encryption support
- [ ] Encrypted file uploads
- [ ] Group chat encryption
- [ ] Forward secrecy for messages
- [ ] Key rotation mechanism
- [ ] Audit logging

## 🆘 Troubleshooting

### "Encryption not enabled" error
→ Enable encryption in Settings → Privacy first

### "Failed to decrypt" error
→ Check that you're using the correct encryption key and IV

### Lost encryption password
→ Unfortunately, data cannot be recovered. Disable and re-enable encryption.

### Keys not persisting
→ Check browser localStorage isn't disabled or being cleared

### Slow encryption/decryption
→ Normal for large data. Consider encrypting smaller chunks.

## 📞 Support

For security issues or questions:
- Create an issue on GitHub
- Check browser console for detailed error messages
- Verify Web Crypto API is supported in your browser

---

**Remember**: With great encryption comes great responsibility. Keep your passwords secure! 🔐
