-- =============================================
-- CREATE FOLLOW REQUESTS TABLE FOR PRIVATE PROFILES
-- =============================================
-- This handles follow requests for private accounts

-- Create follow_requests table
CREATE TABLE IF NOT EXISTS public.follow_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate requests
  CONSTRAINT follow_requests_unique UNIQUE (requester_id, target_id),
  CONSTRAINT follow_requests_no_self_request CHECK (requester_id != target_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follow_requests_requester ON public.follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_target ON public.follow_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_status ON public.follow_requests(status);
CREATE INDEX IF NOT EXISTS idx_follow_requests_created ON public.follow_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own sent requests and received requests
CREATE POLICY "follow_requests_select_policy" ON public.follow_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = target_id
  );

-- Users can create follow requests
CREATE POLICY "follow_requests_insert_policy" ON public.follow_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update requests they received (accept/reject)
CREATE POLICY "follow_requests_update_policy" ON public.follow_requests
  FOR UPDATE
  USING (auth.uid() = target_id);

-- Users can delete their own sent requests
CREATE POLICY "follow_requests_delete_policy" ON public.follow_requests
  FOR DELETE
  USING (auth.uid() = requester_id);

-- Function to handle accepted follow requests
CREATE OR REPLACE FUNCTION handle_accepted_follow_request()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is accepted, create a follower relationship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.followers (follower_id, following_id)
    VALUES (NEW.requester_id, NEW.target_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
    
    -- Delete the request after accepting
    DELETE FROM public.follow_requests WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for accepted requests
DROP TRIGGER IF EXISTS follow_request_accepted_trigger ON public.follow_requests;
CREATE TRIGGER follow_request_accepted_trigger
  AFTER UPDATE ON public.follow_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_accepted_follow_request();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_follow_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS follow_request_updated_at_trigger ON public.follow_requests;
CREATE TRIGGER follow_request_updated_at_trigger
  BEFORE UPDATE ON public.follow_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_request_timestamp();
