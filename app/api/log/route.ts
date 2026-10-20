import { readJson } from "@/lib/http";

export async function POST(req: Request) {
  const body = await readJson<{ message: string; stack: string; url: string; ua: string }>(req);
  console.error("[client error]", String(body.url ?? "").slice(0, 200), String(body.message ?? "").slice(0, 500), {
    stack: String(body.stack ?? "").slice(0, 2000),
    ua: String(body.ua ?? "").slice(0, 200),
  });
  return new Response(null, { status: 204 });
}
