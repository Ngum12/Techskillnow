"use client";
import { useState } from "react";
import { useT } from "./I18n";

type Props = { name: string; course: string; date: string; scoreLine: string; missionLine: string; id: string; qr: boolean[][] };

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Fits text on one line by shrinking the font if needed. */
function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, weight: string, size: number, maxWidth: number) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
    s -= 2;
  } while (ctx.measureText(text).width > maxWidth && s > 14);
  ctx.fillText(text, x, y);
}

async function drawCertificate(t: ReturnType<typeof useT>, p: Props): Promise<Blob | null> {
  const W = 1200, H = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#fdfbf6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#1d5440";
  ctx.lineWidth = 12;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  const badge = await loadImage("/illustrations/certificate-badge.webp");
  if (badge) ctx.drawImage(badge, W / 2 - 75, 80, 150, 150);

  const cx = W / 2, max = W - 200;
  ctx.textAlign = "center";
  ctx.fillStyle = "#4f5a54";
  fitText(ctx, t.certificate.title.toUpperCase(), cx, 270, "600", 28, max);
  fitText(ctx, t.certificate.awarded, cx, 335, "400", 30, max);
  ctx.fillStyle = "#17201b";
  fitText(ctx, p.name, cx, 410, "700", 60, max);
  ctx.fillStyle = "#4f5a54";
  fitText(ctx, t.certificate.completed, cx, 470, "400", 30, max);
  ctx.fillStyle = "#1d5440";
  fitText(ctx, p.course, cx, 535, "700", 48, max);
  ctx.fillStyle = "#17201b";
  fitText(ctx, p.scoreLine, cx, 595, "600", 28, max);
  if (p.missionLine) fitText(ctx, `✓ ${p.missionLine}`, cx, 635, "400", 24, max);

  // Footer: date and ID on the left, QR code to the verification page on the right.
  ctx.textAlign = "left";
  ctx.fillStyle = "#4f5a54";
  fitText(ctx, p.date, 110, 720, "400", 26, 700);
  fitText(ctx, t.certificate.id.replace("{id}", p.id), 110, 760, "400", 24, 700);
  ctx.fillStyle = "#17201b";
  fitText(ctx, t.appName, 110, 800, "700", 28, 700);

  const size = 170, n = p.qr.length, cell = size / (n + 4), qx = W - 110 - size, qy = 650;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qx, qy, size, size);
  ctx.fillStyle = "#17201b";
  p.qr.forEach((row, r) => row.forEach((dark, c) => dark && ctx.fillRect(qx + (c + 2) * cell, qy + (r + 2) * cell, Math.ceil(cell), Math.ceil(cell))));
  ctx.textAlign = "center";
  ctx.fillStyle = "#4f5a54";
  fitText(ctx, t.certificate.verify, qx + size / 2, qy + size + 28, "400", 20, size + 40);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export function ShareCertificate(props: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const fileName = `${t.appName}-${props.id}.png`;

  async function share() {
    setBusy(true);
    const blob = await drawCertificate(t, props);
    setBusy(false);
    if (!blob) return;
    const file = new File([blob], fileName, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: t.certificate.title, text: `${props.course} – ${t.appName}` });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    // Fallback: offer the image as a download.
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    a.click();
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button type="button" className="btn btn-primary w-full" onClick={share} disabled={busy}>
        {busy ? t.certificate.preparing : t.certificate.share}
      </button>
      {url && (
        <a href={url} download={fileName} className="btn btn-ghost w-full">
          {t.certificate.download}
        </a>
      )}
    </div>
  );
}
