// Cloudflare Email Worker: receives mission emails sent to MISSION_EMAIL and posts them to the app for checking.
import PostalMime from "postal-mime";

export default {
  async email(message, env) {
    const email = await PostalMime.parse(message.raw);
    await fetch(`${env.APP_URL}/api/mission/inbound`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-inbound-secret": env.INBOUND_SECRET },
      body: JSON.stringify({
        from: email.from?.address || message.from,
        subject: email.subject ?? "",
        text: email.text ?? "",
        attachments: (email.attachments ?? []).map((a) => ({ filename: a.filename ?? "", contentType: a.mimeType ?? "" })),
      }),
    });
    // Optional: keep a copy in your own inbox.
    if (env.FORWARD_TO) await message.forward(env.FORWARD_TO);
  },
};
