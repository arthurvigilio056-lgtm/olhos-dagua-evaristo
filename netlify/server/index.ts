import { Hono } from "hono";
import { desc, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { quizResults } from "../../db/schema.ts";

const app = new Hono();

// Salva o resultado de uma pessoa no quiz
app.post("/api/resultados", async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  const name = String(body?.name ?? "").trim().slice(0, 60);
  const score = Number(body?.score);
  const total = Number(body?.total);
  if (!name) return c.json({ error: "Nome obrigatório" }, 400);
  if (!Number.isInteger(total) || total < 1 || total > 100 || !Number.isInteger(score) || score < 0 || score > total) {
    return c.json({ error: "Pontuação inválida" }, 400);
  }
  const [row] = await db.insert(quizResults).values({ name, score, total }).returning();
  return c.json(row, 201);
});

// Lista os resultados e o total geral de acertos
app.get("/api/resultados", async (c) => {
  const rows = await db
    .select()
    .from(quizResults)
    .orderBy(desc(quizResults.score), desc(quizResults.createdAt))
    .limit(50);
  const [stats] = await db
    .select({
      participantes: sql<number>`count(*)::int`,
      acertos: sql<number>`coalesce(sum(${quizResults.score}),0)::int`,
      perguntas: sql<number>`coalesce(sum(${quizResults.total}),0)::int`,
    })
    .from(quizResults);
  return c.json({ resultados: rows, ...stats });
});

export default app;

export const config = { path: "/api/*" };
