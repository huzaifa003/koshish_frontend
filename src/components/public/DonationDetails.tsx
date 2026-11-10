"use client";
import { useLanguage } from "@/lib/language";
import { useState } from "react";
import { Check, Copy, MessageCircle, Phone, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  donationAccount,
  isWhatsAppGroupUrl,
  whatsAppChatUrl,
} from "@/lib/whatsapp";

export function WhatsAppCommunity({ groupUrl = "" }: { groupUrl?: string }) {
  const { t, language } = useLanguage();
  const hasInvite = isWhatsAppGroupUrl(groupUrl);
  return (
    <div className="rounded-lg border border-brand-line p-6">
      <Users size={24} className="text-brand-ink" />
      <h3 className="mt-4 font-semibold">{t("Stay part of the effort.")}</h3>
      <p className="mt-3 text-sm leading-7 text-brand-slate">
        {t(
          "Connect with the community on WhatsApp for project updates and ways to help.",
        )}{" "}
      </p>
      <Button asChild variant="outline" className="mt-4 w-full">
        <a
          href={
            hasInvite
              ? groupUrl
              : whatsAppChatUrl(
                  donationAccount.phone,
                  language === "ur"
                    ? "السلام علیکم کوشش، میں واٹس ایپ گروپ میں شامل ہونا چاہتا/چاہتی ہوں۔ براہِ کرم دعوت نامہ بھیج دیں۔"
                    : "Hello Koshish, I’d like to join the WhatsApp community group. Please share the invite link.",
                )!
          }
          target="_blank"
          rel="noreferrer"
        >
          {hasInvite ? t("Join WhatsApp group") : t("Ask to join the group")}
          <Users size={16} />
        </a>
      </Button>
      <p className="mt-3 text-xs leading-6 text-brand-slate">
        {t(
          "Joining opens WhatsApp. Other group members may see your phone number and profile.",
        )}{" "}
      </p>
    </div>
  );
}

export function DonationDetails({ projectTitle }: { projectTitle?: string }) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        donationAccount.localNumber.replace(/-/g, ""),
      );
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  const message =
    language === "ur"
      ? `السلام علیکم کوشش، میں نے عطیہ بھیجا ہے${projectTitle ? `، منصوبہ: ${projectTitle}` : ""}۔ میں منتقلی کی تصدیق بھیجنا چاہتا/چاہتی ہوں۔`
      : `Hello Koshish, I have made a donation${projectTitle ? ` for ${projectTitle}` : ""}. I’d like to share my transfer confirmation and confirm the project allocation.`;
  return (
    <section
      aria-labelledby="donation-account-title"
      className="mb-8 mt-6 scroll-mt-28 overflow-hidden rounded-xl border border-brand-line"
    >
      <div className="border-b border-brand-line bg-brand-ink px-6 py-5 text-white">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <Wallet size={16} />
          {t("Donate directly")}{" "}
        </p>
        <h2
          id="donation-account-title"
          className="mt-3 font-editorial text-3xl"
        >
          {t("Your support starts here.")}{" "}
        </h2>
      </div>
      <div className="space-y-5 bg-brand-paper p-6">
        <div>
          <p lang="en" dir="ltr" className="eyebrow">
            {donationAccount.providers}
          </p>
          <p
            lang="en"
            dir="ltr"
            className="latin-data mt-3 text-lg font-semibold"
          >
            {donationAccount.holder}
          </p>
          <p className="mt-1 text-xs text-brand-slate">{t("Account holder")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-brand-line py-4">
          <div>
            <p
              dir="ltr"
              lang="en"
              className="latin-data w-fit text-2xl font-semibold tracking-wide tabular-nums"
            >
              {donationAccount.internationalNumber}
            </p>
            <p className="mt-2 text-xs text-brand-slate">
              {t("Local account number:")}{" "}
              <bdi className="latin-data">{donationAccount.localNumber}</bdi>
            </p>
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={() => void copy()}
            aria-label={t("Copy local donation account number")}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t("Copied") : t("Copy number")}
          </Button>
        </div>
        <p role="status" className="text-xs text-brand-slate">
          {copyError
            ? t("Copy is unavailable. Please select the account number above.")
            : copied
              ? t("Local account number copied for your payment app.")
              : t(
                  "Check the account holder’s name in your payment app before confirming your transfer.",
                )}
        </p>
        <p className="text-sm leading-7 text-brand-slate">
          {projectTitle
            ? language === "ur"
              ? `${projectTitle} کے لیے تعاون؟ `
              : `Giving towards ${projectTitle}? `
            : t("After your transfer, ")}
          {t(
            "send your transfer confirmation on WhatsApp and tell us the campaign you want to support. An admin verifies receipt before it appears in the project’s totals.",
          )}{" "}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="brand-button">
            <a
              href={whatsAppChatUrl(donationAccount.phone, message)!}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              {t("Share transfer confirmation")}{" "}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:+${donationAccount.phone}`}>
              <Phone size={16} />
              {t("Call the team")}{" "}
            </a>
          </Button>
        </div>
        <p className="text-xs leading-6 text-brand-slate">
          {t(
            "Transfers happen in your payment app. This website does not collect a payment or confirm a transfer automatically.",
          )}{" "}
        </p>
      </div>
    </section>
  );
}
