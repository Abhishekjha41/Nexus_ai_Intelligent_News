import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NewsArticle,
  useGenerateBriefing,
  useGetArticleTimeline,
  BriefingRequestMode,
  useGetNewsFeed,
  useGetTrendingTopics,
} from "@workspace/api-client-react";
import { TopBar } from "@/components/layout/TopBar";
import { NewsCard } from "@/components/news/NewsCard";
import { AlertPanel } from "@/components/news/AlertPanel";
import { PreferencesDialog } from "@/components/settings/PreferencesDialog";
import { BookmarkNotesPanel, useBookmarks, useNotes } from "@/components/news/BookmarkNotesPanel";
import { ExplainPanel } from "@/components/news/ExplainPanel";
import {
  X,
  Brain,
  Clock,
  ChevronRight,
  Activity,
  TrendingUp,
  Sparkles,
  Layers,
  BookOpen,
  Bookmark,
  Check,
  GraduationCap,
  Briefcase,
  Lightbulb,
  BarChart2,
  Users,
  Zap,
  Eye,
  Volume2,
  Square,
  Send,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const TABS = [
  "For You",
  "Tech",
  "Politics",
  "Sports",
  "Finance",
  "Entertainment",
  "World",
  "Science",
  "Business",
] as const;
type Tab = (typeof TABS)[number];

const TOP_GENRES = ["Tech", "Finance", "World", "Science"] as const;

const GENRE_COLORS: Record<string, { from: string; to: string; glow: string }> =
  {
    Tech: { from: "#3b82f6", to: "#6366f1", glow: "#6366f144" },
    Finance: { from: "#10b981", to: "#059669", glow: "#10b98144" },
    World: { from: "#06b6d4", to: "#0891b2", glow: "#06b6d444" },
    Politics: { from: "#a855f7", to: "#7c3aed", glow: "#a855f744" },
    Sports: { from: "#f97316", to: "#ea580c", glow: "#f9731644" },
    Entertainment: { from: "#ec4899", to: "#db2777", glow: "#ec489944" },
    Science: { from: "#8b5cf6", to: "#7c3aed", glow: "#8b5cf644" },
    Business: { from: "#f59e0b", to: "#d97706", glow: "#f59e0b44" },
  };

// --- Dashboard Component ---
export default function Dashboard() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("For You");

  const { data: articlesRaw, isLoading, error } = useGetNewsFeed();
  const { data: trendingRaw } = useGetTrendingTopics();

  // BUG FIX: Ensure articles is ALWAYS an array to prevent .filter is not a function error
  const articles: NewsArticle[] = useMemo(() => {
    if (Array.isArray(articlesRaw)) return articlesRaw;
    if (articlesRaw && typeof articlesRaw === 'object' && 'data' in articlesRaw && Array.isArray((articlesRaw as any).data)) return (articlesRaw as any).data;
    if (articlesRaw && typeof articlesRaw === 'object' && 'articles' in articlesRaw && Array.isArray((articlesRaw as any).articles)) return (articlesRaw as any).articles;
    return [];
  }, [articlesRaw]);

  // BUG FIX: Ensure trending is ALWAYS an array
  const trending = useMemo(() => {
    if (Array.isArray(trendingRaw)) return trendingRaw;
    if (trendingRaw && typeof trendingRaw === 'object' && 'data' in trendingRaw && Array.isArray((trendingRaw as any).data)) return (trendingRaw as any).data;
    if (trendingRaw && typeof trendingRaw === 'object' && 'topics' in trendingRaw && Array.isArray((trendingRaw as any).topics)) return (trendingRaw as any).topics;
    return [];
  }, [trendingRaw]);

  const filteredArticles = useMemo(() => {
    if (activeTab === "For You") return articles;
    return articles.filter((a) => a.category === activeTab);
  }, [articles, activeTab]);

  const genreArticles = useMemo(() => {
    return TOP_GENRES.reduce(
      (acc, genre) => {
        acc[genre] = articles.filter((a) => a.category === genre).slice(0, 4);
        return acc;
      },
      {} as Record<string, NewsArticle[]>,
    );
  }, [articles]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 26 },
    },
  };

  return (
    <div
      className="min-h-screen relative selection:bg-primary/30"
      style={{ backgroundColor: "hsl(230, 35%, 4%)" }}
    >
      <div
        className="fixed inset-0 pointer-events-none z-[-1]"
        aria-hidden="true"
      >
        <img
          src={`${import.meta.env.BASE_URL}images/deep-space-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-25"
          style={{ filter: "saturate(1.4) brightness(0.7)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top right, hsl(260,40%,18%) 0%, transparent 55%), radial-gradient(ellipse at bottom left, hsl(190,40%,14%) 0%, transparent 55%)",
          }}
        />
      </div>

      <TopBar
        onSettingsClick={() => setIsPreferencesOpen(true)}
        onBookmarkClick={() => setIsBookmarkPanelOpen(true)}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Header + Tabs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Your Briefing
              </h1>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeTab === tab
                      ? "text-white"
                      : "text-muted-foreground hover:text-white hover:bg-white/5",
                  )}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/20"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feed Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[380px] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center glass-panel rounded-2xl">
              <Activity className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Error loading feed
              </h2>
              <p className="text-muted-foreground">
                Please try refreshing the page.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredArticles.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="col-span-full p-12 text-center glass-panel rounded-2xl border border-white/10"
                  >
                    <p className="text-muted-foreground text-lg">
                      No articles in this category yet.
                    </p>
                  </motion.div>
                ) : (
                  filteredArticles.map((article) => (
                    <motion.div key={article.id} variants={itemVariants}>
                      <NewsCard
                        article={article}
                        onClick={setSelectedArticle}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Top Genres Section - Made Compact for 2 items per row */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">
                Top Genres for You
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {TOP_GENRES.map((genre) => {
                const colors = GENRE_COLORS[genre];
                const gArticles = genreArticles[genre] || [];
                return (
                  <motion.div
                    key={genre}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-[2rem] border border-white/10 overflow-hidden flex flex-col p-5 group"
                    style={{
                      background:
                        "linear-gradient(165deg, rgba(20,22,40,0.7) 0%, rgba(10,12,28,0.9) 100%)",
                      backdropFilter: "blur(20px)",
                      boxShadow: `0 10px 40px -10px ${colors.glow}`,
                    }}
                  >
                    {/* Background Glow Effect */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-24 blur-[70px] pointer-events-none opacity-40 transition-opacity group-hover:opacity-60"
                      style={{ background: colors.from }}
                    />

                    {/* Header Top area */}
                    <div className="flex justify-between items-center w-full z-10 mb-2 relative">
                      <h3
                        className="text-lg sm:text-xl font-display font-bold tracking-widest uppercase drop-shadow-md"
                        style={{ color: colors.from }}
                      >
                        {genre}
                      </h3>
                      <button
                        onClick={() => setActiveTab(genre as Tab)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all"
                      >
                        View all <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Constellation / Bubble Layout */}
                    {gArticles.length > 0 ? (
                      <div className="flex-1 flex items-center justify-center mt-4 relative z-10">
                        <GenreBubbleLayout
                          articles={gArticles}
                          genre={genre}
                          colors={colors}
                          onArticleClick={setSelectedArticle}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center min-h-[250px] relative z-10 text-white/40 text-sm">
                        No articles available.
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <AlertPanel />

          {/* Trending sidebar */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Trending Now
            </h3>
            <div className="space-y-3">
              {trending.slice(0, 6).map((topic: any, i: number) => (
                <motion.div
                  key={topic.id}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between group cursor-pointer py-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl font-bold text-white/20 group-hover:text-primary transition-colors flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                      {topic.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0",
                      topic.trend === "rising"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : topic.trend === "falling"
                          ? "text-rose-400 bg-rose-400/10"
                          : "text-blue-400 bg-blue-400/10",
                    )}
                  >
                    {topic.trend === "rising"
                      ? "↑"
                      : topic.trend === "falling"
                        ? "↓"
                        : "→"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <AIDetailOverlay
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
      <PreferencesDialog
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
      <BookmarkNotesPanel
        isOpen={isBookmarkPanelOpen}
        onClose={() => setIsBookmarkPanelOpen(false)}
        onArticleClick={(id) => {
          const art = articles.find((a) => a.id === id) ?? null;
          if (art) {
            setSelectedArticle(art);
            setIsBookmarkPanelOpen(false);
          }
        }}
        articles={articles}
      />
    </div>
  );
}

// Compact & Optimized Sci-Fi Orbital UI
function GenreBubbleLayout({
  articles,
  genre,
  colors,
  onArticleClick,
}: {
  articles: NewsArticle[];
  genre: string;
  colors: { from: string; to: string; glow: string };
  onArticleClick: (a: NewsArticle) => void;
}) {
  const items = articles.slice(0, 4);

  // Custom positions for a tighter layout
  const positions = [
    { top: "2%", left: "-2%" },
    { top: "12%", right: "-2%" },
    { bottom: "5%", left: "2%" },
    { bottom: "2%", right: "4%" },
  ];

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center my-2">
      {/* Decorative Stars/Sparkles */}
      <Sparkles className="absolute top-[10%] left-[40%] w-3 h-3 text-white/30 animate-pulse" />
      <Sparkles
        className="absolute bottom-[20%] right-[30%] w-3 h-3 text-white/20 animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-[30%] right-[10%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px]" />
      <div className="absolute bottom-[10%] left-[20%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[2px]" />

      {/* Orbital Rings - Scaled down */}
      <div className="absolute w-[70%] h-[70%] rounded-full border border-white/10 border-dashed animate-[spin_100s_linear_infinite]" />
      <div className="absolute w-[98%] h-[98%] rounded-full border border-white/5 animate-[spin_140s_linear_infinite_reverse]" />

      {/* Center Glowing Orb - Made smaller */}
      <div
        className="relative z-10 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.from}ee, ${colors.to}aa, transparent)`,
          boxShadow: `0 0 50px 10px ${colors.glow}, inset 0 0 20px rgba(255,255,255,0.4)`,
        }}
      >
        <span className="font-display font-bold text-white text-base sm:text-lg tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {genre}
        </span>
      </div>

      {/* Satellite Bubbles (Articles) - Made smaller and hover text color fixed */}
      {items.map((article, i) => (
        <motion.div
          key={article.id}
          onClick={() => onArticleClick(article)}
          whileHover={{ scale: 1.08, zIndex: 30 }}
          whileTap={{ scale: 0.95 }}
          className="absolute w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full flex flex-col items-center justify-center p-2 sm:p-3 text-center cursor-pointer overflow-hidden border border-white/20 hover:border-white/50 shadow-[0_10px_20px_rgba(0,0,0,0.5)] bg-black/50 backdrop-blur-xl z-20 group transition-colors"
          style={{ ...positions[i] }}
        >
          {article.imageUrl && (
            <div className="absolute inset-0 z-0">
              <img
                src={article.imageUrl}
                alt=""
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>
          )}

          <div className="relative z-10 w-full flex flex-col h-full justify-end pb-0.5">
            {/* Always white text for title on hover */}
            <p className="text-[9px] sm:text-[11px] font-bold text-white leading-[1.2] line-clamp-3 mb-1 drop-shadow-md transition-all">
              {article.title}
            </p>
            <div className="flex items-center justify-center gap-1 opacity-80">
              <span className="text-[7px] sm:text-[8px] text-white/80 truncate max-w-[70%]">
                {article.source}
              </span>
              <span className="text-[7px] sm:text-[8px] text-white/50">•</span>
              <span className="text-[7px] sm:text-[8px] text-white/70 whitespace-nowrap">
                {Math.ceil(article.readTime / 60)}m
              </span>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: `inset 0 0 15px ${colors.glow}` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// --- AIDetailOverlay & supporting components below ---
const READING_MODES: {
  id: BriefingRequestMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "beginner",
    label: "Student",
    desc: "Simple & clear",
    icon: <GraduationCap className="w-4 h-4" />,
    color: "#3b82f6",
  },
  {
    id: "normal",
    label: "Normal",
    desc: "Balanced depth",
    icon: <BookOpen className="w-4 h-4" />,
    color: "#10b981",
  },
  {
    id: "expert",
    label: "Expert",
    desc: "Deep analysis",
    icon: <Briefcase className="w-4 h-4" />,
    color: "#a855f7",
  },
];

function ReadingProgressBar({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? (scrollTop / max) * 100 : 0);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-10">
      <motion.div
        className="h-full reading-progress"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.05 }}
      />
    </div>
  );
}

function ArticleChat({ article }: { article: NewsArticle }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! Ask me anything specific about this article.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // 🔥 HACKATHON MOCK: Simulate AI thinking delay for 1.5 seconds
    // Isme koi fetch api nahi hai, toh error aane ka chance hi zero hai!
    setTimeout(() => {
      const mockResponses = [
        `Based on the article's context regarding "${currentInput}", the key takeaway is that this development has significant global implications.`,
        `That's a great question! The article suggests that experts are closely monitoring this exact situation.`,
        `To answer your question: The data points towards a massive paradigm shift, though exact figures are still developing.`,
        `According to the summary, this is a fascinating aspect. The core concept revolves around the integration of these new strategies.`
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: randomResponse },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="mt-8 relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-secondary/15 rounded-full blur-[80px] pointer-events-none"></div>

      <h4 className="text-sm font-bold text-white mb-5 flex items-center gap-2 relative z-10">
        <Sparkles className="w-4 h-4 text-primary" /> AI Companion
      </h4>

      <div
        ref={scrollRef}
        className="space-y-4 max-h-64 overflow-y-auto mb-4 pr-2 scrollbar-thin relative z-10"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-primary/20 text-white rounded-br-sm border border-primary/20"
                  : "bg-white/10 text-white/90 rounded-bl-sm border border-white/5"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3.5 border border-white/5 flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 relative z-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/30"
          placeholder="Ask about this article..."
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all flex items-center justify-center shadow-[0_0_15px_rgba(0,210,240,0.2)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AIDetailOverlayProps {
  article: NewsArticle | null;
  onClose: () => void;
}

type TabType = "summary" | "deep_dive" | "timeline" | "impact";

export function AIDetailOverlay({ article, onClose }: AIDetailOverlayProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [readingMode, setReadingMode] = useState<BriefingRequestMode>("normal");
  const [isDeepRead, setIsDeepRead] = useState(false);
  const [bookmarkDone, setBookmarkDone] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const articleBodyRef = useRef<HTMLDivElement>(null);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addNote } = useNotes();

  const {
    data: briefing,
    isPending: isBriefingLoading,
    mutate: getBriefing,
  } = useGenerateBriefing();
  const { data: timeline, isLoading: isTimelineLoading } =
    useGetArticleTimeline(article?.id || "", {
      query: { enabled: activeTab === "timeline" && !!article },
    });

  useEffect(() => {
    if (article && activeTab !== "timeline") {
      getBriefing({
        id: article.id,
        data: {
          mode: readingMode,
          style: activeTab === "deep_dive" ? "deep_dive" : "tldr",
        },
      });
    }
  }, [article, activeTab, readingMode]);

  useEffect(() => {
    if (article) {
      setActiveTab("summary");
      setIsDeepRead(false);
      setBookmarkDone(false);
    }
  }, [article?.id]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handleBookmark = () => {
    if (!article) return;
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
      setBookmarkDone(true);
      setTimeout(() => setBookmarkDone(false), 2000);
    }
  };

  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article?.summary || "No content available to read.");
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!article) return null;

  const bookmarked = isBookmarked(article.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-md"
          style={{ background: "rgba(4, 5, 14, 0.80)" }}
          onClick={() => {
            if (isSpeaking) {
               window.speechSynthesis.cancel();
               setIsSpeaking(false);
            }
            onClose();
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="relative w-full max-w-5xl max-h-full h-[92vh] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl"
          style={{
            background: "rgba(10, 12, 28, 0.96)",
            backdropFilter: "blur(40px)",
          }}
        >
          <ReadingProgressBar containerRef={contentRef} />

          {/* Hero */}
          <div className="relative flex-shrink-0" style={{ height: 200 }}>
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,210,240,0.2), rgba(139,92,246,0.2))",
                }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,12,28,1) 0%, rgba(10,12,28,0.65) 55%, transparent 100%)",
              }}
            />

            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={handleBookmark}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all",
                  bookmarked
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-black/50 border-white/15 text-white/70 hover:text-white hover:bg-white/10",
                )}
              >
                {bookmarkDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Bookmark
                    className={cn("w-3.5 h-3.5", bookmarked && "fill-current")}
                  />
                )}
                {bookmarked ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => setIsDeepRead((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all",
                  isDeepRead
                    ? "bg-secondary/20 border-secondary/40 text-secondary"
                    : "bg-black/50 border-white/15 text-white/70 hover:text-white hover:bg-white/10",
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                {isDeepRead ? "Exit Deep Read" : "Deep Read"}
              </button>
              <button
                onClick={() => {
                  if (isSpeaking) {
                     window.speechSynthesis.cancel();
                     setIsSpeaking(false);
                  }
                  onClose();
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/15 hover:bg-white/10 transition-all"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full px-5 pb-5 md:px-7 md:pb-6">
              <div className="flex flex-wrap gap-2 mb-2.5">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold border"
                  style={{
                    background: "rgba(0,210,240,0.15)",
                    borderColor: "rgba(0,210,240,0.3)",
                    color: "hsl(190,90%,65%)",
                  }}
                >
                  {article.category}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/12 text-white/65"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  {article.source}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/12 text-white/50 flex items-center gap-1"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {Math.ceil(article.readTime / 60)}m read
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-display font-bold text-white max-w-3xl leading-tight">
                {article.title}
              </h2>
            </div>
          </div>

          {/* Deep Read Mode */}
          {isDeepRead ? (
            <div ref={contentRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8" ref={articleBodyRef}>
                <p className="text-lg leading-[1.95] text-white/85 prose-dark">
                  {article.summary}
                </p>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                          Topics
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-white/55"
                              style={{ background: "rgba(255,255,255,0.04)" }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={toggleSpeech}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all flex-shrink-0 mt-1",
                        isSpeaking
                          ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,210,240,0.3)]"
                          : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current animate-pulse" /> Stop Reading
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" /> Listen to Article
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <ExplainPanel
                articleTitle={article.title}
                articleContext={article.summary}
                articleId={article.id}
                containerRef={
                  articleBodyRef as React.RefObject<HTMLElement | null>
                }
              />
              <div className="max-w-3xl mx-auto px-6 pb-10">
                <ArticleChat article={article} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
              <div className="flex-shrink-0 md:w-52 lg:w-56 border-b md:border-b-0 md:border-r border-white/8 overflow-x-auto md:overflow-y-auto">
                <div className="flex md:flex-col gap-1 p-3">
                  {[
                    {
                      id: "summary" as TabType,
                      icon: <Brain className="w-4 h-4" />,
                      label: "Summary",
                    },
                    {
                      id: "deep_dive" as TabType,
                      icon: <Layers className="w-4 h-4" />,
                      label: "Deep Dive",
                    },
                    {
                      id: "timeline" as TabType,
                      icon: <Activity className="w-4 h-4" />,
                      label: "Timeline",
                    },
                    {
                      id: "impact" as TabType,
                      icon: <TrendingUp className="w-4 h-4" />,
                      label: "Impact",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold whitespace-nowrap md:w-full",
                        activeTab === tab.id
                          ? "bg-white/10 text-white"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0",
                          activeTab === tab.id
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {tab.icon}
                      </span>
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="sidebarTab"
                          className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-full hidden md:block"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="hidden md:block px-3 pb-3 mt-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2.5 px-1 font-semibold">
                    Reading Lens
                  </p>
                  <div className="space-y-1.5">
                    {READING_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setReadingMode(mode.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border",
                          readingMode === mode.id
                            ? "border-opacity-40"
                            : "border-transparent hover:bg-white/5",
                        )}
                        style={
                          readingMode === mode.id
                            ? {
                                background: `${mode.color}15`,
                                borderColor: `${mode.color}38`,
                              }
                            : {}
                        }
                      >
                        <span
                          style={{
                            color:
                              readingMode === mode.id
                                ? mode.color
                                : "rgba(255,255,255,0.38)",
                          }}
                        >
                          {mode.icon}
                        </span>
                        <div>
                          <p
                            className={cn(
                              "text-xs font-semibold leading-none",
                              readingMode === mode.id
                                ? "text-white"
                                : "text-white/55",
                            )}
                          >
                            {mode.label}
                          </p>
                          <p
                            className="text-[10px] mt-0.5 leading-none"
                            style={{
                              color:
                                readingMode === mode.id
                                  ? mode.color
                                  : "rgba(255,255,255,0.28)",
                            }}
                          >
                            {mode.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div ref={contentRef} className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${readingMode}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 md:p-7"
                  >
                    {activeTab !== "timeline" &&
                      (isBriefingLoading ? (
                        <BriefingLoader />
                      ) : briefing ? (
                        <BriefingContent
                          briefing={briefing}
                          activeTab={activeTab}
                          article={article}
                          readingMode={readingMode}
                          addNote={addNote}
                        />
                      ) : null)}
                    {activeTab === "timeline" &&
                      (isTimelineLoading ? (
                        <BriefingLoader />
                      ) : timeline ? (
                        <TimelineContent timeline={timeline} />
                      ) : null)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function BriefingLoader() {
  return (
    <div className="space-y-5">
      <div className="h-4 w-24 rounded-full bg-white/8 animate-pulse" />
      {[80, 65, 90, 55, 75].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-white/5 animate-pulse"
          style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

function BriefingContent({
  briefing,
  activeTab,
  article,
  readingMode,
  addNote,
}: {
  briefing: any;
  activeTab: TabType;
  article: NewsArticle;
  readingMode: BriefingRequestMode;
  addNote: (
    content: string,
    articleId: string,
    articleTitle: string,
    selectedText?: string,
  ) => void;
}) {
  const [noteSaved, setNoteSaved] = useState(false);
  const mode = READING_MODES.find((m) => m.id === readingMode);

  const saveNote = () => {
    addNote(briefing.tldr, article.id, article.title);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {activeTab === "summary"
            ? "AI Briefing"
            : activeTab === "deep_dive"
              ? "Deep Analysis"
              : "Impact Analysis"}
        </h3>
        <div className="flex items-center gap-2">
          {mode && (
            <span
              className="text-[11px] px-2 py-1 rounded-full font-semibold border"
              style={{
                background: `${mode.color}12`,
                borderColor: `${mode.color}32`,
                color: mode.color,
              }}
            >
              {mode.label}
            </span>
          )}
          <button
            onClick={saveNote}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full font-medium border transition-all",
              noteSaved
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/45 hover:text-white hover:bg-white/10",
            )}
          >
            {noteSaved ? "✓ Saved" : "+ Note"}
          </button>
        </div>
      </div>

      {briefing.tldr && (
        <div
          className="p-4 rounded-2xl border"
          style={{
            background: "rgba(0,210,240,0.05)",
            borderColor: "rgba(0,210,240,0.18)",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "hsl(190,90%,60%)" }}
          >
            TL;DR
          </p>
          <p className="text-white/88 leading-relaxed text-sm">
            {briefing.tldr}
          </p>
        </div>
      )}

      {briefing.keyPoints?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" /> Key Points
          </p>
          <div className="space-y-2.5">
            {(briefing.keyPoints as string[]).map(
              (point: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-3 items-start"
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 leading-none"
                    style={{
                      background: "rgba(0,210,240,0.12)",
                      color: "hsl(190,90%,65%)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed flex-1">
                    {point}
                  </p>
                </motion.div>
              ),
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {briefing.whyItMatters && (
          <InfoCard
            icon={<Lightbulb className="w-3.5 h-3.5" />}
            title="Why It Matters"
            content={briefing.whyItMatters}
            color="#f59e0b"
          />
        )}
        {briefing.impact && (
          <InfoCard
            icon={<Zap className="w-3.5 h-3.5" />}
            title="Broader Impact"
            content={briefing.impact}
            color="#a855f7"
          />
        )}
      </div>

      {briefing.whatNext && (
        <InfoCard
          icon={<ChevronRight className="w-3.5 h-3.5" />}
          title="What Happens Next"
          content={briefing.whatNext}
          color="#10b981"
        />
      )}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  content,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-2xl border"
      style={{ background: `${color}07`, borderColor: `${color}20` }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {title}
        </span>
      </div>
      <p className="text-sm text-white/78 leading-relaxed">{content}</p>
    </div>
  );
}

function TimelineContent({ timeline }: { timeline: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" /> Story Timeline
      </h3>
      <div className="relative pl-6 border-l border-white/10 space-y-6">
        {(timeline.events || []).map((event: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="relative"
          >
            <div
              className={cn(
                "absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 border-background",
                event.importance === "high"
                  ? "bg-primary shadow-[0_0_12px_rgba(0,210,240,0.65)]"
                  : event.importance === "medium"
                    ? "bg-secondary"
                    : "bg-white/20",
              )}
            />
            <span
              className="text-[11px] font-mono mb-1 block"
              style={{ color: "hsl(190,90%,60%)" }}
            >
              {formatDate(event.date)}
            </span>
            <h4 className="text-sm font-semibold text-white mb-1">
              {event.title}
            </h4>
            <p className="text-sm text-white/62 leading-relaxed">
              {event.description}
            </p>
          </motion.div>
        ))}
      </div>

      {timeline.keyPeople?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Key People
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(timeline.keyPeople || []).map((person: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-white/8"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: "rgba(139,92,246,0.18)",
                    color: "#a855f7",
                  }}
                >
                  {person.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {person.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {person.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {timeline.futurePredictions?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> What's Next
          </p>
          <div className="space-y-2">
            {(timeline.futurePredictions || []).map(
              (pred: string, i: number) => (
                <div key={i} className="flex gap-2 items-start">
                  <ChevronRight className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/72">{pred}</p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}