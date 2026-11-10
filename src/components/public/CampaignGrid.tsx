"use client";
import { useLanguage } from "@/lib/language";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Users } from "lucide-react";
import { usePortal } from "@/lib/portal-store";
import { formatPKR, formatNumber } from "@/lib/format";
import { ProjectArtwork } from "@/components/ProjectArtwork";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Project } from "@/types";
export function CampaignGrid({ featured = false }: { featured?: boolean }) {
  const { t, language } = useLanguage();
  const { data, loading, loadError } = usePortal();
  const [status, setStatus] = useState("active");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const projects = data.projects.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (!query ||
        [p.title, p.category, p.location]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const shown = featured ? projects.slice(0, 3) : projects;
  const finance = (id: string) =>
    data.finances.find((f) => f.projectId === id) ?? {
      raised: 0,
      spent: 0,
      donations: 0,
    };
  return (
    <>
      {!featured && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div
            aria-label={t("Campaign status", "مہم کی کیفیت")}
            className="flex flex-wrap gap-2"
          >
            {[
              ["active", t("Ongoing")],
              ["planned", t("Upcoming")],
              ["completed", t("Completed")],
              ["all", t("All campaigns")],
            ].map(([value, label]) => (
              <Button
                key={value}
                variant={status === value ? "default" : "outline"}
                aria-pressed={status === value}
                onClick={() => setStatus(value)}
                className={status === value ? "bg-brand-ink" : "bg-white"}
              >
                {label}
              </Button>
            ))}
          </div>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">{t("Search campaigns")}</span>
            <Search
              size={16}
              className="absolute start-3 top-3.5 text-brand-slate"
            />
            <Input
              placeholder={t("Search cause or location")}
              className="h-11 bg-white ps-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      )}
      {loading ? (
        <div
          role="status"
          className="rounded-xl border p-10 text-center text-brand-slate"
        >
          {t("Loading campaigns…")}{" "}
        </div>
      ) : !shown.length ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <h3 className="font-semibold">
            {loadError
              ? t("Campaigns are temporarily unavailable")
              : t("No campaigns found here yet.")}
          </h3>
          <p className="mt-2 text-sm text-brand-slate">
            {featured
              ? t("Check back for the next community effort.")
              : t("Try another status or search term.")}
          </p>
          {!featured && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStatus("all");
                setQuery("");
              }}
            >
              {t("Show all campaigns")}{" "}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const f = finance(p.id);
            const percent =
              p.goalAmount > 0 ? (f.raised / p.goalAmount) * 100 : 0;
            return (
              <article
                key={p.id}
                className="campaign-card overflow-hidden rounded-2xl border border-brand-line bg-white"
              >
                <div className="relative">
                  <ProjectArtwork type={p.art} className="h-40" />
                  <Badge className="absolute bottom-4 left-5 border-0 bg-white text-brand-ink hover:bg-white">
                    {p.category}
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 text-xs text-brand-slate">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {p.location}
                    </span>
                    <span className="capitalize">
                      {p.status === "active"
                        ? t("Ongoing")
                        : p.status === "completed"
                          ? t("Completed")
                          : t("Upcoming")}
                    </span>
                  </div>
                  <h3
                    dir="auto"
                    lang={/[\u0600-\u06ff]/.test(p.title) ? "ur" : "en"}
                    className="mt-4 font-display text-2xl font-semibold tracking-tight"
                  >
                    {p.title}
                  </h3>
                  <p
                    dir="auto"
                    lang={/[\u0600-\u06ff]/.test(p.summary) ? "ur" : "en"}
                    className="mt-3 min-h-[72px] text-sm leading-6 text-brand-slate"
                  >
                    {p.summary}
                  </p>
                  <div className="mt-5 flex justify-between gap-2 text-xs">
                    <span>
                      <strong className="text-sm text-brand-ink">
                        {formatPKR(f.raised, true)}
                      </strong>{" "}
                      {t("raised")}{" "}
                    </span>
                    <span>
                      {p.goalAmount > 0
                        ? Math.round(percent) + t("% of goal")
                        : t("Goal to be announced")}
                    </span>
                  </div>
                  <Progress
                    aria-label={p.title + " · " + t("Fundraising goal")}
                    value={Math.min(100, percent)}
                    className="mt-3 h-2 bg-brand-sand [&>div]:bg-brand-ink"
                  />
                  <p className="mt-2 text-xs text-brand-slate">
                    {t("Goal")}{" "}
                    <bdi className="latin-data">{formatPKR(p.goalAmount)}</bdi>{" "}
                    · {t("Verified donations only")}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button
                      onClick={() => setSelected(p)}
                      variant="outline"
                      className="min-w-[110px] flex-1"
                    >
                      {t("View project")}{" "}
                    </Button>
                    {p.status === "active" && (
                      <Button
                        asChild
                        className="brand-button min-w-[110px] flex-1"
                      >
                        <Link
                          href={
                            "/contribute?tab=donate&project=" +
                            encodeURIComponent(p.id)
                          }
                        >
                          {t("Contribute")} <ArrowRight size={15} />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          closeLabel={t("Close")}
          lang={language}
          dir={language === "ur" ? "rtl" : "ltr"}
          className="public-dialog max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        >
          {selected && (
            <>
              <DialogHeader>
                <p className="eyebrow">
                  {selected.category} · {selected.location}
                </p>
                <DialogTitle dir="auto" className="pt-2 font-display text-3xl">
                  {selected.title}
                </DialogTitle>
                <DialogDescription dir="auto" className="pt-3 leading-7">
                  {selected.summary}
                </DialogDescription>
              </DialogHeader>
              <p
                dir="auto"
                lang={
                  /[\u0600-\u06ff]/.test(selected.description) ? "ur" : "en"
                }
                className="text-sm leading-7 text-brand-slate"
              >
                {selected.description}
              </p>
              <dl className="grid grid-cols-2 gap-4 rounded-xl bg-brand-paper p-5">
                {[
                  [t("Fundraising goal"), formatPKR(selected.goalAmount)],
                  [
                    t("Verified support"),
                    formatPKR(finance(selected.id).raised),
                  ],
                  [
                    t("Verified spending"),
                    formatPKR(finance(selected.id).spent),
                  ],
                  [
                    t("Available balance"),
                    formatPKR(
                      finance(selected.id).raised - finance(selected.id).spent,
                    ),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-brand-slate">{label}</dt>
                    <dd className="mt-1 text-sm font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="flex items-center gap-2 text-sm">
                <Users size={16} />
                <bdi className="latin-data">
                  {formatNumber(selected.beneficiaries)}
                </bdi>{" "}
                {t(
                  "reported reach (may include repeat support)",
                  "مستفید افراد کی تعداد (دوبارہ مدد شامل ہو سکتی ہے)",
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={"/transparency#project-" + selected.id}>
                    {t("Read financial report")}{" "}
                  </Link>
                </Button>
                {selected.status === "active" && (
                  <Button asChild className="brand-button">
                    <Link
                      href={
                        "/contribute?tab=donate&project=" +
                        encodeURIComponent(selected.id)
                      }
                    >
                      {t("Support this project")} <ArrowRight size={15} />
                    </Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
