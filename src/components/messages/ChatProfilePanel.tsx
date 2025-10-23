import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, BellOff, UserX, Flag, Archive, Heart, Image as ImageIcon, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChatProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  username?: string;
  avatar?: string;
  isOnline?: boolean;
  onViewProfile: () => void;
}

export function ChatProfilePanel({
  isOpen,
  onClose,
  userName,
  username,
  avatar,
  isOnline,
  onViewProfile,
}: ChatProfilePanelProps) {
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l border-border z-50 shadow-2xl"
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-lg">Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center py-8 px-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {userName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              <h3 className="text-xl font-semibold mt-4">{userName}</h3>
              {username && (
                <p className="text-sm text-muted-foreground">@{username}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 w-full max-w-xs">
                <Button
                  variant="outline"
                  onClick={onViewProfile}
                  className="flex-1 rounded-xl"
                >
                  View Profile
                </Button>
              </div>
            </div>

            <Separator />

            {/* Options */}
            <div className="py-2">
              {/* Theme */}
              <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Default</p>
                </div>
              </button>

              <Separator className="my-2" />

              {/* Search in conversation */}
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="font-medium">Search</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <Separator className="my-2" />

              {/* Disappearing messages */}
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Disappearing messages</p>
                    <p className="text-xs text-muted-foreground">Off</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <Separator className="my-2" />

              {/* Mute notifications */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {isMuted ? (
                      <BellOff className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>
                  <p className="font-medium">
                    {isMuted ? "Unmute" : "Mute"} notifications
                  </p>
                </div>
              </button>

              <Separator className="my-2" />

              {/* Privacy & safety */}
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="font-medium">Privacy & safety</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <Separator className="my-2" />

              {/* Nicknames */}
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <p className="font-medium">Nicknames</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <Separator className="my-2" />

              {/* Shared photos */}
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="font-medium">Shared photos & videos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <Separator className="my-4" />

            {/* Danger Zone */}
            <div className="py-2 px-4 space-y-2">
              <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-red-500">
                <UserX className="w-5 h-5" />
                <p className="font-medium">Block</p>
              </button>

              <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-red-500">
                <Flag className="w-5 h-5" />
                <p className="font-medium">Report</p>
              </button>

              <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-orange-500">
                <Archive className="w-5 h-5" />
                <p className="font-medium">Archive chat</p>
              </button>

              <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-red-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <p className="font-medium">Delete chat</p>
              </button>
            </div>

            <div className="h-20" />
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}
