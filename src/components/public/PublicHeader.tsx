"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, ArrowUpRight, Languages } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { usePortal } from "@/lib/portal-store";
import { useLanguage } from "@/lib/language";
const links = [
  ["Our work", "/#mission"],
  ["Campaigns", "/campaigns"],
  ["Transparency", "/transparency"],
  ["Get involved", "/contribute?tab=volunteer"],
];
export function PublicHeader() {
  const pathname = usePathname();
  const { mode } = usePortal();
  const { language, setLanguage, t } = useLanguage();
  return (
    <>
      {mode === "demo" && (
        <div className="bg-brand-ink px-4 py-2 text-center text-xs leading-6 text-white/90">
          {t(
            "Preview experience · All figures and project records are illustrative samples.",
          )}
        </div>
      )}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4"
      >
        {t("Skip to content")}
      </a>
      <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-paper/95 backdrop-blur-md">
        <div className="site-container flex h-[84px] items-center justify-between gap-3 lg:h-[94px]">
          <Logo />
          <nav
            aria-label={t("Main navigation", "مرکزی مینو")}
            className="hidden items-center gap-7 lg:flex"
          >
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  pathname === href.split("?")[0] ? "page" : undefined
                }
                className={
                  "border-b-2 py-3 text-sm font-medium transition-colors hover:text-brand-brick " +
                  (pathname === href.split("?")[0]
                    ? "border-brand-brick text-brand-ink"
                    : "border-transparent text-brand-slate")
                }
              >
                {t(label)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "ur" : "en")}
              aria-label={
                language === "en"
                  ? "Read this website in Urdu"
                  : "Read this website in English"
              }
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-brand-line px-3 text-sm font-medium hover:bg-brand-sand"
            >
              <Languages size={15} className="hidden sm:block" />
              <span lang={language === "en" ? "ur" : "en"}>
                {language === "en" ? "اردو" : "EN"}
              </span>
            </button>
            <Button
              asChild
              className="brand-button hidden h-11 px-5 lg:inline-flex"
            >
              <Link href="/contribute?tab=donate">
                <Heart size={16} />
                {t("Donate now")}
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label={t("Open navigation")}
                >
                  <Menu size={23} />
                </Button>
              </SheetTrigger>
              <SheetContent
                closeLabel={t("Close")}
                side={language === "ur" ? "left" : "right"}
                dir={language === "ur" ? "rtl" : "ltr"}
                lang={language}
                className="public-dialog bg-brand-paper p-6"
              >
                <SheetHeader>
                  <SheetTitle className="text-start text-xl">
                    {t("Find your next step")}
                  </SheetTitle>
                  <SheetDescription className="text-start">
                    {t(
                      "Choose a campaign, read a report, or get involved.",
                      "مہم چنیں، رپورٹ پڑھیں، یا ہمارے ساتھ کام کریں۔",
                    )}
                  </SheetDescription>
                </SheetHeader>
                <nav
                  className="mt-7 flex flex-col"
                  aria-label={t("Mobile navigation", "موبائل مینو")}
                >
                  {links.map(([label, href]) => (
                    <SheetClose asChild key={href}>
                      <Link
                        className="flex items-center justify-between border-b border-brand-line py-4 text-base font-medium"
                        href={href}
                      >
                        {t(label)}
                        <ArrowUpRight size={17} />
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Button asChild className="brand-button mt-7">
                      <Link href="/contribute?tab=donate">
                        {t("Donate now")}
                        <Heart size={16} />
                      </Link>
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
