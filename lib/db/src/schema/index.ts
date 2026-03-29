export * from "./conversations";
export * from "./messages";
import { pgTable, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const newsArticles = pgTable("news_articles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 100 }),
  source: varchar("source", { length: 100 }),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  imageUrl: text("image_url"),
  importance: integer("importance"),
  sentiment: varchar("sentiment", { length: 50 }),
  tags: text("tags").array(),
  readTime: integer("read_time"),
  relevanceReason: text("relevance_reason")
});

export const trendingTopics = pgTable("trending_topics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  category: varchar("category", { length: 100 }),
  importance: integer("importance"),
  articleCount: integer("article_count"),
  trend: varchar("trend", { length: 50 }),
  color: varchar("color", { length: 50 })
});

export const smartAlerts = pgTable("smart_alerts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 50 }),
  title: text("title"),
  message: text("message"),
  impact: text("impact"),
  severity: varchar("severity", { length: 50 }),
  location: varchar("location", { length: 100 }),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow()
});