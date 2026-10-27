import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Download, Paperclip, Search } from "lucide-react";
import { usePortal } from "@/lib/portal-store";
import { donorLabel, downloadCSV, formatDate, formatPKR, getProjectName } from "@/lib/format";

export function OpenLedger() {
  const { data } = usePortal();
  const [kind, setKind] = useState("all");
  const [year, setYear] = useState("all");
  const [project, setProject] = useState("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const listener = (event: Event) => {
      setProject((event as CustomEvent<string>).detail);
      setKind("all");
    };
    window.addEventListener("koshish:project-filter", listener);
    return () => window.removeEventListener("koshish:project-filter", listener);
  }, []);

  const entries = useMemo(() => [
    ...data.donations.filter((item) => item.verified).map((item) => ({ kind: "donation" as const, id: item.id, date: item.receivedOn, amount: item.amount, title: donorLabel(item), detail: `${item.source} · ${item.method}`, projectId: item.projectId, reference: item.reference, evidence: 0 })),
    ...data.expenses.filter((item) => item.verified).map((item) => ({ kind: "expense" as const, id: item.id, date: item.spentOn, amount: item.amount, title: item.vendor, detail: `${item.category} · ${item.description}`, projectId: item.projectId, reference: item.reference, evidence: data.evidence.filter((proof) => proof.visibility === "public" && proof.expenseId === item.id).length })),
  ].sort((a, b) => b.date.localeCompare(a.date)), [data.donations, data.expenses, data.evidence]);

  const years = useMemo(() => Array.from(new Set(entries.map((entry) => entry.date.slice(0, 4)))).sort().reverse(), [entries]);
  const filtered = entries.filter((entry) => {
    const query = search.toLowerCase().trim();
    return (kind === "all" || entry.kind === kind) && (year === "all" || entry.date.startsWith(year)) && (project === "all" || entry.projectId === project) && (!query || `${entry.title} ${entry.detail} ${entry.reference} ${getProjectName(data.projects, entry.projectId)}`.toLowerCase().includes(query));
  });
  const visible = showAll ? filtered : filtered.slice(0, 10);
  const incoming = filtered.filter((entry) => entry.kind === "donation").reduce((sum, entry) => sum + entry.amount, 0);
  const outgoing = filtered.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);

  const exportLedger = () => downloadCSV(`koshish-open-ledger-${new Date().toISOString().slice(0, 10)}.csv`, [
    ["Date", "Type", "Party / donor", "Details", "Project", "Reference", "Amount PKR", "Public proofs"],
    ...filtered.map((entry) => [entry.date, entry.kind, entry.title, entry.detail, getProjectName(data.projects, entry.projectId), entry.reference, entry.kind === "expense" ? -entry.amount : entry.amount, entry.evidence]),
  ]);

  return (
    <section id="open-ledger" className="mx-auto max-w-[1480px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8"><p className="font-mono mb-4 text-[10px] uppercase tracking-[0.18em] text-[#716c61]">Open books / Line by line</p><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">The ledger is the story.</h2></div>
        <div className="lg:col-span-4"><p className="max-w-md text-sm leading-7 text-[#625e55]">Donor names stay private unless explicit display consent is recorded. Amounts, dates, sources and spending remain open.</p></div>
      </div>
      <div className="mt-12 grid gap-3 border-y border-[#bdb6a8] py-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr_auto]">
        <label className="relative"><span className="sr-only">Search ledger</span><Search className="absolute left-3 top-3.5 text-[#777166]" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendor, source, reference…" className="min-h-11 w-full rounded-md border border-[#c4bdae] bg-[#f8f5ed] pl-10 pr-3 text-xs placeholder:text-[#777166]" /></label>
        <select aria-label="Filter transaction type" value={kind} onChange={(event) => setKind(event.target.value)} className="min-h-11 rounded-md border border-[#c4bdae] bg-[#f8f5ed] px-3 text-xs"><option value="all">All transactions</option><option value="donation">Donations only</option><option value="expense">Expenses only</option></select>
        <select aria-label="Filter ledger year" value={year} onChange={(event) => setYear(event.target.value)} className="min-h-11 rounded-md border border-[#c4bdae] bg-[#f8f5ed] px-3 text-xs"><option value="all">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter ledger project" value={project} onChange={(event) => setProject(event.target.value)} className="min-h-11 rounded-md border border-[#c4bdae] bg-[#f8f5ed] px-3 text-xs"><option value="all">All projects + general fund</option>{data.projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
        <button type="button" onClick={exportLedger} disabled={!filtered.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#171612] px-4 text-xs font-bold text-[#f3f0e6] transition-colors hover:bg-[#f54e00] disabled:opacity-40"><Download size={15} />Export CSV</button>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#69645a]"><span>{filtered.length} records</span><span>In <b className="text-[#1e1c18]">{formatPKR(incoming)}</b></span><span>Out <b className="text-[#1e1c18]">{formatPKR(outgoing)}</b></span></div>

      <div className="mt-7 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead><tr className="border-b border-[#aaa396] font-mono text-[9px] uppercase tracking-[0.12em] text-[#716c61]"><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 pr-4 font-medium">Transaction</th><th className="pb-3 pr-4 font-medium">Project</th><th className="pb-3 pr-4 font-medium">Reference</th><th className="pb-3 text-right font-medium">Amount (PKR)</th></tr></thead>
          <tbody>{visible.map((entry) => <tr key={`${entry.kind}-${entry.id}`} className="border-b border-[#d3ccbd] align-top transition-colors hover:bg-[#ece7db]">
            <td className="whitespace-nowrap py-5 pr-4 font-mono text-[10px] text-[#625e55]">{formatDate(entry.date)}</td>
            <td className="max-w-md py-5 pr-4"><div className="flex items-start gap-3"><span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${entry.kind === "donation" ? "bg-[#f54e00] text-white" : "bg-[#ded8ca]"}`}>{entry.kind === "donation" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}</span><div><p className="text-sm font-bold">{entry.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#69645a]">{entry.detail}</p>{entry.evidence > 0 && <span className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-[#625e55]"><Paperclip size={11} />{entry.evidence} public proof{entry.evidence > 1 ? "s" : ""}</span>}</div></div></td>
            <td className="max-w-48 py-5 pr-4 text-xs leading-5">{getProjectName(data.projects, entry.projectId)}</td>
            <td className="py-5 pr-4 font-mono text-[10px] text-[#69645a]">{entry.reference}</td>
            <td className={`whitespace-nowrap py-5 text-right font-display numeric text-lg font-semibold ${entry.kind === "donation" ? "text-[#d94100]" : ""}`}>{entry.kind === "donation" ? "+" : "−"}{formatNumberWithoutCurrency(entry.amount)}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="mt-6 divide-y divide-[#cec7b8] border-y border-[#bdb6a8] md:hidden">{visible.map((entry) => <article key={`${entry.kind}-${entry.id}`} className="py-5"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-wider text-[#716c61]">{formatDate(entry.date)} · {entry.kind}</p><h3 className="mt-2 text-sm font-bold">{entry.title}</h3></div><p className={`font-display numeric whitespace-nowrap text-lg font-semibold ${entry.kind === "donation" ? "text-[#d94100]" : ""}`}>{entry.kind === "donation" ? "+" : "−"}{formatPKR(entry.amount).replace("PKR ", "")}</p></div><p className="mt-2 text-xs leading-5 text-[#69645a]">{entry.detail}</p><p className="mt-2 text-xs font-semibold">{getProjectName(data.projects, entry.projectId)}</p><p className="mt-1 font-mono text-[9px] text-[#716c61]">{entry.reference}</p></article>)}</div>
      {!visible.length && <div className="border-b border-[#bdb6a8] py-16 text-center"><p className="font-display text-2xl font-semibold">No matching records.</p><button type="button" onClick={() => { setKind("all"); setYear("all"); setProject("all"); setSearch(""); }} className="mt-3 min-h-11 text-sm font-bold text-[#d94100] underline">Clear all filters</button></div>}
      {filtered.length > 10 && <button type="button" onClick={() => setShowAll((value) => !value)} className="mx-auto mt-8 flex min-h-12 items-center gap-2 rounded-full border border-[#aaa396] px-6 text-xs font-bold transition-colors hover:border-[#f54e00] hover:text-[#d94100]">{showAll ? "Show recent records" : `View all ${filtered.length} records`}<ArrowDownLeft className={showAll ? "rotate-180" : ""} size={15} /></button>}
    </section>
  );
}

const formatNumberWithoutCurrency = (value: number) => new Intl.NumberFormat("en-PK").format(value);
