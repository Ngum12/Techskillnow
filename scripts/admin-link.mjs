// Prints a one-time admin sign-in link without sending an email (avoids Supabase's email rate limit).
// Usage: npm run admin-link            (link back to APP_URL)
//        npm run admin-link -- http://localhost:3000
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const appUrl = (process.argv[2] ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
if (!url || !key || !email) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL in .env.local first.");
  process.exit(1);
}
const res = await fetch(`${url}/auth/v1/admin/generate_link`, {
  method: "POST",
  headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ type: "magiclink", email, redirect_to: `${appUrl}/auth/confirm` }),
});
const data = await res.json();
const link = data.action_link ?? data.properties?.action_link;
if (!res.ok || !link) {
  console.error("Could not create a link:", data.msg ?? data.message ?? res.status);
  process.exit(1);
}
console.log(`\nOpen this link to sign in as ${email} (single use, expires in about an hour):\n\n${link}\n`);
