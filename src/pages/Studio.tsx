import { useState } from "react";
import { Eye, ThumbsUp, MessageSquare, TrendingUp, Users, DollarSign, FileText, Image, Video, BarChart3, Clock, Edit2, Trash2, MoreVertical, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Studio() {
  const [timeRange, setTimeRange] = useState("28days");

  const stats = [
    { label: "Total Reach", value: "4.2M", change: "+12.5%", icon: Eye },
    { label: "Engagements", value: "284K", change: "+8.3%", icon: ThumbsUp },
    { label: "Comments", value: "15.2K", change: "+15.7%", icon: MessageSquare },
    { label: "Followers", value: "125K", change: "+5.2%", icon: Users },
    { label: "Revenue", value: "$12.4K", change: "+18.2%", icon: DollarSign },
    { label: "Avg. Engagement", value: "6.8%", change: "+2.1%", icon: TrendingUp },
  ];

  const recentContent = [
    {
      id: 1,
      type: "post",
      title: "Building Scalable Applications with React",
      status: "Published",
      views: "1.2M",
      likes: "15K",
      comments: "234",
      published: "2 days ago",
      thumbnail: "💻",
    },
    {
      id: 2,
      type: "short",
      title: "Quick Tip: TypeScript Best Practices",
      status: "Published",
      views: "850K",
      likes: "12K",
      comments: "189",
      published: "1 week ago",
      thumbnail: "⚡",
    },
    {
      id: 3,
      type: "post",
      title: "The Future of Web Development",
      status: "Draft",
      views: "0",
      likes: "0",
      comments: "0",
      published: "Draft",
      thumbnail: "🚀",
    },
  ];

  const topPosts = [
    { title: "React Performance Optimization", views: "2.1M", engagement: "8.2%" },
    { title: "Building Modern UIs", views: "1.8M", engagement: "7.5%" },
    { title: "TypeScript Advanced Patterns", views: "1.5M", engagement: "6.9%" },
  ];

  const audienceInsights = [
    { metric: "Age 18-24", percentage: "28%" },
    { metric: "Age 25-34", percentage: "45%" },
    { metric: "Age 35-44", percentage: "20%" },
    { metric: "Age 45+", percentage: "7%" },
  ];

  const revenueBreakdown = [
    { source: "Monetization", amount: "$8,240" },
    { source: "Brand Deals", amount: "$3,500" },
    { source: "Tips", amount: "$718" },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Giga Studio</h1>
          <p className="text-muted-foreground">Manage your content and track performance</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="flex gap-2">
              {["7days", "28days", "90days"].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === "7days" ? "7 days" : range === "28days" ? "28 days" : "90 days"}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-5 rounded-lg border border-border hover:border-border/80 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <stat.icon className="text-muted-foreground" size={20} />
                  <span className={`text-xs font-medium px-2 py-1 rounded ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-semibold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-6">
            <TabsTrigger value="content" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Content</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Analytics</TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Audience</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 py-3 rounded-none bg-transparent shadow-none">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Content</h3>
                <Button variant="outline" size="sm">Create New</Button>
              </div>

              {recentContent.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-3xl">
                      {item.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <Badge variant={item.status === "Published" ? "default" : "secondary"} className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {item.type === "post" ? <FileText size={14} /> : <Video size={14} />}
                          {item.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          {item.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp size={14} />
                          {item.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          {item.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {item.published}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit2 size={14} className="mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><BarChart3 size={14} className="mr-2" />View Analytics</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Performance Overview</h3>
                    <p className="text-sm text-muted-foreground">Track your content performance over time</p>
                  </div>
                  <Button variant="outline" size="sm">Export Data</Button>
                </div>

                <div className="h-64 rounded-lg bg-muted/50 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-2 text-muted-foreground" size={48} />
                    <p className="text-sm text-muted-foreground">Analytics chart visualization</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Top Performing Content</h3>
                <div className="space-y-3">
                  {topPosts.map((post, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{post.title}</p>
                          <p className="text-sm text-muted-foreground">{post.views} views</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{post.engagement} engagement</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience">
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-4">Audience Demographics</h3>
                <div className="space-y-4">
                  {audienceInsights.map((insight, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{insight.metric}</span>
                        <span className="text-sm font-medium">{insight.percentage}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: insight.percentage }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-lg border border-border">
                  <h3 className="font-semibold mb-4">Growth Trend</h3>
                  <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-muted-foreground" size={32} />
                  </div>
                </div>
                <div className="p-6 rounded-lg border border-border">
                  <h3 className="font-semibold mb-4">Engagement Rate</h3>
                  <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-muted-foreground" size={32} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">$12,458</p>
                    <p className="text-sm text-muted-foreground">Estimated revenue (last 28 days)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Revenue Breakdown</h3>
                  {revenueBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{item.source}</span>
                      <span className="font-medium">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-4">Payout History</h3>
                <div className="space-y-3">
                  {[
                    { date: "Mar 1, 2024", amount: "$11,240", status: "Paid" },
                    { date: "Feb 1, 2024", amount: "$9,850", status: "Paid" },
                    { date: "Jan 1, 2024", amount: "$8,920", status: "Paid" },
                  ].map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span className="text-sm">{payout.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{payout.amount}</span>
                        <Badge variant="outline" className="text-green-500">{payout.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
