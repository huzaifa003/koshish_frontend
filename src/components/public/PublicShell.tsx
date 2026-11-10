"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, MessageCircle } from "lucide-react";
import { PublicHeader } from "./PublicHeader";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { usePortal } from "@/lib/portal-store";
import { useLanguage } from "@/lib/language";
import {
  donationAccount,
  whatsAppChatUrl,
  isWhatsAppGroupUrl,
} from "@/lib/whatsapp";
export function PublicShell({ children }: { children: React.ReactNode }) {
  const { data, loadError, loading, refreshData } = usePortal();
  const pathname = usePathname();
  const { language, t } = useLanguage();
  useEffect(() => {
    if (!window.location.hash)
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    return () => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    };
  }, [language]);
  const group = isWhatsAppGroupUrl(data.settings.whatsappGroupUrl ?? "");
  return (
    <div
      lang={language}
      dir={language === "ur" ? "rtl" : "ltr"}
      className="public-site min-h-screen bg-brand-paper pb-24 text-brand-ink lg:pb-0"
    >
      <PublicHeader />
      <main id="main">
        {loadError && (
          <div
            role="alert"
            className="site-container my-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm"
          >
            {t("Live records could not be loaded. Figures are unavailable.")}
            <Button
              variant="outline"
              className="ms-3"
              onClick={() => void refreshData().catch(() => {})}
            >
              {t("Try again")}
            </Button>
          </div>
        )}
        {loading && (
          <p role="status" className="site-container py-3 text-sm">
            {t("Loading verified project reports…")}
          </p>
        )}
        {children}
      </main>
      <footer className="mt-8 bg-brand-ink text-white">
        <div className="site-container py-14">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Logo inverse />
              <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
                {t(
                  "Small efforts, shared purpose. Helping communities move forward with dignity, care, and clear accountability.",
                )}
              </p>
              <p
                lang="ur"
                dir="rtl"
                className="font-urdu-logo mt-5 w-fit text-xl leading-[2.4] text-[#E4B45F]"
              >
                کوشش سے امید تک
              </p>
            </div>
            <div>
              <p className="mb-5 text-sm font-bold">
                {t("Find your next step")}
              </p>
              <div className="flex flex-col gap-3 text-sm text-white/75">
                {[
                  ["Choose a campaign", "/campaigns"],
                  ["See where funds go", "/transparency"],
                  ["Become a volunteer", "/contribute?tab=volunteer"],
                  ["Get in touch", "/contribute?tab=contact"],
                ].map(([label, href]) => (
                  <Link
                    className="w-fit py-1 hover:text-white"
                    key={href}
                    href={href}
                  >
                    {t(label)}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-5 text-sm font-bold">{t("Stay connected")}</p>
              <div className="flex flex-col gap-4 text-sm text-white/75">
                <a
                  href={whatsAppChatUrl(donationAccount.phone)!}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span lang="en">WhatsApp</span> ·{" "}
                  <bdi className="latin-data">
                    {donationAccount.internationalNumber}
                  </bdi>
                </a>
                <a
                  href={
                    group
                      ? data.settings.whatsappGroupUrl
                      : whatsAppChatUrl(
                          donationAccount.phone,
                          language === "ur"
                            ? "السلام علیکم کوشش، براہِ کرم واٹس ایپ گروپ کا دعوت نامہ بھیج دیں۔"
                            : "Hello Koshish, please share the WhatsApp group invite.",
                        )!
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t(
                    group
                      ? "Join our WhatsApp group ↗"
                      : "Ask to join our WhatsApp group ↗",
                  )}
                </a>
                <a
                  href={data.settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1"
                >
                  <span lang="en">Instagram</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs leading-6 text-white/70">
            <span>
              {t("© Koshish · A little effort. A lasting difference.")}
            </span>
            <Link href="/internal">{t("Team sign in ↗")}</Link>
          </div>
        </div>
      </footer>
      <nav
        aria-label={t("Quick giving actions", "عطیے اور رابطے کے فوری لنک")}
        className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-brand-line bg-brand-paper/95 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden"
      >
        <Button asChild className="brand-button h-12 flex-1">
          <Link href="/contribute?tab=donate">
            <Heart size={17} />
            {t("Donate now")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 flex-1 bg-white">
          <a
            href={whatsAppChatUrl(donationAccount.phone)!}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} />
            <span lang="en">WhatsApp</span>
          </a>
        </Button>
      </nav>
    </div>
  );
}
