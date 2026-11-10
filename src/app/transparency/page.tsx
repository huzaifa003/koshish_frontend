"use client";
import { useLanguage } from "@/lib/language";
import Link from "next/link";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";
import { EvidenceGallery } from "@/components/public/EvidenceGallery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePortal } from "@/lib/portal-store";
import { formatPKR, downloadCSV } from "@/lib/format";
export default function Transparency() {
  const { t } = useLanguage();
  const { data, mode, loading, loadError } = usePortal();
  const raised = data.finances.reduce((s, p) => s + p.raised, 0);
  const spent = data.finances.reduce((s, p) => s + p.spent, 0);
  const unavailable = loading || !!loadError;
  const report = data.finances.map((f) => ({
    ...f,
    title:
      data.projects.find((p) => p.id === f.projectId)?.title ??
      t("General / unallocated fund"),
  }));
  const exportReport = () =>
    downloadCSV("koshish-project-summary.csv", [
      [
        t("Project"),
        "Verified donations PKR",
        "Verified expenses PKR",
        "Available balance PKR",
      ],
      ...report.map((f) => [f.title, f.raised, f.spent, f.raised - f.spent]),
    ]);
  return (
    <PublicShell>
      <section className="site-container pt-14 md:pt-20">
        <p className="eyebrow">
          <ShieldCheck size={16} />
          {t("Clarity at every step")}{" "}
        </p>
        <h1 className="page-title mt-4">
          {t("See what your support makes possible.")}{" "}
        </h1>
        <p className="mt-5 max-w-2xl leading-8 text-brand-slate">
          {t(
            "Follow verified support from fundraising to project delivery. These are cumulative project reports in Pakistani rupees, with personal information kept private.",
          )}{" "}
        </p>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            [t("Support received"), raised],
            [t("Verified spending"), spent],
            [t("Available funds"), raised - spent],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-white p-6">
              <p className="text-sm text-brand-slate">{label}</p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-tight">
                {unavailable ? "—" : formatPKR(Number(value), true)}
              </p>
              <p className="mt-2 text-xs text-brand-slate">
                {unavailable ? t("Awaiting records") : formatPKR(Number(value))}
              </p>
            </div>
          ))}
        </div>
        <div className="my-6 rounded-xl bg-brand-sand p-5 text-sm leading-7 text-brand-slate">
          {mode === "demo" ? (
            <b>{t("Illustrative sample report.", "مثالی رپورٹ۔")} </b>
          ) : (
            <b>{t("Reporting basis.", "رپورٹ کی بنیاد۔")} </b>
          )}
          {t(
            "Only verified donations and expenses are included. Available balance = donations − expenses; this is a ledger balance, not an independently audited bank statement. Goals describe funding needs, and funds used do not measure project completion. General funds are reported separately.",
          )}{" "}
        </div>
      </section>
      <section className="site-container py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("Project by project")}</p>
            <h2 className="section-title mt-3">
              {t("The numbers behind the effort.")}{" "}
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={exportReport}
            disabled={unavailable || !report.length}
          >
            <Download size={16} />
            {t("Download summary")}{" "}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[720px] text-start text-sm">
            <caption className="sr-only">
              {t("Verified project finances in PKR, cumulative totals")}{" "}
            </caption>
            <thead className="bg-brand-sand text-xs text-brand-slate">
              <tr>
                {[
                  t("Project / fund"),
                  t("Goal"),
                  t("Received"),
                  t("Used"),
                  t("Balance"),
                ].map((h) => (
                  <th className="px-5 py-4 font-semibold" key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((f) => {
                const p = data.projects.find((p) => p.id === f.projectId);
                return (
                  <tr
                    id={"project-" + f.projectId}
                    key={f.projectId ?? "general"}
                    className="border-t"
                  >
                    <th scope="row" className="px-5 py-5">
                      <span className="font-semibold">{f.title}</span>
                      <span className="mt-1 block text-xs font-normal capitalize text-brand-slate">
                        {p?.status ?? t("Unallocated")}
                      </span>
                    </th>
                    <td className="px-5 py-5 text-brand-slate">
                      {p ? formatPKR(p.goalAmount) : "—"}
                    </td>
                    <td className="px-5 py-5 tabular-nums">
                      {formatPKR(f.raised)}
                    </td>
                    <td className="px-5 py-5 tabular-nums">
                      {formatPKR(f.spent)}
                    </td>
                    <td
                      className={
                        "px-5 py-5 font-semibold tabular-nums " +
                        (f.raised - f.spent < 0
                          ? "text-red-700"
                          : "text-brand-slate")
                      }
                    >
                      {formatPKR(f.raised - f.spent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!report.length && (
            <p className="p-8 text-center text-sm text-brand-slate">
              {unavailable
                ? t("Reports are unavailable while records load.")
                : t("No verified financial records have been published yet.")}
            </p>
          )}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold">{t("Where funds have been used")}</h3>
            <p className="mt-2 text-xs leading-6 text-brand-slate">
              {t(
                "Share of all verified expenses, including the general fund.",
              )}{" "}
            </p>
            <div className="mt-6 space-y-5">
              {report
                .filter((f) => f.spent > 0)
                .map((f) => (
                  <div key={f.title}>
                    <div className="mb-2 flex justify-between gap-3 text-xs">
                      <span>{f.title}</span>
                      <span>
                        {spent > 0 ? ((f.spent / spent) * 100).toFixed(1) : 0}%
                        · {formatPKR(f.spent, true)}
                      </span>
                    </div>
                    <Progress
                      aria-label={f.title + " share of expenses"}
                      value={spent > 0 ? (f.spent / spent) * 100 : 0}
                      className="h-2 bg-brand-sand [&>div]:bg-brand-slate"
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-xl bg-brand-sand p-7">
            <h3 className="font-display text-2xl font-semibold">
              {t("Know the full picture.")}{" "}
            </h3>
            <ul className="mt-5 list-disc space-y-4 pl-5 text-sm leading-7 text-brand-slate">
              <li>
                {t(
                  "Donations are counted after an administrator verifies receipt.",
                )}{" "}
              </li>
              <li>
                {t(
                  "Project goals and available balances are separate: reaching a goal does not mean delivery is complete.",
                )}{" "}
              </li>
              <li>
                {t(
                  "Reported reach may count repeat support. It is not a count of unique people.",
                )}{" "}
              </li>
              <li>
                {t(
                  "Documents are selected for public release; individual donation and expense records remain admin-only.",
                )}{" "}
              </li>
            </ul>
            <Button asChild variant="outline" className="mt-6 bg-transparent">
              <Link href="/contribute?tab=contact">
                {t("Ask about a report")} <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <EvidenceGallery />
    </PublicShell>
  );
}
