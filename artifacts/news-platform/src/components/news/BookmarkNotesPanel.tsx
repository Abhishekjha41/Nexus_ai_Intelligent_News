import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bookmark,
  StickyNote,
  Trash2,
  FileText,
  ExternalLink,
  Plus,
  Edit3,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsArticle } from "@workspace/api-client-react";

export interface BookmarkItem {
  id: string;
  articleId: string;
  title: string;
  source: string;
  category: string;
  imageUrl?: string;
  savedAt: string;
}

export interface NoteItem {
  id: string;
  articleId: string;
  articleTitle: string;
  content: string;
  selectedText?: string;
  createdAt: string;
  updatedAt: string;
}

const BOOKMARKS_KEY = "nexusai_bookmarks";
const NOTES_KEY = "nexusai_notes";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const sync = () => {
      const data = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
      setBookmarks(data);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("bookmark-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bookmark-updated", sync);
    };
  }, []);

  const addBookmark = (article: NewsArticle) => {
    const item: BookmarkItem = {
      id: `bm_${Date.now()}`,
      articleId: article.id,
      title: article.title,
      source: article.source,
      category: article.category,
      imageUrl: article.imageUrl,
      savedAt: new Date().toISOString(),
    };

    const updated = [
      item,
      ...bookmarks.filter((b) => b.articleId !== article.id),
    ];
    setBookmarks(updated);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("bookmark-updated"));

    return item;
  };

  const removeBookmark = (articleId: string) => {
    const updated = bookmarks.filter((b) => b.articleId !== articleId);
    setBookmarks(updated);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("bookmark-updated"));
  };

  const isBookmarked = (articleId: string) =>
    bookmarks.some((b) => b.articleId === articleId);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const sync = () => {
      const data = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
      setNotes(data);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("notes-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("notes-updated", sync);
    };
  }, []);

  const addNote = (
    content: string,
    articleId: string,
    articleTitle: string,
    selectedText?: string,
  ) => {
    const item: NoteItem = {
      id: `note_${Date.now()}`,
      articleId,
      articleTitle,
      content,
      selectedText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [item, ...notes];
    setNotes(updated);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("notes-updated"));

    return item;
  };

  const updateNote = (id: string, content: string) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n,
    );

    setNotes(updated);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("notes-updated"));
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("notes-updated"));
  };

  return { notes, addNote, updateNote, deleteNote };
}

interface BookmarkNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleClick: (articleId: string) => void;
  articles: NewsArticle[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "#3b82f6",
  Finance: "#10b981",
  World: "#06b6d4",
  Politics: "#a855f7",
  Sports: "#f97316",
  Entertainment: "#ec4899",
  Science: "#8b5cf6",
  Business: "#f59e0b",
};

export function BookmarkNotesPanel({
  isOpen,
  onClose,
  onArticleClick,
  articles,
}: BookmarkNotesPanelProps) {
  const [activeTab, setActiveTab] = useState<"bookmarks" | "notes">(
    "bookmarks",
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { bookmarks, removeBookmark } = useBookmarks();
  const { notes, updateNote, deleteNote } = useNotes();

  const groupedBookmarks = bookmarks.reduce(
    (acc, bm) => {
      const date = new Date(bm.savedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(bm);
      return acc;
    },
    {} as Record<string, BookmarkItem[]>,
  );

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    doc.setFillColor(10, 12, 25);
    doc.rect(0, 0, pageW, 297, "F");

    doc.setTextColor(0, 210, 240);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("NexusAI — My Notes", margin, y);
    y += 8;

    doc.setTextColor(120, 140, 180);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Exported on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      margin,
      y,
    );
    y += 6;

    doc.setDrawColor(0, 210, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    if (notes.length === 0) {
      doc.setTextColor(150, 160, 190);
      doc.setFontSize(12);
      doc.text("No notes yet.", margin, y);
    } else {
      notes.forEach((note, idx) => {
        if (y > 250) {
          doc.addPage();
          doc.setFillColor(10, 12, 25);
          doc.rect(0, 0, pageW, 297, "F");
          y = 20;
        }

        doc.setTextColor(200, 220, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`NOTE ${idx + 1}`, margin, y);
        y += 5;

        doc.setTextColor(180, 195, 230);
        doc.setFontSize(11);
        doc.text(note.articleTitle, margin, y, {
          maxWidth: pageW - 2 * margin,
        });
        y += 6;

        if (note.selectedText) {
          doc.setFillColor(25, 30, 55);
          doc.roundedRect(margin, y, pageW - 2 * margin, 10, 2, 2, "F");
          doc.setTextColor(100, 160, 255);
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          const snippet =
            note.selectedText.length > 90
              ? note.selectedText.slice(0, 90) + "…"
              : note.selectedText;
          doc.text(`"${snippet}"`, margin + 3, y + 6, {
            maxWidth: pageW - 2 * margin - 6,
          });
          y += 14;
        }

        doc.setTextColor(220, 230, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(note.content, pageW - 2 * margin);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 3;

        doc.setTextColor(80, 100, 140);
        doc.setFontSize(8);
        doc.text(new Date(note.createdAt).toLocaleString(), margin, y);
        y += 4;

        doc.setDrawColor(40, 50, 80);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageW - margin, y);
        y += 8;
      });
    }

    doc.save("nexusai-notes.pdf");
  };

  const startEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingNoteId) {
      updateNote(editingNoteId, editContent);
      setEditingNoteId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col glass-panel-strong border-l border-white/10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  {activeTab === "bookmarks" ? (
                    <Bookmark className="w-4 h-4 text-primary" />
                  ) : (
                    <StickyNote className="w-4 h-4 text-secondary" />
                  )}
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-lg leading-none">
                    {activeTab === "bookmarks" ? "Saved Articles" : "My Notes"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeTab === "bookmarks"
                      ? `${bookmarks.length} saved`
                      : `${notes.length} notes`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1 p-3 border-b border-white/10">
              {(["bookmarks", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    activeTab === tab
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-muted-foreground hover:text-white hover:bg-white/5",
                  )}
                >
                  {tab === "bookmarks" ? (
                    <Bookmark className="w-3.5 h-3.5" />
                  ) : (
                    <StickyNote className="w-3.5 h-3.5" />
                  )}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {activeTab === "bookmarks" ? (
                bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Bookmark className="w-12 h-12 text-white/10 mb-3" />
                    <p className="text-white/50 font-medium">
                      No bookmarks yet
                    </p>
                    <p className="text-white/30 text-sm mt-1">
                      Save articles to read later
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedBookmarks).map(([date, items]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                        {date}
                      </p>
                      <div className="space-y-2">
                        {items.map((bm) => (
                          <motion.div
                            key={bm.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="group flex items-start gap-3 p-3 rounded-xl bg-white/4 hover:bg-white/7 border border-white/8 hover:border-white/15 transition-all cursor-pointer"
                            onClick={() => onArticleClick(bm.articleId)}
                          >
                            {bm.imageUrl && (
                              <img
                                src={bm.imageUrl}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1"
                                style={{
                                  background: `${CATEGORY_COLORS[bm.category]}22`,
                                  color: CATEGORY_COLORS[bm.category],
                                }}
                              >
                                {bm.category}
                              </span>
                              <p className="text-sm font-medium text-white leading-tight line-clamp-2 mt-1">
                                {bm.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {bm.source}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(bm.articleId);
                              }}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-destructive/20 hover:bg-destructive/40 flex items-center justify-center text-destructive transition-all flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                )
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <StickyNote className="w-12 h-12 text-white/10 mb-3" />
                  <p className="text-white/50 font-medium">No notes yet</p>
                  <p className="text-white/30 text-sm mt-1">
                    Select text in articles to add notes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="rounded-xl bg-white/4 border border-white/8 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-primary/80 font-medium truncate">
                            {note.articleTitle}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() =>
                              editingNoteId === note.id
                                ? saveEdit()
                                : startEdit(note)
                            }
                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                          >
                            {editingNoteId === note.id ? (
                              <Check className="w-3 h-3 text-primary" />
                            ) : (
                              <Edit3 className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="w-6 h-6 rounded-lg bg-destructive/10 hover:bg-destructive/30 flex items-center justify-center text-destructive/70 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {note.selectedText && (
                        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-primary/5 border-l-2 border-primary/40">
                          <p className="text-[11px] text-primary/70 italic line-clamp-2">
                            "{note.selectedText}"
                          </p>
                        </div>
                      )}
                      <div className="px-3 py-3">
                        {editingNoteId === note.id ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/15 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-primary/50 transition-colors"
                            rows={4}
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm text-white/80 leading-relaxed">
                            {note.content}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {activeTab === "notes" && notes.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 border border-primary/30 text-white font-medium text-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Export Notes as PDF
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
