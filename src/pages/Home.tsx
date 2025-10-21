import { StoriesBar } from "@/components/StoriesBar";
import { PostCard } from "@/components/PostCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = ["All", "Music", "Gaming", "Tech", "Cooking", "Sports", "News", "Education"];

const posts = [
  {
    id: "1",
    title: "Building a Modern Social Platform with React and TypeScript",
    content: "Learn how to create a full-featured social media platform from scratch using modern web technologies...",
    author: "Tech Tutorials",
    likes: "1.2K",
    comments: "89",
    timestamp: "2 days ago",
    image: "💻",
  },
  {
    id: "2",
    title: "Top 10 Web Development Trends in 2024",
    content: "Discover the latest trends shaping the future of web development this year...",
    author: "Code Masters",
    likes: "850",
    comments: "45",
    timestamp: "1 week ago",
    image: "🚀",
  },
  {
    id: "3",
    title: "Full Stack Development Course - Complete Guide",
    content: "Everything you need to know about becoming a full-stack developer in 2024...",
    author: "Developer Pro",
    likes: "2.1K",
    comments: "156",
    timestamp: "3 days ago",
    image: "📚",
  },
  {
    id: "4",
    title: "UI/UX Design Principles Every Developer Should Know",
    content: "Master the essential design principles that will elevate your development projects...",
    author: "Design Hub",
    likes: "920",
    comments: "67",
    timestamp: "5 days ago",
    image: "🎨",
  },
  {
    id: "5",
    title: "Advanced TypeScript Techniques and Best Practices",
    content: "Take your TypeScript skills to the next level with these advanced techniques...",
    author: "TypeScript Guru",
    likes: "1.5K",
    comments: "92",
    timestamp: "1 day ago",
    image: "⚡",
  },
  {
    id: "6",
    title: "Creating Beautiful Animations with CSS and JavaScript",
    content: "Learn how to create stunning animations that will make your websites stand out...",
    author: "Animation Studio",
    likes: "680",
    comments: "34",
    timestamp: "4 days ago",
    image: "✨",
  },
  {
    id: "7",
    title: "Database Design and Optimization Strategies",
    content: "Optimize your database performance with these proven strategies and techniques...",
    author: "Data Expert",
    likes: "1.1K",
    comments: "78",
    timestamp: "6 days ago",
    image: "🗄️",
  },
  {
    id: "8",
    title: "Mobile-First Responsive Design Tutorial",
    content: "Master mobile-first design principles and create responsive layouts that work everywhere...",
    author: "Responsive Dev",
    likes: "750",
    comments: "56",
    timestamp: "2 days ago",
    image: "📱",
  },
];

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <StoriesBar />

      <div className="px-3 sm:px-4 md:px-6 pb-6">
        <div className="mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
          <Tabs defaultValue="All" className="w-full">
            <TabsList className="mb-4 sm:mb-6 bg-transparent justify-start w-max gap-1 p-0 h-auto border-b border-border rounded-none">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground text-sm px-4 py-2 font-medium transition-all rounded-none bg-transparent shadow-none"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="max-w-3xl mx-auto space-y-1">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
