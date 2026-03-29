import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetTrendingTopics, useGetNewsFeed, TrendingTopic, NewsArticle } from "@workspace/api-client-react";
import { TopBar } from "@/components/layout/TopBar";
import { AIDetailOverlay } from "@/components/news/AIDetailOverlay";
import { X } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "#6366f1",
  Politics: "#a855f7",
  Sports: "#f97316",
  Finance: "#10b981",
  Entertainment: "#ec4899",
  World: "#06b6d4",
  Science: "#8b5cf6",
  Business: "#f59e0b",
};

function getColor(category: string) {
  return CATEGORY_COLORS[category] ?? "#94a3b8";
}

// Simple force-directed non-overlapping layout
interface BubbleNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  topic: TrendingTopic;
}

function useNonOverlappingLayout(
  topics: TrendingTopic[],
  width: number,
  height: number
): BubbleNode[] {
  const [nodes, setNodes] = useState<BubbleNode[]>([]);

  useEffect(() => {
    if (!topics.length || width === 0 || height === 0) return;

    // Initial positions — spread evenly in a grid-like pattern
    const initial: BubbleNode[] = topics.map((topic, i) => {
      const r = Math.max(50, (topic.importance / 100) * 120);
      const cols = Math.ceil(Math.sqrt(topics.length));
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = width / (cols + 1);
      const cellH = height / (Math.ceil(topics.length / cols) + 1);
      return {
        id: topic.id,
        x: cellW * (col + 1) + (Math.random() - 0.5) * 40,
        y: cellH * (row + 1) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        r,
        topic,
      };
    });

    // Run force simulation steps to separate overlapping bubbles
    const sim = [...initial];
    const STEPS = 200;
    const PADDING = 12;

    for (let step = 0; step < STEPS; step++) {
      for (let i = 0; i < sim.length; i++) {
        for (let j = i + 1; j < sim.length; j++) {
          const dx = sim[j].x - sim[i].x;
          const dy = sim[j].y - sim[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const minDist = sim[i].r + sim[j].r + PADDING;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = (dx / dist) * overlap * 0.5;
            const ny = (dy / dist) * overlap * 0.5;
            sim[i].x -= nx;
            sim[i].y -= ny;
            sim[j].x += nx;
            sim[j].y += ny;
          }
        }
        // Boundary clamping
        sim[i].x = Math.max(sim[i].r + 8, Math.min(width - sim[i].r - 8, sim[i].x));
        sim[i].y = Math.max(sim[i].r + 8, Math.min(height - sim[i].r - 8, sim[i].y));
      }
    }

    setNodes(sim);
  }, [topics, width, height]);

  return nodes;
}

export default function BubblesView() {
  const { data: topics, isLoading } = useGetTrendingTopics();
  const { data: articles } = useGetNewsFeed();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [focusedTopic, setFocusedTopic] = useState<TrendingTopic | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const nodes = useNonOverlappingLayout(topics ?? [], dimensions.width, dimensions.height);

  const topicArticles = useCallback((topic: TrendingTopic) => {
    if (!articles) return [];
    return articles
      .filter(a => a.category === topic.category)
      .slice(0, 6);
  }, [articles]);

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <img
          src={`${import.meta.env.BASE_URL}images/deep-space-bg.png`}
          alt="Space background"
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
      </div>

      <TopBar onSettingsClick={() => {}} />

      <main className="flex-1 relative overflow-hidden" ref={containerRef}>
        <div className="absolute top-6 left-8 z-10 pointer-events-none">
          <h1 className="text-4xl font-bold text-white mb-1">The Infoverse</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Topics sized by global importance. Click any bubble to explore.
          </p>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Main bubble field */}
        <AnimatePresence>
          {!focusedTopic && nodes.map((node, i) => {
            const color = getColor(node.topic.category);
            return (
              <FloatingBubble
                key={node.id}
                node={node}
                color={color}
                index={i}
                onClick={() => setFocusedTopic(node.topic)}
              />
            );
          })}
        </AnimatePresence>

        {/* Focused concentric view */}
        <AnimatePresence>
          {focusedTopic && (
            <ConcentricView
              topic={focusedTopic}
              relatedArticles={topicArticles(focusedTopic)}
              onClose={() => setFocusedTopic(null)}
              onArticleClick={(a) => { setSelectedArticle(a); }}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
            />
          )}
        </AnimatePresence>
      </main>

      <AIDetailOverlay
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

function FloatingBubble({
  node,
  color,
  index,
  onClick,
}: {
  node: BubbleNode;
  color: string;
  index: number;
  onClick: () => void;
}) {
  const floatY = (index % 2 === 0 ? -1 : 1) * (8 + (index % 4) * 3);
  const floatX = (index % 3 === 0 ? 1 : -1) * (5 + (index % 3) * 3);
  const duration = 4 + (index % 5);

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: [0, floatX, -floatX / 2, 0],
        y: [0, floatY, -floatY / 2, 0],
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.06 },
        scale: { type: "spring", stiffness: 180, damping: 18, delay: index * 0.06 },
        x: { repeat: Infinity, duration: duration + 1, ease: "easeInOut" },
        y: { repeat: Infinity, duration: duration, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.12, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="absolute rounded-full cursor-pointer flex items-center justify-center"
      style={{
        left: node.x - node.r,
        top: node.y - node.r,
        width: node.r * 2,
        height: node.r * 2,
        background: `radial-gradient(circle at 35% 35%, ${color}55, ${color}22)`,
        border: `1.5px solid ${color}55`,
        boxShadow: `0 0 ${node.r / 2}px ${color}33, inset 0 0 ${node.r / 3}px ${color}22`,
      }}
    >
      <div className="text-center px-3">
        <span
          className="block font-bold text-white/60 uppercase tracking-widest mb-0.5"
          style={{ fontSize: Math.max(8, node.r / 10) }}
        >
          {node.topic.category}
        </span>
        <h3
          className="font-bold text-white leading-tight"
          style={{ fontSize: Math.max(11, node.r / 7) }}
        >
          {node.topic.name}
        </h3>
        {node.r > 90 && (
          <span
            className="block text-white/40 mt-1"
            style={{ fontSize: Math.max(9, node.r / 12) }}
          >
            {node.topic.articleCount} stories
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ConcentricView({
  topic,
  relatedArticles,
  onClose,
  onArticleClick,
  containerWidth,
  containerHeight,
}: {
  topic: TrendingTopic;
  relatedArticles: NewsArticle[];
  onClose: () => void;
  onArticleClick: (a: NewsArticle) => void;
  containerWidth: number;
  containerHeight: number;
}) {
  const color = getColor(topic.category);
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const centerR = 80;
  const orbit1R = 170;
  const orbit2R = 290;

  const inner = relatedArticles.slice(0, 3);
  const outer = relatedArticles.slice(3, 6);

  function satellitePos(orbitR: number, index: number, total: number) {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * orbitR,
      y: cy + Math.sin(angle) * orbitR,
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <p className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-white/50 z-30">
        Click an article bubble to open AI briefing
      </p>

      {/* SVG orbit rings + connector lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <circle cx={cx} cy={cy} r={orbit1R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5 5" />
        <circle cx={cx} cy={cy} r={orbit2R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="5 5" />
        {inner.map((_, i) => {
          const pos = satellitePos(orbit1R, i, inner.length);
          return <line key={i} x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke={`${color}25`} strokeWidth="1" strokeDasharray="4 4" />;
        })}
        {outer.map((_, i) => {
          const innerPos = satellitePos(orbit1R, i % inner.length, inner.length);
          const outerPos = satellitePos(orbit2R, i, outer.length);
          return <line key={i} x1={innerPos.x} y1={innerPos.y} x2={outerPos.x} y2={outerPos.y} stroke={`${color}15`} strokeWidth="1" strokeDasharray="4 4" />;
        })}
      </svg>

      {/* Center bubble */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -8, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 200, damping: 20 },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        }}
        className="absolute rounded-full flex items-center justify-center font-bold text-white"
        style={{
          width: centerR * 2,
          height: centerR * 2,
          left: cx - centerR,
          top: cy - centerR,
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}77)`,
          boxShadow: `0 0 60px ${color}66, 0 0 120px ${color}33`,
          zIndex: 25,
        }}
      >
        <div className="text-center px-3">
          <span className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{topic.category}</span>
          <span className="block text-sm font-bold leading-tight">{topic.name}</span>
        </div>
      </motion.div>

      {/* Inner orbit article bubbles */}
      {inner.map((article, i) => {
        const pos = satellitePos(orbit1R, i, inner.length);
        const r = 55;
        return (
          <ArticleBubble
            key={article.id}
            article={article}
            x={pos.x}
            y={pos.y}
            r={r}
            color={color}
            delay={i * 0.1}
            floatOffset={i}
            onClick={() => onArticleClick(article)}
          />
        );
      })}

      {/* Outer orbit article bubbles */}
      {outer.map((article, i) => {
        const pos = satellitePos(orbit2R, i, outer.length);
        const r = 45;
        return (
          <ArticleBubble
            key={article.id}
            article={article}
            x={pos.x}
            y={pos.y}
            r={r}
            color={color}
            delay={0.3 + i * 0.1}
            floatOffset={i + 3}
            onClick={() => onArticleClick(article)}
          />
        );
      })}
    </motion.div>
  );
}

function ArticleBubble({
  article,
  x,
  y,
  r,
  color,
  delay,
  floatOffset,
  onClick,
}: {
  article: NewsArticle;
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
  floatOffset: number;
  onClick: () => void;
}) {
  const floatY = (floatOffset % 2 === 0 ? -1 : 1) * 6;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, floatY, 0],
      }}
      transition={{
        opacity: { duration: 0.3, delay },
        scale: { type: "spring", stiffness: 200, damping: 20, delay },
        y: { repeat: Infinity, duration: 3.5 + floatOffset * 0.4, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.18, zIndex: 30 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="absolute rounded-full flex items-center justify-center cursor-pointer"
      style={{
        width: r * 2,
        height: r * 2,
        left: x - r,
        top: y - r,
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12), rgba(255,255,255,0.04))`,
        border: `1.5px solid ${color}55`,
        boxShadow: `0 0 20px ${color}22`,
        backdropFilter: "blur(8px)",
        zIndex: 24,
      }}
    >
      <p className="text-center text-white text-[9px] font-medium px-2 leading-tight line-clamp-3">
        {article.title}
      </p>
    </motion.div>
  );
}
