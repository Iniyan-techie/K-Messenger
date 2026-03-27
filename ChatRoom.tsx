import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatBubble from "@/components/ChatBubble";
import { Send, LogOut, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  users: string[];
}

interface ReplyTo {
  id: string;
  sender: string;
  text: string;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: Timestamp | null;
  reactions?: Record<string, string[]>;
  imageUrl?: string;
  readBy?: string[];
  replyToId?: string;
  replyToSender?: string;
  replyToText?: string;
}

interface ChatRoomProps {
  nickname: string;
  onLogout: () => void;
}

const EMOJI_LIST = ["❤️", "😂", "👍", "😮", "😢", "🔥"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ChatRoom = ({ nickname, onLogout }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyTo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages from others as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.sender !== nickname && !(msg.readBy || []).includes(nickname)) {
        updateDoc(doc(db, "messages", msg.id), {
          readBy: [...(msg.readBy || []), nickname],
        }).catch((err) => console.error("Failed to mark as read:", err));
      }
    });
  }, [messages, nickname]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleReply = useCallback((msg: Message) => {
    setReplyingTo({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
    });
    inputRef.current?.focus();
  }, []);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("animate-pulse");
      setTimeout(() => el.classList.remove("animate-pulse"), 1500);
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if ((!text && !imageFile) || sending) return;

    setSending(true);
    setNewMessage("");
    const currentImage = imageFile;
    const currentReply = replyingTo;
    clearImage();
    setReplyingTo(null);

    try {
      let imageUrl: string | undefined;

      if (currentImage) {
        const imageRef = ref(storage, `chat-images/${Date.now()}-${currentImage.name}`);
        const snapshot = await uploadBytes(imageRef, currentImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "messages"), {
        text: text || "",
        sender: nickname,
        createdAt: serverTimestamp(),
        reactions: {},
        ...(imageUrl && { imageUrl }),
        ...(currentReply && {
          replyToId: currentReply.id,
          replyToSender: currentReply.sender,
          replyToText: currentReply.text,
        }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(text);
    }
    setSending(false);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const reactions = { ...(msg.reactions || {}) };
    const users = reactions[emoji] ? [...reactions[emoji]] : [];

    if (users.includes(nickname)) {
      reactions[emoji] = users.filter((u) => u !== nickname);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...users, nickname];
    }

    try {
      await updateDoc(doc(db, "messages", messageId), { reactions });
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  const getReactionsArray = (msg: Message): Reaction[] => {
    const reactions = msg.reactions || {};
    return EMOJI_LIST.map((emoji) => ({
      emoji,
      users: reactions[emoji] || [],
    }));
  };

  const getReplyTo = (msg: Message): ReplyTo | null => {
    if (!msg.replyToId) return null;
    return {
      id: msg.replyToId,
      sender: msg.replyToSender || "",
      text: msg.replyToText || "",
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">☕</span>
          <h1 className="font-bold text-foreground">Our Space</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{nickname}</span>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No messages yet. Say hi! 👋</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} ref={(el) => { messageRefs.current[msg.id] = el; }}>
            <ChatBubble
              message={msg.text}
              sender={msg.sender}
              timestamp={msg.createdAt?.toDate() ?? new Date()}
              isMine={msg.sender === nickname}
              reactions={getReactionsArray(msg)}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              currentUser={nickname}
              imageUrl={msg.imageUrl}
              readBy={msg.readBy || []}
              senderName={msg.sender}
              replyTo={getReplyTo(msg)}
              onReply={() => handleReply(msg)}
              onScrollToMessage={scrollToMessage}
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 py-2 border-t border-border bg-card/60 flex items-center gap-2">
          <div className="flex-1 border-l-2 border-primary/50 pl-3 py-1">
            <p className="text-xs font-medium text-primary">{replyingTo.sender}</p>
            <p className="text-xs text-muted-foreground truncate">{replyingTo.text || "📷 Image"}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className={cn("px-4 py-2 border-t border-border bg-card/60", !replyingTo && "border-t")}>
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover" />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card/80 backdrop-blur-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={replyingTo ? `Reply to ${replyingTo.sender}...` : "Type a message..."}
          className="flex-1 bg-secondary/50"
          maxLength={1000}
        />
        <Button type="submit" size="icon" disabled={(!newMessage.trim() && !imageFile) || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatRoom;
