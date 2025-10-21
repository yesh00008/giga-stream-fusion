import { useState, useRef } from "react";
import { Search, Send, MoreVertical, Phone, Video, Info, Image, Smile, Heart, Camera, Mic, Paperclip, X, FileText, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const conversations = [
  { id: 1, name: "Tech Master", lastMessage: "Thanks for subscribing!", time: "2m ago", unread: 2, avatar: "TM", online: true },
  { id: 2, name: "Gaming Zone", lastMessage: "New video coming soon!", time: "1h ago", unread: 0, avatar: "GZ", online: true },
  { id: 3, name: "Music Hub", lastMessage: "Check out my latest track", time: "3h ago", unread: 1, avatar: "MH", online: false },
  { id: 4, name: "Cooking Corner", lastMessage: "Recipe in bio!", time: "5h ago", unread: 0, avatar: "CC", online: false },
  { id: 5, name: "Travel Vlogs", lastMessage: "Where should I go next?", time: "1d ago", unread: 0, avatar: "TV", online: true },
];

const messages = [
  { id: 1, text: "Hey! Love your content!", sent: false, time: "10:30 AM", type: "text" },
  { id: 2, text: "Thank you so much! 😊", sent: true, time: "10:32 AM", type: "text" },
  { id: 3, text: "When is your next video?", sent: false, time: "10:35 AM", type: "text" },
  { id: 4, text: "Coming this weekend! Stay tuned!", sent: true, time: "10:36 AM", type: "text" },
  { id: 5, text: "document.pdf", sent: true, time: "10:38 AM", type: "file", fileSize: "2.4 MB" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }
      setFileError("");
      setSelectedFile(file);
      setShowFileDialog(true);
    }
  };

  const handleSendFile = () => {
    if (selectedFile) {
      // Handle file upload logic here
      console.log("Sending file:", selectedFile.name);
      setShowFileDialog(false);
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      {/* Conversations List - Instagram Style */}
      <div className="w-full lg:w-80 xl:w-96 border-r border-border bg-card flex flex-col">
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold">Messages</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical size={20} />
            </Button>
          </div>
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
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="gradient-primary text-white text-sm">{conv.avatar}</AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
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

      {/* Chat Area - Instagram Style */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="gradient-primary text-white text-sm">{selectedChat.avatar}</AvatarFallback>
              </Avatar>
              {selectedChat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">{selectedChat.name}</p>
              <p className="text-xs text-muted-foreground">{selectedChat.online ? "Active now" : "Active 2h ago"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 hover:bg-accent"
              onClick={() => {/* Handle audio call */}}
            >
              <Phone size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 hover:bg-accent"
              onClick={() => setShowVideoCall(true)}
            >
              <Video size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent">
              <Info size={20} />
            </Button>
          </div>
        </div>

        {/* Messages - Instagram Style */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.sent ? "justify-end" : "justify-start"} group`}>
                {!msg.sent && (
                  <Avatar className="w-7 h-7 mt-auto mb-1">
                    <AvatarFallback className="gradient-primary text-white text-xs">{selectedChat.avatar}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex items-end gap-2 ${msg.sent ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.type === "file" ? (
                    <div
                      className={`max-w-[300px] rounded-2xl p-3 border ${
                        msg.sent
                          ? "bg-primary/10 border-primary/20"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{msg.text}</p>
                          <p className="text-xs text-muted-foreground">{msg.fileSize}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[300px] rounded-3xl px-4 py-2.5 ${
                        msg.sent
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  )}
                  {msg.sent && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-smooth"
                    >
                      <Heart size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input - Instagram Style */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex gap-3 max-w-4xl mx-auto items-center">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 flex-shrink-0 hover:bg-accent rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 hover:bg-accent rounded-full">
              <Camera size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 hover:bg-accent rounded-full">
              <Image size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 hover:bg-accent rounded-full">
              <Mic size={24} />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="h-10 rounded-full border-border pr-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    // Handle send message
                    setNewMessage('');
                  }
                }}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-accent"
              >
                <Smile size={20} />
              </Button>
            </div>
            {newMessage ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary font-semibold hover:bg-transparent"
                onClick={() => {
                  if (newMessage.trim()) {
                    // Handle send message
                    setNewMessage('');
                  }
                }}
              >
                Send
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 hover:bg-accent rounded-full">
                <Heart size={24} />
              </Button>
            )}
          </div>
          {fileError && (
            <p className="text-xs text-red-500 mt-2 text-center">{fileError}</p>
          )}
        </div>
      </div>

      {/* Video Call Dialog */}
      <Dialog open={showVideoCall} onOpenChange={setShowVideoCall}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Call with {selectedChat.name}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="gradient-primary text-white text-2xl">
                    {selectedChat.avatar}
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-semibold mb-1">{selectedChat.name}</p>
                <p className="text-sm text-white/70">Calling...</p>
              </div>
            </div>
            {/* Your video preview */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg border-2 border-white/20">
              <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                Your Camera
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
            >
              <Mic size={20} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
            >
              <Video size={20} />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={() => setShowVideoCall(false)}
            >
              <Phone size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send File</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText size={32} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowFileDialog(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSendFile}
                >
                  Send File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
