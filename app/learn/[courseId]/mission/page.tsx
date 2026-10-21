import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { getJourney } from "@/lib/journey";
import { env } from "@/lib/env";
import { getDict, fmt } from "@/lib/i18n";
import { missionFeedback } from "@/lib/mission-check";
import { missionAddress } from "@/lib/mission-address";
import { missionStage } from "@/lib/mission-reply";
import { Watermark } from "@/components/Watermark";
import { MissionPanel } from "@/components/MissionPanel";

export const dynamic = "force-dynamic";

export default async function MissionPage({ params }: PageProps<"/learn/[courseId]/mission">) {
  const { courseId } = await params;
  const locale = await getLocale();
  const course = getCourse(courseId, locale);
  if (!course) notFound();
  const learner = await getLearner(course.id);
  if (!learner) redirect("/redeem");
  if (!env.missionEmail) redirect(`/learn/${course.id}/finish`);
  const t = getDict(locale);
  const j = await getJourney(learner, course);
  if (!j.lessonsDone) redirect(`/learn/${course.id}/finish`);
  const { stage, reply } = await missionStage(course, learner.code);

  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href={`/learn/${course.id}/finish`} className="font-semibold text-primary">
        ← {t.mission.back}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t.mission.title}</h1>
      <p className="mt-2">{course.mission.intro}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-6">
        {course.mission.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <MissionPanel
        courseId={course.id}
        missionEmail={missionAddress(learner.code)}
        subjectExample={fmt(course.mission.subjectExample ?? t.mission.subjectExample, { name: learner.buyerName })}
        advert={course.mission.advert}
        initial={j.mission ? { ...j.mission, feedback: missionFeedback(course.mission, j.mission.feedback), stage, reply } : null}
      />
      <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />
    </main>
  );
}
