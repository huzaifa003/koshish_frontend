import Link from "next/link";
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8 31c1 14 10 25 24 28 14-3 23-14 24-28"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M17 31c1 8 6 14 15 18 9-4 14-10 15-18M32 48V29"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="15" r="8" fill="#E4B45F" />
    </svg>
  );
}
export function Logo({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Koshish — کوشش — home"
      dir="ltr"
      className={
        "inline-flex shrink-0 items-center gap-2 rounded-sm sm:gap-2.5 " +
        (inverse ? "text-white" : "text-brand-ink")
      }
    >
      <BrandMark className="h-9 w-9 max-[359px]:hidden sm:h-12 sm:w-12" />
      {!compact && (
        <span className="flex items-center gap-2 sm:gap-3">
          <span
            className="font-display text-[23px] font-bold leading-none tracking-[-.055em] sm:text-[29px]"
            lang="en"
          >
            koshish
            <span className={inverse ? "text-[#E4B45F]" : "text-brand-brick"}>
              .
            </span>
          </span>
          <span
            className={
              "h-8 w-px " + (inverse ? "bg-white/25" : "bg-brand-line")
            }
          />
          <span
            lang="ur"
            dir="rtl"
            className="font-urdu-logo pb-2 text-[25px] leading-[1.8] sm:text-[31px]"
          >
            کوشش
          </span>
        </span>
      )}
    </Link>
  );
}
