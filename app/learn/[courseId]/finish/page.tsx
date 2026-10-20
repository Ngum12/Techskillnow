import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { getJourney } from "@/lib/journey";
import { getDict, fmt } from "@/lib/i18n";
import { Watermark } from "@/components/Watermark";

export const dynamic = "force-dynamic";

function Row({ done, label, detail, action }: { done: boolean; label: string; detail?: string; action?: React.ReactNode }) {
  return (
    <li className="card flex items-center gap-4 p-4">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${done ? "bg-ok text-white" : "border-2 border-line text-muted"}`}
      >
        {done ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{label}</p>
        {detail && <p className="text-sm text-muted">{detail}</p>}
      </div>
      {action}
    </li>
  );
}

/** Checklist between the last lesson and the certificate: lessons, final test, real-world mission. */
export default async function FinishPage({ params }: PageProps<"/learn/[courseId]/finish">) {
  const { courseId } = await params;
  const locale = await getLocale();
  const course = getCourse(courseId, locale);
  if (!course) notFound();
  const learner = await getLearner(course.id);
  if (!learner) redirect("/redeem");
  const t = getDict(locale);
  const j = await getJourney(learner, course);
  const small = "btn btn-secondary min-h-11 shrink-0 px-4 py-2 text-sm";

  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href="/" className="font-bold text-primary">
        {t.appName}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t.finish.title}</h1>
      <p className="mt-1 text-muted">{t.finish.intro}</p>

      <ul className="mt-6 flex flex-col gap-3">
        <Row
          done={j.lessonsDone}
          label={t.finish.lessons}
          detail={j.lessonsDone ? t.finish.done : fmt(t.learn.progress, { n: j.step, total: course.steps.length })}
          action={!j.lessonsDone && <Link href={`/learn/${course.id}`} className={small}>{t.finish.start}</Link>}
        />
        <Row
          done={j.postPassed}
          label={t.finish.test}
          detail={j.post ? fmt(t.finish.score, { score: j.post.score, total: j.post.total }) : t.finish.todo}
          action={
            j.lessonsDone && !j.postPassed && (
              <Link href={`/learn/${course.id}/check?kind=post`} className={small}>
                {j.post ? t.finish.retake : t.finish.start}
              </Link>
            )
          }
        />
        {j.missionEnabled && (
          <Row
            done={j.missionPassed}
            label={t.finish.mission}
            detail={j.missionPassed ? t.finish.done : j.mission?.status === "waiting" ? t.finish.waiting : t.finish.todo}
            action={j.lessonsDone && !j.missionPassed && <Link href={`/learn/${course.id}/mission`} className={small}>{t.finish.start}</Link>}
          />
        )}
      </ul>

      {j.eligible ? (
        <Link href={`/learn/${course.id}/certificate`} className="btn btn-primary mt-8 w-full">
          {t.finish.certificate}
        </Link>
      ) : (
        <button type="button" className="btn btn-primary mt-8 w-full" disabled>
          {t.finish.certificate}
        </button>
      )}
      <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />
    </main>
  );
}
