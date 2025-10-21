import { useParams } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Settings, Maximize, Minimize, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Subtitles, ListVideo, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/VideoCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const relatedVideos = [
  {
    id: "2",
    title: "Top 10 Web Development Trends in 2024",
    channel: "Code Masters",
    views: "850K",
    timestamp: "1 week ago",
    duration: "12:30",
  },
  {
    id: "3",
    title: "Full Stack Development Course - Complete Guide",
    channel: "Developer Pro",
    views: "2.1M",
    timestamp: "3 days ago",
    duration: "45:20",
  },
  {
    id: "4",
    title: "UI/UX Design Principles Every Developer Should Know",
    channel: "Design Hub",
    views: "920K",
    timestamp: "5 days ago",
    duration: "18:15",
  },
];

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
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
                  <Badge variant="secondary" className="bg-red-600 text-white">
                    1.2M views
                  </Badge>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                          <Settings size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                      <span className="text-white text-sm">10:25 / 32:00</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
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
            </div>

            <div>
            <h1 className="text-2xl font-bold mb-2">
              Building a Modern Video Platform with React and TypeScript
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-card">TT</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Tech Tutorials</p>
                  <p className="text-sm text-muted-foreground">1.2M subscribers</p>
                </div>
                <Button variant="gradient" size="sm">Subscribe</Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center rounded-full overflow-hidden border border-input">
                  <Button
                    variant={liked ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => {
                      setLiked(!liked);
                      if (disliked) setDisliked(false);
                    }}
                  >
                    <ThumbsUp size={18} className="mr-2" />
                    {liked ? "15.1K" : "15K"}
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <Button
                    variant={disliked ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => {
                      setDisliked(!disliked);
                      if (liked) setLiked(false);
                    }}
                  >
                    <ThumbsDown size={18} />
                  </Button>
                </div>

                <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 size={18} className="mr-2" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share this video</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`https://giga.app/watch/${id}`}
                          className="flex-1"
                        />
                        <Button variant="gradient" onClick={() => {
                          navigator.clipboard.writeText(`https://giga.app/watch/${id}`);
                        }}>
                          Copy
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Share2 className="mb-1" size={20} />
                          <span className="text-xs">Twitter</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Share2 className="mb-1" size={20} />
                          <span className="text-xs">Facebook</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Share2 className="mb-1" size={20} />
                          <span className="text-xs">WhatsApp</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Share2 className="mb-1" size={20} />
                          <span className="text-xs">Email</span>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant={saved ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSaved(!saved)}
                >
                  <Download size={18} className="mr-2" />
                  {saved ? "Saved" : "Save"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ListVideo className="mr-2" size={16} />
                      Add to playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Repeat className="mr-2" size={16} />
                      Loop video
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <Card className="p-4 gradient-card">
            <p className="font-medium mb-2">1.2M views • 2 days ago</p>
            <p className="text-muted-foreground">
              In this comprehensive tutorial, we'll build a modern video platform from scratch using React, 
              TypeScript, and the latest web technologies. You'll learn about video handling, responsive design, 
              state management, and much more!
            </p>
          </Card>

          {/* Video Chapters */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ListVideo size={18} />
              Chapters
            </h3>
            <div className="space-y-2">
              {videoChapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <span className="text-sm text-primary font-medium min-w-[60px]">
                    {chapter.time}
                  </span>
                  <span className="text-sm flex-1">{chapter.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {chapter.duration}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="comments">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="space-y-4 mt-4">
              <div className="flex gap-3 mb-6">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    Y
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input placeholder="Add a comment..." className="mb-2" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm">Cancel</Button>
                    <Button variant="gradient" size="sm">Comment</Button>
                  </div>
                </div>
              </div>
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-card">{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp size={14} className="mr-1" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">Reply</Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="transcript">
              <p className="text-muted-foreground p-4">Transcript not available</p>
            </TabsContent>
          </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recommended</h3>
          {relatedVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </div>
    </div>
  );
}
