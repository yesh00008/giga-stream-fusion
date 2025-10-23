import React, { useState, useEffect } from 'react';
import { X, Search, Moon, Sun, Laptop, Clock, BellOff, Shield, User, Image, Flag, Ban, Archive, Trash2, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string;
}

type SettingsView = 'main' | 'theme' | 'disappearing' | 'privacy' | 'nickname' | 'media' | 'report' | 'search';

export const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  isOpen,
  onClose,
  recipientId,
  conversationId,
  recipientName,
  recipientAvatar
}) => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings state
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isMuted, setIsMuted] = useState(false);
  const [muteUntil, setMuteUntil] = useState<string | null>(null);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [nickname, setNickname] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [disappearingEnabled, setDisappearingEnabled] = useState(false);
  const [disappearingDuration, setDisappearingDuration] = useState<number>(86400); // 24 hours
  
  // Dialog states
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Media state
  const [media, setMedia] = useState<any[]>([]);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    if (isOpen) {
      loadChatSettings();
      loadDisappearingSettings();
    }
  }, [isOpen, conversationId]);

  const loadChatSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
        .single();

      if (data) {
        setTheme(data.theme || 'auto');
        setIsMuted(data.is_muted || false);
        setMuteUntil(data.muted_until);
        setReadReceipts(data.read_receipts_enabled ?? true);
        setTypingIndicators(data.typing_indicators_enabled ?? true);
        setNickname(data.nickname || '');
        setIsArchived(data.is_archived || false);
      }
    } catch (error) {
      console.error('Error loading chat settings:', error);
    }
  };

  const loadDisappearingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('disappearing_message_settings')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();

      if (data) {
        setDisappearingEnabled(data.is_enabled || false);
        setDisappearingDuration(data.duration_seconds || 86400);
      }
    } catch (error) {
      console.error('Error loading disappearing settings:', error);
    }
  };

  const updateChatSettings = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_settings')
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,conversation_id'
        });

      if (error) throw error;

      toast({
        title: 'Settings updated',
        description: 'Your chat settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating chat settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    updateChatSettings({ theme: newTheme });
  };

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    const until = muted ? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() : null; // 8 hours
    setMuteUntil(until);
    updateChatSettings({ is_muted: muted, muted_until: until });
  };

  const handleDisappearingToggle = async (enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('disappearing_message_settings')
        .upsert({
          conversation_id: conversationId,
          enabled_by: user.id,
          is_enabled: enabled,
          duration_seconds: disappearingDuration,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'conversation_id'
        });

      if (error) throw error;

      setDisappearingEnabled(enabled);
      toast({
        title: enabled ? 'Disappearing messages enabled' : 'Disappearing messages disabled',
        description: enabled ? `Messages will disappear after ${formatDuration(disappearingDuration)}` : 'Messages will no longer disappear',
      });
    } catch (error) {
      console.error('Error updating disappearing messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to update disappearing messages setting.',
        variant: 'destructive',
      });
    }
  };

  const handleBlock = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: recipientId,
          reason: blockReason
        });

      if (error) throw error;

      toast({
        title: 'User blocked',
        description: `${recipientName} has been blocked.`,
      });
      setShowBlockDialog(false);
      
      // Close panel and refresh
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to block user.',
        variant: 'destructive',
      });
    }
  };

  const handleReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: recipientId,
          conversation_id: conversationId,
          reason: reportReason,
          description: reportDescription
        });

      if (error) throw error;

      toast({
        title: 'Report submitted',
        description: 'Thank you for your report. We will review it shortly.',
      });
      setShowReportDialog(false);
      setReportDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = () => {
    const newArchived = !isArchived;
    setIsArchived(newArchived);
    updateChatSettings({ is_archived: newArchived, archived_at: newArchived ? new Date().toISOString() : null });
    toast({
      title: newArchived ? 'Chat archived' : 'Chat unarchived',
      description: newArchived ? 'This chat has been moved to your archive.' : 'This chat has been restored.',
    });
    
    // Close panel and reload to update conversation list
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleDeleteChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark all messages as deleted for this user using RPC
      const { error } = await supabase.rpc('mark_messages_deleted', {
        p_conversation_id: conversationId,
        p_user_id: user.id
      });

      if (error) {
        console.error('RPC error:', error);
        // Fallback: If RPC doesn't exist, fetch and update messages individually
        const { data: messages } = await supabase
          .from('messages')
          .select('id, deleted_for_users')
          .eq('conversation_id', conversationId);
        
        if (messages) {
          for (const msg of messages) {
            const deletedUsers = msg.deleted_for_users || [];
            if (!deletedUsers.includes(user.id)) {
              deletedUsers.push(user.id);
              await supabase
                .from('messages')
                .update({ deleted_for_users: deletedUsers })
                .eq('id', msg.id);
            }
          }
        }
      }

      toast({
        title: 'Chat deleted',
        description: 'All messages have been deleted for you.',
      });
      setShowDeleteDialog(false);
      
      // Close panel and reload
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat.',
        variant: 'destructive',
      });
    }
  };

  const loadMedia = async () => {
    try {
      const mediaType = mediaFilter === 'all' ? null : mediaFilter;
      const { data, error } = await supabase.rpc('get_conversation_media', {
        p_conversation_id: conversationId,
        p_media_type: mediaType,
        p_limit: 50,
        p_offset: 0
      });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'media') {
      loadMedia();
    }
  }, [currentView, mediaFilter]);

  const formatDuration = (seconds: number) => {
    if (seconds === 60) return '1 minute';
    if (seconds === 3600) return '1 hour';
    if (seconds === 86400) return '24 hours';
    if (seconds === 604800) return '7 days';
    return `${seconds} seconds`;
  };

  const renderMainView = () => (
    <div className="space-y-1">
      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 space-y-3">
        <Avatar className="w-24 h-24">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback className="text-2xl">{recipientName[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-xl font-semibold">{nickname || recipientName}</h3>
          {nickname && <p className="text-sm text-muted-foreground">@{recipientName}</p>}
        </div>
      </div>

      <Separator />

      {/* Search */}
      <Button
        variant="ghost"
        className="w-full justify-between h-12"
        onClick={() => setCurrentView('search')}
      >
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5" />
          <span>Search in conversation</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </Button>

      <Separator />

      {/* Customize Chat */}
      <div className="py-2">
        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">CUSTOMIZE CHAT</p>
        
        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => setCurrentView('theme')}
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
            <span>Theme</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground capitalize">{theme}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => setCurrentView('nickname')}
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5" />
            <span>Nickname</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{nickname || 'Not set'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Button>
      </div>

      <Separator />

      {/* Chat Settings */}
      <div className="py-2">
        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">CHAT SETTINGS</p>
        
        <div className="flex items-center justify-between h-12 px-3">
          <div className="flex items-center gap-3">
            <BellOff className="w-5 h-5" />
            <span>Mute notifications</span>
          </div>
          <Switch checked={isMuted} onCheckedChange={handleMuteToggle} />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => setCurrentView('disappearing')}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span>Disappearing messages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {disappearingEnabled ? formatDuration(disappearingDuration) : 'Off'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => setCurrentView('privacy')}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <span>Privacy & safety</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      {/* Shared Content */}
      <Button
        variant="ghost"
        className="w-full justify-between h-12"
        onClick={() => setCurrentView('media')}
      >
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5" />
          <span>Shared photos & videos</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </Button>

      <Separator />

      {/* Actions */}
      <div className="py-2 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-blue-600 hover:text-blue-700"
          onClick={handleArchive}
        >
          <Archive className="w-5 h-5 mr-3" />
          {isArchived ? 'Unarchive chat' : 'Archive chat'}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-amber-600 hover:text-amber-700"
          onClick={() => setShowReportDialog(true)}
        >
          <Flag className="w-5 h-5 mr-3" />
          Report
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-red-600 hover:text-red-700"
          onClick={() => setShowBlockDialog(true)}
        >
          <Ban className="w-5 h-5 mr-3" />
          Block
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-red-600 hover:text-red-700"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-5 h-5 mr-3" />
          Delete chat
        </Button>
      </div>
    </div>
  );

  const renderThemeView = () => (
    <div className="space-y-4 py-4">
      <RadioGroup value={theme} onValueChange={(value: any) => handleThemeChange(value)}>
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light" className="flex items-center gap-3 flex-1 cursor-pointer">
            <Sun className="w-5 h-5" />
            <div>
              <p className="font-medium">Light</p>
              <p className="text-sm text-muted-foreground">Bright and clear interface</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark" className="flex items-center gap-3 flex-1 cursor-pointer">
            <Moon className="w-5 h-5" />
            <div>
              <p className="font-medium">Dark</p>
              <p className="text-sm text-muted-foreground">Easy on the eyes in low light</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="auto" id="auto" />
          <Label htmlFor="auto" className="flex items-center gap-3 flex-1 cursor-pointer">
            <Laptop className="w-5 h-5" />
            <div>
              <p className="font-medium">Auto</p>
              <p className="text-sm text-muted-foreground">Matches system preference</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  const renderDisappearingView = () => (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Enable disappearing messages</p>
          <p className="text-sm text-muted-foreground">Messages will automatically delete after the timer expires</p>
        </div>
        <Switch checked={disappearingEnabled} onCheckedChange={handleDisappearingToggle} />
      </div>

      {disappearingEnabled && (
        <div className="space-y-3">
          <Label>Delete messages after</Label>
          <Select value={disappearingDuration.toString()} onValueChange={(v) => setDisappearingDuration(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">24 hours</SelectItem>
              <SelectItem value="604800">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderPrivacyView = () => (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between p-3 rounded-lg">
        <div>
          <p className="font-medium">Read receipts</p>
          <p className="text-sm text-muted-foreground">Let others know when you've read their messages</p>
        </div>
        <Switch checked={readReceipts} onCheckedChange={(v) => { setReadReceipts(v); updateChatSettings({ read_receipts_enabled: v }); }} />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg">
        <div>
          <p className="font-medium">Typing indicators</p>
          <p className="text-sm text-muted-foreground">Show when you're typing</p>
        </div>
        <Switch checked={typingIndicators} onCheckedChange={(v) => { setTypingIndicators(v); updateChatSettings({ typing_indicators_enabled: v }); }} />
      </div>
    </div>
  );

  const renderNicknameView = () => (
    <div className="space-y-4 py-4">
      <div>
        <Label htmlFor="nickname">Custom nickname for {recipientName}</Label>
        <p className="text-sm text-muted-foreground mb-3">This is only visible to you</p>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter nickname..."
          maxLength={100}
        />
      </div>
      <Button onClick={() => { updateChatSettings({ nickname }); setCurrentView('main'); }} className="w-full">
        Save nickname
      </Button>
    </div>
  );

  const renderMediaView = () => (
    <div className="space-y-4 py-4">
      <div className="flex gap-2">
        <Button variant={mediaFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setMediaFilter('all')}>All</Button>
        <Button variant={mediaFilter === 'image' ? 'default' : 'outline'} size="sm" onClick={() => setMediaFilter('image')}>Photos</Button>
        <Button variant={mediaFilter === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setMediaFilter('video')}>Videos</Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => (
            <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={item.thumbnail_url || item.media_url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        {media.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No media shared yet</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderSearchView = () => (
    <div className="space-y-4 py-4">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search messages..."
        className="w-full"
      />
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Enter a search term to find messages</p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Main Panel */}
      <div className="absolute top-0 right-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {currentView !== 'main' && (
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              {currentView === 'main' && 'Chat Settings'}
              {currentView === 'theme' && 'Theme'}
              {currentView === 'disappearing' && 'Disappearing Messages'}
              {currentView === 'privacy' && 'Privacy & Safety'}
              {currentView === 'nickname' && 'Nickname'}
              {currentView === 'media' && 'Shared Media'}
              {currentView === 'search' && 'Search'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {currentView === 'main' && renderMainView()}
            {currentView === 'theme' && renderThemeView()}
            {currentView === 'disappearing' && renderDisappearingView()}
            {currentView === 'privacy' && renderPrivacyView()}
            {currentView === 'nickname' && renderNicknameView()}
            {currentView === 'media' && renderMediaView()}
            {currentView === 'search' && renderSearchView()}
          </div>
        </ScrollArea>
      </div>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {recipientName}?</DialogTitle>
            <DialogDescription>
              They won't be able to message you or see your profile. They won't be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blockReason">Reason (optional)</Label>
              <Textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Why are you blocking this user?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBlock}>Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {recipientName}</DialogTitle>
            <DialogDescription>
              Help us understand what's happening. We'll review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportReason">Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="fake">Fake account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportDescription">Additional details</Label>
              <Textarea
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more context about this report..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button onClick={handleReport}>Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this chat?</DialogTitle>
            <DialogDescription>
              All messages will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteChat}>Delete chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
