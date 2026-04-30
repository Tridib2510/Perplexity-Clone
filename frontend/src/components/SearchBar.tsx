import { Search, SendHorizontal } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ onSendMessage, isLoading, placeholder = "Ask anything..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSendMessage(query.trim());
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl px-4 py-3 focus-within:border-[#3d3d3d] transition-colors">
        <Search className="w-5 h-5 text-[#71767b] flex-shrink-0 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent text-white placeholder:text-[#71767b] outline-none text-[15px]"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !query.trim()}
          className="bg-[#5a5a5a] hover:bg-[#6a6a6a] text-white rounded-full w-8 h-8"
        >
          <SendHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}