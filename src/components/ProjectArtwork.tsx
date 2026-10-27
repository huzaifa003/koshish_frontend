import type { Project } from "@/types";

const labels = { ration: "01 / FOOD", education: "02 / LEARN", health: "03 / HEALTH", winter: "04 / WARMTH", water: "05 / WATER", recovery: "06 / RECOVER" };

export function ProjectArtwork({ type, className = "" }: { type: Project["art"]; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden bg-[#df5a25] text-[#f3f0e6] ${className}`} aria-hidden="true">
      <div className="dark-noise absolute inset-0 opacity-70" />
      <span className="font-mono absolute left-4 top-3 z-10 text-[9px] tracking-[0.14em]">{labels[type]}</span>
      <svg viewBox="0 0 320 220" className="absolute inset-0 h-full w-full" fill="none">
        <circle cx="255" cy="45" r="82" stroke="currentColor" strokeOpacity=".22" />
        <circle cx="255" cy="45" r="58" stroke="currentColor" strokeOpacity=".22" />
        {type === "ration" && <><path d="M83 77h118l-13 104H96L83 77Z" fill="#f3f0e6" /><path d="M103 77c0-31 16-46 39-46s39 15 39 46" stroke="#f3f0e6" strokeWidth="8" /><path d="M120 112h45M120 132h58M120 152h33" stroke="#df5a25" strokeWidth="6" strokeLinecap="round" /></>}
        {type === "education" && <><path d="M52 64c45-18 79-8 105 18v105c-27-25-61-34-105-17V64Z" fill="#f3f0e6" /><path d="M262 64c-45-18-79-8-105 18v105c27-25 61-34 105-17V64Z" fill="#f3f0e6" /><path d="M157 82v105" stroke="#df5a25" strokeWidth="5" /><path d="m211 28 8 22 23 2-18 15 5 23-18-12-19 12 6-23-18-15 23-2 8-22Z" fill="#f3f0e6" /></>}
        {type === "health" && <><rect x="72" y="50" width="174" height="133" rx="20" fill="#f3f0e6" /><path d="M159 78v78M120 117h78" stroke="#df5a25" strokeWidth="19" strokeLinecap="round" /><path d="M112 50c0-23 15-35 47-35s47 12 47 35" stroke="#f3f0e6" strokeWidth="8" /></>}
        {type === "winter" && <><path d="M160 28v164M88 70l144 82M88 152l144-82" stroke="#f3f0e6" strokeWidth="8" strokeLinecap="round" /><path d="m160 28-14 22m14-22 14 22m-14 142-14-22m14 22 14-22M88 70l26 3m-26-3 9 25m135 57-26-3m26 3-9-25M88 152l26-3m-26 3 9-25m135-57-26 3m26-3-9 25" stroke="#f3f0e6" strokeWidth="6" strokeLinecap="round" /><circle cx="160" cy="111" r="25" fill="#f3f0e6" /></>}
        {type === "water" && <><path d="M160 24s-76 82-76 127a76 76 0 0 0 152 0c0-45-76-127-76-127Z" fill="#f3f0e6" /><path d="M116 153c14 14 30 19 48 14 18-6 31-3 43 6" stroke="#df5a25" strokeWidth="7" strokeLinecap="round" /><path d="M127 133c10 7 20 9 33 5" stroke="#df5a25" strokeWidth="7" strokeLinecap="round" /></>}
        {type === "recovery" && <><path d="m54 117 106-82 106 82-18 21-88-68-88 68-18-21Z" fill="#f3f0e6" /><path d="M83 135v54h154v-54" stroke="#f3f0e6" strokeWidth="12" /><path d="M160 113v76M122 151h76" stroke="#f3f0e6" strokeWidth="9" strokeLinecap="round" /></>}
      </svg>
      <span className="font-display absolute bottom-2 right-4 text-[66px] font-bold leading-none tracking-[-0.09em] opacity-25">K.</span>
    </div>
  );
}
