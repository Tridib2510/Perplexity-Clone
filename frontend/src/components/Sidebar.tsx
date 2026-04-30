import { useState } from "react";
import { Search, Plus, Settings, X, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onStartNewConversation: () => void;
  activeConversationId?: string | null;
}

export default function Sidebar({ open = true, onClose, conversations, onSelectConversation, onStartNewConversation, activeConversationId }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={cn(
      "h-full w-64 flex flex-col bg-[#0a0a0a] border-r border-[#2a2a2a]",
      "transition-all duration-300",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#2a2a2a]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#5a5a5a] flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-[15px]">Perplexity</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-[#71767b] hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <button
          onClick={onStartNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[14px] rounded-full border border-[#2a2a2a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New search
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="relative"
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-[14px] transition-colors",
                  activeConversationId === conv.id
                    ? "bg-[#2a2a2a] text-white"
                    : "text-[#71767b] hover:text-white hover:bg-[#1a1a1a]"
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{conv.title || "New conversation"}</span>
              </button>
              {hoveredId === conv.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#71767b] hover:text-white hover:bg-[#3a3a3a] rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-[#71767b] text-[13px] text-center py-8">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-[#71767b] hover:text-white hover:bg-[#1a1a1a] transition-colors text-[14px] rounded-xl">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
