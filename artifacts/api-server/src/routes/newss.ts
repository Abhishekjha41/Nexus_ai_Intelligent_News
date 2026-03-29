import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { newsArticles, trendingTopics, smartAlerts } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Helper to ensure database dates and arrays are formatted correctly for the React frontend
const normalizeArticle = (dbArticle: any) => ({
  ...dbArticle,
  publishedAt: dbArticle.publishedAt instanceof Date 
    ? dbArticle.publishedAt.toISOString() 
    : dbArticle.publishedAt || new Date().toISOString(),
  tags: dbArticle.tags || []
});

/**
 * Fetch News Feed strictly from Database
 */
router.get("/news/feed", async (req: Request, res: Response) => {
  const { categories: catParam, limit = "20", offset = "0" } = req.query;
  const lim = parseInt(limit as string, 10);
  const off = parseInt(offset as string, 10);
  
  try {
    const dbData = await db.select().from(newsArticles);
    
    // If table is empty, dbData will be []
    let articles = dbData.map(normalizeArticle);
    
    // Filter by categories from DB data
    if (catParam && typeof catParam === "string") {
      const cats = catParam.toLowerCase().split(",");
      articles = articles.filter(a => cats.some(c => (a.category || "").toLowerCase().includes(c)));
    }
    
    res.json(articles.slice(off, off + lim));
  } catch (error) {
    console.error("DB Fetch Error (Feed):", error);
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

/**
 * Fetch Trending Topics strictly from Database
 */
router.get("/news/trending", async (_req: Request, res: Response) => {
  try {
    const dbTrending = await db.select().from(trendingTopics);
    res.json(dbTrending);
  } catch (error) {
    console.error("DB Fetch Error (Trending):", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

/**
 * Fetch Smart Alerts strictly from Database
 */
router.get("/news/alerts", async (_req: Request, res: Response) => {
  try {
    const dbAlerts = await db.select().from(smartAlerts);
    res.json(dbAlerts);
  } catch (error) {
    console.error("DB Fetch Error (Alerts):", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

/**
 * AI Briefing using Real DB Context
 */
router.post("/news/articles/:id/briefing", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { mode = "normal", style = "tldr" } = req.body;
  
  try {
    const dbResult = await db.select().from(newsArticles).where(eq(newsArticles.id, id)).limit(1);
    
    if (dbResult.length === 0) {
      return res.status(404).json({ error: "Article not found in database" });
    }

    const article = normalizeArticle(dbResult[0]);

    const levelGuide = mode === "beginner" 
      ? "Use simple language." 
      : mode === "expert"
      ? "Use technical language."
      : "Use professional language.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an elite news analyst AI. ${levelGuide} Mode: ${mode}, Style: ${style}. Respond in valid JSON.`
        },
        {
          role: "user",
          content: `Generate briefing for: ${article.title}. Summary: ${article.summary}.`
        }
      ],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (err) {
    res.status(500).json({ error: "AI Briefing failed" });
  }
});

/**
 * Story Timeline strictly from Database
 */
router.get("/news/articles/:id/timeline", async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const dbResult = await db.select().from(newsArticles).where(eq(newsArticles.id, id)).limit(1);
    
    if (dbResult.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = normalizeArticle(dbResult[0]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a news timeline analyst. Respond in valid JSON only."
        },
        {
          role: "user",
          content: `Create timeline for: ${article.title}. Summary: ${article.summary}.`
        }
      ],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (err) {
    res.status(500).json({ error: "Timeline generation failed" });
  }
});

router.get("/news/preferences", (_req: Request, res: Response) => {
  res.json({
    categories: ["Tech", "Finance", "World", "Science"],
    location: "Local",
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
    return res.status(400).json({ error: "selectedText is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Explain news terms in valid JSON."
        },
        {
          role: "user",
          content: `Explain: "${selectedText}" in context of "${articleTitle}".`
        }
      ],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (err) {
    res.status(500).json({ error: "Explanation failed" });
  }
});

export default router;