import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { getDict } from "@/lib/i18n";
import { buyTarget } from "@/lib/buy";
import { LessonPlayer } from "@/components/LessonPlayer";
import { Watermark } from "@/components/Watermark";
import { Welcome } from "@/components/Welcome";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params, searchParams }: PageProps<"/learn/[courseId]">) {
  const { courseId } = await params;
  const { step } = await searchParams;
  const locale = await getLocale();
  const course = getCourse(courseId, locale);
  if (!course) notFound();

  const t = getDict(locale);
  const learner = await getLearner(course.id);
  const total = course.steps.length;

  let initialStep = 1;
  if (learner) {
    const supabase = db();
    const [{ data: progress }, { data: pre }] = await Promise.all([
      supabase.from("progress").select("step").eq("code", learner.code).eq("course_id", course.id).maybeSingle(),
      supabase.from("assessments").select("score").eq("code", learner.code).eq("course_id", course.id).eq("kind", "pre").maybeSingle(),
    ]);
    initialStep = progress?.step ?? 1;
    // First visit after buying: a welcome screen, with the warm-up offered but optional.
    const welcomed = (await cookies()).has(`tsn_welcomed_${course.id}`);
    if (initialStep === 1 && !pre && !welcomed && typeof step !== "string") {
      return (
        <>
          <Welcome courseId={course.id} courseTitle={course.title} name={learner.buyerName} totalSteps={total} />
          <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />
        </>
      );
    }
  }
  const requested = Number.parseInt(typeof step === "string" ? step : "", 10);
  if (requested >= 1 && requested <= total && (learner || requested <= course.freeSteps + 1)) initialStep = requested;

  const buy = buyTarget(t, course);
  const sectionSteps = Object.fromEntries(course.steps.flatMap((s, i) => (s.cvSection ? [[s.cvSection, i + 1]] : [])));
  return (
    <>
      <LessonPlayer
        courseId={course.id}
        total={total}
        freeSteps={course.freeSteps}
        paid={!!learner}
        initialStep={initialStep}
        buyHref={buy.href}
        buyLabel={buy.label}
        tutorEnabled={!!env.anthropicKey}
        usesCv={!!course.usesCv}
        sectionSteps={sectionSteps}
      />
      {learner && <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />}
    </>
  );
}
