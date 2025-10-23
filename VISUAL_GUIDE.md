# 🎨 Message Requests - Visual Guide

## Before vs After

### BEFORE ❌
```
Messages Page
├── Search bar (searches ALL users)
├── Conversation list (anyone can appear)
└── Chat area
    ├── Messages from anyone
    └── No filtering
```

### AFTER ✅
```
Messages Page
├── Search bar (searches ONLY followers/following)
├── Tabs
│   ├── 💬 Messages Tab
│   │   ├── Conversations with followers/following
│   │   ├── Relationship badges (Mutual/Follower/Following)
│   │   └── Normal chat functionality
│   │
│   └── 📬 Requests Tab (with count badge)
│       ├── Messages from non-followers
│       ├── Sender info + message preview
│       └── Accept/Delete buttons
│
└── Chat area (same as before)
```

---

## 📱 Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Messages                                          [@user]   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔍 Search followers/following...                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────┬──────────────────┐                   │
│  │  💬 Messages     │  📬 Requests  3  │                   │
│  └──────────────────┴──────────────────┘                   │
│                                                              │
│  If "Messages" tab selected:                                │
│  ┌────────────────────────────────────┬──────────────────┐ │
│  │  🟢 Alice Johnson      [Mutual] 2m │                  │ │
│  │  @alice                            │                  │ │
│  │  You: Hey! How are you?            │                  │ │
│  ├────────────────────────────────────┤                  │ │
│  │  🔴 Bob Smith       [Following] 5m │                  │ │
│  │  @bob                              │  Selected Chat   │ │
│  │  Bob: Great! Thanks for asking     │                  │ │
│  ├────────────────────────────────────┤     (Right)      │ │
│  │  🟢 Carol Davis      [Follower] 1h │                  │ │
│  │  @carol                            │                  │ │
│  │  Carol: See you later! 🎉          │                  │ │
│  └────────────────────────────────────┴──────────────────┘ │
│                                                              │
│  If "Requests" tab selected:                                │
│  ┌────────────────────────────────────┬──────────────────┐ │
│  │  ┌──────────────────────────────┐  │                  │ │
│  │  │ 👤 Dave Unknown              │  │                  │ │
│  │  │ @dave_random                 │  │                  │ │
│  │  │                              │  │                  │ │
│  │  │ "Hey, can we collaborate?"   │  │                  │ │
│  │  │                              │  │                  │ │
│  │  │  [✅ Accept]  [❌ Delete]    │  │  Empty State     │ │
│  │  └──────────────────────────────┘  │                  │ │
│  │                                    │                  │ │
│  │  ┌──────────────────────────────┐  │    "Select a     │ │
│  │  │ 👤 Eve Stranger              │  │  conversation"   │ │
│  │  │ @eve_someone                 │  │                  │ │
│  │  │                              │  │                  │ │
│  │  │ "I saw your post!"           │  │                  │ │
│  │  │                              │  │                  │ │
│  │  │  [✅ Accept]  [❌ Delete]    │  │                  │ │
│  │  └──────────────────────────────┘  │                  │ │
│  └────────────────────────────────────┴──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 User Flow Diagrams

### Flow 1: Normal Messaging (Follower → Follower)

```
     User A                                    User B
       │                                         │
       │  1. Opens Messages                      │
       │  2. Searches "User B"                   │
       │  ✓ Sees User B (mutual follower)        │
       │                                         │
       │  3. Clicks on User B                    │
       │  4. Types "Hello!"                      │
       │  5. Clicks Send ──────────────────────> │
       │                                         │
       │                                         │ 6. Receives message
       │                                         │    (appears in Messages tab)
       │                                         │
       │ <─────────────────────── 7. Replies    │
       │  8. Receives reply                      │
       │     (real-time)                         │
       │                                         │
       ✓  Normal chat continues                 ✓
```

### Flow 2: Request from Non-Follower

```
   User X                                    User Y
  (doesn't                                  (target)
   follow Y)
      │                                        │
      │  1. Opens Messages                     │
      │  2. Searches "User Y"                  │
      │  ✗ No results (not a follower)         │
      │                                        │
      │  3. Types URL or username directly     │
      │  4. Sends message ─────────────────>   │
      │     ⚠️ Marked as is_request=true       │
      │                                        │
      │                                        │ 5. Sees badge on
      │                                        │    "Requests" tab (3)
      │                                        │
      │                                        │ 6. Opens Requests
      │                                        │ 7. Sees message:
      │                                        │    ┌─────────────────┐
      │                                        │    │ 👤 User X       │
      │                                        │    │ "Hello there!"  │
      │                                        │    │                 │
      │                                        │    │ [✅] [❌]       │
      │                                        │    └─────────────────┘
      │                                        │
      │                                        │ 8a. Clicks "Accept"
      │ <─────────────────────────────────────│     ✓ Moved to Messages
      │  9. Can now chat normally              │     ✓ Full access
      │                                        │
      │                      OR                │
      │                                        │
      │                                        │ 8b. Clicks "Delete"
      │  ✗ Request deleted                     │     ✓ Removed from UI
      │  ✗ Cannot message again                │     ✓ No conversation
```

### Flow 3: Search Behavior

```
User searches in Messages page:

┌─────────────────────────────────────────────────┐
│ Search Query: "John"                            │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│ System checks:                                  │
│  1. Get user's followers                        │
│  2. Get user's following                        │
│  3. Combine into connectionIds array            │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│ SQL Query:                                      │
│  SELECT * FROM profiles                         │
│  WHERE id IN (connectionIds)                    │
│    AND (username ILIKE '%john%'                 │
│         OR full_name ILIKE '%john%')            │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│ Results:                                        │
│  ✓ John Doe (mutual follower)                   │
│  ✓ Johnny Smith (you follow)                    │
│  ✗ John Random (not connected) ← NOT SHOWN     │
└─────────────────────────────────────────────────┘
```

---

## 🏷️ Badge System

### Relationship Badges

```
┌───────────────────────────────────────┐
│  Alice Johnson        [Mutual]        │  ← Both follow each other
│  @alice                               │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  Bob Smith           [Following]      │  ← You follow them
│  @bob                                 │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  Carol Davis         [Follower]       │  ← They follow you
│  @carol                               │
└───────────────────────────────────────┘
```

### Request Count Badge

```
Tabs:
┌─────────────┬──────────────────────┐
│  💬 Messages │  📬 Requests    3   │  ← Red badge shows count
└─────────────┴──────────────────────┘
                            ↑
                   (Destructive variant)
```

### Online Status

```
┌─────────────────────────────────────┐
│  🟢 Alice Johnson     [Mutual]  2m  │  ← Green = Online
│  @alice                             │
├─────────────────────────────────────┤
│  🔴 Bob Smith      [Following]  1h  │  ← Gray = Offline
│  @bob                               │
└─────────────────────────────────────┘
```

### Unread Indicator

```
┌─────────────────────────────────────┐
│  Alice Johnson  [Mutual]  2m    🔵  │  ← Blue dot = unread
│  You: Hey there!                    │
└─────────────────────────────────────┘
```

---

## 🎨 Color Scheme

```css
/* Relationship Badges */
.badge-mutual {
  background: hsl(var(--secondary));  /* Gray */
  color: hsl(var(--secondary-foreground));
}

.badge-follower, .badge-following {
  background: transparent;
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}

/* Request Count */
.badge-requests {
  background: hsl(var(--destructive));  /* Red */
  color: hsl(var(--destructive-foreground));
}

/* Online Status */
.status-online {
  background: #10b981;  /* Green-500 */
}

.status-offline {
  background: #6b7280;  /* Gray-500 */
}

/* Unread Indicator */
.unread-dot {
  background: hsl(var(--primary));  /* Blue */
}
```

---

## 💡 Visual Cues

### Empty States

**Messages Tab (No Conversations)**
```
┌────────────────────────────────────┐
│                                    │
│          💬                        │
│      (Large Icon)                  │
│                                    │
│    No messages yet                 │
│                                    │
│  Search for followers to           │
│     start chatting                 │
│                                    │
└────────────────────────────────────┘
```

**Requests Tab (No Requests)**
```
┌────────────────────────────────────┐
│                                    │
│          📬                        │
│      (Large Icon)                  │
│                                    │
│   No message requests              │
│                                    │
│  Messages from non-followers       │
│    will appear here                │
│                                    │
└────────────────────────────────────┘
```

**Chat Area (No Selection)**
```
┌────────────────────────────────────┐
│                                    │
│          📤                        │
│      (Large Icon)                  │
│                                    │
│   Select a conversation            │
│                                    │
│  Choose a message or search for    │
│   followers to start chatting      │
│                                    │
└────────────────────────────────────┘
```

### Request Card Layout

```
┌────────────────────────────────────────┐
│  ┌──┐                                  │
│  │  │  Dave Unknown                    │
│  │👤│  @dave_random                    │
│  └──┘                                  │
│                                        │
│  "Hey, I saw your post about React.   │
│   Would love to collaborate!"         │
│                                        │
│  ┌──────────┐  ┌──────────┐          │
│  │ ✅ Accept │  │ ❌ Delete │          │
│  └──────────┘  └──────────┘          │
└────────────────────────────────────────┘
```

---

## 🔔 Toast Notifications

```javascript
// Success messages
toast.success("Message sent");
toast.success("Message request accepted");
toast.success("Message request deleted");

// Error messages
toast.error("Failed to send message");
toast.error("Failed to accept request");
toast.error("Failed to delete request");

// Info messages
toast.info("Message sent as a request (user doesn't follow you)");
```

---

## 📱 Responsive Behavior

### Desktop (>= 1024px)
```
┌─────────────┬──────────────────────────┐
│             │                          │
│  Sidebar    │     Chat Area            │
│  (Visible)  │     (Always visible)     │
│             │                          │
└─────────────┴──────────────────────────┘
```

### Mobile (< 1024px)
```
Conversation List View:
┌──────────────────────┐
│                      │
│   Sidebar            │
│   (Full screen)      │
│                      │
└──────────────────────┘

        ↓ (Select conversation)

Chat View:
┌──────────────────────┐
│  ← Back              │
│                      │
│   Chat Area          │
│   (Full screen)      │
│                      │
└──────────────────────┘
```

---

## 🎯 Key Visual Differences

| Feature | Before | After |
|---------|--------|-------|
| Search results | All users | Followers/following only |
| Tab system | None | Messages + Requests tabs |
| Badges | None | Mutual/Follower/Following |
| Request count | None | Red badge on Requests tab |
| Non-follower messages | Mixed in | Separate Requests tab |
| Accept/Reject | None | Buttons on each request |
| Relationship status | Hidden | Clearly visible |

---

## 🎨 Animation Details

```typescript
// Message entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  {message}
</motion.div>

// Conversation item
<motion.button
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {conversation}
</motion.button>
```

---

This visual guide complements the technical documentation and helps understand the UI/UX changes at a glance! 🎨
