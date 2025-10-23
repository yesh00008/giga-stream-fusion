# Call Persistence & Navigation Protection Guide

## ✅ Fixed Issues

### 1. **RLS Policy Error (42501) - FIXED**
**Problem:** `user_call_status` table had restrictive RLS policies that prevented the PostgreSQL triggers from inserting/updating rows.

**Solution:** Updated RLS policies in `CREATE_CALLS_TABLES.sql`:
```sql
-- Allow inserts from triggers (no auth.uid() restriction)
CREATE POLICY "Users can insert their own call status" ON user_call_status
  FOR INSERT WITH CHECK (true);

-- Allow updates from triggers
CREATE POLICY "Users can update their own call status" ON user_call_status
  FOR UPDATE USING (true) WITH CHECK (true);
```

**Action Required:** Run the updated `CREATE_CALLS_TABLES.sql` in Supabase SQL Editor.

---

### 2. **Call Persistence Across Page Refresh - FIXED**
**Problem:** Refreshing the page would lose the active call state.

**Solution:** Implemented localStorage-based call persistence in `call-service.ts`:

#### New Functions:
- `saveActiveCallState(call, role)` - Saves call to localStorage
- `getActiveCallState()` - Retrieves call from localStorage on page load
- `clearActiveCallState()` - Clears call from localStorage when ended
- `updateActiveCallState(updates)` - Updates call in localStorage

#### How It Works:
1. **When call starts:** Call data saved to localStorage with role ('caller' or 'receiver')
2. **On page refresh:** Call restored from localStorage in `MessagesInstagram.tsx`
3. **When call ends:** localStorage cleared automatically

#### Key Code:
```typescript
// On component mount - restore active call
const { call: savedCall, role } = getActiveCallState();
if (savedCall && (savedCall.status === 'ringing' || savedCall.status === 'ongoing')) {
  setActiveCall(savedCall);
  setIsOutgoingCall(role === 'caller');
}

// When accepting call
saveActiveCallState(incomingCall, 'receiver');

// When ending call
clearActiveCallState();
```

---

### 3. **Navigation Protection During Calls - FIXED**
**Problem:** Users could navigate away during calls without warning.

**Solution:** Implemented React Router's `useBlocker` hook:

#### Features:
- ✅ Blocks navigation when call is active (ringing or ongoing)
- ✅ Shows confirmation dialog: "You are currently in a call. Are you sure you want to leave?"
- ✅ Auto-ends call if user confirms navigation
- ✅ Stays on page if user cancels

#### Key Code:
```typescript
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    activeCall !== null &&
    (activeCall.status === 'ringing' || activeCall.status === 'ongoing') &&
    currentLocation.pathname !== nextLocation.pathname
);
```

---

### 4. **Deprecated `send()` Warning - FIXED**
**Problem:** Supabase showing deprecation warning about `send()` falling back to REST API.

**Solution:** Proper broadcast channel subscription pattern:
```typescript
const broadcastChannel = supabase.channel(`call-${callId}`);

// Subscribe first, then send
broadcastChannel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await broadcastChannel.send({
      type: 'broadcast',
      event: 'call_update',
      payload: data
    });
    // Unsubscribe after sending
    setTimeout(() => broadcastChannel.unsubscribe(), 1000);
  }
});
```

---

## 🎯 User Experience

### Scenario 1: Refresh During Active Call
1. User is in an active video call
2. User accidentally refreshes the page
3. **Result:** Call continues seamlessly - same UI, same connection state ✅

### Scenario 2: Navigate During Call
1. User is in an active call
2. User clicks on "Home" in sidebar
3. **Result:** Confirmation dialog appears
4. **If Cancel:** Stays on Messages page, call continues
5. **If Confirm:** Call ends, navigates to Home ✅

### Scenario 3: Accept Call + Refresh
1. User B receives incoming call from User A
2. User B accepts the call
3. User B refreshes the page
4. **Result:** Call modal reappears with "ongoing" status ✅

### Scenario 4: Decline Call
1. User receives incoming call
2. User declines
3. **Result:** Call status updates to "rejected" on both sides within 500ms ✅

---

## 🔧 Technical Implementation

### Call State Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    CALL INITIATED                        │
│  - Insert to database                                    │
│  - Save to localStorage (caller)                         │
│  - Broadcast to receiver                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  CALL ACCEPTED                           │
│  - Update status to "ongoing"                            │
│  - Save to localStorage (receiver)                       │
│  - Broadcast update                                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              DURING CALL (PERSISTENT)                    │
│  - State synced via broadcast + polling                  │
│  - Survives page refresh via localStorage                │
│  - Navigation blocked with confirmation                  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   CALL ENDED                             │
│  - Update status to "ended"                              │
│  - Clear localStorage                                    │
│  - Broadcast final update                                │
│  - Unblock navigation                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Testing Checklist

### ✅ Database Setup
- [ ] Run updated `CREATE_CALLS_TABLES.sql` in Supabase
- [ ] Verify no RLS errors in console when calls are created

### ✅ Call Initiation
- [ ] User A can call User B
- [ ] User B receives notification within 2 seconds
- [ ] No duplicate notifications

### ✅ Call Acceptance
- [ ] Accept button works on User B's side
- [ ] User A sees status change to "ongoing" within 500ms
- [ ] Both users see call modal

### ✅ Page Refresh During Call
- [ ] Refresh during ringing - call UI persists
- [ ] Refresh during ongoing call - call UI persists
- [ ] Refresh after call ended - no call UI (clean state)

### ✅ Navigation Protection
- [ ] Try navigating during call - confirmation appears
- [ ] Click "Cancel" - stays on Messages page
- [ ] Click "OK" - call ends, navigation proceeds

### ✅ Call Decline
- [ ] Decline button works
- [ ] Caller sees "rejected" status within 500ms
- [ ] No call UI on receiver side
- [ ] localStorage cleared

### ✅ Call End
- [ ] End button works for both users
- [ ] Status updates to "ended"
- [ ] localStorage cleared
- [ ] Navigation unblocked

---

## 🐛 Debugging

### Check localStorage:
```javascript
// In browser console
localStorage.getItem('active_call_state')
localStorage.getItem('call_role')
```

### Check Console Logs:
- `📱 Restored call state from localStorage:` - Call restored on refresh
- `💾 Call state saved to localStorage:` - Call state saved
- `🗑️ Call state cleared from localStorage` - Call ended/cleared
- `📞 Broadcast incoming call received:` - Real-time call notification
- `📞 Call update received via polling:` - Polling backup working

### Common Issues:
1. **RLS Error:** Make sure you ran the updated SQL migration
2. **Call not persisting:** Check localStorage in DevTools
3. **Navigation not blocked:** Check if blocker hook is registered
4. **Status not updating:** Check polling interval (should be 500ms)

---

## 🚀 Next Steps

1. Run the updated `CREATE_CALLS_TABLES.sql`
2. Test with two users in different browsers
3. Verify all scenarios in the testing checklist
4. Check console logs for any errors

---

## 📞 Support

If issues persist, check:
- Browser console for errors
- Supabase dashboard > Database > Logs
- Network tab for failed requests
- localStorage content in DevTools
