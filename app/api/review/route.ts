import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { json } from "@/lib/http";

/** Two random questions about earlier steps, for spaced review at the start of a session. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const course = getCourse(url.searchParams.get("course") ?? "", await getLocale());
  if (!course) return json({ error: "not_found" }, 404);
  if (!(await getLearner(course.id))) return json({ error: "locked" }, 401);
  const upto = Number.parseInt(url.searchParams.get("upto") ?? "0", 10);
  const pool = course.assessment.questions.filter((q) => q.step < upto);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return json({ questions: pool.slice(0, 2).map(({ question, options, answer }) => ({ question, options, answer })) });
}
