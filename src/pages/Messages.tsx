import { useState } from "react";
import { Search, Send, MoreVertical, Phone, Video, Info, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const conversations = [
  { id: 1, name: "Tech Master", lastMessage: "Thanks for subscribing!", time: "2m ago", unread: 2, avatar: "TM", online: true },
  { id: 2, name: "Gaming Zone", lastMessage: "New video coming soon!", time: "1h ago", unread: 0, avatar: "GZ", online: true },
  { id: 3, name: "Music Hub", lastMessage: "Check out my latest track", time: "3h ago", unread: 1, avatar: "MH", online: false },
  { id: 4, name: "Cooking Corner", lastMessage: "Recipe in bio!", time: "5h ago", unread: 0, avatar: "CC", online: false },
  { id: 5, name: "Travel Vlogs", lastMessage: "Where should I go next?", time: "1d ago", unread: 0, avatar: "TV", online: true },
];

const messages = [
  { id: 1, text: "Hey! Love your content!", sent: false, time: "10:30 AM" },
  { id: 2, text: "Thank you so much! 😊", sent: true, time: "10:32 AM" },
  { id: 3, text: "When is your next video?", sent: false, time: "10:35 AM" },
  { id: 4, text: "Coming this weekend! Stay tuned!", sent: true, time: "10:36 AM" },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      {/* Conversations List */}
      <div className="w-full lg:w-80 xl:w-96 border-r border-border bg-card flex flex-col">
        <div className="p-3 sm:p-4 border-b border-border">
          <h1 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search messages..." 
              className="pl-9 h-9 sm:h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-smooth hover:bg-accent/50 ${
                  selectedChat.id === conv.id ? "bg-accent" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-11 h-11 sm:w-12 sm:h-12">
                    <AvatarFallback className="gradient-primary text-white text-sm">{conv.avatar}</AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-semibold text-foreground text-sm truncate">{conv.name}</p>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-white font-bold">{conv.unread}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-3 sm:px-4 bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
              <AvatarFallback className="gradient-primary text-white text-sm">{selectedChat.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground text-sm sm:text-base">{selectedChat.name}</p>
              <p className="text-xs text-muted-foreground">{selectedChat.online ? "Active now" : "Offline"}</p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Phone size={16} className="sm:w-4 sm:h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Video size={16} className="sm:w-4 sm:h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Info size={16} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] ${msg.sent ? "order-2" : "order-1"}`}>
                  <div
                    className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
                      msg.sent
                        ? "gradient-primary text-white"
                        : "bg-card text-foreground border border-border"
                    }`}
                  >
                    <p className="text-xs sm:text-sm">{msg.text}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 px-2">
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-3 sm:p-4 bg-card">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
              <Image size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
              <Smile size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 h-9 sm:h-10 text-sm"
            />
            <Button variant="gradient" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
              <Send size={16} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
