import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetUserPreferences, useSaveUserPreferences, UserPreferencesReadingLevel } from "@workspace/api-client-react";
import { X, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["Tech", "Politics", "Sports", "Finance", "Entertainment", "World", "Science", "Business"];

export function PreferencesDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: prefs, isLoading } = useGetUserPreferences({ query: { enabled: isOpen } });
  const { mutate: savePrefs, isPending } = useSaveUserPreferences();

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [readingLevel, setReadingLevel] = useState<UserPreferencesReadingLevel>("normal");

  useEffect(() => {
    if (prefs) {
      setSelectedCats(prefs.categories);
      setReadingLevel(prefs.readingLevel);
    }
  }, [prefs]);

  const toggleCategory = (cat: string) => {
    setSelectedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    savePrefs({ 
      data: {
        categories: selectedCats,
        readingLevel,
        alertsEnabled: true
      } 
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-display font-bold text-white mb-6">Customize Your Feed</h2>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading preferences...</div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider opacity-80">Topics of Interest</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCats.includes(cat)
                          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                          : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider opacity-80">AI Reading Level</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'normal', 'expert'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setReadingLevel(level)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        readingLevel === level
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span className="capitalize font-bold">{level}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="glow" onClick={handleSave} disabled={isPending}>
                  {isPending ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
