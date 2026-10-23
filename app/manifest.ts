import type { MetadataRoute } from "next";
import { getDict } from "@/lib/i18n";

export default function manifest(): MetadataRoute.Manifest {
  const t = getDict();
  return {
    name: t.appName,
    short_name: t.appName,
    description: t.landing.promise,
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf6",
    theme_color: "#4338ca",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
