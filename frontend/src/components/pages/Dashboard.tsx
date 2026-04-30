import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { createClient } from "@/lib/client";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "@/lib/config";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import MessageDisplay from "@/components/MessageDisplay";
import Navbar from "@/components/Navbar";
import { Menu, X, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "User" | "Assistant";
}

const supabase = createClient();

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{id: string; title: string; slug: string; createdAt: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getInfo() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/auth");
      } else {
        setUser(data.user);
      }
    }
    getInfo();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;
    if (!jwt) return;

    const response = await axios.get(`${BACKEND_URL}/conversations`, {
      headers: { Authorization: jwt }
    });
    setConversations(response.data.conversations || []);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversation = async (conversationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      if (!jwt) return;

      const response = await axios.get(`${BACKEND_URL}/conversation/${conversationId}`, {
        headers: { Authorization: jwt }
      });

      const conv = response.data.conversation;
      if (conv && conv.Message) {
        setMessages(conv.Message.map((m: { id: number; content: string; role: string }) => ({
          id: m.id.toString(),
          content: m.content,
          role: m.role as "User" | "Assistant"
        })));
        setActiveConversationId(conversationId);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
  };

  const handleSendMessage = async (query: string) => {
    if (!user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      role: "User",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;

      const endpoint = activeConversationId
        ? `${BACKEND_URL}/perplexity_ask/followup`
        : `${BACKEND_URL}/perplexity_ask`;

      const payload = activeConversationId
        ? { query, conversationId: activeConversationId }
        : { query };

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: jwt!,
        },
        responseType: "text",
      });

      let responseText = response.data;
      let newConversationId: string | null = null;

      // Parse conversation ID if present
      const convIdMatch = responseText.match(/<ConversationId>([\s\S]*?)<\/ConversationId>/);
      if (convIdMatch) {
        newConversationId = convIdMatch[1].trim();
        setActiveConversationId(newConversationId);
        responseText = responseText.replace(/<ConversationId>[\s\S]*?<\/ConversationId>\n?/, "");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: "Assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "Assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      loadConversations();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/auth");
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-white flex overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          onSelectConversation={loadConversation}
          onStartNewConversation={startNewConversation}
          activeConversationId={activeConversationId}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Navbar */}
        <Navbar onLogout={handleLogout} />

        {/* Chat area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[768px] mx-auto px-4 py-6 lg:py-12">
            {messages.length === 0 ? (
              /* Welcome screen - Perplexity style */
              <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <h1 className="text-4xl lg:text-5xl font-medium mb-3 text-center bg-gradient-to-b from-white to-[#71767b] bg-clip-text text-transparent">
                  Where can I help you today?
                </h1>
                <p className="text-[#71767b] text-lg mb-10">Ask questions, get answers, and explore ideas with AI.</p>
                <div className="w-full max-w-[600px]">
                  <SearchBar onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-8 pb-32">
                {messages.map((message) => (
                  <MessageDisplay key={message.id} message={message} />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3 text-[#71767b]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input at bottom - Perplexity style */}
          {messages.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-6">
              <div className="max-w-[600px] mx-auto px-4">
                <SearchBar
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="Ask a follow-up..."
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}