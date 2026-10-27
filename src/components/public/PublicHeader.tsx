import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "@/components/Logo";
import { usePortal } from "@/lib/portal-store";

const links = [["Impact", "#impact"], ["Projects", "#projects"], ["Open ledger", "#open-ledger"], ["Evidence", "#evidence"]];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { data, mode } = usePortal();
  return (
    <>
      {mode === "demo" && <div className="bg-[#171612] px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8d3c6]">Interactive preview · Sample records · Not real financial data</div>}
      <header className="sticky top-0 z-40 border-b border-[#c9c3b5] bg-[#f3f0e6]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between px-5 md:px-8 lg:px-12">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Public navigation">
            {links.map(([label, href]) => <a key={href} href={href} className="rounded-sm text-[13px] font-semibold text-[#4d4941] transition-colors hover:text-[#f54e00]">{label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/internal" className="hidden rounded-full px-4 py-2 text-[13px] font-semibold text-[#4d4941] transition-colors hover:bg-[#e8e3d7] sm:block">Internal portal</Link>
            <a href={data.settings.donationUrl} target="_blank" rel="noreferrer" className="hidden min-h-11 items-center gap-2 rounded-full bg-[#f54e00] px-5 text-[13px] font-bold text-[#fff8ef] transition-colors hover:bg-[#d94100] sm:inline-flex">Support Koshish <ArrowUpRight size={15} /></a>
            <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-[#bdb6a8] lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        {open && <div className="border-t border-[#c9c3b5] bg-[#f3f0e6] px-5 py-5 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="border-b border-[#d4cec0] py-3 font-display text-xl font-semibold">{label}</a>)}
            <Link to="/internal" className="py-4 text-sm font-semibold">Internal portal →</Link>
            <a href={data.settings.donationUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f54e00] px-5 text-sm font-bold text-[#fff8ef]">Support Koshish <ArrowUpRight size={16} /></a>
          </nav>
        </div>}
      </header>
    </>
  );
}
