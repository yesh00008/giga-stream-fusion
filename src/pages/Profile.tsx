import { useState, useEffect, useRef } from "react";
import { Settings2, Share2, MapPin, Link as LinkIcon, Calendar, Edit2, Pen, Mail, Phone, Globe, Video, BarChart3, Users, Shield, Bell, Lock, Star, Bookmark, Award, TrendingUp, MessageSquare, Copy, Check, MoreVertical, Upload, Loader2, RefreshCw, Image as ImageIcon, UserPlus, UserCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostCard } from "@/components/PostCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImageEditor } from "@/components/ImageEditor";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { BadgeInfoDialog } from "@/components/BadgeInfoDialog";
import { MobileProfileHeader } from "@/components/MobileProfileHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isOwnProfile = !urlUsername || urlUsername === user?.user_metadata?.username;
  const [copied, setCopied] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followRequestPending, setFollowRequestPending] = useState(false);
  const [followRequestsCount, setFollowRequestsCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    email: "",
    phone: "",
    joined: "",
    verified: false,
    badge_type: null as BadgeType,
    avatar_url: "",
    banner_url: "",
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    is_private: false,
    id: "",
  });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");

  useEffect(() => {
    if (urlUsername || user) {
      fetchProfileData();
      fetchUserPosts();
      if (isOwnProfile) {
        fetchUserBadges();
        fetchFollowRequests();
      } else {
        checkFollowStatus();
      }
    }
  }, [user, urlUsername]);

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      let profileQuery;
      
      if (urlUsername) {
        // Viewing another user's profile
        profileQuery = supabase
          .from('profiles')
          .select('*')
          .eq('username', urlUsername)
          .maybeSingle();
      } else if (user?.id) {
        // Viewing own profile
        profileQuery = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
      } else {
        console.error('No user ID or username available');
        toast.error('Profile not found');
        setLoading(false);
        return;
      }
      
      let { data, error } = await profileQuery;

      console.log('Profile query result:', { data, error });

      // If profile doesn't exist and it's the current user, create it
      if (!data && !error && isOwnProfile && user?.id) {
        console.log('Creating new profile for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error(`Failed to create profile: ${createError.message}`);
          throw createError;
        }

        console.log('Profile created successfully:', newProfile);
        data = newProfile;
        toast.success('Profile created successfully!');
      }

      if (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile');
        throw error;
      }

      if (!data) {
        toast.error('Profile not found');
        navigate('/');
        return;
      }

      if (data) {
        console.log('Profile data loaded:', data);

        setProfile({
          name: data.full_name || data.username || 'User',
          username: data.username || 'user',
          bio: data.bio || 'No bio yet',
          location: data.location || '',
          website: data.website || '',
          email: user?.email || '',
          phone: '',
          joined: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          verified: data.verified || false,
          badge_type: data.badge_type || null,
          avatar_url: data.avatar_url || '',
          banner_url: data.banner_url || '',
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0,
          posts_count: data.posts_count || 0,
          is_private: data.is_private || false,
          id: data.id || '',
        });
        console.log('Profile state updated successfully');
      } else {
        console.warn('No profile data returned');
        toast.error('Profile data is empty');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error(`Failed to load profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      let userId;
      
      if (urlUsername) {
        // Get user ID from username
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', urlUsername)
          .single();
        
        if (!profileData) return;
        userId = profileData.id;
      } else if (user?.id) {
        userId = user.id;
      } else {
        console.log('No user ID, skipping posts fetch');
        return;
      }

      console.log('Fetching posts for user:', userId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, verified, badge_type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching posts:', error);
        // Don't throw, just log - posts are optional
        return;
      }
      
      console.log('Posts loaded:', data?.length || 0);
      setUserPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      // Posts are optional, don't show error toast
    }
  };

  const refreshProfile = async () => {
    await Promise.all([
      fetchProfileData(),
      fetchUserPosts(),
      fetchUserBadges()
    ]);
    toast.success('Profile refreshed!');
  };

  const checkFollowStatus = async () => {
    if (!user?.id || !urlUsername) return;

    try {
      // Optimized: Single query to check both profile and follow status
      const { data: result, error } = await supabase.rpc('check_follow_and_request_status', {
        viewer_id: user.id,
        target_username: urlUsername
      });

      if (error) {
        // Fallback to manual queries if RPC doesn't exist
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', urlUsername)
          .single();

        if (!targetProfile) return;

        // Check if following
        const { data: followData } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetProfile.id)
          .maybeSingle();

        setIsFollowing(!!followData);

        // Check for pending request
        const { data: requestData } = await supabase
          .from('follow_requests')
          .select('id')
          .eq('requester_id', user.id)
          .eq('target_id', targetProfile.id)
          .eq('status', 'pending')
          .maybeSingle();

        setFollowRequestPending(!!requestData);
      } else {
        setIsFollowing(result?.is_following || false);
        setFollowRequestPending(result?.has_pending_request || false);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user?.id) {
      toast.error('Please sign in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      // Get the full profile of the user being viewed
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('id, is_private, username')
        .eq('username', urlUsername)
        .single();

      if (!targetProfile) {
        toast.error('User not found');
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetProfile.id);

        if (error) throw error;

        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          followers_count: Math.max(0, prev.followers_count - 1)
        }));
        toast.success('Unfollowed');
      } else if (followRequestPending) {
        // Cancel follow request
        const { error } = await supabase
          .from('follow_requests')
          .delete()
          .eq('requester_id', user.id)
          .eq('target_id', targetProfile.id);

        if (error) throw error;

        setFollowRequestPending(false);
        toast.success('Follow request cancelled');
      } else {
        // Check if profile is private
        if (targetProfile.is_private) {
          // Send follow request
          const { error } = await supabase
            .from('follow_requests')
            .insert([{
              requester_id: user.id,
              target_id: targetProfile.id
            }]);

          if (error) {
            // Check if it's a duplicate error
            if (error.code === '23505') {
              toast.info('Follow request already sent');
              setFollowRequestPending(true);
            } else {
              throw error;
            }
          } else {
            setFollowRequestPending(true);
            toast.success('Follow request sent');
          }
        } else {
          // Public profile - follow directly
          // First check if already following to prevent duplicate
          const { data: existingFollow } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', targetProfile.id)
            .maybeSingle();

          if (existingFollow) {
            toast.info('Already following');
            setIsFollowing(true);
            return;
          }

          const { error } = await supabase
            .from('followers')
            .insert([{
              follower_id: user.id,
              following_id: targetProfile.id
            }]);

          if (error) {
            if (error.code === '23505') {
              toast.info('Already following');
              setIsFollowing(true);
            } else {
              throw error;
            }
          } else {
            setIsFollowing(true);
            setProfile(prev => ({
              ...prev,
              followers_count: prev.followers_count + 1
            }));
            toast.success('Following');
          }
        }
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error);
      toast.error(error.message || 'Action failed. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchFollowRequests = async () => {
    if (!user?.id || !isOwnProfile) return;

    try {
      const { data, error } = await supabase
        .from('follow_requests')
        .select(`
          id,
          created_at,
          requester:requester_id (
            id,
            username,
            full_name,
            avatar_url,
            badge_type,
            bio
          )
        `)
        .eq('target_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingRequests(data || []);
      setFollowRequestsCount((data || []).length);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string, requesterId: string) => {
    try {
      // Update request status to accepted (trigger will create follower relationship)
      const { error } = await supabase
        .from('follow_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      setFollowRequestsCount(prev => Math.max(0, prev - 1));
      setProfile(prev => ({
        ...prev,
        followers_count: prev.followers_count + 1
      }));

      toast.success('Follow request accepted');
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('follow_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      setFollowRequestsCount(prev => Math.max(0, prev - 1));

      toast.success('Follow request rejected');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const fetchFollowers = async () => {
    try {
      const profileId = profile.id || user?.id;
      if (!profileId) return;

      const { data, error } = await supabase
        .from('followers')
        .select(`
          id,
          created_at,
          follower_id
        `)
        .eq('following_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data for each follower
      if (data && data.length > 0) {
        const followerIds = data.map(f => f.follower_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, badge_type, bio')
          .in('id', followerIds);

        // Check which followers the current user is following
        if (user?.id) {
          const { data: followingData } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id)
            .in('following_id', followerIds);

          const followingSet: Record<string, boolean> = {};
          followingData?.forEach(f => {
            followingSet[f.following_id] = true;
          });
          setFollowingMap(followingSet);
        }

        const followersWithProfiles = data.map(follower => ({
          ...follower,
          follower: profiles?.find(p => p.id === follower.follower_id)
        }));

        setFollowers(followersWithProfiles);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Failed to load followers');
    }
  };

  const fetchFollowing = async () => {
    try {
      const profileId = profile.id || user?.id;
      if (!profileId) return;

      const { data, error } = await supabase
        .from('followers')
        .select(`
          id,
          created_at,
          following_id
        `)
        .eq('follower_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data for each following
      if (data && data.length > 0) {
        const followingIds = data.map(f => f.following_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, badge_type, bio')
          .in('id', followingIds);

        // All users in this list are already followed by definition
        const followingSet: Record<string, boolean> = {};
        followingIds.forEach(id => {
          followingSet[id] = true;
        });
        setFollowingMap(followingSet);

        const followingWithProfiles = data.map(following => ({
          ...following,
          following: profiles?.find(p => p.id === following.following_id)
        }));

        setFollowing(followingWithProfiles);
      } else {
        setFollowing([]);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to load following');
    }
  };

  const handleFollowFromList = async (targetUserId: string, currentlyFollowing: boolean) => {
    if (!user?.id) {
      toast.error('Please sign in');
      return;
    }

    try {
      if (currentlyFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        setFollowingMap(prev => ({ ...prev, [targetUserId]: false }));
        toast.success('Unfollowed');
      } else {
        // Check if already following
        const { data: existing } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        if (existing) {
          setFollowingMap(prev => ({ ...prev, [targetUserId]: true }));
          return;
        }

        // Follow
        await supabase
          .from('followers')
          .insert([{
            follower_id: user.id,
            following_id: targetUserId
          }]);

        setFollowingMap(prev => ({ ...prev, [targetUserId]: true }));
        toast.success('Following');
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error);
      toast.error('Action failed');
    }
  };

  const fetchUserBadges = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID, skipping badges fetch');
        return;
      }

      console.log('Fetching badges for user:', user.id);
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          awarded_at,
          badges(id, name, description, icon, color, rarity)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching badges:', error);
        // Don't throw, badges are optional
        return;
      }

      if (data) {
        console.log('Badges loaded:', data.length);
        setUserBadges(data.map(item => (item.badges as any)));
      }
    } catch (error: any) {
      console.error('Error fetching badges:', error);
      // Badges are optional, don't show error toast
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.name,
          username: editedProfile.username,
          bio: editedProfile.bio,
          location: editedProfile.location,
          website: editedProfile.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local state
      setProfile(editedProfile);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh to get updated data from server
      await fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📤 Loading avatar for editing...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user?.id
    });

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create temporary URL for editor
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setShowAvatarEditor(true);
  };

  const handleSaveAvatar = async (croppedImage: Blob) => {
    if (!user?.id) {
      console.error('❌ No user ID available');
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsUploading(true);
      const fileName = `${user.id}/avatar-${Date.now()}.jpg`;
      console.log('📁 Uploading cropped avatar to path:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImage, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw updateError;
      }

      console.log('✅ Profile updated successfully');
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Avatar updated successfully!');
      await fetchProfileData();
      
      // Cleanup
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl('');
    } catch (error: any) {
      console.error('❌ Error uploading avatar:', error);
      const errorMessage = error.message || 'Failed to upload avatar';
      toast.error(`Failed to upload avatar: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Banner must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create temporary URL for editor
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setShowBannerEditor(true);
  };

  const handleSaveBanner = async (croppedImage: Blob) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsUploading(true);
      const fileName = `${user.id}/banner-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, croppedImage, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, banner_url: publicUrl });
      toast.success('Banner updated successfully!');
      await fetchProfileData();
      
      // Cleanup
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl('');
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner');
    } finally {
      setIsUploading(false);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`https://giga.stream/@${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Posts", value: profile.posts_count.toString() },
    { label: "Followers", value: profile.followers_count >= 1000 ? `${(profile.followers_count / 1000).toFixed(1)}K` : profile.followers_count.toString() },
    { label: "Following", value: profile.following_count.toString() },
  ];

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      {/* Mobile Profile Header - Replaces top nav on profile page */}
      <MobileProfileHeader username={profile.username || 'user'} />
      
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Profile Header Section */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Layout - Instagram Style */}
          <div className="sm:hidden">
            <div className="px-4 py-3 space-y-3">
              {/* Row 1: Avatar + Stats (Instagram Style) */}
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <Avatar className="w-20 h-20 border-2 border-border">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent">
                        {profile.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Edit avatar"
                  >
                    <Pen size={18} className="text-white" />
                  </button>
                  {/* Hidden file input for quick avatar change */}
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Stats - Instagram Style */}
                <div className="flex-1 flex justify-around text-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{profile.posts_count || userPosts.length || 0}</span>
                    <span className="text-xs text-muted-foreground">Posts</span>
                  </div>
                  <button 
                    className="flex flex-col"
                    onClick={() => {
                      setShowFollowersDialog(true);
                      fetchFollowers();
                    }}
                  >
                    <span className="font-semibold text-sm">{profile.followers_count || 0}</span>
                    <span className="text-xs text-muted-foreground">Followers</span>
                  </button>
                  <button 
                    className="flex flex-col"
                    onClick={() => {
                      setShowFollowingDialog(true);
                      fetchFollowing();
                    }}
                  >
                    <span className="font-semibold text-sm">{profile.following_count || 0}</span>
                    <span className="text-xs text-muted-foreground">Following</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Name & Badge */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold">{profile.name}</h1>
                  {profile.badge_type && (
                    <button 
                      onClick={() => setShowBadgeInfo(true)} 
                      className="hover:opacity-80 transition-opacity focus:outline-none"
                      aria-label="View badge information"
                    >
                      <VerificationBadge type={profile.badge_type} size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 3: Bio */}
              {profile.bio && (
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              )}

              {/* Row 4: Location, Website */}
              {(profile.location || profile.website) && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <a 
                      href={`https://${profile.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <LinkIcon size={12} />
                      <span className="truncate max-w-[150px]">{profile.website}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Row 5: Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-sm font-semibold">
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Avatar Upload */}
                      <div className="grid gap-2">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt="Avatar" className="object-cover" />
                            ) : (
                              <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col gap-2">
                            <input 
                              type="file" 
                              ref={avatarInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleAvatarUpload}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload className="mr-2 h-4 w-4" /> Upload Avatar</>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, WebP</p>
                          </div>
                        </div>
                      </div>

                      {/* Banner Upload */}
                      <div className="grid gap-2">
                        <Label>Banner Image</Label>
                        <div className="flex flex-col gap-2">
                          {profile.banner_url && (
                            <div className="w-full h-32 rounded-lg overflow-hidden border">
                              <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <input 
                            type="file" 
                            ref={bannerInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleBannerUpload}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-fit"
                          >
                            {isUploading ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="mr-2 h-4 w-4" /> Upload Banner</>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground">Max 10MB • JPG, PNG, WebP • Recommended: 1500x500px</p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={editedProfile.name} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={editedProfile.username} onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={editedProfile.bio} onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })} rows={4} placeholder="Tell us about yourself..." />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="location" className="pl-10" value={editedProfile.location} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} placeholder="City, Country" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="website" className="pl-10" value={editedProfile.website} onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })} placeholder="https://yourwebsite.com" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button className="flex-1" onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => { setIsEditing(false); setEditedProfile(profile); }}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"} 
                    size="sm" 
                    className="flex-1 h-8 text-sm font-semibold"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : isFollowing ? (
                      <UserCheck className="w-4 h-4 mr-1" />
                    ) : followRequestPending ? (
                      <Loader2 className="w-4 h-4 mr-1" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-1" />
                    )}
                    {isFollowing ? 'Following' : followRequestPending ? 'Requested' : 'Follow'}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1 h-8 text-sm font-semibold" onClick={copyProfileLink}>
                  Share Profile
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/studio")}>
                      <Video size={14} className="mr-2" />
                      Go to Studio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings2 size={14} className="mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyProfileLink}>
                      <Share2 size={14} className="mr-2" />
                      {copied ? 'Link Copied!' : 'Copy Link'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 size={14} className="mr-2" />
                      Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout (Side by Side) */}
          <div className="hidden sm:flex items-start gap-4 md:gap-6">
            <div className="relative group flex-shrink-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-border">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                <AvatarFallback className="text-3xl md:text-5xl">
                  {profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Edit avatar"
              >
                <Pen size={24} className="text-white" />
              </button>
              {profile.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Shield size={16} className="text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-semibold">{profile.name}</h1>
                    {profile.badge_type && (
                      <button onClick={() => setShowBadgeInfo(true)} className="hover:opacity-80 transition-opacity">
                        <VerificationBadge type={profile.badge_type} size={24} />
                      </button>
                    )}
                    {profile.verified && !profile.badge_type && (
                      <Badge variant="default" className="text-xs">
                        <Shield size={12} className="mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">@{profile.username}</p>
                    <button
                      onClick={copyProfileLink}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Copy profile link"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  {isOwnProfile ? (
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit2 size={16} className="mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="website">Website</Label>
                          <Input id="website" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                          <Button className="flex-1" onClick={handleSaveProfile}>Save Changes</Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  ) : (
                    <Button 
                      variant={isFollowing ? "outline" : "default"} 
                      size="sm"
                      onClick={handleFollow}
                      disabled={followLoading}
                    >
                      {followLoading ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : isFollowing ? (
                        <UserCheck size={16} className="mr-2" />
                      ) : followRequestPending ? (
                        <Loader2 size={16} className="mr-2" />
                      ) : (
                        <UserPlus size={16} className="mr-2" />
                      )}
                      {followLoading ? 'Loading...' : isFollowing ? 'Following' : followRequestPending ? 'Requested' : 'Follow'}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate("/studio")}>
                        <Video size={14} className="mr-2" />
                        Go to Studio
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings2 size={14} className="mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={copyProfileLink}>
                        <Share2 size={14} className="mr-2" />
                        Share Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 size={14} className="mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell size={14} className="mr-2" />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm mb-4 leading-relaxed">{profile.bio}</p>

              <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a 
                    href={`https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <LinkIcon size={16} />
                    <span>{profile.website}</span>
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {profile.joined}</span>
                </div>
              </div>

              <div className="flex gap-4 md:gap-6">
                {stats.map((stat) => (
                  <button 
                    key={stat.label} 
                    className="hover:underline cursor-pointer"
                    onClick={() => {
                      if (stat.label === 'Followers') {
                        setShowFollowersDialog(true);
                        fetchFollowers();
                      } else if (stat.label === 'Following') {
                        setShowFollowingDialog(true);
                        fetchFollowing();
                      }
                    }}
                  >
                    <span className="font-semibold">{stat.value}</span>{" "}
                    <span className="text-muted-foreground text-sm">{stat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-center border-b border-border rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground px-6 sm:px-8 py-3 rounded-none bg-transparent shadow-none text-xs sm:text-sm font-semibold flex-1 sm:flex-none">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground px-6 sm:px-8 py-3 rounded-none bg-transparent shadow-none text-xs sm:text-sm font-semibold flex-1 sm:flex-none">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground px-6 sm:px-8 py-3 rounded-none bg-transparent shadow-none text-xs sm:text-sm font-semibold flex-1 sm:flex-none">
              <Bookmark size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <div className="grid grid-cols-3 gap-1">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="aspect-square bg-muted relative group cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        📝
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={20} />
                        <span className="font-semibold">{post.comments_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={20} />
                        <span className="font-semibold">{post.likes_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <div className="grid grid-cols-3 gap-1">
              {userPosts.filter(post => post.image_url).length > 0 ? (
                userPosts.filter(post => post.image_url).map((post) => (
                  <div 
                    key={post.id} 
                    className="aspect-square bg-muted relative group cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={20} />
                        <span className="font-semibold">{post.comments_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={20} />
                        <span className="font-semibold">{post.likes_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <p>No media yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No saved posts yet</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Followers Dialog */}
        <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
          <DialogContent className="max-w-md max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Followers</DialogTitle>
              <DialogDescription>
                People who follow {profile.name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {followers.length > 0 ? (
                  followers.map((item: any) => {
                    const followerProfile = item.follower;
                    if (!followerProfile) return null;
                    const isFollowingThisUser = followingMap[followerProfile.id];
                    const isOwnUser = user?.id === followerProfile.id;
                    
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => {
                            navigate(`/profile/${followerProfile.username}`);
                            setShowFollowersDialog(false);
                          }}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={followerProfile.avatar_url || undefined} />
                            <AvatarFallback>
                              {followerProfile.full_name?.charAt(0)?.toUpperCase() || followerProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-medium text-sm truncate">{followerProfile.full_name || followerProfile.username}</p>
                              {followerProfile.badge_type && (
                                <VerificationBadge type={followerProfile.badge_type} />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">@{followerProfile.username}</p>
                            {followerProfile.bio && (
                              <p className="text-xs text-muted-foreground truncate mt-1">{followerProfile.bio}</p>
                            )}
                          </div>
                        </div>
                        {!isOwnUser && (
                          <Button
                            size="sm"
                            variant={isFollowingThisUser ? "outline" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowFromList(followerProfile.id, isFollowingThisUser);
                            }}
                            className="ml-2"
                          >
                            {isFollowingThisUser ? 'Following' : 'Follow'}
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No followers yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Following Dialog */}
        <Dialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
          <DialogContent className="max-w-md max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Following</DialogTitle>
              <DialogDescription>
                People {profile.name} follows
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {following.length > 0 ? (
                  following.map((item: any) => {
                    const followedProfile = item.following;
                    if (!followedProfile) return null;
                    const isFollowingThisUser = followingMap[followedProfile.id];
                    const isOwnUser = user?.id === followedProfile.id;
                    
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => {
                            navigate(`/profile/${followedProfile.username}`);
                            setShowFollowingDialog(false);
                          }}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={followedProfile.avatar_url || undefined} />
                            <AvatarFallback>
                              {followedProfile.full_name?.charAt(0)?.toUpperCase() || followedProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-medium text-sm truncate">{followedProfile.full_name || followedProfile.username}</p>
                              {followedProfile.badge_type && (
                                <VerificationBadge type={followedProfile.badge_type} />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">@{followedProfile.username}</p>
                            {followedProfile.bio && (
                              <p className="text-xs text-muted-foreground truncate mt-1">{followedProfile.bio}</p>
                            )}
                          </div>
                        </div>
                        {!isOwnUser && (
                          <Button
                            size="sm"
                            variant={isFollowingThisUser ? "outline" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowFromList(followedProfile.id, isFollowingThisUser);
                            }}
                            className="ml-2"
                          >
                            {isFollowingThisUser ? 'Following' : 'Follow'}
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Not following anyone yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Avatar Image Editor */}
        {tempImageUrl && (
          <ImageEditor
            open={showAvatarEditor}
            onOpenChange={setShowAvatarEditor}
            imageUrl={tempImageUrl}
            onSave={handleSaveAvatar}
            aspectRatio={1}
            cropShape="round"
            title="Edit Avatar"
            description="Crop and adjust your profile picture"
          />
        )}

        {/* Banner Image Editor */}
        {tempImageUrl && (
          <ImageEditor
            open={showBannerEditor}
            onOpenChange={setShowBannerEditor}
            imageUrl={tempImageUrl}
            onSave={handleSaveBanner}
            aspectRatio={3}
            cropShape="rect"
            title="Edit Banner"
            description="Crop and adjust your profile banner"
          />
        )}

        {/* Badge Info Dialog */}
        <BadgeInfoDialog 
          open={showBadgeInfo} 
          onOpenChange={setShowBadgeInfo} 
          badgeType={profile.badge_type} 
        />
      </div>
    </div>
  );
}
