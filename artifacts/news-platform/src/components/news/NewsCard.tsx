import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { NewsArticle } from "@workspace/api-client-react";
import { cn, formatTimeAgo, getCategoryColor, getSentimentColor } from "@/lib/utils";
import { Brain, Clock, Activity, Zap } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
}

export function NewsCard({ article, onClick }: NewsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 30 });
  const springY = useSpring(y, { stiffness: 200, damping: 30 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(relX);
    y.set(relY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const importancePercent = (article.importance / 10) * 100;
  const importanceColor =
    article.importance >= 8 ? "#f43f5e" : article.importance >= 6 ? "#f59e0b" : "#6366f1";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(article)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ scale: { duration: 0.2, ease: "easeOut" } }}
      className="relative h-[380px] w-full cursor-pointer group"
    >
      {/* Glow shadow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: `0 20px 60px -10px ${importanceColor}55, 0 0 0 1px ${importanceColor}30`,
        }}
      />

      <div className="w-full h-full glass-panel rounded-2xl overflow-hidden flex flex-col border border-white/10 group-hover:border-primary/40 transition-colors duration-300">
        {/* Image area */}
        <div className="h-48 relative overflow-hidden">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
              <Activity className="w-12 h-12 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border", getCategoryColor(article.category))}>
              {article.category}
            </span>
          </div>

          {/* Importance gauge */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/10">
            <Zap className="w-3 h-3" style={{ color: importanceColor }} />
            <span className="text-xs font-bold text-white">{article.importance}/10</span>
          </div>

          {/* Peek content — visible on hover */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-2 left-4 right-4"
          >
            <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          </motion.div>
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg leading-tight line-clamp-3 text-white mb-3 group-hover:text-primary/90 transition-colors duration-200">
            {article.title}
          </h3>

          {/* Importance bar */}
          <div className="mb-3">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${importancePercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                style={{ background: `linear-gradient(90deg, ${importanceColor}88, ${importanceColor})` }}
              />
            </div>
          </div>

          {/* Relevance tag */}
          {article.relevanceReason && (
            <div className="flex items-center gap-1.5 mb-3">
              <Brain className="w-3 h-3 text-primary/70 flex-shrink-0" />
              <span className="text-xs text-primary/70 line-clamp-1">{article.relevanceReason}</span>
            </div>
          )}

          {/* Sentiment + meta row */}
          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-white/70">{article.source}</span>
              <span>•</span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", getSentimentColor(article.sentiment))}>
                {article.sentiment}
              </span>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{article.readTime ? Math.round(article.readTime / 60) : 3}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
