import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { db } from "@/lib/supabase-admin";
import { questionsFor, scoreAssessment } from "@/lib/assessment";
import { json, readJson } from "@/lib/http";

type Kind = "pre" | "post";
const isKind = (k: unknown): k is Kind => k === "pre" || k === "post";

/** Scores the optional warm-up ("pre") or the final test ("post"). */
export async function POST(req: Request) {
  const body = await readJson<{ courseId: string; kind: Kind; answers: number[] }>(req);
  const course = getCourse(String(body.courseId ?? ""), await getLocale());
  if (!course || !isKind(body.kind)) return json({ error: "bad_request" }, 400);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);

  const supabase = db();
  const key = { code: learner.code, course_id: course.id };
  if (body.kind === "post") {
    const { data: progress } = await supabase.from("progress").select("completed_at").match(key).maybeSingle();
    if (!progress?.completed_at) return json({ error: "not_ready" }, 403);
  }

  const questions = questionsFor(course, body.kind);
  const answers = (Array.isArray(body.answers) ? body.answers : []).slice(0, questions.length).map((a) => (Number.isInteger(a) ? a : -1));
  const { score, total, wrong } = scoreAssessment(questions, answers);
  const { data: existing } = await supabase.from("assessments").select("score").match({ ...key, kind: body.kind }).maybeSingle();
  // The warm-up counts once; the final test keeps the best score.
  const save = body.kind === "pre" ? !existing : !existing || score > existing.score;
  if (save) {
    await supabase.from("assessments").upsert({ ...key, kind: body.kind, score, total, answers, created_at: new Date().toISOString() });
  }
  return json({
    score,
    total,
    passed: score >= course.assessment.passMark,
    wrong: wrong.map((i) => ({ question: questions[i].question, answer: questions[i].options[questions[i].answer] })),
  });
}
