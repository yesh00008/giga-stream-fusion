import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Archive, ArchiveX, Search, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { getArchivedChats, unarchiveChat } from '@/services/chat-settings-service';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ArchivedChatsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (conversationId: string, userId: string) => void;
}

interface ArchivedChat {
  conversation_id: string;
  archived_at: string;
  nickname: string | null;
  other_user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

const ArchivedChats: React.FC<ArchivedChatsProps> = ({
  isOpen,
  onClose,
  onSelectChat,
}) => {
  const { user } = useAuth();
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadArchivedChats();
    }
  }, [isOpen, user]);

  const loadArchivedChats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const chats = await getArchivedChats(user.id);
      
      // Check if chats already have user details (from optimized RPC)
      if (chats.length > 0 && (chats[0] as any).other_user) {
        // Already has details from RPC function
        setArchivedChats(chats as any);
      } else {
        // Need to fetch details manually (fallback)
        const chatsWithDetails = await Promise.all(
          chats.map(async (chat) => {
            // Extract other user ID from conversation_id
            const [id1, id2] = chat.conversation_id.split('_');
            const otherUserId = id1 === user.id ? id2 : id1;

            // Fetch user details safely
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', otherUserId)
              .maybeSingle();
            
            const otherUser = userData || null;
            if (userError) {
              console.error('Error fetching user:', userError);
            }

            // Fetch last message
            const { data: messages } = await supabase
              .from('messages')
              .select('content, created_at')
              .or(
                `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
              )
              .order('created_at', { ascending: false })
              .limit(1);

            return {
              ...chat,
              other_user: otherUser,
              last_message: messages?.[0]?.content,
              last_message_time: messages?.[0]?.created_at,
            };
          })
        );

        setArchivedChats(chatsWithDetails);
      }
    } catch (error) {
      console.error('Error loading archived chats:', error);
      toast.error('Failed to load archived chats');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    const success = await unarchiveChat(user.id, conversationId);
    if (success) {
      toast.success('Chat unarchived');
      // Remove from list
      setArchivedChats((prev) =>
        prev.filter((chat) => chat.conversation_id !== conversationId)
      );
      onClose(); // Close panel after unarchive
      setTimeout(() => window.location.reload(), 300); // Reload to show in main list
    } else {
      toast.error('Failed to unarchive chat');
    }
  };

  const handleBulkUnarchive = async () => {
    if (!user || selectedChats.size === 0) return;

    setLoading(true);
    
    // Import bulkUnarchiveChats function
    const { bulkUnarchiveChats } = await import('@/services/chat-settings-service');
    const successCount = await bulkUnarchiveChats(user.id, Array.from(selectedChats));

    if (successCount > 0) {
      toast.success(`${successCount} chat(s) unarchived`);
      // Remove unarchived chats from list
      setArchivedChats((prev) =>
        prev.filter((chat) => !selectedChats.has(chat.conversation_id))
      );
      setSelectedChats(new Set());
      setShowBulkActions(false);
      
      if (successCount === archivedChats.length) {
        onClose(); // Close if all chats unarchived
      }
      setTimeout(() => window.location.reload(), 300);
    } else {
      toast.error('Failed to unarchive chats');
    }
    setLoading(false);
  };

  const toggleSelectChat = (conversationId: string) => {
    setSelectedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  };

  const selectAllChats = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedChats(new Set(filteredChats.map(c => c.conversation_id)));
      setShowBulkActions(true);
    }
  };

  const handleChatClick = (chat: ArchivedChat) => {
    if (!chat.other_user) return;
    onSelectChat(chat.conversation_id, chat.other_user.id);
    onClose();
  };

  const filteredChats = archivedChats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    
    const displayName =
      chat.nickname ||
      chat.other_user?.full_name ||
      chat.other_user?.username ||
      '';
    
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 86400000) {
      // Less than 24 hours
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diff < 604800000) {
      // Less than 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-background border-r shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Archive className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">Archived Chats</h2>
                  <p className="text-sm text-muted-foreground">
                    {archivedChats.length} archived {selectedChats.size > 0 && `• ${selectedChats.size} selected`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {archivedChats.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllChats}
                    className="text-xs"
                  >
                    {selectedChats.size === filteredChats.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {selectedChats.size} chat(s) selected
                </span>
                <Button
                  size="sm"
                  onClick={handleBulkUnarchive}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <ArchiveX className="w-4 h-4 mr-2" />
                  Unarchive Selected
                </Button>
              </motion.div>
            )}

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search archived chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredChats.length > 0 ? (
                <div className="divide-y">
                  {filteredChats.map((chat) => (
                    <motion.div
                      key={chat.conversation_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-accent cursor-pointer transition-colors group ${
                        selectedChats.has(chat.conversation_id) ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleChatClick(chat)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox for selection */}
                        <div
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectChat(chat.conversation_id);
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              selectedChats.has(chat.conversation_id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {selectedChats.has(chat.conversation_id) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chat.other_user?.avatar_url} />
                          <AvatarFallback>
                            {chat.other_user?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">
                              {chat.nickname ||
                                chat.other_user?.full_name ||
                                chat.other_user?.username}
                            </h3>
                            {chat.last_message_time && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatTime(chat.last_message_time)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.last_message || 'No messages yet'}
                            </p>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-all shrink-0 hover:bg-blue-500/10 hover:text-blue-500"
                              onClick={(e) => handleUnarchive(chat.conversation_id, e)}
                              title="Unarchive chat"
                            >
                              <ArchiveX size={18} />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Archive className="w-3 h-3 mr-1" />
                              Archived
                            </Badge>
                            {chat.archived_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(chat.archived_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                  <Archive className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No archived chats</p>
                  <p className="text-sm">
                    {searchQuery
                      ? 'No chats match your search'
                      : 'Your archived chats will appear here'}
                  </p>
                </div>
              )}
            </ScrollArea>
            
            {/* Footer with actions */}
            {archivedChats.length > 0 && (
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {filteredChats.length} of {archivedChats.length} chats
                  </div>
                  {selectedChats.size === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllChats}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ArchivedChats;
