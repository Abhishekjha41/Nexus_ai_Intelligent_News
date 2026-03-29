import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, BookOpen, Baby, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "./BookmarkNotesPanel";

interface ExplainResult {
  selectedText: string;
  simple: string;
  keyConcepts: Array<{ term: string; definition: string }>;
  eli5: string;
  whyItMatters: string;
}

interface TooltipPosition {
  x: number;
  y: number;
}

interface ExplainPanelProps {
  articleTitle: string;
  articleContext: string;
  articleId: string;
  containerRef: React.RefObject<HTMLElement | null>;
}

export function ExplainPanel({ articleTitle, articleContext, articleId, containerRef }: ExplainPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipPosition | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteAdded, setNoteAdded] = useState(false);
  const { addNote } = useNotes();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setTooltip(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3 || text.length > 500) return;

    if (containerRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      if (
        rect.top >= containerRect.top &&
        rect.bottom <= containerRect.bottom + 200 &&
        rect.left >= containerRect.left - 50 &&
        rect.right <= containerRect.right + 50
      ) {
        setSelectedText(text);
        setTooltip({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      }
    }
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const explainText = async () => {
    if (!selectedText) return;
    setIsPanelOpen(true);
    setTooltip(null);
    setIsLoading(true);
    setResult(null);
    setNoteText("");
    setNoteAdded(false);

    // 🔥 HACKATHON DEMO MOCK: Simulated AI Delay and Contextual Explanation
    setTimeout(() => {
      const lowerSelectedText = selectedText.toLowerCase();
      let mockExplanation: ExplainResult;

      // 🎯 DEMO SPECIFIC TRIGGER
      if (lowerSelectedText.includes("geneva climate summit")) {
        mockExplanation = {
          selectedText: selectedText,
          simple: "A major international meeting in Geneva where world leaders negotiated and signed a landmark treaty to strictly limit global carbon emissions.",
          keyConcepts: [
            { term: "Landmark Treaty", definition: "A very important, legally binding agreement." },
            { term: "Carbon Emissions", definition: "Pollution from burning fossil fuels like coal and oil." }
          ],
          eli5: "Imagine all the leaders of the world getting together in a room in Switzerland and promising to stop polluting the air, so the Earth doesn't get too hot.",
          whyItMatters: "This summit resulted in actual legally binding rules, meaning countries can be penalized if they don't switch to clean energy. This fundamentally changes global politics and economics."
        };
      } else {
        // Fallback for any other text highlighted
        mockExplanation = {
          selectedText: selectedText,
          simple: `"${selectedText}" is a key concept in this article representing a major shift.`,
          keyConcepts: [],
          eli5: "This is an important idea that changes how things currently work.",
          whyItMatters: "Understanding this helps grasp the full context of the article's impact."
        };
      }

      setResult(mockExplanation);
      setIsLoading(false);
    }, 1500); // 1.5 second realistic loading delay
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      addNote(noteText.trim(), articleId, articleTitle, selectedText);
      setNoteAdded(true);
      setTimeout(() => setNoteAdded(false), 2000);
      setNoteText("");
    }
  };

  return (
    <>
      <AnimatePresence>
        {tooltip && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
            }}
          >
            <button
              onMouseDown={e => { e.preventDefault(); explainText(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-[0_8px_24px_rgba(0,210,240,0.4)] hover:shadow-[0_8px_32px_rgba(0,210,240,0.6)] transition-shadow whitespace-nowrap"
            >
              <Lightbulb className="w-3 h-3" />
              Explain this
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50"
              onClick={() => setIsPanelOpen(false)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col glass-panel-strong border-l border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display font-bold text-white">AI Explain</span>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="px-3 py-3 rounded-xl bg-primary/8 border-l-2 border-primary/50">
                  <p className="text-xs text-primary/60 font-medium mb-1">Selected text</p>
                  <p className="text-sm text-white/80 italic leading-relaxed line-clamp-4">"{selectedText}"</p>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                ) : result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl bg-white/4 border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Simple Explanation</span>
                      </div>
                      <p className="text-sm text-white/85 leading-relaxed">{result.simple}</p>
                    </div>

                    {result.keyConcepts.length > 0 && (
                      <div className="rounded-xl bg-white/4 border border-white/10 p-4">
                        <p className="text-xs font-bold text-white uppercase tracking-widest mb-3">Key Concepts</p>
                        <div className="space-y-2.5">
                          {result.keyConcepts.map((kc, i) => (
                            <div key={i} className="flex gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                              <div>
                                <span className="text-sm font-semibold text-secondary">{kc.term}</span>
                                <p className="text-xs text-white/65 mt-0.5 leading-relaxed">{kc.definition}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.eli5 && (
                      <div className="rounded-xl bg-secondary/8 border border-secondary/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Baby className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Like I'm 10</span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">{result.eli5}</p>
                      </div>
                    )}

                    {result.whyItMatters && (
                      <div className="rounded-xl bg-accent/8 border border-accent/20 p-4">
                        <p className="text-xs font-bold text-accent/80 uppercase tracking-widest mb-2">Why It Matters</p>
                        <p className="text-sm text-white/80 leading-relaxed">{result.whyItMatters}</p>
                      </div>
                    )}

                    <div className="rounded-xl bg-white/4 border border-white/10 p-4">
                      <p className="text-xs font-bold text-white uppercase tracking-widest mb-2.5">Save a Note</p>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Write your thoughts about this..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                        rows={3}
                      />
                      <button
                        onClick={handleSaveNote}
                        disabled={!noteText.trim()}
                        className={cn(
                          "mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                          noteAdded
                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                            : noteText.trim()
                            ? "bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white"
                            : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {noteAdded ? "Note saved!" : "Save Note"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}