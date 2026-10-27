import { Link } from "react-router";

export function Logo({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <Link to="/" aria-label="Koshish home" className="group inline-flex items-center gap-3 rounded-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f54e00] transition-transform duration-200 group-hover:rotate-6">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true"><path d="M9 6v20M10 17 23 6M10 17l14 10" fill="none" stroke="#f3f0e6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      {!compact && <span className="leading-none">
        <span className={`font-display block text-[25px] font-bold tracking-[-0.06em] ${inverse ? "text-[#f3f0e6]" : "text-[#11100e]"}`}>koshish<span className="text-[#f54e00]">.</span></span>
        <span className={`font-mono mt-1 block text-[8px] uppercase tracking-[0.18em] ${inverse ? "text-[#b9b5a9]" : "text-[#625e55]"}`}>Open impact ledger</span>
      </span>}
    </Link>
  );
}
