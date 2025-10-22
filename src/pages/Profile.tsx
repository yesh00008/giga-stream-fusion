import { useState, useEffect, useRef } from "react";
import { Settings2, Share2, MapPin, Link as LinkIcon, Calendar, Edit2, Pen, Mail, Phone, Globe, Video, BarChart3, Users, Shield, Bell, Lock, Star, Bookmark, Award, TrendingUp, MessageSquare, Copy, Check, MoreVertical, Upload, Loader2, RefreshCw, Image as ImageIcon, UserPlus, UserCheck } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
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

  const fetchFollowers = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey(id, username, full_name, avatar_url, verified)
        `)
        .eq('following_id', user.id);

      if (error) {
        console.error('Error fetching followers:', error);
        return;
      }

      setFollowers(data?.map(item => item.profiles) || []);
    } catch (error: any) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey(id, username, full_name, avatar_url, verified)
        `)
        .eq('follower_id', user.id);

      if (error) {
        console.error('Error fetching following:', error);
        return;
      }

      setFollowing(data?.map(item => item.profiles) || []);
    } catch (error: any) {
      console.error('Error fetching following:', error);
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
                    <span className="font-semibold text-sm">{stats[0]?.value || '0'}</span>
                    <span className="text-xs text-muted-foreground">Posts</span>
                  </div>
                  <button 
                    className="flex flex-col"
                    onClick={() => {
                      setShowFollowersDialog(true);
                      fetchFollowers();
                    }}
                  >
                    <span className="font-semibold text-sm">{stats[1]?.value || '0'}</span>
                    <span className="text-xs text-muted-foreground">Followers</span>
                  </button>
                  <button 
                    className="flex flex-col"
                    onClick={() => {
                      setShowFollowingDialog(true);
                      fetchFollowing();
                    }}
                  >
                    <span className="font-semibold text-sm">{stats[2]?.value || '0'}</span>
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
                  <Button variant="default" size="sm" className="flex-1 h-8 text-sm font-semibold">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
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
                    <Button variant="default" size="sm">
                      <UserPlus size={16} className="mr-2" />
                      Follow
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
                  <div key={post.id} className="aspect-square bg-muted relative group cursor-pointer overflow-hidden">
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
                        <span className="font-semibold">{post.comments || 0}</span>
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
                  <div key={post.id} className="aspect-square bg-muted relative group cursor-pointer overflow-hidden">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={20} />
                        <span className="font-semibold">{post.comments || 0}</span>
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
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-muted flex items-center justify-center text-3xl sm:text-4xl cursor-pointer hover:opacity-80 transition-opacity">
                  {["💾", "⭐", "📌", "💫", "🔖", "✨"][i - 1]}
                </div>
              ))}
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
                  followers.map((follower) => (
                    <div key={follower.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={follower.avatar_url || undefined} />
                          <AvatarFallback>
                            {follower.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{follower.name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">@{follower.username || 'user'}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Follow
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
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
                  following.map((followed) => (
                    <div key={followed.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={followed.avatar_url || undefined} />
                          <AvatarFallback>
                            {followed.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{followed.name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">@{followed.username || 'user'}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Unfollow
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
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
