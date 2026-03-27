import { useState } from "react";
import { cn } from "@/lib/utils";
import EmojiReactions from "./EmojiReactions";
import { Reply } from "lucide-react";

interface Reaction {
  emoji: string;
  users: string[];
}

interface ReplyTo {
  id: string;
  sender: string;
  text: string;
}

interface ChatBubbleProps {
  message: string;
  sender: string;
  timestamp: Date;
  isMine: boolean;
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  currentUser: string;
  imageUrl?: string;
  readBy?: string[];
  senderName?: string;
  replyTo?: ReplyTo | null;
  onReply: () => void;
  onScrollToMessage?: (id: string) => void;
}

const ChatBubble = ({
  message, sender, timestamp, isMine, reactions, onReact, currentUser,
  imageUrl, readBy = [], senderName, replyTo, onReply, onScrollToMessage,
}: ChatBubbleProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const time = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className={cn("flex flex-col gap-1 max-w-[80%] group", isMine ? "self-end items-end" : "self-start items-start")}>
        <span className="text-xs text-muted-foreground px-2">{sender}</span>

        <div className={cn("flex items-center gap-1", isMine ? "flex-row-reverse" : "flex-row")}>
          <div
            className={cn(
              "rounded-2xl shadow-sm overflow-hidden",
              isMine
                ? "bg-bubble-mine rounded-br-md"
                : "bg-bubble-theirs rounded-bl-md"
            )}
          >
            {/* Reply preview */}
            {replyTo && (
              <button
                onClick={() => onScrollToMessage?.(replyTo.id)}
                className={cn(
                  "w-full text-left px-3 py-2 border-l-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors",
                )}
              >
                <p className="text-[10px] font-medium text-primary">{replyTo.sender}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {replyTo.text || "📷 Image"}
                </p>
              </button>
            )}

            {imageUrl && (
              <div className="relative cursor-pointer" onClick={() => setFullscreen(true)}>
                {!imageLoaded && (
                  <div className="w-48 h-36 bg-muted animate-pulse rounded-t-2xl" />
                )}
                <img
                  src={imageUrl}
                  alt="Shared image"
                  className={cn(
                    "max-w-[280px] max-h-[300px] object-cover",
                    !replyTo && "rounded-t-2xl",
                    !imageLoaded && "hidden"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}
            {message && (
              <div className="px-4 py-2.5">
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{message}</p>
              </div>
            )}
          </div>

          {/* Reply button */}
          <button
            onClick={onReply}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
            title="Reply"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>
        </div>

        <EmojiReactions reactions={reactions} onReact={onReact} currentUser={currentUser} isMine={isMine} />
        <div className={cn("flex items-center gap-1 px-2", isMine ? "justify-end" : "justify-start")}>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isMine && (
            <span className={cn("text-[10px]", readBy.length > 0 ? "text-primary" : "text-muted-foreground")}>
              {readBy.length > 0 ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>

      {fullscreen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={imageUrl}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default ChatBubble;
