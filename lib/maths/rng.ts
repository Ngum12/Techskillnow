/** Seeded randomness for question generators: the same seed always gives the same question. */
export type Rng = {
  next: () => number;
  int: (lo: number, hi: number) => number;
  /** A non-zero integer in [lo, hi]. */
  nz: (lo: number, hi: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
  /** k different integers from [lo, hi], optionally excluding some. */
  distinct: (k: number, lo: number, hi: number, exclude?: number[]) => number[];
};

export function makeRng(seed: number): Rng {
  let a = seed >>> 0 || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  const rng: Rng = {
    next,
    int,
    nz: (lo, hi) => {
      for (;;) {
        const v = int(lo, hi);
        if (v !== 0) return v;
      }
    },
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffle: (items) => {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    distinct: (k, lo, hi, exclude = []) => {
      const out: number[] = [];
      for (let guard = 0; out.length < k && guard < 1000; guard++) {
        const v = int(lo, hi);
        if (!out.includes(v) && !exclude.includes(v)) out.push(v);
      }
      return out;
    },
  };
  return rng;
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
