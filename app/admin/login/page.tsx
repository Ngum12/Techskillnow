import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-auth";
import { getDict } from "@/lib/i18n";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const t = getDict();
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <p className="font-bold text-primary">{t.appName}</p>
      <h1 className="mt-4 text-2xl font-bold">{t.admin.loginTitle}</h1>
      {error === "link" && (
        <p role="alert" className="mt-4 rounded-xl bg-err-soft p-4 text-err">
          {t.admin.linkFailed}
        </p>
      )}
      <LoginForm />
    </main>
  );
}
