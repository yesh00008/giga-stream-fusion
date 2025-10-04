import { StoriesBar } from "@/components/StoriesBar";
import { VideoCard } from "@/components/VideoCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = ["All", "Music", "Gaming", "Tech", "Cooking", "Sports", "News", "Education"];

const videos = [
  {
    id: "1",
    title: "Building a Modern Video Platform with React and TypeScript",
    channel: "Tech Tutorials",
    views: "1.2M",
    timestamp: "2 days ago",
    duration: "15:42",
  },
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
  {
    id: "5",
    title: "Advanced TypeScript Techniques and Best Practices",
    channel: "TypeScript Guru",
    views: "1.5M",
    timestamp: "1 day ago",
    duration: "22:45",
  },
  {
    id: "6",
    title: "Creating Beautiful Animations with CSS and JavaScript",
    channel: "Animation Studio",
    views: "680K",
    timestamp: "4 days ago",
    duration: "14:30",
  },
  {
    id: "7",
    title: "Database Design and Optimization Strategies",
    channel: "Data Expert",
    views: "1.1M",
    timestamp: "6 days ago",
    duration: "28:10",
  },
  {
    id: "8",
    title: "Mobile-First Responsive Design Tutorial",
    channel: "Responsive Dev",
    views: "750K",
    timestamp: "2 days ago",
    duration: "16:55",
  },
];

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto">
      <StoriesBar />

      <div className="px-6 pb-6">
        <div className="mb-6 overflow-x-auto">
          <Tabs defaultValue="All" className="w-full">
            <TabsList className="mb-6 bg-transparent justify-start w-max">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </div>
    </div>
  );
}
