import { useState, useEffect } from "react";
import { Settings2, Share2, MapPin, Link as LinkIcon, Calendar, Edit2, Camera, Mail, Phone, Globe, Video, BarChart3, Users, Shield, Bell, Lock, Star, Bookmark, Award, TrendingUp, MessageSquare, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PostCard } from "@/components/PostCard";
import { CharacterSelector } from "@/components/CharacterSelector";
import { Character, getDefaultCharacter } from "@/lib/characters";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(getDefaultCharacter());
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    username: "alexj_dev",
    bio: "Full-stack developer | Tech enthusiast | Content creator sharing knowledge about web development and design",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    joined: "January 2024",
    verified: true,
  });

  useEffect(() => {
    // Load saved character from localStorage
    const savedCharacter = localStorage.getItem('userCharacter');
    if (savedCharacter) {
      setSelectedCharacter(JSON.parse(savedCharacter));
    }
  }, []);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    localStorage.setItem('userCharacter', JSON.stringify(character));
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`https://giga.stream/@${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Posts", value: "142" },
    { label: "Followers", value: "12.5K" },
    { label: "Following", value: "384" },
  ];

  const myPosts = [
    {
      id: "1",
      title: "Building Scalable Applications with React and TypeScript",
      content: "Comprehensive guide on building large-scale applications with best practices and modern patterns...",
      author: "Alex Johnson",
      likes: "2.4K",
      comments: "156",
      timestamp: "2 days ago",
      image: "💻",
    },
    {
      id: "2",
      title: "The Future of Web Development in 2025",
      content: "Exploring upcoming trends and technologies that will shape the future of web development...",
      author: "Alex Johnson",
      likes: "1.8K",
      comments: "98",
      timestamp: "5 days ago",
      image: "🚀",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="relative group">
              <div 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-border flex items-center justify-center text-5xl sm:text-7xl cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: selectedCharacter.bgColor }}
              >
                <div className="animate-bounce-subtle">{selectedCharacter.emoji}</div>
              </div>
              <button
                onClick={() => setShowCharacterSelector(true)}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={24} className="text-white" />
              </button>
              {profile.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Shield size={16} className="text-primary-foreground" />
                </div>
              )}
            </div>

            <CharacterSelector
              open={showCharacterSelector}
              onOpenChange={setShowCharacterSelector}
              onSelect={handleCharacterSelect}
              currentCharacter={selectedCharacter}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold">{profile.name}</h1>
                    {profile.verified && (
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
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Quick Actions
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
                        Notification Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1" onClick={() => setIsEditing(false)}>Save Changes</Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                    <Settings2 size={16} />
                  </Button>
                </div>
              </div>

              <p className="text-sm mb-4 leading-relaxed">{profile.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (<div className="flex items-center gap-1"><MapPin size={16} /><span>{profile.location}</span></div>)}
                {profile.website && (<a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><LinkIcon size={16} /><span>{profile.website}</span></a>)}
                <div className="flex items-center gap-1"><Calendar size={16} /><span>Joined {profile.joined}</span></div>
              </div>

              <div className="flex gap-6">
                {stats.map((stat) => (<button key={stat.label} className="hover:underline"><span className="font-semibold">{stat.value}</span> <span className="text-muted-foreground text-sm">{stat.label}</span></button>))}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Posts</TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Media</TabsTrigger>
            <TabsTrigger value="likes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Likes</TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">About</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Activity</TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-1">{myPosts.map((post) => (<PostCard key={post.id} {...post} />))}</div>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid grid-cols-3 gap-1">{[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-4xl">{["💻", "🚀", "🎨", "⚡", "📱", "✨"][i - 1]}</div>))}</div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="text-center py-12 text-muted-foreground"><p>Liked posts will appear here</p></div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm"><Mail size={18} className="text-muted-foreground" /><span>{profile.email}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Phone size={18} className="text-muted-foreground" /><span>{profile.phone}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Globe size={18} className="text-muted-foreground" /><a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{profile.website}</a></div>
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">{["Web Development", "React", "TypeScript", "Design", "Open Source", "Teaching"].map((interest) => (<Badge key={interest} variant="secondary">{interest}</Badge>))}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={18} className="text-primary" />
                  <p className="text-sm"><span className="font-medium">Reached 10K followers</span></p>
                </div>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare size={18} className="text-primary" />
                  <p className="text-sm"><span className="font-medium">Most engaged post this week</span></p>
                </div>
                <p className="text-xs text-muted-foreground">5 days ago</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Star size={18} className="text-primary" />
                  <p className="text-sm"><span className="font-medium">Featured in trending creators</span></p>
                </div>
                <p className="text-xs text-muted-foreground">1 week ago</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={18} className="text-primary" />
                  <p className="text-sm"><span className="font-medium">Earned "Rising Star" badge</span></p>
                </div>
                <p className="text-xs text-muted-foreground">2 weeks ago</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate("/studio")}>
                <Video size={16} className="mr-2" />
                View Full Analytics in Studio
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Award size={32} className="text-yellow-500" />
                </div>
                <p className="font-medium text-sm mb-1">Early Adopter</p>
                <p className="text-xs text-muted-foreground">Joined in 2024</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp size={32} className="text-blue-500" />
                </div>
                <p className="font-medium text-sm mb-1">Rising Star</p>
                <p className="text-xs text-muted-foreground">10K+ followers</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <MessageSquare size={32} className="text-purple-500" />
                </div>
                <p className="font-medium text-sm mb-1">Conversationalist</p>
                <p className="text-xs text-muted-foreground">1K+ comments</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Users size={32} className="text-green-500" />
                </div>
                <p className="font-medium text-sm mb-1">Community Builder</p>
                <p className="text-xs text-muted-foreground">Active member</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Star size={32} className="text-red-500" />
                </div>
                <p className="font-medium text-sm mb-1">Content Creator</p>
                <p className="text-xs text-muted-foreground">100+ posts</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Bookmark size={32} className="text-pink-500" />
                </div>
                <p className="font-medium text-sm mb-1">Curator</p>
                <p className="text-xs text-muted-foreground">50+ saved posts</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center opacity-50">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Lock size={32} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">Influencer</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center opacity-50">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Lock size={32} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">Legend</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
