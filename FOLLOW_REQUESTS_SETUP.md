# Follow Requests Setup Guide

## 📋 Overview
This guide will help you set up the follow requests table in your Supabase database for private account functionality.

## 🚀 Quick Setup

### Step 1: Open Supabase Dashboard
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the SQL Script
1. Click **New Query** button
2. Copy the entire content from `CREATE_FOLLOW_REQUESTS_TABLE.sql`
3. Paste it into the SQL Editor
4. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Step 3: Verify Installation
After running the script, verify that the table was created:

```sql
SELECT * FROM public.follow_requests LIMIT 1;
```

You should see an empty table with the following columns:
- `id` (UUID)
- `requester_id` (UUID)
- `target_id` (UUID)
- `status` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## ✅ What This Creates

### Table Structure
- **follow_requests**: Stores pending, accepted, and rejected follow requests
  - Unique constraint prevents duplicate requests
  - Self-request check prevents users from requesting to follow themselves

### RLS Policies
- ✅ Users can view their own sent and received requests
- ✅ Users can create follow requests
- ✅ Users can update requests they received (accept/reject)
- ✅ Users can delete their own sent requests

### Triggers
- ✅ Auto-creates follower relationship when request is accepted
- ✅ Auto-deletes request after acceptance
- ✅ Auto-updates `updated_at` timestamp

### Indexes
- ✅ Performance indexes on `requester_id`, `target_id`, `status`, and `created_at`

## 🎯 How It Works

### For Public Accounts
1. User clicks "Follow" button
2. Follower relationship created immediately
3. No request needed

### For Private Accounts
1. User clicks "Follow" button → Shows "Requested"
2. Creates a follow request with status: `pending`
3. Target user sees request in Notifications page
4. Target user can **Accept** or **Reject**:
   - **Accept**: Trigger automatically creates follower relationship and deletes request
   - **Reject**: Request is deleted

## 🔧 Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the SQL script in the correct project
- Check if the table exists: `SELECT * FROM public.follow_requests;`

### Error: "permission denied"
- Verify RLS policies are enabled
- Check that you're signed in as a valid user

### Requests not showing
1. Check Notifications page → "Requests" tab
2. Verify you have `is_private = true` in your profile
3. Test by having another user try to follow you

## 📱 Features Enabled

After setup, you'll have:
- ✅ Private account toggle in Settings
- ✅ Follow request system for private accounts
- ✅ Notifications page showing pending requests
- ✅ Accept/Reject buttons in Notifications
- ✅ Profile page showing request count badge
- ✅ "Requested" button state when pending
- ✅ Posts from private accounts hidden from non-followers

## 🎉 You're Done!

The follow request system is now fully functional. Users with private accounts will require approval before followers can see their posts.
