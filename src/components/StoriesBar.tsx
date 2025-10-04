import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const stories = [
  { id: 1, name: "Tech Reviews", avatar: "TR", hasStory: true },
  { id: 2, name: "Gaming Zone", avatar: "GZ", hasStory: true },
  { id: 3, name: "Music Hub", avatar: "MH", hasStory: true },
  { id: 4, name: "Cooking Corner", avatar: "CC", hasStory: true },
  { id: 5, name: "Travel Vlogs", avatar: "TV", hasStory: true },
  { id: 6, name: "Fitness First", avatar: "FF", hasStory: true },
];

export function StoriesBar() {
  return (
    <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
      <div className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]">
        <div className="w-16 h-16 rounded-full bg-card border-2 border-dashed border-primary flex items-center justify-center hover:bg-accent transition-smooth">
          <Plus size={24} className="text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">Your story</span>
      </div>

      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]">
          <div className="w-16 h-16 rounded-full p-0.5 gradient-primary">
            <Avatar className="w-full h-full border-2 border-background">
              <AvatarFallback className="bg-card">{story.avatar}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[72px]">{story.name}</span>
        </div>
      ))}
    </div>
  );
}
