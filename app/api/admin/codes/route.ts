import { getAdmin } from "@/lib/admin-auth";
import { getCourse } from "@/content";
import { createAccessCode } from "@/lib/access";
import { env } from "@/lib/env";
import { json, readJson } from "@/lib/http";

export async function POST(req: Request) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const body = await readJson<{ buyerName: string; buyerPhone: string; courseId: string; note: string }>(req);
  const buyerName = String(body.buyerName ?? "").trim().slice(0, 120);
  const buyerPhone = String(body.buyerPhone ?? "").trim().slice(0, 30);
  const note = String(body.note ?? "").trim().slice(0, 500) || null;
  const course = getCourse(String(body.courseId ?? ""));
  if (!buyerName || buyerPhone.replace(/\D/g, "").length < 8) return json({ error: "missing" }, 400);
  if (!course) return json({ error: "course" }, 400);

  const code = await createAccessCode({ courseId: course.id, buyerName, buyerPhone, note, source: "admin" });
  if (!code) return json({ error: "server" }, 500);
  return json({ code, courseId: course.id, courseTitle: course.title, buyerName, buyerPhone, maxDevices: env.maxDevices });
}
