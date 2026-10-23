import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18n";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ErrorReporter } from "@/components/ErrorReporter";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return {
    title: t.appName,
    description: t.landing.promise,
    applicationName: t.appName,
    appleWebApp: { capable: true, title: t.appName, statusBarStyle: "default" },
    icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="min-h-dvh antialiased">
        <I18nProvider dict={getDict(locale)} locale={locale}>
          {children}
        </I18nProvider>
        <ServiceWorker />
        <ErrorReporter />
      </body>
    </html>
  );
}
