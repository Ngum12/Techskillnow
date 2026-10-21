/** Checks a paper application file (dossier) against the documents an advert asks for. */

export type DossierPick = { id: string; copies: number };
export type DossierResult = {
  missing: string[];
  extra: string[];
  copies: { id: string; want: number; got: number }[];
  /** True when the requested documents are not in the order the advert lists them. */
  order: boolean;
};

export function checkDossier(picked: DossierPick[], required: DossierPick[]): DossierResult {
  const want = new Map(required.map((r) => [r.id, r.copies]));
  const got = new Map(picked.map((p) => [p.id, p.copies]));
  const missing = required.filter((r) => !got.has(r.id)).map((r) => r.id);
  const extra = picked.filter((p) => !want.has(p.id)).map((p) => p.id);
  const copies = required.filter((r) => got.has(r.id) && got.get(r.id) !== r.copies).map((r) => ({ id: r.id, want: r.copies, got: got.get(r.id)! }));
  // Order: the requested items that were picked must appear in the advert's order.
  const pickedOrder = picked.map((p) => p.id).filter((id) => want.has(id));
  const expectedOrder = required.map((r) => r.id).filter((id) => got.has(id));
  const order = pickedOrder.join() !== expectedOrder.join();
  return { missing, extra, copies, order };
}

export function dossierOk(r: DossierResult): boolean {
  return !r.missing.length && !r.extra.length && !r.copies.length && !r.order;
}
