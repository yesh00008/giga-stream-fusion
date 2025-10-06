import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const stories = [
  { id: 1, name: "Tech Reviews", avatar: "TR", hasStory: true },
  { id: 2, name: "Gaming Zone", avatar: "GZ", hasStory: true },
  { id: 3, name: "Music Hub", avatar: "MH", hasStory: true },
  { id: 4, name: "Cooking Corner", avatar: "CC", hasStory: true },
  { id: 5, name: "Travel Vlogs", avatar: "TV", hasStory: true },
  { id: 6, name: "Fitness First", avatar: "FF", hasStory: true },
  { id: 7, name: "Art Studio", avatar: "AS", hasStory: true },
  { id: 8, name: "Tech News", avatar: "TN", hasStory: true },
];

export function StoriesBar() {
  return (
    <div className="border-b border-border bg-card">
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 min-w-max">
          {/* Your Story */}
          <div className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted to-accent flex items-center justify-center border-2 border-border group-hover:scale-105 transition-smooth">
                <Plus size={28} className="text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                <Plus size={14} className="text-white" />
              </div>
            </div>
            <span className="text-xs font-medium text-foreground">Your Story</span>
          </div>

          {/* Stories from others */}
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[3px] gradient-primary group-hover:scale-105 transition-smooth">
                  <Avatar className="w-full h-full border-[3px] border-background">
                    <AvatarFallback className="bg-card text-foreground font-semibold">{story.avatar}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[80px] group-hover:text-foreground transition-smooth">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
