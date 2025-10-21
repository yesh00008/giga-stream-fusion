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
    <div className="border-b border-border/50">
      <ScrollArea className="w-full">
        <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 min-w-max overflow-x-auto scrollbar-hide">
          {/* Your Story */}
          <div className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center border border-border/50">
                <Plus size={24} className="text-muted-foreground" />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <Plus size={11} className="text-white" />
              </div>
            </div>
            <span className="text-xs text-foreground/80 text-center leading-tight">Your Story</span>
          </div>

          {/* Stories from others */}
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary to-accent">
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarFallback className="bg-muted text-foreground font-medium text-sm">{story.avatar}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[72px] text-center leading-tight">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
