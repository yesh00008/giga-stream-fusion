import { useParams } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Settings, Maximize, Minimize, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Subtitles, ListVideo, Repeat, Bell, BarChart3, Bookmark, Repeat2, Filter, CheckCircle, TrendingUp, Eye, Clock, Flag, Link as LinkIcon, MessageSquare, DollarSign, Gift, Users, Wifi, ChevronRight, MonitorPlay, Smartphone, Tv, Cast, Zap, Award, Crown, Star, Heart, Flame, MessageCircle, Send, Radio, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/VideoCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const comments = [
  {
    id: 1,
    author: "John Developer",
    content: "This is amazing! Learned so much from this video. Thanks for sharing!",
    likes: 245,
    timestamp: "2 days ago",
  },
  {
    id: 2,
    author: "Sarah Coder",
    content: "Great explanation! Could you make a follow-up video about advanced features?",
    likes: 128,
    timestamp: "1 day ago",
  },
  {
    id: 3,
    author: "Mike Tech",
    content: "Subscribed! Your content quality is outstanding.",
    likes: 89,
    timestamp: "3 hours ago",
  },
];

const videoChapters = [
  { time: "0:00", title: "Introduction", duration: "2:30" },
  { time: "2:30", title: "Setup Environment", duration: "5:45" },
  { time: "8:15", title: "Building Components", duration: "12:20" },
  { time: "20:35", title: "State Management", duration: "8:15" },
  { time: "28:50", title: "Conclusion", duration: "3:10" },
];

export default function Watch() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [volume, setVolume] = useState(100);
  const [subscribed, setSubscribed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [viewMode, setViewMode] = useState<'video' | 'shorts'>('video');
  const [sortComments, setSortComments] = useState('top');
  const [showDonation, setShowDonation] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState('en');
  const [isLive, setIsLive] = useState(true);
  const [liveViewers, setLiveViewers] = useState(12543);
  const [showPoll, setShowPoll] = useState(true);
  const [pollVote, setPollVote] = useState<number | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [memberOnly, setMemberOnly] = useState(false);
  const [showLiveChatPanel, setShowLiveChatPanel] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [donations, setDonations] = useState([
    { id: 1, user: 'Sarah M.', amount: 50, message: 'Great content! Keep it up! 🔥', timestamp: '2 min ago' },
    { id: 2, user: 'Mike P.', amount: 25, message: 'Thanks for explaining this!', timestamp: '5 min ago' },
    { id: 3, user: 'Alex K.', amount: 100, message: 'Best tutorial ever!', timestamp: '8 min ago' },
  ]);
  const [liveChatMessages, setLiveChatMessages] = useState([
    { id: 1, user: 'TechFan123', message: 'This is amazing!', timestamp: 'Just now', isMember: true },
    { id: 2, user: 'CoderGirl', message: 'Can you explain that again?', timestamp: '10s ago', isMember: false },
    { id: 3, user: 'DevMaster', message: 'Great explanation!', timestamp: '25s ago', isMember: true },
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6">
        <div className={isTheaterMode ? "col-span-full" : "lg:col-span-2"} style={{ transition: "all 0.3s ease" }}>
          <div className="space-y-4">
            {/* Enhanced Video Player */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black gradient-card group">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Video Player (Video ID: {id})</p>
              </div>
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                      LIVE • 1.2M watching
                    </Badge>
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                      {quality}
                    </Badge>
                    {autoplay && (
                      <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                        Autoplay ON
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                          <Settings size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onSelect={() => setAutoplay(!autoplay)}>
                          <Repeat className="mr-2" size={16} />
                          Autoplay: {autoplay ? 'On' : 'Off'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowStats(!showStats)}>
                          <BarChart3 className="mr-2" size={16} />
                          Stats for nerds
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Subtitles className="mr-2" size={16} />
                          Subtitles: Off
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setQuality("2160p")}>
                          Quality: 2160p (4K)
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setQuality("1440p")}>
                          Quality: 1440p (2K)
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setQuality("1080p")}>
                          Quality: 1080p (HD) ✓
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setQuality("720p")}>
                          Quality: 720p
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setQuality("480p")}>
                          Quality: 480p
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setPlaybackSpeed(0.5)}>
                          Speed: 0.5x
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPlaybackSpeed(0.75)}>
                          Speed: 0.75x
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPlaybackSpeed(1)}>
                          Speed: Normal ✓
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPlaybackSpeed(1.25)}>
                          Speed: 1.25x
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPlaybackSpeed(1.5)}>
                          Speed: 1.5x
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPlaybackSpeed(2)}>
                          Speed: 2x
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Center Play/Pause */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                  </Button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <SkipBack size={20} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <SkipForward size={20} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </Button>
                      <div className="w-20 group/volume flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(parseInt(e.target.value));
                            if (parseInt(e.target.value) > 0) setIsMuted(false);
                          }}
                          className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <span className="text-white text-sm font-medium">10:25 / 32:00</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPiP(!isPiP)}
                        title="Picture in Picture"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <rect x="13" y="11" width="7" height="6" rx="1" fill="currentColor" />
                        </svg>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Subtitles size={20} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsTheaterMode(!isTheaterMode)}
                      >
                        {isTheaterMode ? <Minimize size={20} /> : <Maximize size={20} />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        <Maximize size={20} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats for Nerds Overlay */}
              {showStats && (
                <div className="absolute top-4 left-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono backdrop-blur-sm">
                  <div className="space-y-1">
                    <div>Video ID: {id}</div>
                    <div>Resolution: 1920x1080@60fps</div>
                    <div>Codec: VP9 (315) / Opus (251)</div>
                    <div>Bandwidth: 5.2 Mbps</div>
                    <div>Buffer: 15.3s</div>
                    <div>Dropped Frames: 0 / 1523</div>
                    <div>Connection: cable</div>
                    <div>Network Activity: 2.1 MB</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">              
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                Building a Modern Video Platform with React and TypeScript
              </h1>
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarFallback className="bg-card">TT</AvatarFallback>
                </Avatar>
                <div className="flex-1 sm:flex-initial">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm sm:text-base">Tech Tutorials</p>
                    <CheckCircle className="w-4 h-4 text-primary" fill="currentColor" />
                    <Badge variant="default" className="text-[9px] h-4 px-1 bg-gradient-to-r from-yellow-500 to-amber-600">
                      <Crown size={10} className="mr-0.5" />
                      PRO
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">1.2M subscribers • 347 videos</p>
                </div>
                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <Button 
                    variant={subscribed ? "outline" : "default"} 
                    size="sm"
                    onClick={() => setSubscribed(!subscribed)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                  {subscribed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNotificationsOn(!notificationsOn)}
                    >
                      <Bell size={16} fill={notificationsOn ? 'currentColor' : 'none'} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <div className="flex items-center rounded-full overflow-hidden border border-input flex-shrink-0">
                  <Button
                    variant={liked ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => {
                      setLiked(!liked);
                      if (disliked) setDisliked(false);
                    }}
                  >
                    <ThumbsUp size={16} className="sm:size-[18px] mr-1 sm:mr-2" fill={liked ? 'currentColor' : 'none'} />
                    <span className="hidden xs:inline">{liked ? "15.1K" : "15K"}</span>
                  </Button>
                  <Separator orientation="vertical" className="h-6 sm:h-8" />
                  <Button
                    variant={disliked ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none h-8 sm:h-9"
                    onClick={() => {
                      setDisliked(!disliked);
                      if (liked) setLiked(false);
                    }}
                  >
                    <ThumbsDown size={16} className="sm:size-[18px]" fill={disliked ? 'currentColor' : 'none'} />
                  </Button>
                </div>

                {/* Repost/Retweet Button */}
                <Button
                  variant={reposted ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReposted(!reposted)}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Repeat2 size={16} className="sm:size-[18px] mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">{reposted ? "Reposted" : "Repost"}</span>
                </Button>

                <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                      <Share2 size={16} className="sm:size-[18px] mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Share</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share this video</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`https://giga.app/watch/${id}`}
                          className="flex-1 text-xs sm:text-sm"
                        />
                        <Button variant="default" size="sm" onClick={() => {
                          navigator.clipboard.writeText(`https://giga.app/watch/${id}`);
                        }}>
                          Copy
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Button variant="outline" className="flex-col h-auto py-2 sm:py-3">
                          <svg className="mb-1" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span className="text-[10px] sm:text-xs">Twitter</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-2 sm:py-3">
                          <svg className="mb-1" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span className="text-[10px] sm:text-xs">Instagram</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-2 sm:py-3">
                          <Share2 className="mb-1" size={18} />
                          <span className="text-[10px] sm:text-xs">WhatsApp</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-2 sm:py-3">
                          <LinkIcon className="mb-1" size={18} />
                          <span className="text-[10px] sm:text-xs">Copy Link</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Start at (e.g., 1:30)"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Bookmark size={16} className="sm:size-[18px] mr-1 sm:mr-2" fill={bookmarked ? 'currentColor' : 'none'} />
                  <span className="hidden xs:inline">{bookmarked ? "Saved" : "Save"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Download size={16} className="sm:size-[18px] mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Download</span>
                </Button>

                <Dialog open={showDonation} onOpenChange={setShowDonation}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs sm:text-sm h-8 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      <DollarSign size={16} className="sm:size-[18px] mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Super Chat</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Super Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 25, 50, 100, 250].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            className="h-16 flex-col"
                          >
                            <DollarSign size={20} />
                            <span className="text-lg font-bold">{amount}</span>
                          </Button>
                        ))}
                      </div>
                      <Input placeholder="Custom amount" type="number" />
                      <textarea
                        placeholder="Your message (optional)"
                        className="w-full min-h-20 px-3 py-2 rounded-md border border-input bg-background text-sm"
                      />
                      <Button className="w-full" size="lg">
                        <Heart size={18} className="mr-2" />
                        Send Super Chat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Cast size={16} className="sm:size-[18px] mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Cast</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">Cast to device</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs">
                      <Tv className="mr-2" size={16} />
                      Living Room TV
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <MonitorPlay className="mr-2" size={16} />
                      Office Monitor
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Smartphone className="mr-2" size={16} />
                      iPhone 15 Pro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                      <MoreHorizontal size={16} className="sm:size-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <ListVideo className="mr-2" size={16} />
                      Save to playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <svg className="mr-2" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 3l14 9-14 9V3z"/>
                        <path d="M5 12h14"/>
                      </svg>
                      Create clip
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Repeat className="mr-2" size={16} />
                      Loop video
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2" size={16} />
                      Not interested
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="mr-2" size={16} />
                      Don't recommend channel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Flag className="mr-2" size={16} />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            </div>

            <div className="border border-border/50 rounded-lg p-3 sm:p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm sm:text-base">1,234,567 views • Feb 15, 2024</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="font-medium">#12 Trending</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground flex-wrap">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <ThumbsUp size={14} />
                  <span>15K</span>
                </button>
                <span>•</span>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <MessageSquare size={14} />
                  <span>342</span>
                </button>
                <span>•</span>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Repeat2 size={14} />
                  <span>1.2K reposts</span>
                </button>
                <span>•</span>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Bookmark size={14} />
                  <span>890 saves</span>
                </button>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                In this comprehensive tutorial, we'll build a modern video platform from scratch using React, 
                TypeScript, and the latest web technologies. You'll learn about video handling, responsive design, 
                state management, and much more!
              </p>
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  #react #typescript #webdevelopment #tutorial #programming
                </p>
              </div>
            </div>

          {/* Video Chapters */}
          <div className="border border-border/50 rounded-lg p-3 sm:p-4 bg-muted/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <ListVideo size={16} className="sm:size-[18px]" />
              Chapters
            </h3>
            <div className="space-y-1 sm:space-y-2">
              {videoChapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors active:scale-[0.98]"
                >
                  <span className="text-xs sm:text-sm text-primary font-medium min-w-[50px] sm:min-w-[60px]">
                    {chapter.time}
                  </span>
                  <span className="text-xs sm:text-sm flex-1 line-clamp-1">{chapter.title}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                    {chapter.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger value="comments" className="text-xs sm:text-sm data-[state=active]:bg-muted/50">
                {comments.length} Comments
              </TabsTrigger>
              <TabsTrigger value="transcript" className="text-xs sm:text-sm data-[state=active]:bg-muted/50">Transcript</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <div className="flex items-center gap-2 mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                      <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="21" y1="10" x2="3" y2="10" />
                        <line x1="21" y1="6" x2="7" y2="6" />
                        <line x1="21" y1="14" x2="3" y2="14" />
                        <line x1="21" y1="18" x2="7" y2="18" />
                      </svg>
                      Sort by
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Top comments</DropdownMenuItem>
                    <DropdownMenuItem>Newest first</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    Y
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input placeholder="Add a comment..." className="mb-2 text-xs sm:text-sm h-9 sm:h-10" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">Cancel</Button>
                    <Button variant="gradient" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">Comment</Button>
                  </div>
                </div>
              </div>
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 sm:gap-3">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback className="bg-card text-xs sm:text-sm">{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-xs sm:text-sm">{comment.author}</span>
                      {comment.id === 1 && <CheckCircle className="w-3 h-3 text-primary" fill="currentColor" />}
                      {comment.id === 1 && <Badge variant="secondary" className="text-[9px] h-4 px-1">Creator</Badge>}
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm mb-2 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2">
                        <ThumbsUp size={12} className="sm:size-[14px] mr-1" />
                        <span>{comment.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2">
                        <ThumbsDown size={12} className="sm:size-[14px]" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">Reply</Button>
                      {comment.id === 1 && (
                        <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                          </svg>
                        </Button>
                      )}
                    </div>
                    {comment.id === 2 && (
                      <div className="mt-3 ml-2 pl-3 border-l-2 border-border/50">
                        <div className="flex gap-2">
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarFallback className="bg-card text-[10px]">TT</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="font-medium text-xs">Tech Tutorials</span>
                              <CheckCircle className="w-3 h-3 text-primary" fill="currentColor" />
                              <span className="text-[10px] text-muted-foreground">1 hour ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Thanks! Will do in the next video 👍</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="transcript">
              <p className="text-muted-foreground p-3 sm:p-4 text-xs sm:text-sm">Transcript not available</p>
            </TabsContent>
          </Tabs>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Live Chat Panel (for live streams) */}
          {isLive && (
            <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/20">
              <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <MessageCircle size={16} className="text-primary" />
                  Live Chat
                  <Badge variant="destructive" className="text-[10px]">
                    <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                    LIVE
                  </Badge>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLiveChatPanel(!showLiveChatPanel)}
                  className="h-6 text-xs"
                >
                  {showLiveChatPanel ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showLiveChatPanel && (
                <div>
                  <div className="h-80 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                    {liveChatMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-2 items-start">
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="bg-card text-[10px]">{msg.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium text-xs">{msg.user}</span>
                            {msg.isMember && (
                              <Badge className="text-[8px] h-3 px-1 bg-gradient-to-r from-primary to-orange-600">
                                <Crown size={8} />
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                          </div>
                          <p className="text-xs break-words">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-border/50 bg-muted/30">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Say something..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="flex-1 text-xs h-8"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && chatMessage.trim()) {
                            setLiveChatMessages([
                              { id: Date.now(), user: 'You', message: chatMessage, timestamp: 'Just now', isMember: true },
                              ...liveChatMessages
                            ]);
                            setChatMessage('');
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (chatMessage.trim()) {
                            setLiveChatMessages([
                              { id: Date.now(), user: 'You', message: chatMessage, timestamp: 'Just now', isMember: true },
                              ...liveChatMessages
                            ]);
                            setChatMessage('');
                          }
                        }}
                      >
                        <Send size={14} />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {liveViewers.toLocaleString()} viewers watching
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Playlist Queue */}
          <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ListVideo size={16} />
                Up Next
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="h-6 text-xs"
              >
                {showPlaylist ? 'Hide' : 'Show'}
              </Button>
            </div>
            {showPlaylist && (
              <div className="space-y-2">
                {[
                  { id: 1, title: 'Advanced JavaScript Patterns', duration: '18:45', views: '234K', channel: 'Code Academy' },
                  { id: 2, title: 'React Performance Tips', duration: '15:20', views: '189K', channel: 'Dev Tips' },
                  { id: 3, title: 'TypeScript Best Practices', duration: '22:10', views: '312K', channel: 'Type Masters' },
                ].map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="w-28 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center text-xs font-medium relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:from-primary/30 group-hover:to-purple-500/30 transition-colors" />
                      <span className="relative z-10">{video.duration}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2 mb-1">{video.title}</p>
                      <p className="text-[10px] text-muted-foreground">{video.channel}</p>
                      <p className="text-[10px] text-muted-foreground">{video.views} views</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <ChevronRight size={14} className="mr-1" />
                  View full playlist (12 videos)
                </Button>
              </div>
            )}
          </div>

          {/* Services Integration */}
          <div className="border border-border/50 rounded-lg p-3 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Streaming Services
            </h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Tv className="mr-2" size="16" />
                Watch on Netflix
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <MonitorPlay className="mr-2" size="16" />
                Watch on Prime Video
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Smartphone className="mr-2" size="16" />
                Watch on Disney+
              </Button>
            </div>
          </div>

          {/* Channel Stats */}
          <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
            <h3 className="font-semibold text-sm mb-3">Channel Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-xs">Subscribers</span>
                </div>
                <span className="text-xs font-semibold">1.2M</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-muted-foreground" />
                  <span className="text-xs">Total Views</span>
                </div>
                <span className="text-xs font-semibold">45.8M</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  <span className="text-xs">Videos</span>
                </div>
                <span className="text-xs font-semibold">347</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-muted-foreground" />
                  <span className="text-xs">Avg. Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-500" fill="currentColor" />
                  <span className="text-xs font-semibold">4.8</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-base sm:text-lg">Recommended</h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recommended videos available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
