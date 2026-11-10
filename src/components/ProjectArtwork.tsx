import type { Project } from "@/types";

export function ProjectArtwork({
  type,
  className = "",
}: {
  type: Project["art"];
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-brand-sand text-brand-ink ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 220"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {type === "ration" && (
          <>
            <path d="M83 77h118l-13 104H96L83 77Z" fill="currentColor" />
            <path
              d="M103 77c0-31 16-46 39-46s39 15 39 46"
              stroke="currentColor"
              strokeWidth="8"
            />
            <path
              d="M120 112h45M120 132h58M120 152h33"
              stroke="hsl(var(--sand))"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        )}
        {type === "education" && (
          <>
            <path
              d="M52 64c45-18 79-8 105 18v105c-27-25-61-34-105-17V64Z"
              fill="currentColor"
            />
            <path
              d="M262 64c-45-18-79-8-105 18v105c27-25 61-34 105-17V64Z"
              fill="currentColor"
            />
            <path d="M157 82v105" stroke="hsl(var(--sand))" strokeWidth="5" />
            <path
              d="m211 28 8 22 23 2-18 15 5 23-18-12-19 12 6-23-18-15 23-2 8-22Z"
              fill="currentColor"
            />
          </>
        )}
        {type === "health" && (
          <>
            <rect
              x="72"
              y="50"
              width="174"
              height="133"
              rx="20"
              fill="currentColor"
            />
            <path
              d="M159 78v78M120 117h78"
              stroke="hsl(var(--sand))"
              strokeWidth="19"
              strokeLinecap="round"
            />
            <path
              d="M112 50c0-23 15-35 47-35s47 12 47 35"
              stroke="currentColor"
              strokeWidth="8"
            />
          </>
        )}
        {type === "winter" && (
          <>
            <path
              d="M160 28v164M88 70l144 82M88 152l144-82"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="m160 28-14 22m14-22 14 22m-14 142-14-22m14 22 14-22M88 70l26 3m-26-3 9 25m135 57-26-3m26 3-9-25M88 152l26-3m-26 3 9-25m135-57-26 3m26-3-9 25"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="160" cy="111" r="25" fill="currentColor" />
          </>
        )}
        {type === "water" && (
          <>
            <path
              d="M160 24s-76 82-76 127a76 76 0 0 0 152 0c0-45-76-127-76-127Z"
              fill="currentColor"
            />
            <path
              d="M116 153c14 14 30 19 48 14 18-6 31-3 43 6"
              stroke="hsl(var(--sand))"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M127 133c10 7 20 9 33 5"
              stroke="hsl(var(--sand))"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        )}
        {type === "recovery" && (
          <>
            <path
              d="m54 117 106-82 106 82-18 21-88-68-88 68-18-21Z"
              fill="currentColor"
            />
            <path
              d="M83 135v54h154v-54"
              stroke="currentColor"
              strokeWidth="12"
            />
            <path
              d="M160 113v76M122 151h76"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}
