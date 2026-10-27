import { useState } from "react";
import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePortal } from "@/lib/portal-store";
import { formatDate, formatPKR, getProjectName } from "@/lib/format";
import type { EvidenceItem } from "@/types";

export function EvidenceGallery() {
  const { data } = usePortal();
  const [selected, setSelected] = useState<EvidenceItem | null>(null);
  const evidence = data.evidence.filter((item) => item.visibility === "public");
  const linkedExpense = selected?.expenseId ? data.expenses.find((item) => item.id === selected.expenseId) : null;

  return (
    <section id="evidence" className="border-t border-[#c8c1b3] bg-[#e9e4d8] px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8"><p className="font-mono mb-4 text-[10px] uppercase tracking-[0.18em] text-[#716c61]">Receipts, field notes & proof</p><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">Not just said.<br /><span className="text-[#f54e00]">Shown.</span></h2></div>
          <div className="lg:col-span-4"><div className="flex gap-3"><ShieldCheck className="mt-1 shrink-0 text-[#f54e00]" size={20} /><p className="text-sm leading-7 text-[#625e55]">Public documents exclude recipient identities and sensitive payment details. Internal-only files remain behind team access.</p></div></div>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {evidence.map((item, index) => <button key={item.id} type="button" onClick={() => setSelected(item)} className={`group overflow-hidden rounded-lg border border-[#c2bbad] bg-[#f3f0e6] text-left transition-transform duration-200 hover:-translate-y-1 ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden border-b border-[#c2bbad] bg-[#ded8ca]">{item.mimeType === "application/pdf" ? <div className="grid h-full place-items-center"><FileText size={44} /></div> : <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />}<span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#171612] text-[#f3f0e6] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ArrowUpRight size={16} /></span></div>
            <div className="p-5"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#716c61]">{getProjectName(data.projects, item.projectId)} / {formatDate(item.capturedOn)}</p><h3 className="font-display mt-2 text-xl font-semibold tracking-[-0.03em]">{item.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#69645a]">{item.description}</p></div>
          </button>)}
        </div>
        {!evidence.length && <p className="mt-10 border-y border-[#c2bbad] py-12 text-center text-sm">No public evidence has been published yet.</p>}
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92dvh] max-w-4xl overflow-y-auto border-[#bdb6a8] bg-[#f3f0e6] p-0">
          {selected && <><DialogHeader className="border-b border-[#c8c1b3] p-6 text-left"><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#716c61]">Sample evidence in preview · Public proof</p><DialogTitle className="font-display text-2xl tracking-[-0.04em]">{selected.title}</DialogTitle><DialogDescription className="text-xs leading-6 text-[#625e55]">{selected.description}</DialogDescription></DialogHeader>
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_220px]">
              <div className="overflow-hidden rounded-md border border-[#c8c1b3] bg-[#ded8ca]">{selected.mimeType === "application/pdf" ? <iframe src={selected.url} title={selected.title} className="h-[55dvh] w-full" /> : <img src={selected.url} alt={`Evidence: ${selected.title}`} className="max-h-[60dvh] w-full object-contain" />}</div>
              <aside className="text-xs"><dl className="space-y-4"><div><dt className="font-mono text-[9px] uppercase text-[#716c61]">Project</dt><dd className="mt-1 font-semibold">{getProjectName(data.projects, selected.projectId)}</dd></div><div><dt className="font-mono text-[9px] uppercase text-[#716c61]">Document date</dt><dd className="mt-1 font-semibold">{formatDate(selected.capturedOn, true)}</dd></div>{linkedExpense && <div><dt className="font-mono text-[9px] uppercase text-[#716c61]">Linked expense</dt><dd className="mt-1 font-semibold">{formatPKR(linkedExpense.amount)}</dd><dd className="mt-1 text-[#69645a]">{linkedExpense.reference}</dd></div>}</dl><a href={selected.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[#d94100] underline">Open original <ArrowUpRight size={14} /></a></aside>
            </div></>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
