// Cloudflare Email Worker: receives mission emails sent to MISSION_EMAIL (including mission+CODE@ addresses)
// and posts them to the app for checking. PDFs up to 2 MB are sent so the CV can be checked; the app
// reads them in memory and stores nothing.
import PostalMime from "postal-mime";

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
    await fetch(`${env.APP_URL}/api/mission/inbound`, {
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
    // Optional: keep a copy in your own inbox.
    if (env.FORWARD_TO) await message.forward(env.FORWARD_TO);
  },
};
