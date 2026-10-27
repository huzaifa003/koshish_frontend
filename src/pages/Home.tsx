import { ArrowDown, ArrowUpRight, Check, FileCheck2, HeartHandshake, LockKeyhole } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ImpactCharts } from "@/components/public/ImpactCharts";
import { ProjectIndex } from "@/components/public/ProjectIndex";
import { OpenLedger } from "@/components/public/OpenLedger";
import { EvidenceGallery } from "@/components/public/EvidenceGallery";
import { Logo } from "@/components/Logo";
import { usePortal } from "@/lib/portal-store";
import { formatNumber, formatPKR } from "@/lib/format";
import "../App.css";

export default function Home() {
  const { data, loading, mode } = usePortal();
  const verifiedDonations = data.donations.filter((item) => item.verified);
  const verifiedExpenses = data.expenses.filter((item) => item.verified);
  const raised = verifiedDonations.reduce((sum, item) => sum + item.amount, 0);
  const spent = verifiedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const reached = data.projects.reduce((sum, item) => sum + item.beneficiaries, 0);
  const proofs = data.evidence.filter((item) => item.visibility === "public").length;

  return (
    <div className="paper-noise min-h-[100dvh] bg-[#f3f0e6] text-[#11100e]">
      <PublicHeader />
      <main>
        <section className="relative mx-auto max-w-[1480px] px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="relative lg:col-span-7">
              <span className="vertical-label font-mono absolute -left-8 top-2 hidden text-[8px] uppercase tracking-[0.2em] text-[#777166] xl:block">Open books · Real work · Since 2021</span>
              <p className="font-mono mb-6 text-[10px] uppercase tracking-[0.18em] text-[#716c61]"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#f54e00]" />Five years of small, consistent effort</p>
              <h1 className="font-display text-balance text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.075em]">Small efforts.<br /><span className="text-[#f54e00]">Clearly</span> accounted<br />for.</h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-[#575349] md:text-lg md:leading-8">Koshish turns community support into practical help—and every rupee into a public record. Explore the projects, follow the money, inspect the proof.</p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href="#open-ledger" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#171612] px-6 text-sm font-bold text-[#f3f0e6] transition-colors hover:bg-[#f54e00]">Explore the open ledger <ArrowDown size={16} /></a>
                <a href={data.settings.donationUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full text-sm font-bold underline decoration-[#f54e00] decoration-2 underline-offset-8">Support the effort <ArrowUpRight size={16} /></a>
              </div>
            </div>
            <div className="lg:col-span-5 lg:pl-6">
              <div className="relative mt-2 overflow-hidden rounded-xl bg-[#f54e00] p-6 text-[#fff8ef] shadow-[12px_12px_0_#d9d2c3] md:p-8 lg:mt-10">
                <div className="dark-noise absolute inset-0 opacity-50" />
                <div className="relative">
                  <div className="flex items-center justify-between"><p className="font-mono text-[9px] uppercase tracking-[0.16em]">Total verified support</p><HeartHandshake size={22} /></div>
                  <p className="font-display numeric mt-12 text-[clamp(2.5rem,5vw,4.7rem)] font-semibold leading-none tracking-[-0.07em]">{formatPKR(raised, true)}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wider">{formatPKR(raised)}</p>
                  <div className="mt-12 grid grid-cols-2 gap-5 border-t border-white/35 pt-5">
                    <div><p className="font-mono text-[8px] uppercase tracking-wider text-[#fff1e5]">Applied to work</p><p className="font-display numeric mt-1 text-xl font-semibold">{formatPKR(spent, true)}</p></div>
                    <div><p className="font-mono text-[8px] uppercase tracking-wider text-[#fff1e5]">Available balance</p><p className="font-display numeric mt-1 text-xl font-semibold">{formatPKR(raised - spent, true)}</p></div>
                  </div>
                </div>
                <svg viewBox="0 0 160 160" className="absolute -bottom-10 -right-8 h-40 w-40 opacity-20" aria-hidden="true"><circle cx="80" cy="80" r="65" fill="none" stroke="white" strokeWidth="2" /><circle cx="80" cy="80" r="46" fill="none" stroke="white" strokeWidth="2" /><path d="M80 15v130M15 80h130" stroke="white" strokeWidth="2" /></svg>
              </div>
              <p className="mt-6 text-right font-mono text-[9px] uppercase tracking-[0.12em] text-[#716c61]">{mode === "demo" ? "Illustrative sample totals" : "Calculated from verified records"}</p>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 border-y border-[#bdb6a8] md:grid-cols-4">
            {[[String(data.projects.length).padStart(2, "0"), "Projects introduced"], [formatNumber(reached), "People reached*"], [String(verifiedDonations.length), "Verified donations"], [String(proofs).padStart(2, "0"), "Public proofs"]].map(([value, label], index) => <div key={label} className={`py-6 ${index % 2 === 1 ? "border-l border-[#bdb6a8] pl-5" : ""} ${index > 1 ? "border-t border-[#bdb6a8] md:border-t-0" : ""} ${index > 0 ? "md:border-l md:border-[#bdb6a8] md:pl-6" : ""}`}><p className="font-display numeric text-4xl font-semibold tracking-[-0.06em] md:text-5xl">{loading ? "—" : value}</p><p className="mt-2 text-xs font-semibold text-[#625e55]">{label}</p></div>)}
          </div>
          <p className="mt-3 text-[10px] text-[#716c61]">*People reached is the sum of reported project reach and may include repeat support across initiatives.</p>
        </section>

        <ImpactCharts />
        <ProjectIndex />
        <OpenLedger />
        <EvidenceGallery />

        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4"><p className="font-mono mb-4 text-[10px] uppercase tracking-[0.18em] text-[#716c61]">Our accountability practice</p><h2 className="font-display text-4xl font-semibold leading-[1.04] tracking-[-0.05em]">Trust is a habit,<br />not a headline.</h2></div>
            <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
              {[[<FileCheck2 key="icon" size={23} />, "Record first", "Every donation and expense receives a date, reference, project allocation and verification status."], [<LockKeyhole key="icon" size={23} />, "Publish responsibly", "Financial records stay open while donor consent and recipient privacy remain protected."], [<Check key="icon" size={23} />, "Reconcile visibly", "Public totals come directly from the same verified entries available in the open ledger."]].map(([icon, title, copy]) => <div key={String(title)} className="border-t-2 border-[#171612] pt-5"><span className="text-[#f54e00]">{icon}</span><h3 className="font-display mt-5 text-xl font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#625e55]">{copy}</p></div>)}
            </div>
          </div>
        </section>
      </main>
      <footer className="dark-noise overflow-hidden bg-[#171612] px-5 pb-8 pt-16 text-[#f3f0e6] md:px-8 md:pt-20 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><Logo inverse /><p className="mt-6 max-w-md text-sm leading-7 text-[#b9b4a8]">A community effort built on the belief that good intentions deserve clear records.</p></div><a href={data.settings.donationUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[52px] w-fit items-center gap-3 rounded-full bg-[#f54e00] px-7 text-sm font-bold text-white transition-colors hover:bg-[#d94100]">Support Koshish <ArrowUpRight size={17} /></a></div>
          <div className="font-display pointer-events-none mt-14 select-none whitespace-nowrap text-[clamp(5.5rem,18vw,16rem)] font-bold leading-[0.72] tracking-[-0.09em] text-[#292721]">koshish.</div>
          <div className="mt-10 flex flex-col gap-4 border-t border-[#45423b] pt-6 font-mono text-[9px] uppercase tracking-[0.1em] text-[#989387] sm:flex-row sm:items-center sm:justify-between"><span>© 2021–2026 Koshish · Transparency by default</span><div className="flex gap-5"><a href={data.settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-[#f54e00]">Instagram ↗</a><a href="#open-ledger" className="hover:text-[#f54e00]">Open ledger ↑</a></div></div>
        </div>
      </footer>
    </div>
  );
}
