// Cloudflare Email Worker: receives mission emails sent to MISSION_EMAIL (including mission+CODE@ addresses)
// and posts them to the app for checking. PDFs up to 2 MB are sent so the CV can be checked; the app
// reads them in memory and stores nothing. When the app returns a `reply` (course 3: the recruiter
// answers a correct application), it is sent back to the learner as a reply to their email.
import PostalMime from "postal-mime";
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const MAX_PDF = 2 * 1024 * 1024;

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export default {
  async email(message, env) {
    const email = await PostalMime.parse(message.raw);
    const attachments = (email.attachments ?? []).map((a) => {
      const filename = a.filename ?? "";
      const isPdf = a.mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
      const size = a.content?.byteLength ?? 0;
      return {
        filename,
        contentType: a.mimeType ?? "",
        size,
        content: isPdf && size > 0 && size <= MAX_PDF ? toBase64(a.content) : undefined,
      };
    });
    const res = await fetch(`${env.APP_URL}/api/mission/inbound`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-inbound-secret": env.INBOUND_SECRET },
      body: JSON.stringify({
        from: email.from?.address || message.from,
        to: message.to,
        subject: email.subject ?? "",
        text: email.text ?? "",
        attachments,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.reply) {
      try {
        const msg = createMimeMessage();
        msg.setSender({ name: data.reply.from, addr: message.to });
        msg.setRecipient(message.from);
        msg.setSubject(data.reply.subject);
        const id = message.headers.get("Message-ID");
        if (id) {
          msg.setHeader("In-Reply-To", id);
          msg.setHeader("References", id);
        }
        msg.addMessage({ contentType: "text/plain", data: data.reply.text });
        await message.reply(new EmailMessage(message.to, message.from, msg.asRaw()));
      } catch (e) {
        // The learner also sees the reply in the app, so a failed send is not fatal.
        console.error("reply failed", e);
      }
    }
    // Optional: keep a copy in your own inbox.
    if (env.FORWARD_TO) await message.forward(env.FORWARD_TO);
  },
};
