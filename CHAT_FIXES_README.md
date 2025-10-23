# CHAT SYSTEM FIXES - Complete Solution

## Issues Fixed

### 1. ❌ useAuth Import Error
**Error:** `Failed to resolve import "@/hooks/useAuth" from "src/components/ArchivedChats.tsx"`

**Fix:** Changed import in `ArchivedChats.tsx`
```typescript
// ❌ Before
import { useAuth } from '@/hooks/useAuth';

// ✅ After
import { useAuth } from '@/lib/auth-context';
```

### 2. ❌ Database Error - conversation_id Missing
**Error:** `column messages.conversation_id does not exist`

**Fix:** Run `COMPREHENSIVE_CHAT_FIXES.sql` to:
- Add `conversation_id` column to messages table
- Add `deleted_for_users` column for soft deletes
- Create trigger to auto-populate conversation_id
- Create RPC function `mark_messages_deleted`
- Backfill existing messages with conversation_id

### 3. ❌ Archived Chats Showing in Main List
**Problem:** Archived chats were still visible in the main messenger

**Fix:** Updated `loadConversations()` in `MessagesInstagram.tsx` to:
```typescript
// Filter out archived chats
const settings = await getChatSettings(user.id, conv.other_user_id);
if (settings?.is_archived) continue;
```

### 4. ❌ Theme Not Working
**Problem:** Theme changes weren't being applied

**Fix:** Updated `ChatSettingsPanel.tsx`:
- Theme is saved to `chat_settings` table
- Loaded on mount from database
- Applied to conversation UI

### 5. ❌ Nickname Not Working
**Problem:** Nickname wasn't being saved or displayed

**Fix:** Updated `ChatSettingsPanel.tsx`:
- Nickname is saved to `chat_settings` table
- Loaded on mount and displayed in profile section
- Shows in conversation list if set

### 6. ❌ Delete Chat Issues
**Problem:** Delete was removing messages for both users

**Fix:** Implemented soft delete:
- Messages marked as deleted for specific user only
- Uses `deleted_for_users` array
- Other user still sees their messages
- Media files are preserved

## Files Modified

### 1. `src/components/ArchivedChats.tsx`
- Fixed useAuth import path

### 2. `src/services/chat-settings-service.ts`
- Updated `deleteChat()` to use RPC function
- Marks messages as deleted for user only

### 3. `src/pages/MessagesInstagram.tsx`
- Updated `loadConversations()` to exclude archived chats
- Added archived chats count and menu button
- Added ArchivedChats component integration

### 4. `src/components/ChatSettingsPanel.tsx`
- Fixed `handleDeleteChat()` to use RPC function
- Updated `handleArchive()` to reload page
- Added theme and nickname persistence
- Fixed block and report functions

## SQL Migrations Required

### Run in Supabase SQL Editor (in order):

1. **COMPREHENSIVE_CHAT_FIXES.sql** (Main migration)
   - Adds conversation_id column
   - Adds deleted_for_users column
   - Creates triggers and functions
   - Backfills existing data

## How to Test

### 1. Test Archived Chats
```
1. Open a conversation
2. Click settings (⚙️) icon
3. Click "Archive chat"
4. Chat should disappear from main list
5. Click "Archived" button in sidebar
6. Chat should appear in archived list
7. Click on archived chat to view
8. Unarchive to restore to main list
```

### 2. Test Delete Chat
```
1. Open a conversation
2. Click settings (⚙️) icon
3. Click "Delete chat"
4. Confirm deletion
5. Chat should disappear from your list
6. Other user should still see their messages
7. Check database: deleted_for_users should contain your ID
```

### 3. Test Theme
```
1. Open a conversation
2. Click settings (⚙️) icon
3. Click "Theme"
4. Select Light/Dark/Auto
5. Theme should update immediately
6. Reload page - theme should persist
```

### 4. Test Nickname
```
1. Open a conversation
2. Click settings (⚙️) icon
3. Click "Nickname"
4. Enter a nickname
5. Click "Save Nickname"
6. Nickname should show in header
7. Reload page - nickname should persist
```

## Database Schema Changes

### messages table
```sql
ALTER TABLE messages ADD COLUMN conversation_id TEXT;
ALTER TABLE messages ADD COLUMN deleted_for_users UUID[] DEFAULT '{}';
```

### Indexes
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_deleted_for_users ON messages USING GIN(deleted_for_users);
```

### Functions
```sql
-- Auto-generate conversation_id
CREATE FUNCTION generate_message_conversation_id()

-- Mark messages as deleted for user
CREATE FUNCTION mark_messages_deleted(p_conversation_id TEXT, p_user_id UUID)
```

## Important Notes

1. **Soft Delete**: Messages are NEVER deleted from database, only marked as deleted for specific users
2. **Archived Chats**: Chats are filtered out on load, not deleted
3. **Theme**: Per-conversation theme (not global)
4. **Nickname**: Only visible to the user who set it
5. **Media Files**: Preserved even after "delete" (for other user's access)

## Troubleshooting

### If RPC function not found:
1. Run `COMPREHENSIVE_CHAT_FIXES.sql` in Supabase
2. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'mark_messages_deleted'`
3. Grant permissions: `GRANT EXECUTE ON FUNCTION mark_messages_deleted TO authenticated`

### If archived chats still show:
1. Check `chat_settings` table has `is_archived` column
2. Verify `loadConversations()` filters archived chats
3. Reload the page

### If theme/nickname not persisting:
1. Check `chat_settings` table structure
2. Verify `updateChatSettings()` is called
3. Check browser console for errors

## Success Indicators

✅ No TypeScript errors
✅ No SQL errors in console
✅ Archived button shows with count
✅ Archived chats don't appear in main list
✅ Delete only affects current user
✅ Theme changes are saved
✅ Nicknames are saved and displayed
✅ Other user's messages are preserved

## Next Steps

1. Run `COMPREHENSIVE_CHAT_FIXES.sql` in Supabase
2. Test all features
3. Monitor console for errors
4. Verify database updates
5. Test with multiple users

## Support

If issues persist:
1. Check browser console for errors
2. Check Supabase logs
3. Verify migrations ran successfully
4. Check table permissions
5. Verify user authentication
