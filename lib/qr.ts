import "server-only";
import qrcode from "qrcode-generator";

/** QR code as a matrix of dark (true) / light (false) modules. */
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** SVG path data for the dark modules (1 unit per module), for a crisp, tiny inline SVG. */
export function qrPath(matrix: boolean[][]): string {
  let d = "";
  matrix.forEach((row, r) => row.forEach((dark, c) => dark && (d += `M${c} ${r}h1v1h-1z`)));
  return d;
}
