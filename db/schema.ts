import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const quizResults = pgTable("quiz_results", {
  id: serial().primaryKey(),
  name: text().notNull(),
  score: integer().notNull(),
  total: integer().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
