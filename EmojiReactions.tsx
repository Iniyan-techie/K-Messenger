import { useState } from "react";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

interface Reaction {
  emoji: string;
  users: string[];
}

interface EmojiReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  currentUser: string;
  isMine: boolean;
}

const EmojiReactions = ({ reactions, onReact, currentUser, isMine }: EmojiReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const activeReactions = reactions.filter((r) => r.users.length > 0);

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", isMine ? "justify-end" : "justify-start")}>
      {activeReactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onReact(r.emoji)}
          className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all",
            "border hover:scale-105 active:scale-95",
            r.users.includes(currentUser)
              ? "bg-primary/15 border-primary/30"
              : "bg-secondary/50 border-border"
          )}
        >
          <span>{r.emoji}</span>
          <span className="text-muted-foreground">{r.users.length}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-muted-foreground hover:text-foreground text-xs px-1 py-0.5 rounded-full hover:bg-secondary/50 transition-colors"
        >
          {showPicker ? "✕" : "+"}
        </button>

        {showPicker && (
          <div
            className={cn(
              "absolute bottom-full mb-1 flex gap-1 bg-card border border-border rounded-full px-2 py-1 shadow-lg z-10",
              isMine ? "right-0" : "left-0"
            )}
          >
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowPicker(false);
                }}
                className="hover:scale-125 active:scale-95 transition-transform text-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiReactions;
