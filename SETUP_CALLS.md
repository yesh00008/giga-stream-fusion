# 🚀 Quick Setup Guide for Video/Audio Calls

## Step 1: Database Setup
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Open the file `CREATE_CALLS_TABLES.sql` from this project
5. Copy and paste the entire SQL content
6. Click **RUN** to execute

## Step 2: Verify Installation
After running the SQL, you should see these new tables:
- ✅ `calls`
- ✅ `call_signals`

## Step 3: Test the Feature
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in **two different browsers** (or incognito mode)
3. Login as two different users
4. Open a chat conversation
5. Click the **Phone** icon (audio call) or **Video** icon (video call)

## Step 4: Grant Permissions
When starting a call, your browser will ask for permissions:
- ✅ Allow access to **Microphone**
- ✅ Allow access to **Camera** (for video calls)

## Features You Can Test

### Audio Call
1. Click the phone icon in chat header
2. Wait for the other user to accept
3. Test controls:
   - Mute/unmute microphone
   - Toggle speaker
   - End call

### Video Call
1. Click the video camera icon in chat header
2. Wait for the other user to accept
3. Test controls:
   - Mute/unmute microphone
   - Turn camera on/off
   - Toggle speaker
   - End call

### Incoming Calls
When someone calls you:
- A notification appears at the top of the screen
- Click the green phone button to accept
- Click the red phone button to reject

## Troubleshooting

### "Permission denied" error
- Allow camera/microphone permissions in your browser settings
- Refresh the page and try again

### "Call doesn't connect"
- Make sure both users are online
- Check your internet connection
- Try using Chrome/Edge for best compatibility

### "No video/audio"
- Verify your camera/microphone is not being used by another app
- Check browser console for errors
- Try restarting your browser

## Database Structure

### Calls Table
Stores all call records with:
- Caller and receiver IDs
- Call type (audio/video)
- Status (ringing, ongoing, ended, etc.)
- Duration
- Timestamps

### Call Signals Table
Stores WebRTC signaling data for establishing peer connections

## Need Help?
- Check `CALLS_README.md` for detailed documentation
- Review browser console for errors
- Verify Supabase tables were created correctly
- Ensure RLS policies are active
