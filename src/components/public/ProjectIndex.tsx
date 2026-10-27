import { useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { ProjectArtwork } from "@/components/ProjectArtwork";
import { usePortal } from "@/lib/portal-store";
import { formatNumber, formatPKR } from "@/lib/format";

export function ProjectIndex() {
  const { data } = usePortal();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [expanded, setExpanded] = useState<string | null>(data.projects[0]?.id ?? null);
  const projects = data.projects.filter((project) => filter === "all" || project.status === filter);
  const totals = useMemo(() => Object.fromEntries(data.projects.map((project) => {
    const raised = data.donations.filter((d) => d.verified && d.projectId === project.id).reduce((sum, d) => sum + d.amount, 0);
    const spent = data.expenses.filter((e) => e.verified && e.projectId === project.id).reduce((sum, e) => sum + e.amount, 0);
    return [project.id, { raised, spent }];
  })), [data.projects, data.donations, data.expenses]);

  const openInLedger = (projectId: string) => {
    window.dispatchEvent(new CustomEvent("koshish:project-filter", { detail: projectId }));
    document.getElementById("open-ledger")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="projects" className="dark-noise bg-[#171612] px-5 py-20 text-[#f3f0e6] md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8"><p className="font-mono mb-5 text-[10px] uppercase tracking-[0.18em] text-[#a8a397]">Under the Koshish umbrella</p><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">Different needs.<br />One accountable effort.</h2></div>
          <div className="flex items-end lg:col-span-4"><p className="max-w-md text-sm leading-7 text-[#b9b4a8]">Every initiative has its own purpose, funding trail and public record. Open a project to see its complete financial picture.</p></div>
        </div>
        <div className="no-scrollbar mt-12 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter projects">
          {(["all", "active", "completed"] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-11 shrink-0 rounded-full border px-5 text-xs font-semibold capitalize transition-colors ${filter === item ? "border-[#f54e00] bg-[#f54e00] text-white" : "border-[#4a4740] text-[#c6c1b5] hover:border-[#8e887b]"}`}>{item === "all" ? `All projects (${data.projects.length})` : item}</button>)}
        </div>
        <div className="mt-7 border-t border-[#45423b]">
          {projects.map((project) => {
            const isOpen = expanded === project.id;
            const projectTotals = totals[project.id] ?? { raised: 0, spent: 0 };
            const evidenceCount = data.evidence.filter((item) => item.visibility === "public" && item.projectId === project.id).length;
            return <article key={project.id} className="border-b border-[#45423b]">
              <button type="button" onClick={() => setExpanded(isOpen ? null : project.id)} aria-expanded={isOpen} className="group grid w-full grid-cols-[36px_1fr_auto] items-center gap-3 py-6 text-left md:grid-cols-[52px_1.4fr_1fr_auto] md:gap-5 md:py-8">
                <span className="font-mono text-[10px] text-[#8f8a7e]">{String(data.projects.indexOf(project) + 1).padStart(2, "0")}</span>
                <span><span className="font-display block text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-[#f54e00] md:text-4xl">{project.title}</span><span className="mt-1 block text-xs text-[#a8a397] md:hidden">{project.category}</span></span>
                <span className="hidden max-w-md text-xs leading-6 text-[#aaa599] md:block">{project.summary}</span>
                <span className={`grid h-10 w-10 place-items-center rounded-full border transition-all ${isOpen ? "rotate-180 border-[#f54e00] bg-[#f54e00]" : "border-[#514d45] group-hover:border-[#f54e00]"}`}><ArrowDown size={16} /></span>
              </button>
              {isOpen && <div className="grid gap-7 pb-9 md:grid-cols-12 md:pl-[72px]">
                <ProjectArtwork type={project.art} className="h-[230px] rounded-lg md:col-span-5 md:h-[290px]" />
                <div className="flex flex-col justify-between md:col-span-7 md:pl-4">
                  <div><div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#b4afa3]"><span className="text-[#f58a58]">{project.category}</span><span className="flex items-center gap-1"><MapPin size={11} />{project.location}</span><span>{project.status}</span></div><p className="max-w-2xl text-sm leading-7 text-[#c7c2b6]">{project.description}</p></div>
                  <div className="mt-7 grid grid-cols-2 gap-y-5 border-t border-[#45423b] pt-5 sm:grid-cols-4">
                    <div><p className="font-mono text-[8px] uppercase tracking-wider text-[#8f8a7e]">Received</p><p className="font-display numeric mt-1 text-lg font-semibold">{formatPKR(projectTotals.raised, true)}</p></div>
                    <div><p className="font-mono text-[8px] uppercase tracking-wider text-[#8f8a7e]">Spent</p><p className="font-display numeric mt-1 text-lg font-semibold">{formatPKR(projectTotals.spent, true)}</p></div>
                    <div><p className="font-mono text-[8px] uppercase tracking-wider text-[#8f8a7e]">People reached</p><p className="font-display numeric mt-1 text-lg font-semibold">{formatNumber(project.beneficiaries)}</p></div>
                    <div><p className="font-mono text-[8px] uppercase tracking-wider text-[#8f8a7e]">Public proofs</p><p className="font-display numeric mt-1 text-lg font-semibold">{evidenceCount}</p></div>
                  </div>
                  <button type="button" onClick={() => openInLedger(project.id)} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 text-xs font-bold text-[#f58a58] hover:text-[#f3f0e6]">View project ledger <ArrowUpRight size={15} /></button>
                </div>
              </div>}
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
