"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/I18n";
import { cvFileName, type CvData } from "@/lib/cv/model";

/** Builds and downloads Firstname_Lastname_CV.pdf, loading the PDF library only when needed. */
export function useCvExport() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [pages, setPages] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Fetch the PDF tool in the background as soon as an export screen opens, so the download
  // starts right after the tap (on slow networks, a late download can be blocked by the phone).
  useEffect(() => {
    const id = setTimeout(() => {
      import("./pdf").catch(() => {});
    }, 1500);
    return () => clearTimeout(id);
  }, []);

  async function exportCv(cv: CvData): Promise<number | null> {
    setBusy(true);
    setError(false);
    try {
      const { makeCvPdf, saveFile } = await import("./pdf");
      const { blob, pages } = await makeCvPdf(cv, {
        sections: t.cv.sections,
        skillLevels: t.cv.skillLevels,
        languageLevels: t.cv.languageLevels,
        dob: t.cv.dob,
        marital: t.cv.marital,
        present: t.cv.present,
      });
      const name = cvFileName(cv.header.fullName);
      saveFile(blob, name);
      setPages(pages);
      setFileName(name);
      return pages;
    } catch (e) {
      console.error("CV export failed", e);
      setError(true);
      return null;
    } finally {
      setBusy(false);
    }
  }

  return { exportCv, busy, pages, fileName, error };
}
