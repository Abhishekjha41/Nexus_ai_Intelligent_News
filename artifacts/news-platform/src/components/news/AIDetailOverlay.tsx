import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NewsArticle,
  useGenerateBriefing,
  useGetArticleTimeline,
  BriefingRequestMode,
} from "@workspace/api-client-react";
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
  AlignLeft,
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
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ExplainPanel } from "./ExplainPanel";
import { useBookmarks, useNotes } from "./BookmarkNotesPanel";

interface AIDetailOverlayProps {
  article: NewsArticle | null;
  onClose: () => void;
}

type TabType = "summary" | "deep_dive" | "timeline" | "impact";

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

  // Clean up speech synthesis on component unmount
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
      // Create a clean text without HTML if any, and start speaking
      const utterance = new SpeechSynthesisUtterance(
        article?.summary || "No content available to read.",
      );
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

                {/* Topics and Read Aloud Feature Block */}
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

                    {/* Read Article Button */}
                    <button
                      onClick={toggleSpeech}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all flex-shrink-0 mt-1",
                        isSpeaking
                          ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,210,240,0.3)]"
                          : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10",
                      )}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current animate-pulse" />{" "}
                          Stop Reading
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
              {/* Sidebar */}
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

              {/* Content */}
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