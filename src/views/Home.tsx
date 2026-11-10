"use client";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Wallet,
  Check,
  Users,
} from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";
import { CampaignGrid } from "@/components/public/CampaignGrid";
import { FeaturedCampaign } from "@/components/public/FeaturedCampaign";
import { Button } from "@/components/ui/button";
import { usePortal } from "@/lib/portal-store";
import { useLanguage } from "@/lib/language";
import { formatNumber, formatPKR } from "@/lib/format";
export default function Home() {
  const { data, mode, loading, loadError } = usePortal();
  const { language, t } = useLanguage();
  const unavailable = loading || !!loadError;
  const raised = data.finances.reduce((s, p) => s + p.raised, 0);
  const reached = data.projects.reduce((s, p) => s + p.beneficiaries, 0);
  return (
    <PublicShell>
      <section
        id="mission"
        className="site-container grid items-center gap-10 pb-12 pt-10 md:gap-14 md:pb-16 md:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20"
      >
        <div>
          <p className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#B47E24]" />
            {t("Community care, one effort at a time.")}
          </p>
          <h1 className="hero-title mt-6 font-editorial text-brand-ink">
            {t("A little care.")}
            <br />
            <span>{t("A world of difference.")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-brand-slate md:text-[17px]">
            {t(
              "Food, education, and everyday essentials. Help local communities in Pakistan with a contribution you can follow, from giving to delivery.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="brand-button h-12 px-7">
              <Link href="/contribute?tab=donate">
                {t("Donate now")}
                <ArrowRight size={17} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 border-[#A6B9AA] bg-transparent px-6"
            >
              <Link href="/campaigns">{t("Support a campaign")}</Link>
            </Button>
          </div>
          <Link
            href="/transparency"
            className="mt-6 inline-flex items-center gap-2 py-2 text-sm font-medium text-brand-slate underline decoration-brand-line underline-offset-4 hover:text-brand-ink"
          >
            <ShieldCheck size={16} />
            {t("See where your support goes")}
          </Link>
          {language === "en" && (
            <p
              lang="ur"
              dir="rtl"
              className="font-urdu-logo mt-5 w-fit text-xl leading-[2.4] text-brand-brick"
            >
              چھوٹی کوشش، مشترکہ امید
            </p>
          )}
        </div>
        <FeaturedCampaign />
      </section>
      <div className="border-y border-brand-line bg-white">
        <div className="site-container grid gap-5 py-6 sm:grid-cols-3">
          {[
            {
              Icon: Wallet,
              label: "Direct giving",
              detail: "Easypaisa / SadaPay",
            },
            {
              Icon: ShieldCheck,
              label: "Verified project totals",
              detail: t(
                "Clarity with every contribution",
                "ہر عطیے کا واضح حساب",
              ),
            },
            {
              Icon: HeartHandshake,
              label: "A community effort",
              detail: t(
                "Built on care and participation",
                "توجہ اور اشتراک سے آگے بڑھتے ہوئے",
              ),
            },
          ].map(({ Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-center gap-3 sm:justify-center"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-sand">
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-sm font-semibold">{t(label)}</p>
                <p className="mt-1 text-xs text-brand-slate">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="site-container py-14 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">{t("The work you make possible")}</p>
            <h2 className="section-title mt-3">
              {t("A cause close to your heart.")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-slate">
              {t(
                "Choose a project. Understand the need. See the fundraising goal before you give.",
              )}
            </p>
          </div>
          <Link
            href="/campaigns"
            className="flex items-center gap-2 py-2 text-sm font-semibold text-brand-brick"
          >
            {t("Browse all campaigns")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <CampaignGrid featured />
      </section>
      <section
        aria-label={t("Impact at a glance", "اثر کی ایک جھلک")}
        className="bg-brand-sand"
      >
        <div className="site-container py-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {[
              [
                unavailable ? "—" : formatPKR(raised, true),
                "Verified support received",
              ],
              [
                unavailable ? "—" : formatNumber(reached),
                "Reported project reach*",
              ],
              [
                unavailable
                  ? "—"
                  : String(
                      data.projects.filter((p) => p.status === "active").length,
                    ),
                "Ongoing campaigns",
              ],
              [
                unavailable
                  ? "—"
                  : String(
                      data.evidence.filter((e) => e.visibility === "public")
                        .length,
                    ),
                "Published supporting reports",
              ],
            ].map(([value, label]) => (
              <div key={label}>
                <p
                  dir="ltr"
                  className="latin-data text-start text-3xl font-semibold tracking-tight md:text-4xl"
                >
                  {value}
                </p>
                <p className="mt-2 text-xs leading-6 text-brand-slate">
                  {t(label)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-7 max-w-3xl text-xs leading-6 text-brand-slate">
            {t(
              mode === "demo"
                ? "Illustrative sample data."
                : "Cumulative verified records in PKR.",
            )}{" "}
            {t(
              "*Reach may include repeat support across projects; it is not a count of unique people.",
            )}
          </p>
        </div>
      </section>
      <section className="site-container py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("Giving should feel clear.")}</p>
          <h2 className="section-title mt-3">
            {t("From your kindness to someone’s everyday.")}
          </h2>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            [
              "Choose your cause",
              "Explore the purpose, location, and funding goal of each campaign.",
            ],
            [
              "Make a direct transfer",
              "Use the published Easypaisa or SadaPay account. No card details are collected here.",
            ],
            [
              "Share your confirmation",
              "Send the transfer confirmation on WhatsApp so the team can verify and allocate your support.",
            ],
          ].map(([title, copy], i) => (
            <li key={title} className="border-t border-brand-line pt-6">
              <span className="latin-data grid h-10 w-10 place-items-center rounded-full bg-[#F9EBCF] text-sm font-semibold text-brand-ink">
                0{i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{t(title)}</h3>
              <p className="mt-3 text-sm leading-7 text-brand-slate">
                {t(copy)}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="site-container pb-14 md:pb-20">
        <div className="grid gap-8 overflow-hidden rounded-2xl bg-brand-ink p-7 text-white sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1.5 text-xs text-white/85">
              <ShieldCheck size={14} />
              {t("Read the project report")}
            </span>
            <h2 className="section-title text-white">
              {t("A clear record. A stronger reason to trust.")}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-white/75">
              {t(
                "Public project totals show verified support, spending, and available funds. Donor phone numbers and individual transactions stay private.",
              )}
            </p>
            <Button
              asChild
              className="mt-7 h-12 bg-[#E4B45F] px-6 text-brand-ink hover:bg-[#F0C981]"
            >
              <Link href="/transparency">
                {t("Explore transparency")}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col justify-center gap-5 border-t border-white/20 pt-7 lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0">
            {[
              ["Verified donations only", "صرف تصدیق شدہ عطیات"],
              [
                "Project-level spending and balances",
                "منصوبوں کے اخراجات اور دستیاب رقم",
              ],
              [
                "Supporting evidence, published responsibly",
                "ذمہ داری سے شائع شدہ ثبوت",
              ],
            ].map(([en, ur]) => (
              <p
                key={en}
                className="flex gap-3 text-sm leading-7 text-white/90"
              >
                <Check size={18} className="mt-1 shrink-0 text-[#E4B45F]" />
                {t(en, ur)}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-brand-line bg-white">
        <div className="site-container flex flex-col justify-between gap-7 py-12 md:flex-row md:items-center">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Users size={16} />
              {t("Get involved")}
            </p>
            <h2 className="mt-3 font-editorial text-3xl">
              {t("Your time matters, too.")}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-brand-slate">
              {t(
                "Help with a distribution, offer a skill, or join the conversation. There’s a place for your effort.",
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild className="brand-button h-12">
              <Link href="/contribute?tab=volunteer">
                {t("Become a volunteer")}
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href="/contribute?tab=contact">
                {t("Talk to the team")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
