# 📞 Video & Audio Call Feature

## Overview
Fully functional video and audio calling system integrated into the Instagram-style chat application using WebRTC for peer-to-peer communication.

## Features

### ✅ Implemented Features
- **Audio Calls**: High-quality voice calls between users
- **Video Calls**: Real-time video communication with camera and screen sharing
- **Call Controls**:
  - Mute/Unmute microphone
  - Turn video on/off
  - Toggle speaker
  - End call
- **Incoming Call Notifications**: Beautiful notification UI for incoming calls
- **Call History**: Track all calls (ongoing, missed, rejected, ended)
- **Real-time Signaling**: WebRTC signaling through Supabase Realtime
- **Automatic Missed Calls**: Auto-mark calls as missed after 60 seconds

## Architecture

### Frontend Components
1. **CallModal** (`src/components/messages/CallModal.tsx`)
   - Main call interface with video display
   - Call controls (mute, video toggle, speaker, end)
   - Duration timer
   - Beautiful gradient background

2. **IncomingCallNotification** (`src/components/messages/IncomingCallNotification.tsx`)
   - Floating notification for incoming calls
   - Accept/Reject buttons
   - Caller information display

### Backend Services
1. **call-service.ts** (`src/lib/call-service.ts`)
   - Call initiation
   - Call status management
   - WebRTC signaling (offer/answer/ICE candidates)
   - Real-time subscriptions
   - Call history

### Database Schema
- **calls** table: Stores call records
- **call_signals** table: Stores WebRTC signaling data
- Row Level Security (RLS) policies for privacy
- Automatic triggers for missed call detection

## Setup Instructions

### 1. Database Setup
Run the SQL migration in your Supabase dashboard:

```bash
# The migration file is located at:
CREATE_CALLS_TABLES.sql
```

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy contents of `CREATE_CALLS_TABLES.sql`
4. Execute the query

### 2. WebRTC Configuration
The app uses Google's STUN servers by default:
```javascript
{
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}
```

For production, consider adding TURN servers for better connectivity:
```javascript
{
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
}
```

### 3. Browser Permissions
Users must grant camera and microphone permissions:
- The app automatically requests permissions when a call starts
- Permissions are required for both audio and video calls

## Usage

### Starting a Call
From the chat interface:
1. Open a conversation
2. Click the **Phone** icon for audio call
3. Click the **Video** icon for video call

### Receiving a Call
1. Incoming call notification appears at the top
2. Click green phone button to accept
3. Click red phone button to reject

### During a Call
- **Mute**: Toggle microphone on/off
- **Video**: Toggle camera on/off (video calls only)
- **Speaker**: Toggle speaker/earpiece
- **End Call**: Terminate the call

## Technical Details

### WebRTC Flow
1. **Caller** initiates call → creates offer SDP
2. **Offer** sent through Supabase Realtime
3. **Receiver** receives offer → creates answer SDP
4. **Answer** sent back through Supabase
5. **ICE candidates** exchanged for NAT traversal
6. **Peer connection** established
7. **Media streams** shared between peers

### Call States
- `ringing`: Call initiated, waiting for answer
- `ongoing`: Call is active
- `ended`: Call completed normally
- `rejected`: Call declined by receiver
- `missed`: Call not answered within 60 seconds

### Security
- Row Level Security ensures users can only:
  - View their own calls
  - Create calls where they are the caller
  - Update calls where they are participant
- All signaling data is encrypted in transit
- Media streams are peer-to-peer (not stored)

## Files Modified/Created

### New Files
- `src/lib/call-service.ts` - Call management service
- `src/components/messages/CallModal.tsx` - Main call interface
- `src/components/messages/IncomingCallNotification.tsx` - Call notification
- `CREATE_CALLS_TABLES.sql` - Database migration
- `setup-calls.sh` - Setup helper script
- `CALLS_README.md` - This documentation

### Modified Files
- `src/pages/MessagesInstagram.tsx` - Integrated call functionality

## Future Enhancements

### Potential Additions
- [ ] Group calls (3+ participants)
- [ ] Screen sharing
- [ ] Call recording
- [ ] Call quality indicators
- [ ] Network status display
- [ ] Background blur for video
- [ ] Virtual backgrounds
- [ ] Chat during call
- [ ] Call waiting
- [ ] Call forwarding
- [ ] Voicemail

## Troubleshooting

### Common Issues

**Call doesn't connect:**
- Check browser permissions for camera/microphone
- Verify STUN/TURN server accessibility
- Check firewall settings
- Ensure both users are online

**No audio/video:**
- Verify device permissions
- Check if device is in use by another app
- Try refreshing the browser
- Check browser compatibility

**Poor quality:**
- Check internet connection speed
- Consider adding TURN servers
- Reduce video quality settings
- Close bandwidth-heavy applications

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS 11+)
- ⚠️ Mobile browsers (limited features)

## Performance Tips
1. Use TURN servers for better NAT traversal
2. Implement adaptive bitrate for video
3. Add connection quality monitoring
4. Implement reconnection logic
5. Cache ICE candidates

## Support
For issues or questions:
- Check browser console for WebRTC errors
- Verify Supabase Realtime is working
- Test with different networks
- Review call_signals table for signaling issues
