import { useParams } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/VideoCard";

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

export default function Watch() {
  const { id } = useParams();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted gradient-card flex items-center justify-center">
            <p className="text-muted-foreground">Video Player (Video ID: {id})</p>
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

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ThumbsUp size={18} className="mr-2" />
                  15K
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown size={18} />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 size={18} className="mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download size={18} className="mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="icon">
                  <MoreHorizontal size={18} />
                </Button>
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

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="space-y-4 mt-4">
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
