import { useState, useEffect, useRef } from "react";
import { Search, Send, Image as ImageIcon, X, Settings, ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  getConversations,
  getConversation,
  sendMessage,
  markMessagesAsRead,
  searchUsersForMessaging,
  subscribeToMessages,
  uploadMessageImage,
  type Conversation,
  type MessageWithProfiles
} from "@/lib/message-service";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation && user?.id) {
      loadMessages(selectedConversation.other_user_id);
      markMessagesAsRead(selectedConversation.other_user_id);
    }
  }, [selectedConversation, user?.id]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    const channel = subscribeToMessages(
      selectedConversation.other_user_id,
      user.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage as any]);
        scrollToBottom();
        markMessagesAsRead(selectedConversation.other_user_id);
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversation, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Search users
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const { data } = await searchUsersForMessaging(searchQuery);
        setSearchResults(data || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    if (!user?.id) return;
    const { data } = await getConversations(user.id);
    if (data) setConversations(data);
  };

  const loadMessages = async (otherUserId: string) => {
    const { data } = await getConversation(otherUserId);
    if (data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !user?.id) return;
    if (!messageInput.trim() && !imageFile) return;

    setIsSending(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if present
      if (imageFile) {
        const { url, error } = await uploadMessageImage(imageFile, user.id);
        if (error) throw new Error("Failed to upload image");
        imageUrl = url || undefined;
      }

      // Send message
      const { data, error } = await sendMessage(
        selectedConversation.other_user_id,
        messageInput.trim(),
        imageUrl
      );

      if (error) throw error;

      // Add message to local state
      if (data) {
        setMessages(prev => [...prev, {
          ...data,
          sender_username: user.user_metadata?.username || '',
          sender_name: user.user_metadata?.full_name || '',
          sender_avatar: user.user_metadata?.avatar_url,
          receiver_username: selectedConversation.other_user_username,
          receiver_name: selectedConversation.other_user_name,
          receiver_avatar: selectedConversation.other_user_avatar
        }]);
      }

      // Clear input
      setMessageInput("");
      setImageFile(null);
      setImagePreview(null);
      
      // Reload conversations to update last message
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartConversation = (userProfile: any) => {
    const newConversation: Conversation = {
      id: '',
      other_user_id: userProfile.id,
      other_user_username: userProfile.username,
      other_user_name: userProfile.full_name,
      other_user_avatar: userProfile.avatar_url,
      other_user_online: userProfile.is_online,
      content: '',
      sender_id: '',
      receiver_id: '',
      read: true,
      created_at: new Date().toISOString()
    };
    setSelectedConversation(newConversation);
    setSearchQuery("");
    setSearchResults([]);
    setMessages([]);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 border-r border-border`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search messages or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Results or Conversations */}
        <ScrollArea className="flex-1">
          {searchQuery && searchResults.length > 0 ? (
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-2 font-medium">Search Results</p>
              {searchResults.map((userProfile) => (
                <button
                  key={userProfile.id}
                  onClick={() => handleStartConversation(userProfile)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback>{userProfile.full_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm truncate">{userProfile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{userProfile.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-8 text-center text-muted-foreground">
              {isSearching ? 'Searching...' : 'No users found'}
            </div>
          ) : conversations.length > 0 ? (
            <div className="p-2">
              {conversations.map((conversation) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    selectedConversation?.other_user_id === conversation.other_user_id
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.other_user_avatar} />
                      <AvatarFallback>{conversation.other_user_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    {conversation.other_user_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate">{conversation.other_user_name}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conversation.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {conversation.content}
                    </p>
                  </div>
                  {!conversation.read && conversation.receiver_id === user?.id && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Send size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-2">
                Search for people to start a conversation
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft size={20} />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation.other_user_avatar} />
              <AvatarFallback>{selectedConversation.other_user_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{selectedConversation.other_user_name}</p>
              <p className="text-xs text-muted-foreground">
                @{selectedConversation.other_user_username}
                {selectedConversation.other_user_online && <span className="text-green-500"> • Online</span>}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <Avatar className={`w-8 h-8 ${showAvatar ? '' : 'opacity-0'}`}>
                          <AvatarImage src={message.sender_avatar} />
                          <AvatarFallback>{message.sender_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {message.image_url && (
                          <img
                            src={message.image_url}
                            alt="Message attachment"
                            className="rounded-lg max-h-64 object-cover mb-1"
                          />
                        )}
                        {message.content && (
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="rounded-lg max-h-32 object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={20} />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={(!messageInput.trim() && !imageFile) || isSending}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <Send size={64} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
            <p className="text-muted-foreground">
              Choose a message from the left or search for someone to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
