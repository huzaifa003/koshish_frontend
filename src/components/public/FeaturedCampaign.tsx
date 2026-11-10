"use client";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { usePortal } from "@/lib/portal-store";
import { useLanguage } from "@/lib/language";
import { formatPKR } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
export function FeaturedCampaign() {
  const { data, loading, loadError } = usePortal();
  const { t } = useLanguage();
  const project = data.projects.find((p) => p.status === "active");
  const finance = data.finances.find((f) => f.projectId === project?.id);
  return (
    <aside
      aria-label={t("Featured campaign", "نمایاں مہم")}
      className="overflow-hidden rounded-[1.5rem] border border-brand-line bg-white"
    >
      <div className="relative">
        <img
          src="/brand/community-care.svg"
          width="580"
          height="400"
          alt=""
          className="aspect-[1.45] w-full object-cover"
        />
        <p
          lang="ur"
          dir="rtl"
          className="font-urdu-logo absolute end-6 top-5 text-xl text-brand-ink"
        >
          کوشش سے امید تک
        </p>
      </div>
      <div className="p-6 sm:p-7">
        {project && !loadError ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">{t("Current campaign")}</p>
              <p
                className="flex items-center gap-1 text-xs text-brand-slate"
                dir="auto"
              >
                <MapPin size={13} />
                {project.location}
              </p>
            </div>
            <Link
              href={
                "/contribute?tab=donate&project=" +
                encodeURIComponent(project.id)
              }
              className="mt-3 flex items-center justify-between gap-4"
            >
              <h2
                dir="auto"
                className="font-display text-2xl font-semibold tracking-tight"
              >
                {project.title}
              </h2>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-sand">
                <ArrowRight size={19} />
              </span>
            </Link>
            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-brand-slate">
              <span>
                <bdi className="latin-data font-semibold text-brand-ink">
                  {formatPKR(finance?.raised ?? 0, true)}
                </bdi>{" "}
                {t("raised")}
              </span>
              <span>
                {t("Goal")}{" "}
                <bdi className="latin-data">
                  {formatPKR(project.goalAmount, true)}
                </bdi>
              </span>
            </div>
            <Progress
              aria-label={t("Fundraising goal")}
              value={
                project.goalAmount > 0
                  ? Math.min(
                      100,
                      ((finance?.raised ?? 0) / project.goalAmount) * 100,
                    )
                  : 0
              }
              className="mt-3 h-1.5 bg-brand-sand [&>div]:bg-brand-brick"
            />
          </>
        ) : (
          <>
            <p className="eyebrow">{t("A community effort")}</p>
            <p className="mt-3 text-lg font-medium">
              {loading
                ? t("Loading the latest campaign…")
                : t("Small efforts. Shared hope.")}
            </p>
            <Link
              href="/campaigns"
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-brick"
            >
              {t("Explore campaigns")}
              <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
