import { Card } from "@/components/ui/card";
import { Eye, ThumbsUp, MessageSquare, TrendingUp, Video, Clock, Users, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Views", value: "4.2M", change: "+12.5%", icon: Eye },
  { label: "Likes", value: "284K", change: "+8.3%", icon: ThumbsUp },
  { label: "Comments", value: "15.2K", change: "+15.7%", icon: MessageSquare },
  { label: "Subscribers", value: "125K", change: "+5.2%", icon: Users },
];

const recentVideos = [
  {
    id: 1,
    title: "Building a Modern Video Platform",
    views: "1.2M",
    likes: "15K",
    comments: "234",
    duration: "15:42",
    published: "2 days ago",
  },
  {
    id: 2,
    title: "Web Development Trends 2024",
    views: "850K",
    likes: "12K",
    comments: "189",
    duration: "12:30",
    published: "1 week ago",
  },
  {
    id: 3,
    title: "Full Stack Development Course",
    views: "2.1M",
    likes: "28K",
    comments: "456",
    duration: "45:20",
    published: "3 days ago",
  },
];

export default function Studio() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Channel Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Giga Studio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 gradient-card">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className="text-primary" size={24} />
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Channel Analytics</h2>
            <p className="text-muted-foreground">Last 28 days</p>
          </div>
          <Button variant="outline">View Advanced Analytics</Button>
        </div>

        <div className="h-64 rounded-lg bg-muted/50 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-2 text-primary" size={48} />
            <p className="text-muted-foreground">Analytics chart visualization</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList>
          <TabsTrigger value="videos">Recent Videos</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4 mt-6">
          {recentVideos.map((video) => (
            <Card key={video.id} className="p-4 gradient-card">
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Video className="text-muted-foreground" size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2 truncate">{video.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      {video.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      {video.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {video.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {video.duration}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{video.published}</p>
                </div>
                <Button variant="outline">Edit</Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="p-6 gradient-card">
            <p className="text-muted-foreground">Detailed analytics coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card className="p-6 gradient-card">
            <div className="flex items-center gap-4 mb-4">
              <DollarSign className="text-green-500" size={32} />
              <div>
                <p className="text-3xl font-bold">$12,458</p>
                <p className="text-sm text-muted-foreground">Estimated revenue (last 28 days)</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
