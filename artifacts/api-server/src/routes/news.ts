// @ts-nocheck
import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server/index.ts";

const router: IRouter = Router();

const categories = ["Tech", "Politics", "Sports", "Finance", "Entertainment", "World", "Science", "Business"];

const mockArticles = [
  {
    id: "art-001",
    title: "OpenAI Releases GPT-5: A Leap Toward AGI",
    summary: "OpenAI has unveiled GPT-5, their most capable model yet, demonstrating unprecedented reasoning abilities and multimodal understanding that experts say moves us closer to artificial general intelligence.\n\nThe new architecture completely overhauls how the model processes context, allowing it to hold up to 1 million tokens in active memory while reducing hallucinations by 80%. Enterprise partners are already integrating it into automated coding and complex data analysis pipelines, reporting a massive leap in productivity compared to the previous generation. Industry leaders are now calling for updated regulatory frameworks as the capabilities blur the line between human and machine logic.",
    category: "Tech",
    source: "TechCrunch",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    importance: 10,
    sentiment: "positive",
    tags: ["AI", "OpenAI", "GPT-5", "Technology"],
    readTime: 180,
    relevanceReason: "You follow AI and Technology"
  },
  {
    id: "art-002",
    title: "Global Markets Surge Amid Fed Rate Cut Signals",
    summary: "Stock markets worldwide experienced significant gains after Federal Reserve officials signaled a potential interest rate cut, with the S&P 500 rising 2.3% and tech stocks leading the charge.\n\nThe rally was triggered by comments noting that recent inflation data has consistently trended downward toward the central bank's 2% target. Technology stocks and real estate sectors were the biggest winners of the day, as investors rushed to capitalize on cheaper borrowing costs. Analysts predict that a 50-basis-point cut could be announced as early as next month, potentially sparking a sustained bull market well into the next year.",
    category: "Finance",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    importance: 8,
    sentiment: "positive",
    tags: ["Markets", "Fed", "Economy", "Stocks"],
    readTime: 120,
    relevanceReason: "Trending in Finance"
  },
  {
    id: "art-003",
    title: "Climate Summit Reaches Historic Carbon Agreement",
    summary: "World leaders have agreed to a landmark carbon reduction treaty at the Geneva Climate Summit, pledging to reduce emissions by 60% by 2040 in what scientists are calling the most ambitious climate action in history.\n\nThe agreement includes strict enforcement mechanisms, heavily penalizing nations that fail to meet their incremental five-year targets. Furthermore, developed nations have committed to a $500 billion fund to subsidize the transition to renewable energy for developing economies. While fossil fuel industries have expressed concerns over the aggressive timeline, the renewable tech sector saw a massive surge in market valuation following the announcement.",
    category: "World",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
    importance: 9,
    sentiment: "positive",
    tags: ["Climate", "Environment", "World Leaders", "Policy"],
    readTime: 240,
    relevanceReason: "High global impact story"
  },
  {
    id: "art-004",
    title: "SpaceX Artemis Moon Mission Launches Successfully",
    summary: "SpaceX's Starship carrying NASA's Artemis crew launched flawlessly from Kennedy Space Center, marking the beginning of humanity's return to the lunar surface after over 50 years.\n\nThe massive Super Heavy booster successfully separated and returned to the launch pad, caught mid-air by the launch tower arms in a spectacular display of engineering precision. The four-person crew will spend nearly a week on the lunar surface deploying advanced scientific instruments, sampling permanently shadowed craters for water ice, and laying the groundwork for a permanent lunar base. This mission paves the final stepping stones for eventual human missions to Mars.",
    category: "Science",
    source: "NASA",
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80",
    importance: 10,
    sentiment: "positive",
    tags: ["SpaceX", "NASA", "Moon", "Space"],
    readTime: 200,
    relevanceReason: "Historic milestone in space exploration"
  },
  {
    id: "art-005",
    title: "Election 2026: AI Deepfakes Threaten Democracy",
    summary: "Election officials across the country are sounding alarms about sophisticated AI-generated deepfakes targeting candidates, raising urgent questions about the integrity of upcoming midterm elections.\n\nJust last week, a viral video appearing to show a prominent candidate making controversial statements was debunked by digital forensics, but not before it had been viewed over 20 million times on social media. In response, lawmakers are rushing to pass emergency legislation that would require visible and unalterable watermarks on all AI-generated political content, while tech platforms scramble to deploy advanced detection algorithms.",
    category: "Politics",
    source: "Politico",
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    importance: 9,
    sentiment: "negative",
    tags: ["Politics", "AI", "Elections", "Deepfakes"],
    readTime: 300,
    relevanceReason: "Critical civic issue affecting you"
  },
  {
    id: "art-006",
    title: "NBA Finals: Warriors vs Heat — Game 7 Tonight",
    summary: "The NBA Finals reaches its dramatic conclusion tonight as the Golden State Warriors and Miami Heat battle for the championship in a winner-take-all Game 7 at Chase Center.\n\nThe series has been a rollercoaster, with momentum swinging wildly between the two coastal giants. The Heat forced Game 7 after a spectacular clutch performance in the 4th quarter of Game 6, relying heavily on their suffocating defense. Meanwhile, the Warriors are banking on their home-court advantage and perimeter shooting to secure another dynasty-cementing title. Analysts are predicting record-breaking viewership numbers for tonight's decisive clash.",
    category: "Sports",
    source: "ESPN",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80",
    importance: 7,
    sentiment: "neutral",
    tags: ["NBA", "Basketball", "Warriors", "Heat"],
    readTime: 90,
    relevanceReason: "Major sporting event tonight"
  },
  {
    id: "art-007",
    title: "Tesla Unveils Cybertruck 2.0 with 800-Mile Range",
    summary: "Tesla has announced the next-generation Cybertruck featuring a groundbreaking solid-state battery with an 800-mile range, promising to revolutionize electric vehicle technology and the trucking industry.\n\nThe new battery architecture not only doubles the range of its predecessor but also reduces overall vehicle weight by 15%, drastically improving towing efficiency and acceleration. Furthermore, Tesla confirmed that the new manufacturing process reduces battery production costs by nearly a third. Pre-orders crashed the company's website within minutes of the announcement, with first deliveries expected late next year.",
    category: "Tech",
    source: "The Verge",
    publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    importance: 7,
    sentiment: "positive",
    tags: ["Tesla", "EV", "Cybertruck", "Battery"],
    readTime: 150,
    relevanceReason: "You follow Tesla and EVs"
  },
  {
    id: "art-008",
    title: "Hollywood Writers Strike: AI Terms Finally Agreed",
    summary: "Hollywood's major studios and the Writers Guild of America have reached a groundbreaking deal establishing strict AI usage limits and compensation frameworks for writers whose work trains AI systems.\n\nUnder the agreement, AI cannot be used to write or rewrite literary material, and AI-generated text cannot be considered 'source material' that would undermine a human writer's credit or separated rights. If a studio provides a writer with AI-generated material to work from, the studio must explicitly disclose its origin. This historic deal sets a massive precedent for the future of creative labor across all entertainment industries.",
    category: "Entertainment",
    source: "Variety",
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800&q=80",
    importance: 6,
    sentiment: "positive",
    tags: ["Hollywood", "WGA", "AI", "Strike"],
    readTime: 180,
    relevanceReason: "Affects the media you consume"
  },
  {
    id: "art-009",
    title: "Quantum Computing Breakthrough: 1 Million Qubits Achieved",
    summary: "IBM researchers have achieved a major milestone by successfully operating a one-million qubit quantum processor, a development that could render current encryption methods obsolete within a decade.\n\nThe new architecture solves previous scaling issues by utilizing a novel topological error-correction code and advanced supercooling materials that stabilize the fragile quantum states for significantly longer periods. A stable, million-qubit machine can simulate complex molecular structures in seconds—a task that would take classical supercomputers millennia. Governments are now in a race to implement post-quantum cryptographic standards.",
    category: "Science",
    source: "Nature",
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    importance: 9,
    sentiment: "neutral",
    tags: ["Quantum", "IBM", "Computing", "Science"],
    readTime: 300,
    relevanceReason: "Transformative technology news"
  },
  {
    id: "art-010",
    title: "Medicare Drug Pricing Reform Signed Into Law",
    summary: "President signs landmark legislation allowing Medicare to negotiate directly with pharmaceutical companies on drug prices, expected to save seniors billions and reduce insulin costs by 85%.\n\nThe bill faced steep opposition from pharmaceutical lobbying groups but ultimately passed with narrow bipartisan support. It caps out-of-pocket prescription drug costs at $2,000 annually for Medicare Part D beneficiaries. Healthcare economists predict this reform will dramatically shift the pricing models of major drug manufacturers, potentially lowering costs across the broader private healthcare market as well.",
    category: "Politics",
    source: "AP News",
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    importance: 8,
    sentiment: "positive",
    tags: ["Healthcare", "Medicare", "Drugs", "Policy"],
    readTime: 240,
    relevanceReason: "Healthcare policy that affects many"
  },
  {
    id: "art-011",
    title: "Apple Vision Pro 2 Announced: Neural Interface Added",
    summary: "Apple has unveiled Vision Pro 2, featuring an experimental neural interface that lets users control apps with their thoughts, alongside a dramatically improved display and 18-hour battery life.\n\nThe neural interface utilizes non-invasive sensors built into the headband that read micro-electric signals, allowing for hands-free scrolling, clicking, and typing with astonishing accuracy. Additionally, Apple managed to reduce the headset's weight by 30%, addressing the primary comfort complaint of the first generation. Developers are already receiving beta kits to adapt spatial computing apps for this new mode of interaction.",
    category: "Tech",
    source: "MacRumors",
    publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80",
    importance: 8,
    sentiment: "positive",
    tags: ["Apple", "Vision Pro", "AR", "Neural"],
    readTime: 180,
    relevanceReason: "You follow Apple and Tech"
  },
  {
    id: "art-012",
    title: "Global Chip Shortage Eases as TSMC Opens US Fab",
    summary: "TSMC's new Arizona semiconductor fabrication plant begins mass production, marking a turning point in the global chip shortage and reducing US dependence on Asian chipmakers.\n\nSubsidized heavily by the CHIPS Act, the massive facility will initially produce 4-nanometer chips, with major clients like Apple and Nvidia already securing the first production runs. This onshore capability is expected to stabilize global supply chains against geopolitical shocks. Local economies are also seeing a boom, with the plant creating over 10,000 high-paying engineering and manufacturing jobs in the region.",
    category: "Business",
    source: "Wall Street Journal",
    publishedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    importance: 7,
    sentiment: "positive",
    tags: ["TSMC", "Chips", "Manufacturing", "Supply Chain"],
    readTime: 210,
    relevanceReason: "Critical supply chain development"
  },
];

const mockTrending = [
  { id: "t1", name: "AI Revolution", category: "Tech", importance: 95, articleCount: 142, trend: "rising", color: "#6366f1" },
  { id: "t2", name: "Climate Action", category: "World", importance: 88, articleCount: 98, trend: "rising", color: "#10b981" },
  { id: "t3", name: "Space Race", category: "Science", importance: 82, articleCount: 76, trend: "rising", color: "#8b5cf6" },
  { id: "t4", name: "Election 2026", category: "Politics", importance: 78, articleCount: 115, trend: "rising", color: "#f59e0b" },
  { id: "t5", name: "Market Rally", category: "Finance", importance: 72, articleCount: 64, trend: "stable", color: "#3b82f6" },
  { id: "t6", name: "NBA Finals", category: "Sports", importance: 68, articleCount: 54, trend: "rising", color: "#ef4444" },
  { id: "t7", name: "Quantum Computing", category: "Science", importance: 62, articleCount: 42, trend: "rising", color: "#ec4899" },
  { id: "t8", name: "EV Innovation", category: "Tech", importance: 55, articleCount: 38, trend: "stable", color: "#14b8a6" },
  { id: "t9", name: "Crypto Rebound", category: "Finance", importance: 45, articleCount: 29, trend: "falling", color: "#f97316" },
  { id: "t10", name: "Hollywood AI Deal", category: "Entertainment", importance: 40, articleCount: 22, trend: "falling", color: "#a855f7" },
];

const mockAlerts = [
  {
    id: "alert-001",
    type: "breaking",
    title: "Breaking: Fed Rate Decision",
    message: "Federal Reserve announces emergency rate cut of 0.5% following market volatility",
    impact: "Stock markets expected to surge — check your portfolio",
    severity: "high",
    location: "National",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: "alert-002",
    type: "weather",
    title: "Severe Weather Warning",
    message: "Heavy rainfall and thunderstorms expected in major metropolitan areas tonight",
    impact: "Expect travel delays of 30-60 minutes on major highways",
    severity: "medium",
    location: "Regional",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: "alert-003",
    type: "local",
    title: "Political Rally Nearby",
    message: "Large political demonstration planned in downtown area from 2PM-8PM",
    impact: "Road closures and transit delays expected",
    severity: "low",
    location: "Local",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: "alert-004",
    type: "safety",
    title: "Cybersecurity Alert",
    message: "Major data breach affects 50M users of popular banking app — change passwords immediately",
    impact: "Financial data may be compromised — take action now",
    severity: "critical",
    location: "National",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  }
];

router.get("/news/feed", (req: Request, res: Response) => {
  const { categories: catParam, limit = "20", offset = "0" } = req.query;
  const lim = parseInt(limit as string, 10);
  const off = parseInt(offset as string, 10);
  
  let articles = [...mockArticles];
  
  if (catParam && typeof catParam === "string") {
    const cats = catParam.toLowerCase().split(",");
    articles = articles.filter(a => cats.some(c => a.category.toLowerCase().includes(c)));
  }
  
  const page = articles.slice(off, off + lim);
  res.json(page);
});

router.get("/news/trending", (_req: Request, res: Response) => {
  res.json(mockTrending);
});

router.get("/news/alerts", (_req: Request, res: Response) => {
  res.json(mockAlerts);
});

router.post("/news/articles/:id/briefing", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { mode = "normal", style = "tldr" } = req.body;
  
  const article = mockArticles.find(a => a.id === id);
  
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  // Fast Mock for Video Demo - Instant Loading
  return res.json({
    articleId: id,
    tldr: "This represents a major milestone in the industry, significantly accelerating technological growth and efficiency.",
    keyPoints: [
      "Unprecedented speed and capabilities have been demonstrated.",
      "Major organizations are rapidly adopting these changes.",
      "Experts believe this will redefine standard practices going forward."
    ],
    whyItMatters: "Understanding this development is crucial as it creates a ripple effect, altering how businesses operate and scale.",
    impact: "We can expect widespread adoption leading to lower costs and higher productivity across the global market.",
    whatNext: "Analysts predict regulatory bodies will soon step in, while competitors scramble to release similar innovations.",
    mode
  });
});

router.get("/news/articles/:id/timeline", async (req: Request, res: Response) => {
  const { id } = req.params;
  const article = mockArticles.find(a => a.id === id);

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  const now = new Date();
  res.json({
    articleId: id,
    title: article.title,
    events: [
      { date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString().split("T")[0], title: "Initial Rumors", description: "Early reports and leaks hint at this upcoming development.", importance: "medium" },
      { date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString().split("T")[0], title: "Official Teaser", description: "Key stakeholders confirm that a major announcement is imminent.", importance: "high" },
      { date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString().split("T")[0], title: "Market Speculation", description: "Public anticipation reaches an all-time high prior to the event.", importance: "medium" },
      { date: now.toISOString().split("T")[0], title: "Official Launch", description: article.summary.substring(0, 100) + "...", importance: "high" }
    ],
    keyPeople: [
      { name: "Lead Researcher", role: "Project Head", sentiment: "positive" },
      { name: "Industry Analyst", role: "Market Observer", sentiment: "neutral" }
    ],
    sentimentChanges: [
      { date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString().split("T")[0], sentiment: 0.2, label: "Speculative" },
      { date: now.toISOString().split("T")[0], sentiment: 0.8, label: "Highly Optimistic" }
    ],
    futurePredictions: [
      "Widespread adoption within the next 6-12 months.",
      "Competitors will rush to announce alternative solutions."
    ]
  });
});

router.get("/news/preferences", (_req: Request, res: Response) => {
  res.json({
    categories: ["Tech", "Finance", "World", "Science"],
    location: "San Francisco, CA",
    readingLevel: "normal",
    alertsEnabled: true
  });
});

router.post("/news/preferences", (req: Request, res: Response) => {
  res.json(req.body);
});

router.post("/news/explain", async (req: Request, res: Response) => {
  const { selectedText, articleTitle, articleContext } = req.body;

  if (!selectedText) {
    res.status(400).json({ error: "selectedText is required" });
    return;
  }

  // Very high quality, instant mock response for the demo
  return res.json({
    selectedText,
    simple: `In the context of this article, "${selectedText}" refers to the underlying mechanism or trend that is driving this major development. It represents a significant shift from traditional methods to a more optimized approach.`,
    keyConcepts: [
      { term: selectedText, definition: "The primary subject highlighted in your selection, serving as the core catalyst." },
      { term: "Systemic Impact", definition: "How this specific concept alters the broader industry ecosystem." }
    ],
    eli5: `Think of "${selectedText}" like an upgraded engine in a car—it makes everything run faster and smoother without you having to understand all the complicated parts inside!`,
    whyItMatters: `Understanding "${selectedText}" is crucial because it acts as the foundation for the changes discussed in "${articleTitle}". It dictates how future technologies or policies will be successfully implemented.`
  });
});

export default router;