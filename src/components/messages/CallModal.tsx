import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Volume2, VolumeX, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CallType, Call, updateCallStatus, subscribeToCallUpdates, sendSignal, subscribeToSignals } from "@/lib/call-service";

interface CallModalProps {
  call: Call | null;
  isOutgoing: boolean;
  onEnd: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

export function CallModal({ call, isOutgoing, onEnd, onAccept, onReject }: CallModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<string>(isOutgoing ? 'Calling...' : 'Incoming call...');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef(false);

  const isVideoCall = call?.call_type === 'video';

  // Setup WebRTC
  useEffect(() => {
    if (!call) return;

    // Reset cleanup flag for new call
    cleanupRef.current = false;

    setupWebRTC();

    // Subscribe to call updates
    const callChannel = subscribeToCallUpdates(call.id, (updatedCall) => {
      console.log('📞 Call status updated:', updatedCall.status);
      
      if (updatedCall.status === 'ongoing') {
        setIsConnected(true);
        setCallStatus('Connected');
        startCallTimer();
      } else if (updatedCall.status === 'ended') {
        setCallStatus('Call ended');
        // Only cleanup resources, don't auto-close
        cleanup();
      } else if (updatedCall.status === 'rejected') {
        setCallStatus("Call declined");
        // Only cleanup resources, don't auto-close
        cleanup();
      } else if (updatedCall.status === 'missed') {
        setCallStatus("Didn't join");
        // Only cleanup resources, don't auto-close
        cleanup();
      }
    });

    // Subscribe to WebRTC signals
    const signalChannel = subscribeToSignals(call.id, handleSignal);

    // No auto-timeout - let users manually end the call

    return () => {
      callChannel.unsubscribe();
      signalChannel.unsubscribe();
      cleanup();
    };
  }, [call]);

  const setupWebRTC = async () => {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: isVideoCall
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && isVideoCall) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && call) {
          console.log('🧊 Sending ICE candidate');
          sendSignal(call.id, 'ice-candidate', event.candidate);
        }
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('📹 Received remote track:', event.track.kind);
        if (remoteVideoRef.current) {
          const remoteStream = event.streams[0];
          remoteVideoRef.current.srcObject = remoteStream;
          console.log('✅ Remote stream connected:', remoteStream.id);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          console.log('✅ Peer connection established');
        } else if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
          console.log('❌ Peer connection lost');
        }
      };

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
      };

      // If outgoing call, create offer
      if (isOutgoing && call) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await sendSignal(call.id, 'offer', offer);
      }

    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      setCallStatus('Failed to access media devices');
    }
  };

  const handleSignal = async (signalType: string, signalData: any) => {
    if (!peerConnectionRef.current || !call) return;

    try {
      console.log('📨 Received signal:', signalType);
      
      if (signalType === 'offer') {
        console.log('📥 Processing offer...');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        console.log('📤 Sending answer...');
        await sendSignal(call.id, 'answer', answer);
      } else if (signalType === 'answer') {
        console.log('📥 Processing answer...');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
      } else if (signalType === 'ice-candidate') {
        console.log('🧊 Adding ICE candidate...');
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData));
      }
    } catch (error) {
      console.error('❌ Error handling signal:', error);
    }
  };

  const startCallTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log('🎤 Microphone:', audioTrack.enabled ? 'Unmuted' : 'Muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && isVideoCall) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        console.log('📹 Camera:', videoTrack.enabled ? 'On' : 'Off');
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleAccept = async () => {
    if (call && onAccept) {
      console.log('✅ Accepting call and updating status to ongoing');
      await updateCallStatus(call.id, 'ongoing');
      onAccept();
      
      // If this is the receiver accepting, create an answer
      if (!isOutgoing && peerConnectionRef.current && call) {
        try {
          // Wait a bit for the offer to arrive
          setTimeout(async () => {
            if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'stable') {
              console.log('⚠️ No offer received yet, waiting...');
            }
          }, 1000);
        } catch (error) {
          console.error('Error creating answer:', error);
        }
      }
    }
  };

  const handleReject = async () => {
    if (call && onReject) {
      await updateCallStatus(call.id, 'rejected');
      onReject();
    }
  };

  const endCall = async () => {
    console.log('🛑 User ending call manually');
    if (call && !cleanupRef.current) {
      await updateCallStatus(call.id, 'ended', callDuration);
    }
    cleanup();
    onEnd();
  };

  const cleanup = () => {
    // Prevent multiple cleanup calls
    if (cleanupRef.current) {
      console.log('⚠️ Cleanup already performed, skipping...');
      return;
    }
    cleanupRef.current = true;
    
    console.log('🧹 Cleaning up call resources...');
    
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`⏹️ Stopped ${track.kind} track`);
      });
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log('🔌 Peer connection closed');
    }

    // Clear timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!call) return null;

  const displayName = isOutgoing ? call.receiver_name : call.caller_name;
  const displayAvatar = isOutgoing ? call.receiver_avatar : call.caller_avatar;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-50 flex flex-col"
      >
        {/* Video containers */}
        {isVideoCall && isConnected ? (
          <>
            {/* Remote video (full screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Local video (small preview) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-20 right-4 w-28 h-40 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  isVideoOff && "hidden"
                )}
              />
              {isVideoOff && (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white/50" />
                </div>
              )}
            </motion.div>
          </>
        ) : null}

        {/* Top bar */}
        <div className="relative z-20 flex justify-between items-center p-4 pt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={endCall}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>

        {/* Center content - User info */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            {(!isVideoCall || !isConnected) && (
              <Avatar className="w-36 h-36 mb-8 border-4 border-white/10 shadow-2xl">
                <AvatarImage src={displayAvatar} />
                <AvatarFallback className="text-5xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  {displayName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            )}

            <h2 className="text-3xl font-medium text-white mb-3 text-center">
              {displayName}
            </h2>
            <p className="text-white/60 text-lg">
              {isConnected ? formatDuration(callDuration) : callStatus}
            </p>
          </motion.div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-20 pb-12 px-6">
          {/* Ringing state - Accept/Reject buttons (INCOMING CALL) */}
          {!isOutgoing && !isConnected && call?.status === 'ringing' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-center items-center gap-16 mb-8"
            >
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleReject}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-white text-sm">Decline</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <span className="text-white text-sm">Accept</span>
              </div>
            </motion.div>
          )}

          {/* Connected/Calling state - Call controls */}
          {(isConnected || isOutgoing) && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-center items-end gap-6 px-4"
            >
              {/* Camera toggle (video calls only) */}
              {isVideoCall && isConnected && (
                <button
                  onClick={toggleVideo}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                    isVideoOff ? "bg-gray-700" : "bg-gray-800/80 backdrop-blur-sm"
                  )}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </button>
              )}

              {/* Microphone toggle */}
              {isConnected && (
                <button
                  onClick={toggleMute}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                    isMuted ? "bg-gray-700" : "bg-gray-800/80 backdrop-blur-sm"
                  )}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>
              )}

              {/* End call button */}
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>

              {/* Speaker toggle */}
              {isConnected && (
                <button
                  onClick={toggleSpeaker}
                  className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center"
                >
                  {isSpeakerOn ? (
                    <Volume2 className="w-6 h-6 text-white" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white" />
                  )}
                </button>
              )}
            </motion.div>
          )}

          {/* Didn't join state */}
          {!isConnected && !isOutgoing && call?.status === 'missed' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-center items-center gap-16"
            >
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <X className="w-7 h-7 text-gray-900" />
                </button>
                <span className="text-white text-sm">Close</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => {
                    endCall();
                    // Trigger re-call logic here
                  }}
                  className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
                >
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <span className="text-white text-sm">Call again</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
