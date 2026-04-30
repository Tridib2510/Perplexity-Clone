import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ArrowUp } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "User" | "Assistant";
}

interface MessageDisplayProps {
  message: Message;
  onRegenerate?: () => void;
}

function parseContent(content: string) {
  let answer = content;
  let followUps: string[] = [];
  let sources: { url: string }[] = [];

  const sourcesMatch = content.match(/<Sources>([\s\S]*?)<\/Sources>/);
  if (sourcesMatch) {
    answer = answer.replace(/<Sources>[\s\S]*?<\/Sources>/, "").trim();
    try {
      sources = JSON.parse(sourcesMatch[1]);
    } catch {
      sources = [];
    }
  }

  const answerMatch = content.match(/<ANSWER>([\s\S]*?)<\/ANSWER>/);
  if (answerMatch) {
    answer = answerMatch[1].trim();
  }

  const followUpsMatch = content.match(/<FOLLOWUPS>([\s\S]*?)<\/FOLLOWUPS>/);
  if (followUpsMatch) {
    const questionMatches = followUpsMatch[1].matchAll(/<question>([\s\S]*?)<\/question>/g);
    followUps = Array.from(questionMatches).map((m) => m[1].trim());
  }

  return { answer, followUps, sources };
}

export default function MessageDisplay({ message }: MessageDisplayProps) {
  const [showSources, setShowSources] = useState(false);

  if (message.role === "User") {
    return (
      <div className="flex justify-end mb-6">
        <div className="bg-[#2a2a2a] rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
          <p className="text-white text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const { answer, followUps, sources } = parseContent(message.content);

  return (
    <div className="mb-8">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5a5a5a] to-[#3a3a3a] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-medium">P</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[#e0e0e0] text-[15px] leading-relaxed whitespace-pre-wrap">
            {answer}
          </div>

          {/* Follow-up Questions */}
          {followUps.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-[#71767b] text-[13px]">Suggested follow-ups:</p>
              {followUps.map((q, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#e0e0e0] text-[14px] rounded-xl transition-colors border border-[#2a2a2a] hover:border-[#3a3a3a]"
                >
                  <ArrowUp className="w-4 h-4 text-[#71767b]" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-[#71767b] hover:text-white text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {sources.length} sources
                {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSources && (
                <div className="mt-3 space-y-2">
                  {sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl text-[#71767b] hover:text-white transition-colors text-sm"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{s.url}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}