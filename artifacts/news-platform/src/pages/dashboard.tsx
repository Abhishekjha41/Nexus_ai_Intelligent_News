import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NewsArticle,
  useGetNewsFeed,
  useGetTrendingTopics,
} from "@workspace/api-client-react";
import { TopBar } from "@/components/layout/TopBar";
import { NewsCard } from "@/components/news/NewsCard";
import { AlertPanel } from "@/components/news/AlertPanel";
import { PreferencesDialog } from "@/components/settings/PreferencesDialog";
import { BookmarkNotesPanel } from "@/components/news/BookmarkNotesPanel";
import { AIDetailOverlay } from "@/components/news/AIDetailOverlay";
import { TrendingUp, Sparkles, ArrowUpRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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

const GENRE_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  Tech: { from: "#3b82f6", to: "#6366f1", glow: "#6366f144" },
  Finance: { from: "#10b981", to: "#059669", glow: "#10b98144" },
  World: { from: "#06b6d4", to: "#0891b2", glow: "#06b6d444" },
  Politics: { from: "#a855f7", to: "#7c3aed", glow: "#a855f744" },
  Sports: { from: "#f97316", to: "#ea580c", glow: "#f9731644" },
  Entertainment: { from: "#ec4899", to: "#db2777", glow: "#ec489944" },
  Science: { from: "#8b5cf6", to: "#7c3aed", glow: "#8b5cf644" },
  Business: { from: "#f59e0b", to: "#d97706", glow: "#f59e0b44" },
};

export default function Dashboard() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("For You");

  const { data: articlesRaw, isLoading, error } = useGetNewsFeed();
  const { data: trendingRaw } = useGetTrendingTopics();

  const articles: NewsArticle[] = useMemo(() => {
    if (Array.isArray(articlesRaw)) return articlesRaw;
    if (articlesRaw && typeof articlesRaw === 'object' && 'data' in articlesRaw && Array.isArray((articlesRaw as any).data)) return (articlesRaw as any).data;
    if (articlesRaw && typeof articlesRaw === 'object' && 'articles' in articlesRaw && Array.isArray((articlesRaw as any).articles)) return (articlesRaw as any).articles;
    return [];
  }, [articlesRaw]);

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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
  };

  return (
    <div className="min-h-screen relative selection:bg-primary/30" style={{ backgroundColor: "hsl(230, 35%, 4%)" }}>
      <div className="fixed inset-0 pointer-events-none z-[-1]" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}images/deep-space-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-25"
          style={{ filter: "saturate(1.4) brightness(0.7)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at top right, hsl(260,40%,18%) 0%, transparent 55%), radial-gradient(ellipse at bottom left, hsl(190,40%,14%) 0%, transparent 55%)",
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-3xl font-bold text-white tracking-tight">Your Briefing</h1>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeTab === tab ? "text-white" : "text-muted-foreground hover:text-white hover:bg-white/5",
                  )}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[380px] rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center glass-panel rounded-2xl">
              <Activity className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Error loading feed</h2>
              <p className="text-muted-foreground">Please try refreshing the page.</p>
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
                  <motion.div variants={itemVariants} className="col-span-full p-12 text-center glass-panel rounded-2xl border border-white/10">
                    <p className="text-muted-foreground text-lg">No articles in this category yet.</p>
                  </motion.div>
                ) : (
                  filteredArticles.map((article) => (
                    <motion.div key={article.id} variants={itemVariants}>
                      <NewsCard article={article} onClick={setSelectedArticle} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Top Genres Section */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Top Genres for You</h2>
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
                      background: "linear-gradient(165deg, rgba(20,22,40,0.7) 0%, rgba(10,12,28,0.9) 100%)",
                      backdropFilter: "blur(20px)",
                      boxShadow: `0 10px 40px -10px ${colors.glow}`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-24 blur-[70px] pointer-events-none opacity-40 transition-opacity group-hover:opacity-60"
                      style={{ background: colors.from }}
                    />
                    <div className="flex justify-between items-center w-full z-10 mb-2 relative">
                      <h3 className="text-lg sm:text-xl font-display font-bold tracking-widest uppercase drop-shadow-md" style={{ color: colors.from }}>
                        {genre}
                      </h3>
                      <button
                        onClick={() => setActiveTab(genre as Tab)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all"
                      >
                        View all <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    {gArticles.length > 0 ? (
                      <div className="flex-1 flex items-center justify-center mt-4 relative z-10">
                        <GenreBubbleLayout articles={gArticles} genre={genre} colors={colors} onArticleClick={setSelectedArticle} />
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
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Trending Now
            </h3>
            <div className="space-y-3">
              {trending.slice(0, 6).map((topic: any, i: number) => (
                <motion.div key={topic.id} whileHover={{ x: 4 }} transition={{ duration: 0.15 }} className="flex items-center justify-between group cursor-pointer py-1">
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
                      topic.trend === "rising" ? "text-emerald-400 bg-emerald-400/10" : topic.trend === "falling" ? "text-rose-400 bg-rose-400/10" : "text-blue-400 bg-blue-400/10"
                    )}
                  >
                    {topic.trend === "rising" ? "↑" : topic.trend === "falling" ? "↓" : "→"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <AIDetailOverlay article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      <PreferencesDialog isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
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
  const positions = [
    { top: "2%", left: "-2%" },
    { top: "12%", right: "-2%" },
    { bottom: "5%", left: "2%" },
    { bottom: "2%", right: "4%" },
  ];

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center my-2">
      <Sparkles className="absolute top-[10%] left-[40%] w-3 h-3 text-white/30 animate-pulse" />
      <Sparkles className="absolute bottom-[20%] right-[30%] w-3 h-3 text-white/20 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[30%] right-[10%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px]" />
      <div className="absolute bottom-[10%] left-[20%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[2px]" />

      <div className="absolute w-[70%] h-[70%] rounded-full border border-white/10 border-dashed animate-[spin_100s_linear_infinite]" />
      <div className="absolute w-[98%] h-[98%] rounded-full border border-white/5 animate-[spin_140s_linear_infinite_reverse]" />

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
            <p className="text-[9px] sm:text-[11px] font-bold text-white leading-[1.2] line-clamp-3 mb-1 drop-shadow-md transition-all">
              {article.title}
            </p>
            <div className="flex items-center justify-center gap-1 opacity-80">
              <span className="text-[7px] sm:text-[8px] text-white/80 truncate max-w-[70%]">{article.source}</span>
              <span className="text-[7px] sm:text-[8px] text-white/50">•</span>
              <span className="text-[7px] sm:text-[8px] text-white/70 whitespace-nowrap">{Math.ceil(article.readTime || 0 / 60)}m</span>
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