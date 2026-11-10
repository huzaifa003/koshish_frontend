"use client";
import { useLanguage } from "@/lib/language";
import { PublicShell } from "@/components/public/PublicShell";
import { CampaignGrid } from "@/components/public/CampaignGrid";
export default function Campaigns() {
  const { t } = useLanguage();
  return (
    <PublicShell>
      <section className="site-container py-14 md:py-20">
        <p className="eyebrow">{t("A cause close to your heart")}</p>
        <h1 className="page-title mt-4">{t("Find your next good effort.")}</h1>
        <p className="mb-10 mt-5 max-w-2xl leading-8 text-brand-slate">
          {t(
            "From everyday essentials to a brighter start in school. Explore the mission and funding behind each project, then choose how you’d like to help.",
          )}{" "}
        </p>
        <CampaignGrid />
      </section>
    </PublicShell>
  );
}
