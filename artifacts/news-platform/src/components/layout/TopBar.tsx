import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bell, User, Settings, Sparkles, Bookmark, Command, Loader2, Sparkle, LogOut, Code, Trophy, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/components/news/BookmarkNotesPanel";
import { motion, AnimatePresence } from "framer-motion";

interface TopBarProps {
  onSettingsClick: () => void;
  onBookmarkClick: () => void;
}

export function TopBar({ onSettingsClick, onBookmarkClick }: TopBarProps) {
  const [location] = useLocation();
  const { bookmarks } = useBookmarks();
  
  // Search Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle Cmd+K / Ctrl+K Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setAiResponse(null);
    }
  }, [isSearchOpen]);

  // Fake AI Search Logic for Demo Video
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsSearching(false);
      setAiResponse(
        `Here is what I found about "${searchQuery}": Based on the latest data in your feed, this topic is currently trending. Major tech companies are heavily investing in this space to optimize performance and security. Would you like me to filter your news feed to show specific articles related to this?`
      );
    }, 1200);
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-white/8"
        style={{ background: "rgba(8, 10, 22, 0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(0,210,240,0.35)] group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,210,240,0.55)] transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block text-white">
              Nexus<span className="text-primary">AI</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <span className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer block ${location === '/' ? 'text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}>
                My Feed
                {location === '/' && (
                  <motion.span layoutId="navIndicator" className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </span>
            </Link>
            <Link href="/bubbles">
              <span className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer block ${location === '/bubbles' ? 'text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}>
                Explore
                {location === '/bubbles' && (
                  <motion.span layoutId="navIndicator" className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 max-w-xl px-4 lg:px-8">
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full cursor-text group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <div 
              className="w-full h-11 rounded-full pl-11 pr-4 text-sm text-muted-foreground flex items-center transition-all group-hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Ask AI about any topic...
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <span className="text-[10px] text-white/40 px-2 py-0.5 rounded border border-white/10 font-mono flex items-center gap-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                <Command className="w-3 h-3" /> K
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="relative hidden sm:flex text-muted-foreground hover:text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>

          <button
            onClick={onBookmarkClick}
            className="relative p-2.5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/8 transition-all"
          >
            <Bookmark className="w-5 h-5" />
            {bookmarks.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-bold text-background"
              >
                {bookmarks.length > 9 ? "9+" : bookmarks.length}
              </motion.span>
            )}
          </button>

          <Button variant="ghost" size="icon" onClick={onSettingsClick} className="text-muted-foreground hover:text-white mr-1">
            <Settings className="w-5 h-5" />
          </Button>

          {/* Profile Dropdown Container */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/60 hover:scale-105 transition-all shadow-[0_0_10px_rgba(0,210,240,0.15)]"
            >
              <span className="text-sm font-bold text-primary">AJ</span>
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-72 bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* User Info Header */}
                  <div className="p-5 border-b border-white/10 bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-white">AJ</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-white">Abhishek Jha</span>
                        <span className="text-xs text-muted-foreground">abhishek.jha@dtu.edu</span>
                      </div>
                    </div>
                  </div>

                  {/* Preferences Section */}
                  <div className="p-3 border-b border-white/10">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Interests & Preferences
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-colors">
                        <Code className="w-4 h-4 text-primary" />
                        Hackathons
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-colors">
                        <Cpu className="w-4 h-4 text-secondary" />
                        Technology
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-colors">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Sports
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3">
                    <button 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* AI Search Command Palette Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearch} className="relative flex items-center p-4 border-b border-white/10">
                <Sparkles className="w-5 h-5 text-primary absolute left-6" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask the AI anything..."
                  className="w-full bg-transparent border-none outline-none text-lg text-white placeholder:text-muted-foreground pl-10 pr-4"
                />
                <button 
                  type="submit" 
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-4 py-1.5 bg-primary/20 text-primary text-sm font-medium rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                  Ask
                </button>
              </form>

              <div className="p-6 min-h-[100px] max-h-[60vh] overflow-y-auto">
                {!isSearching && !aiResponse && (
                  <div className="text-center text-muted-foreground py-8">
                    <Sparkle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>Press Enter to search your feed, summaries, and the web.</p>
                  </div>
                )}

                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-primary">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-sm animate-pulse">Consulting NexusAI...</p>
                  </div>
                )}

                {aiResponse && !isSearching && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl rounded-tl-none text-white/90 leading-relaxed text-sm">
                      {aiResponse}
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="bg-white/5 px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-4">
                  <span><kbd className="bg-black/30 px-1.5 py-0.5 rounded border border-white/10 font-sans">esc</kbd> to close</span>
                  <span><kbd className="bg-black/30 px-1.5 py-0.5 rounded border border-white/10 font-sans">↵</kbd> to ask</span>
                </div>
                <span>NexusAI Copilot</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}