-- Create calls table
-- IMPORTANT: Make sure Realtime is enabled for this table in Supabase Dashboard
-- Go to: Database > Replication > Enable for 'calls' table
CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  status TEXT NOT NULL CHECK (status IN ('ringing', 'ongoing', 'ended', 'rejected', 'missed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_signals table for WebRTC signaling
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_caller ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver ON calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON call_signals(call_id);

-- Enable RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies for calls table
DROP POLICY IF EXISTS "Users can view their own calls" ON calls;
CREATE POLICY "Users can view their own calls" ON calls
  FOR SELECT USING (
    auth.uid() = caller_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "Users can create calls" ON calls;
CREATE POLICY "Users can create calls" ON calls
  FOR INSERT WITH CHECK (
    auth.uid() = caller_id
  );

DROP POLICY IF EXISTS "Users can update their own calls" ON calls;
CREATE POLICY "Users can update their own calls" ON calls
  FOR UPDATE USING (
    auth.uid() = caller_id OR auth.uid() = receiver_id
  );

-- RLS policies for call_signals table
DROP POLICY IF EXISTS "Users can view signals for their calls" ON call_signals;
CREATE POLICY "Users can view signals for their calls" ON call_signals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_signals.call_id
      AND (calls.caller_id = auth.uid() OR calls.receiver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert signals for their calls" ON call_signals;
CREATE POLICY "Users can insert signals for their calls" ON call_signals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_signals.call_id
      AND (calls.caller_id = auth.uid() OR calls.receiver_id = auth.uid())
    )
  );

-- Function to automatically mark missed calls
CREATE OR REPLACE FUNCTION mark_missed_calls()
RETURNS TRIGGER AS $$
BEGIN
  -- If call status is still 'ringing' after 60 seconds, mark as missed
  IF OLD.status = 'ringing' AND NEW.status = 'ringing' 
     AND NEW.started_at < NOW() - INTERVAL '60 seconds' THEN
    NEW.status = 'missed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_missed_calls ON calls;
CREATE TRIGGER trigger_mark_missed_calls
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION mark_missed_calls();

-- Add user_call_status table to track if user is currently in a call
CREATE TABLE IF NOT EXISTS user_call_status (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  is_in_call BOOLEAN DEFAULT FALSE,
  current_call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_call_status
ALTER TABLE user_call_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_call_status
DROP POLICY IF EXISTS "Users can view call status" ON user_call_status;
CREATE POLICY "Users can view call status" ON user_call_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own call status" ON user_call_status;
CREATE POLICY "Users can insert their own call status" ON user_call_status
  FOR INSERT WITH CHECK (true); -- Allow inserts from triggers

DROP POLICY IF EXISTS "Users can update their own call status" ON user_call_status;
CREATE POLICY "Users can update their own call status" ON user_call_status
  FOR UPDATE USING (true) WITH CHECK (true); -- Allow updates from triggers

DROP POLICY IF EXISTS "Users can delete their own call status" ON user_call_status;
CREATE POLICY "Users can delete their own call status" ON user_call_status
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update user call status
CREATE OR REPLACE FUNCTION update_user_call_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When call starts (ongoing), mark both users as in call
  IF NEW.status = 'ongoing' AND OLD.status != 'ongoing' THEN
    INSERT INTO user_call_status (user_id, is_in_call, current_call_id)
    VALUES (NEW.caller_id, TRUE, NEW.id)
    ON CONFLICT (user_id) DO UPDATE SET is_in_call = TRUE, current_call_id = NEW.id, updated_at = NOW();
    
    INSERT INTO user_call_status (user_id, is_in_call, current_call_id)
    VALUES (NEW.receiver_id, TRUE, NEW.id)
    ON CONFLICT (user_id) DO UPDATE SET is_in_call = TRUE, current_call_id = NEW.id, updated_at = NOW();
  END IF;
  
  -- When call ends, mark both users as not in call
  IF NEW.status IN ('ended', 'rejected', 'missed') AND OLD.status NOT IN ('ended', 'rejected', 'missed') THEN
    UPDATE user_call_status SET is_in_call = FALSE, current_call_id = NULL, updated_at = NOW()
    WHERE user_id IN (NEW.caller_id, NEW.receiver_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_call_status ON calls;
CREATE TRIGGER trigger_update_user_call_status
  AFTER UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_user_call_status();

-- Alternative: Use broadcast channel for incoming calls (no Replication needed)
-- This creates a realtime broadcast when a new call is inserted
CREATE OR REPLACE FUNCTION notify_incoming_call()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast the new call to the receiver
  PERFORM pg_notify(
    'incoming_call_' || NEW.receiver_id,
    json_build_object(
      'id', NEW.id,
      'caller_id', NEW.caller_id,
      'receiver_id', NEW.receiver_id,
      'call_type', NEW.call_type,
      'status', NEW.status,
      'started_at', NEW.started_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_incoming_call ON calls;
CREATE TRIGGER trigger_notify_incoming_call
  AFTER INSERT ON calls
  FOR EACH ROW
  EXECUTE FUNCTION notify_incoming_call();

-- Also broadcast call status updates
CREATE OR REPLACE FUNCTION notify_call_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify both participants about the call update
  PERFORM pg_notify(
    'call_update_' || NEW.id,
    json_build_object(
      'id', NEW.id,
      'status', NEW.status,
      'ended_at', NEW.ended_at,
      'duration', NEW.duration
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_call_update ON calls;
CREATE TRIGGER trigger_notify_call_update
  AFTER UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION notify_call_update();
