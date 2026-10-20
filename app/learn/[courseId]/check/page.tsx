import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { db } from "@/lib/supabase-admin";
import { getDict, fmt } from "@/lib/i18n";
import { publicQuestions, questionsFor } from "@/lib/assessment";
import { Watermark } from "@/components/Watermark";
import { AssessmentForm } from "@/components/AssessmentForm";

export const dynamic = "force-dynamic";

/** The optional warm-up (?kind=pre) and the final test (?kind=post). */
export default async function CheckPage({ params, searchParams }: PageProps<"/learn/[courseId]/check">) {
  const { courseId } = await params;
  const kind = (await searchParams).kind === "post" ? "post" : "pre";
  const locale = await getLocale();
  const course = getCourse(courseId, locale);
  if (!course) notFound();
  const learner = await getLearner(course.id);
  if (!learner) redirect("/redeem");
  const t = getDict(locale);

  const supabase = db();
  if (kind === "pre") {
    const { data } = await supabase.from("assessments").select("score").eq("code", learner.code).eq("course_id", course.id).eq("kind", "pre").maybeSingle();
    if (data) redirect(`/learn/${course.id}`);
  } else {
    const { data } = await supabase.from("progress").select("completed_at").eq("code", learner.code).eq("course_id", course.id).maybeSingle();
    if (!data?.completed_at) redirect(`/learn/${course.id}`);
  }

  const questions = questionsFor(course, kind);
  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <p className="font-bold text-primary">{t.appName}</p>
      <h1 className="mt-4 text-2xl font-bold">{kind === "pre" ? t.check.preTitle : t.check.postTitle}</h1>
      <p className="mt-2 text-muted">{kind === "pre" ? t.check.preIntro : fmt(t.check.postIntro, { pass: course.assessment.passMark, total: questions.length })}</p>
      <AssessmentForm courseId={course.id} kind={kind} questions={publicQuestions(questions)} />
      <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />
    </main>
  );
}
