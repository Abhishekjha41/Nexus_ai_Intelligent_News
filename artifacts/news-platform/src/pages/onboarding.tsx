import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSaveUserPreferences, UserPreferencesReadingLevel } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Brain, Globe, Shield } from "lucide-react";

const CATEGORIES = [
  { id: "Tech", icon: "💻", desc: "AI, Gadgets, Startups" },
  { id: "Politics", icon: "🏛️", desc: "Elections, Policy" },
  { id: "Sports", icon: "⚽", desc: "Scores, Transfers" },
  { id: "Finance", icon: "📈", desc: "Markets, Crypto" },
  { id: "Entertainment", icon: "🎬", desc: "Movies, Culture" },
  { id: "World", icon: "🌍", desc: "Global Events" },
  { id: "Science", icon: "🔬", desc: "Space, Research" },
  { id: "Business", icon: "💼", desc: "Economy, Companies" }
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [readingLevel, setReadingLevel] = useState<UserPreferencesReadingLevel>("normal");
  
  const { mutate: savePrefs, isPending } = useSaveUserPreferences();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else finishOnboarding();
  };

  const finishOnboarding = () => {
    savePrefs({
      data: {
        categories: selectedCats,
        readingLevel,
        alertsEnabled: true
      }
    }, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-6 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/deep-space-bg.png`} 
          alt="Space background" 
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="w-full max-w-3xl z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.5)] mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            Welcome to Nexus<span className="text-primary">AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            The news, curated and explained specifically for you.
          </motion.p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">What do you care about?</h2>
                  <p className="text-muted-foreground">Select at least 3 topics to tune your AI agent.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCats(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                        selectedCats.includes(cat.id) 
                          ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" 
                          : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className={`font-bold ${selectedCats.includes(cat.id) ? "text-white" : "text-white/80"}`}>{cat.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">{cat.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    variant="glow" 
                    size="lg" 
                    onClick={handleNext}
                    disabled={selectedCats.length < 3}
                    className="group"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">How deep should we go?</h2>
                  <p className="text-muted-foreground">Choose how your AI agent summarizes articles by default.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(['beginner', 'normal', 'expert'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setReadingLevel(level)}
                      className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                        readingLevel === level 
                          ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]" 
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {level === 'beginner' && <Globe className="w-8 h-8 text-blue-400 mb-4" />}
                      {level === 'normal' && <Shield className="w-8 h-8 text-emerald-400 mb-4" />}
                      {level === 'expert' && <Brain className="w-8 h-8 text-purple-400 mb-4" />}
                      <div className="font-bold text-lg text-white capitalize mb-2">{level}</div>
                      <div className="text-sm text-muted-foreground">
                        {level === 'beginner' && "Explain concepts simply, focus on the big picture."}
                        {level === 'normal' && "Standard journalistic depth and terminology."}
                        {level === 'expert' && "In-depth analysis, assuming prior knowledge."}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="glow" size="lg" onClick={handleNext} className="group">
                    Finalize Setup
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse" />
                  <div className="absolute inset-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.6)]">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Initializing Your AI Agent</h2>
                  <p className="text-muted-foreground text-lg">
                    Analyzing your interests... generating knowledge graphs...
                  </p>
                </div>

                <div className="pt-8">
                  <Button 
                    variant="glow" 
                    size="lg" 
                    onClick={finishOnboarding}
                    disabled={isPending}
                    className="w-full md:w-auto px-12"
                  >
                    {isPending ? "Generating Feed..." : "Enter NexusAI"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
