"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { emptyCv, parseCv, type CvData } from "@/lib/cv/model";

export type CvStatus = "loading" | "saved" | "saving" | "offline" | "unavailable";

type CvContextValue = {
  courseId: string;
  cv: CvData;
  status: CvStatus;
  /** Every change is saved automatically (debounced), and kept on the phone until the server has it. */
  update: (fn: (cv: CvData) => CvData) => void;
  remove: () => Promise<boolean>;
  reload: () => void;
};

const CvCtx = createContext<CvContextValue | null>(null);

/** Null outside courses that build the CV. */
export function useCv() {
  return useContext(CvCtx);
}

const SAVE_DELAY = 900;

function readLocal(key: string): CvData | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? parseCv(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, cv: CvData | null) {
  try {
    if (cv) localStorage.setItem(key, JSON.stringify(cv));
    else localStorage.removeItem(key);
  } catch {}
}

export function CvProvider({ courseId, children }: { courseId: string; children: React.ReactNode }) {
  const [cv, setCv] = useState<CvData>(emptyCv);
  const [status, setStatus] = useState<CvStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<CvData>(cv);
  const pendingKey = "tsn_cv_pending";
  const cacheKey = "tsn_cv_cache";

  const push = useCallback(
    async (data: CvData, keepalive = false) => {
      setStatus("saving");
      try {
        const res = await fetch("/api/cv", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, cv: data }),
          keepalive,
        });
        if (res.status === 503) return setStatus("unavailable");
        if (!res.ok) throw new Error(String(res.status));
        if (latest.current === data) writeLocal(pendingKey, null);
        writeLocal(cacheKey, data);
        setStatus("saved");
      } catch {
        setStatus("offline");
      }
    },
    [courseId],
  );

  // Load: server copy, unless this phone has unsaved changes from an earlier offline session.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/cv?course=${courseId}`)
      .then(async (res) => {
        if (cancelled) return;
        const pending = readLocal(pendingKey);
        if (res.status === 503) {
          setCv(pending ?? readLocal(cacheKey) ?? emptyCv());
          return setStatus("unavailable");
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const server = parseCv(data.cv);
        const start = pending ?? server;
        latest.current = start;
        setCv(start);
        writeLocal(cacheKey, server);
        setStatus("saved");
        if (pending) push(pending);
      })
      .catch(() => {
        if (cancelled) return;
        setCv(readLocal(pendingKey) ?? readLocal(cacheKey) ?? emptyCv());
        setStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, reloadKey, push]);

  // Autosave after each change.
  useEffect(() => {
    latest.current = cv;
    if (!dirty.current) return;
    writeLocal(pendingKey, cv);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      dirty.current = false;
      push(cv);
    }, SAVE_DELAY);
  }, [cv, push]);

  // Save immediately when the app is hidden or the connection comes back.
  useEffect(() => {
    const flush = () => {
      const pending = readLocal(pendingKey);
      if (pending) push(pending, true);
    };
    const onHide = () => document.visibilityState === "hidden" && flush();
    window.addEventListener("online", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("online", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [push]);

  const update = useCallback((fn: (cv: CvData) => CvData) => {
    dirty.current = true;
    setCv((prev) => fn(prev));
  }, []);

  const remove = useCallback(async () => {
    const res = await fetch("/api/cv", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    }).catch(() => null);
    if (!res?.ok) return false;
    dirty.current = false;
    if (timer.current) clearTimeout(timer.current);
    writeLocal(pendingKey, null);
    writeLocal(cacheKey, null);
    setCv(emptyCv());
    return true;
  }, [courseId]);

  return (
    <CvCtx.Provider value={{ courseId, cv, status, update, remove, reload: () => setReloadKey((k) => k + 1) }}>{children}</CvCtx.Provider>
  );
}
