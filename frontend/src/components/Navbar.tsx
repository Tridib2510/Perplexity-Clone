import { useState, useRef, useEffect } from "react";
import { Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/client";

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    getUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <nav className="h-14 border-b border-[#2a2a2a] flex items-center justify-between px-4 lg:px-6 bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5a5a5a] to-[#3a3a3a] flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white text-[15px] hidden sm:block">Perplexity</span>
      </div>

      {/* Profile dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#2a2a2a] overflow-hidden flex items-center justify-center border border-[#3a3a3a]">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">{displayName[0]?.toUpperCase()}</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-[#71767b] transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2a2a2a] overflow-hidden flex items-center justify-center border border-[#3a3a3a]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-lg font-medium">{displayName[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[14px] font-medium truncate">{displayName}</p>
                  <p className="text-[#71767b] text-[12px] truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[#71767b] hover:text-white hover:bg-[#2a2a2a] transition-colors text-[14px]">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[#71767b] hover:text-white hover:bg-[#2a2a2a] transition-colors text-[14px]"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
