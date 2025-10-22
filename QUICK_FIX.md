# 🚀 Quick Fix Guide - Avatar Upload & Encryption

## 🔴 URGENT: Fix Avatar Upload Error

### The Problem
```
Failed to upload avatar: new row violates row-level security policy
```

### The Solution (3 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Project: `mbppxyzdynwjpftzdpgt`

2. **Open SQL Editor**
   - Click "SQL Editor" in sidebar
   - Click "New Query"

3. **Run This Script**
   - Open file: `STORAGE_POLICIES.sql`
   - Copy entire content
   - Paste in SQL Editor
   - Click "Run" button

4. **Verify Success**
   ```sql
   -- Run this to confirm:
   SELECT id, name, public FROM storage.buckets 
   WHERE id IN ('avatars', 'banners');
   ```
   
   Should show 2 rows with `public = true`

5. **Test Upload**
   - Refresh your app
   - Go to Profile → Edit
   - Upload avatar
   - Should work now! ✅

### What the Script Does
- Creates `avatars` and `banners` storage buckets
- Sets up RLS policies so users can upload to their own folders
- Allows public read access to all images
- Enforces file size limits (5MB avatars, 10MB banners)
- Restricts file types to images only

---

## 🔐 New Feature: End-to-End Encryption

### What Was Added

✅ **Complete E2EE System**
- AES-256-GCM encryption for data
- RSA-2048 for key exchange
- PBKDF2 password-based encryption
- Secure storage wrapper

✅ **Settings Page Integration**
- New encryption card in Settings → Privacy tab
- Enable/disable encryption
- View public key
- Security status indicator

✅ **Files Created**
```
src/lib/encryption.ts              - Core encryption functions
src/lib/encryption-context.tsx     - React context provider
src/components/EncryptionSettings.tsx - UI component
ENCRYPTION.md                       - Full documentation
```

### How to Use Encryption

#### For Users:
1. Go to **Settings** → **Privacy** tab
2. Scroll to **End-to-End Encryption**
3. Enter a strong password (min 8 chars)
4. Click "Enable"
5. Your data is now encrypted! 🔒

#### For Developers:
```typescript
import { useEncryption } from '@/lib/encryption-context';

function MyComponent() {
  const { encrypt, decrypt, isEncryptionEnabled } = useEncryption();
  
  // Encrypt data
  const { encrypted, iv } = await encrypt('sensitive data');
  
  // Decrypt data
  const original = await decrypt(encrypted, iv);
}
```

### Use Cases
- 🔒 Encrypted messaging
- 🔒 Private notes
- 🔒 Secure API key storage
- 🔒 Encrypted posts
- 🔒 Sensitive profile data

---

## 📋 Summary of Changes

### Avatar/Banner Upload Fix
| File | Status |
|------|--------|
| `STORAGE_POLICIES.sql` | ✅ Created - Run in Supabase |
| `STORAGE_FIX.md` | ✅ Created - Step-by-step guide |
| `src/pages/Profile.tsx` | ✅ Updated - Better error logging |

### End-to-End Encryption
| File | Status |
|------|--------|
| `src/lib/encryption.ts` | ✅ Created - Core crypto functions |
| `src/lib/encryption-context.tsx` | ✅ Created - React context |
| `src/components/EncryptionSettings.tsx` | ✅ Created - UI component |
| `src/App.tsx` | ✅ Updated - Added EncryptionProvider |
| `src/pages/Settings.tsx` | ✅ Updated - Added encryption card |
| `ENCRYPTION.md` | ✅ Created - Full documentation |

---

## ✅ Testing Checklist

### Avatar Upload (After SQL Fix)
- [ ] Login to app
- [ ] Go to Profile page
- [ ] Click Edit Profile
- [ ] Click Upload Avatar
- [ ] Select image file < 5MB
- [ ] Should see "Avatar updated successfully!" ✅
- [ ] Avatar should appear immediately
- [ ] Refresh page - avatar persists

### Banner Upload (After SQL Fix)
- [ ] Same as avatar but click Upload Banner
- [ ] Use image < 10MB
- [ ] Should see "Banner updated successfully!" ✅

### End-to-End Encryption
- [ ] Go to Settings → Privacy
- [ ] See "End-to-End Encryption" card
- [ ] Enter password (min 8 chars)
- [ ] Confirm password
- [ ] Click "Enable End-to-End Encryption"
- [ ] Should see "Encryption Active" badge ✅
- [ ] Public key should be displayed
- [ ] Can disable encryption

---

## 🎯 Quick Reference

### Storage Buckets
```
avatars:  5MB max,  JPG/PNG/WebP/GIF allowed
banners: 10MB max,  JPG/PNG/WebP allowed
```

### File Paths
```
avatars/{user_id}/avatar-{timestamp}.{ext}
banners/{user_id}/banner-{timestamp}.{ext}
```

### Encryption Algorithms
```
Symmetric:  AES-256-GCM
Asymmetric: RSA-2048-OAEP
Key Derive: PBKDF2 (100k iterations, SHA-256)
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `STORAGE_FIX.md` | How to fix avatar upload error |
| `STORAGE_POLICIES.sql` | SQL script to run in Supabase |
| `ENCRYPTION.md` | Complete E2EE documentation |
| `PROFILE_FEATURES.md` | Profile page features (existing) |

---

## 🆘 Common Issues

### Avatar Upload Still Failing?
1. Did you run `STORAGE_POLICIES.sql` in Supabase?
2. Are you logged in? Check browser console
3. Is file size < 5MB?
4. Is file type an image?
5. Check Supabase project URL in `.env`

### Encryption Not Working?
1. Check browser console for errors
2. Browser must support Web Crypto API
3. Password must be min 8 characters
4. Clear localStorage if keys corrupted

### Can't See Changes?
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check dev server is running
4. Rebuild with `npm run dev`

---

## 🎉 What's Next?

After fixing storage policies:
1. ✅ Avatar uploads will work
2. ✅ Banner uploads will work
3. ✅ Encryption available in Settings
4. ✅ Users can enable E2EE
5. ✅ All data properly secured

**Everything is ready to use! 🚀**
