# 🔧 Fix: Incoming Calls Not Working

## The Problem
The receiver is not getting incoming call notifications when someone calls them.

## Root Causes & Solutions

### ✅ Solution 1: Enable Realtime Replication (MOST COMMON)

**This is the #1 reason calls don't work!**

#### Steps:
1. Open your **Supabase Dashboard**
2. Go to **Database** → **Replication**
3. Find the `calls` table in the list
4. **Enable Realtime** by toggling it ON
5. Wait a few seconds for it to activate

#### Visual Guide:
```
Database → Replication
┌─────────────────────────────────────┐
│ Source: 0 tables                    │
│                                     │
│ ☐ profiles                          │
│ ☐ messages                          │
│ ☑ calls          ← ENABLE THIS     │
│ ☐ call_signals                      │
│ ☐ user_call_status                  │
└─────────────────────────────────────┘
```

### ✅ Solution 2: Run the Database Migration

Make sure you've run `CREATE_CALLS_TABLES.sql` in your Supabase SQL Editor.

**Verify tables exist:**
- `calls` ✓
- `call_signals` ✓
- `user_call_status` ✓

### ✅ Solution 3: Check Browser Console Logs

Open DevTools (F12) and look for these logs:

**On the receiver's browser:**
```
🔔 Setting up incoming call subscription for user: xxx
📡 Call subscription status: SUBSCRIBED
```

**When someone calls:**
```
📞 Incoming call received: {...}
👤 Caller profile: {...}
📞 Triggering onIncomingCall callback
✅ Setting incoming call state
```

**If you DON'T see these logs:**
- Realtime is not enabled (go to Solution 1)
- Subscription failed (check network tab)

### ✅ Solution 4: Check RLS Policies

Run this in Supabase SQL Editor to verify:

```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'calls';
```

Should return at least 3 policies:
- Users can view their own calls
- Users can create calls
- Users can update their own calls

### ✅ Solution 5: Test the Subscription Manually

Open browser console on receiver's device and run:

```javascript
// Get your Supabase client
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user.id);

// Test subscription
const channel = supabase
  .channel('test-calls')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'calls',
      filter: `receiver_id=eq.${user.id}`
    },
    (payload) => {
      console.log('✅ CALL RECEIVED!', payload);
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });
```

**Expected output:**
```
Subscription status: SUBSCRIBED
```

**Then ask someone to call you. You should see:**
```
✅ CALL RECEIVED! {...}
```

## Quick Checklist

Run through this checklist:

- [ ] ✅ Ran `CREATE_CALLS_TABLES.sql` in Supabase
- [ ] ✅ Enabled **Realtime** for `calls` table
- [ ] ✅ Both users are logged in
- [ ] ✅ Receiver is on the Messages page (subscription only works when page is open)
- [ ] ✅ Browser console shows "Setting up incoming call subscription"
- [ ] ✅ Browser console shows "Call subscription status: SUBSCRIBED"
- [ ] ✅ No errors in console

## Testing Steps

### Test with 2 Browsers:

**Browser 1 (Caller):**
1. Login as User A
2. Go to Messages
3. Open chat with User B
4. Click Phone or Video icon
5. Should see "Calling..." screen

**Browser 2 (Receiver):**
1. Login as User B
2. Go to Messages page
3. **STAY ON THIS PAGE** (subscription only works when page is open)
4. When User A calls, you should:
   - See notification at top
   - Hear toast notification sound
   - See "Incoming call..." message

### Common Mistakes:

❌ **Receiver is not on Messages page**
- Subscription only works on the Messages page
- Receiver must have the Messages page open

❌ **Realtime not enabled**
- Most common issue
- Go to Database → Replication → Enable for `calls`

❌ **Using same browser/tab**
- Use 2 different browsers or incognito mode
- Can't call yourself

❌ **Not logged in**
- Both users must be authenticated
- Check: `supabase.auth.getUser()`

## Advanced Debugging

### Check Realtime Status:

```javascript
// In browser console
const channels = supabase.getChannels();
console.log('Active channels:', channels);
```

### Check if call was created:

```sql
-- In Supabase SQL Editor
SELECT * FROM calls 
ORDER BY created_at DESC 
LIMIT 10;
```

### Force refresh Realtime:

```javascript
// Unsubscribe all
supabase.removeAllChannels();

// Refresh page
location.reload();
```

## Still Not Working?

If you've tried everything above:

1. **Check Supabase Status**: https://status.supabase.com
2. **Restart Supabase Project**: Dashboard → Settings → General → Restart
3. **Clear Browser Cache**: Hard reload (Ctrl+Shift+R)
4. **Try Different Network**: Switch WiFi/Mobile data

## Success Indicators

When it's working correctly, you'll see:

**Console logs on receiver's side:**
```
🔔 Setting up incoming call subscription for user: xxx
📡 Call subscription status: SUBSCRIBED
📞 Incoming call received: {...}
👤 Caller profile: {...}
📞 Triggering onIncomingCall callback
✅ Setting incoming call state
```

**Visual indicators:**
- 🔔 Toast notification appears
- 📱 Incoming call notification at top
- 🎨 Full screen can be opened

**Database:**
```sql
SELECT * FROM calls WHERE status = 'ringing';
-- Should show the active call
```

---

**Need more help?** Check the browser console logs and share what you see!
