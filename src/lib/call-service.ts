import { supabase } from "./supabase";

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'ongoing' | 'ended' | 'rejected' | 'missed';

export interface Call {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: CallType;
  status: CallStatus;
  started_at: string;
  ended_at?: string;
  duration?: number;
  caller_name?: string;
  caller_avatar?: string;
  receiver_name?: string;
  receiver_avatar?: string;
}

export interface CallOffer {
  sdp: string;
  type: 'offer';
}

export interface CallAnswer {
  sdp: string;
  type: 'answer';
}

export interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

export interface UserCallStatus {
  user_id: string;
  is_in_call: boolean;
  current_call_id?: string;
  updated_at: string;
}

// LocalStorage keys for call persistence
const ACTIVE_CALL_KEY = 'active_call_state';
const CALL_ROLE_KEY = 'call_role'; // 'caller' or 'receiver'

// Save active call to localStorage for persistence across refreshes
export function saveActiveCallState(call: Call, role: 'caller' | 'receiver') {
  try {
    localStorage.setItem(ACTIVE_CALL_KEY, JSON.stringify(call));
    localStorage.setItem(CALL_ROLE_KEY, role);
    console.log('💾 Call state saved to localStorage:', call.id);
  } catch (error) {
    console.error('Error saving call state:', error);
  }
}

// Get active call from localStorage
export function getActiveCallState(): { call: Call | null; role: 'caller' | 'receiver' | null } {
  try {
    const callData = localStorage.getItem(ACTIVE_CALL_KEY);
    const role = localStorage.getItem(CALL_ROLE_KEY) as 'caller' | 'receiver' | null;
    
    if (!callData) return { call: null, role: null };
    
    const call = JSON.parse(callData) as Call;
    
    // Only return if call is still active (not ended/rejected)
    if (call.status === 'ended' || call.status === 'rejected' || call.status === 'missed') {
      clearActiveCallState();
      return { call: null, role: null };
    }
    
    console.log('📱 Restored call state from localStorage:', call.id);
    return { call, role };
  } catch (error) {
    console.error('Error getting call state:', error);
    return { call: null, role: null };
  }
}

// Clear active call from localStorage
export function clearActiveCallState() {
  try {
    localStorage.removeItem(ACTIVE_CALL_KEY);
    localStorage.removeItem(CALL_ROLE_KEY);
    console.log('🗑️ Call state cleared from localStorage');
  } catch (error) {
    console.error('Error clearing call state:', error);
  }
}

// Update active call state in localStorage
export function updateActiveCallState(updates: Partial<Call>) {
  try {
    const { call, role } = getActiveCallState();
    if (call && role) {
      const updatedCall = { ...call, ...updates };
      saveActiveCallState(updatedCall, role);
    }
  } catch (error) {
    console.error('Error updating call state:', error);
  }
}

// Check if a user is currently in a call
export async function isUserInCall(userId: string): Promise<{ inCall: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .from('user_call_status')
      .select('is_in_call, current_call_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error

    return { inCall: data?.is_in_call || false, error: null };
  } catch (error) {
    console.error('Error checking user call status:', error);
    return { inCall: false, error };
  }
}

// Create a new call
export async function initiateCall(
  receiverId: string,
  callType: CallType
): Promise<{ data: Call | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if receiver is already in a call
    const { inCall: receiverBusy } = await isUserInCall(receiverId);
    if (receiverBusy) {
      return { 
        data: null, 
        error: { message: 'User is currently in another call', code: 'USER_BUSY' } 
      };
    }

    // Check if caller is already in a call
    const { inCall: callerBusy } = await isUserInCall(user.id);
    if (callerBusy) {
      return { 
        data: null, 
        error: { message: 'You are already in a call', code: 'CALLER_BUSY' } 
      };
    }

    const { data, error } = await supabase
      .from('calls')
      .insert({
        caller_id: user.id,
        receiver_id: receiverId,
        call_type: callType,
        status: 'ringing',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Save call state for persistence
    if (data) {
      saveActiveCallState(data, 'caller');
    }

    // Broadcast the call to the receiver using proper channel subscription
    if (data) {
      console.log('📡 Broadcasting call to receiver:', receiverId);
      const broadcastChannel = supabase.channel(`incoming-calls-${receiverId}`);
      
      // Subscribe first, then send
      broadcastChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await broadcastChannel.send({
            type: 'broadcast',
            event: 'incoming_call',
            payload: data
          });
          // Unsubscribe after sending
          setTimeout(() => broadcastChannel.unsubscribe(), 1000);
        }
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error initiating call:', error);
    return { data: null, error };
  }
}

// Update call status
export async function updateCallStatus(
  callId: string,
  status: CallStatus,
  duration?: number
): Promise<{ error: any }> {
  try {
    const updateData: any = {
      status,
      ...(status === 'ended' && { ended_at: new Date().toISOString(), duration })
    };

    const { data, error } = await supabase
      .from('calls')
      .update(updateData)
      .eq('id', callId)
      .select()
      .single();

    if (error) throw error;

    // Update localStorage if this is the active call
    updateActiveCallState({ status, ended_at: updateData.ended_at, duration });
    
    // Clear localStorage if call has ended
    if (status === 'ended' || status === 'rejected' || status === 'missed') {
      clearActiveCallState();
    }

    // Broadcast the update using proper channel subscription
    if (data) {
      console.log('📡 Broadcasting call update for:', callId);
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
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating call status:', error);
    return { error };
  }
}

// Subscribe to incoming calls (using broadcast - works without Replication)
export function subscribeToIncomingCalls(
  userId: string,
  onIncomingCall: (call: Call) => void
) {
  console.log('🔔 Setting up incoming call subscription for user:', userId);
  
  let lastProcessedCallId: string | null = null;
  
  // Use broadcast channel instead of postgres_changes
  const channel = supabase
    .channel(`incoming-calls-${userId}`, {
      config: {
        broadcast: { ack: false, self: false }
      }
    })
    .on('broadcast', { event: 'incoming_call' }, async (payload) => {
      console.log('📞 Broadcast incoming call received:', payload);
      
      const callData = payload.payload;
      
      // Prevent duplicate processing
      if (lastProcessedCallId === callData.id) {
        console.log('⏭️ Skipping duplicate call notification');
        return;
      }
      lastProcessedCallId = callData.id;
      
      // Fetch caller details
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', callData.caller_id)
        .single();

      console.log('👤 Caller profile:', callerProfile);

      const call: Call = {
        ...callData as Call,
        caller_name: callerProfile?.full_name || callerProfile?.username,
        caller_avatar: callerProfile?.avatar_url
      };

      console.log('📞 Triggering onIncomingCall callback with:', call);
      onIncomingCall(call);
    })
    .subscribe((status) => {
      console.log('📡 Call broadcast subscription status:', status);
    });

  // Also poll for new calls as backup
  const pollInterval = setInterval(async () => {
    const { data } = await supabase
      .from('calls')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'ringing')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data && data.id !== lastProcessedCallId) {
      const timestamp = new Date(data.created_at).getTime();
      const now = Date.now();
      // Only trigger if call is less than 5 seconds old
      if (now - timestamp < 5000) {
        console.log('📞 Polling found new call:', data);
        lastProcessedCallId = data.id;
        
        // Fetch caller details
        const { data: callerProfile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', data.caller_id)
          .single();

        const call: Call = {
          ...data as Call,
          caller_name: callerProfile?.full_name || callerProfile?.username,
          caller_avatar: callerProfile?.avatar_url
        };

        onIncomingCall(call);
      }
    }
  }, 2000); // Poll every 2 seconds

  // Return cleanup function
  return {
    unsubscribe: () => {
      clearInterval(pollInterval);
      channel.unsubscribe();
    }
  };
}

// Subscribe to call status updates (using broadcast)
export function subscribeToCallUpdates(
  callId: string,
  onCallUpdate: (call: Call) => void
) {
  let lastStatus: CallStatus | null = null;
  
  const channel = supabase
    .channel(`call-${callId}`, {
      config: {
        broadcast: { ack: false, self: false }
      }
    })
    .on('broadcast', { event: 'call_update' }, (payload) => {
      console.log('📞 Call update received via broadcast:', payload);
      const callData = payload.payload as Call;
      if (callData.status !== lastStatus) {
        lastStatus = callData.status;
        onCallUpdate(callData);
      }
    })
    .subscribe((status) => {
      console.log('📡 Call update subscription status:', status);
    });

  // Poll for updates as backup - check more frequently
  const pollInterval = setInterval(async () => {
    const { data } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .maybeSingle();
    
    if (data && data.status !== lastStatus) {
      console.log('📞 Call update received via polling:', data.status);
      lastStatus = data.status;
      onCallUpdate(data as Call);
    }
  }, 500); // Poll every 500ms for faster response

  return {
    unsubscribe: () => {
      clearInterval(pollInterval);
      channel.unsubscribe();
    }
  };
}

// Send WebRTC signaling data
export async function sendSignal(
  callId: string,
  signalType: 'offer' | 'answer' | 'ice-candidate',
  signalData: any
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('call_signals')
      .insert({
        call_id: callId,
        signal_type: signalType,
        signal_data: signalData
      });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error sending signal:', error);
    return { error };
  }
}

// Subscribe to WebRTC signals
export function subscribeToSignals(
  callId: string,
  onSignal: (signalType: string, signalData: any) => void
) {
  const channel = supabase
    .channel(`signals-${callId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `call_id=eq.${callId}`
      },
      (payload) => {
        console.log('📡 Signal received:', payload);
        const { signal_type, signal_data } = payload.new as any;
        onSignal(signal_type, signal_data);
      }
    )
    .subscribe();

  return channel;
}

// Get call history
export async function getCallHistory(
  userId: string
): Promise<{ data: Call[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching call history:', error);
    return { data: null, error };
  }
}
