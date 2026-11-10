"use client";
import { useLanguage } from "@/lib/language";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  HandHelping,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import {
  DonationDetails,
  WhatsAppCommunity,
} from "@/components/public/DonationDetails";
import { donationAccount, whatsAppChatUrl } from "@/lib/whatsapp";
import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortal } from "@/lib/portal-store";
type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export function Contribute() {
  const { t, language } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  const current = params.get("tab");
  const tab =
    current === "volunteer" || current === "contact" ? current : "donate";
  const { data, mode, loading } = usePortal();
  const [project, setProject] = useState(params.get("project") ?? "");
  const [amount, setAmount] = useState("2500");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const captcha = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const directDonationUrl =
    /^https:\/\//.test(data.settings.donationUrl) &&
    !data.settings.donationUrl.includes("instagram.com")
      ? data.settings.donationUrl
      : null;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    setProject(params.get("project") ?? "");
    setSuccess(false);
    setError("");
  }, [params]);
  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !captcha.current ||
      !window.turnstile ||
      success
    )
      return;
    widget.current = window.turnstile.render(captcha.current, {
      sitekey: siteKey,
      callback: (value: string) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => {
        setToken("");
        setError(t("Verification is unavailable. Please try again."));
      },
    });
    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = undefined;
    };
  }, [siteKey, scriptReady, success, tab]);
  const changeTab = (value: string) => {
    router.replace("/contribute?tab=" + value, { scroll: false });
    setError("");
    setSuccess(false);
    setToken("");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (mode === "demo") {
      setError(
        t(
          "This is a preview. Requests are not sent until Supabase is connected. You can message @kosshissh on Instagram.",
        ),
      );
      return;
    }
    setBusy(true);
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: tab,
          name: values.get("name"),
          email: values.get("email"),
          projectId: project || null,
          amount: tab === "donate" ? Number(amount) : null,
          message: values.get("message"),
          consent: values.get("consent") === "on",
          website: values.get("website") ?? "",
          turnstileToken: token,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Please try again.");
      setSuccess(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("Your request could not be sent."),
      );
      if (widget.current) window.turnstile?.reset(widget.current);
      setToken("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PublicShell>
      <section className="site-container py-14 md:py-20">
        <p className="eyebrow">{t("Your effort belongs here")}</p>
        <h1 className="page-title mt-4">{t("Be part of something good.")}</h1>
        <p className="mt-5 max-w-2xl leading-8 text-brand-slate">
          {t(
            "Support a mission, share your time, or start a conversation. Choose the way you’d like to help, and we’ll guide you from there.",
          )}{" "}
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-brand-line bg-white p-5 sm:p-8">
            <Tabs
              dir={language === "ur" ? "rtl" : "ltr"}
              value={tab}
              onValueChange={changeTab}
            >
              <TabsList className="grid h-auto w-full grid-cols-3 bg-brand-sand p-1">
                <TabsTrigger value="donate" className="gap-1.5 py-3">
                  <Heart size={15} />
                  {t("Donate")}{" "}
                </TabsTrigger>
                <TabsTrigger value="volunteer" className="gap-1.5 py-3">
                  <HandHelping size={15} />
                  {t("Volunteer")}{" "}
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-1.5 py-3">
                  <MessageCircle size={15} />
                  {t("Contact")}{" "}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value={tab}
                aria-label={t(
                  tab === "donate"
                    ? "Donate"
                    : tab === "volunteer"
                      ? "Volunteer"
                      : "Contact",
                )}
                key={tab}
              >
                {success ? (
                  <div role="status" className="py-12 text-center">
                    <CheckCircle2
                      size={42}
                      className="mx-auto text-brand-slate"
                    />
                    <h2 className="mt-5 font-display text-2xl font-semibold">
                      {t("Thank you for making an effort.")}{" "}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-brand-slate">
                      {t(
                        "Your request is saved. The team can follow up by email.",
                      )}{" "}
                      {tab === "donate" &&
                        t(
                          " This is an expression of interest; no payment has been taken.",
                        )}
                    </p>
                    <Button asChild variant="outline" className="mt-6">
                      <Link href="/campaigns">
                        {t("Explore more campaigns")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {tab === "donate" && (
                      <DonationDetails
                        projectTitle={
                          data.projects.find((p) => p.id === project)?.title
                        }
                      />
                    )}
                    {tab === "donate" && (
                      <div className="mb-4 border-t border-brand-line pt-5">
                        <p className="eyebrow">
                          {t("Need guidance before donating?")}{" "}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-brand-slate">
                          {t(
                            "The form below is optional. You can donate directly using the account details above without filling it in.",
                          )}{" "}
                        </p>
                      </div>
                    )}
                    <h2 className="mt-8 font-display text-2xl font-semibold">
                      {tab === "donate"
                        ? t("Ask about your contribution.")
                        : tab === "volunteer"
                          ? t("Find your place in the effort.")
                          : t("We’re here to listen.")}
                    </h2>
                    <p className="mb-7 mt-3 text-sm leading-7 text-brand-slate">
                      {tab === "donate"
                        ? t(
                            "If you’d like help choosing a cause, send an inquiry. This form does not record a payment or replace your transfer confirmation.",
                          )
                        : tab === "volunteer"
                          ? t(
                              "Tell us about your skills, interests, location, and availability. We’ll use your details to discuss suitable opportunities.",
                            )
                          : t(
                              "Have a question about a project, partnership, or report? Leave a message for the team.",
                            )}
                    </p>
                    {tab === "donate" && directDonationUrl && (
                      <p className="mb-5 rounded-lg bg-brand-sand p-4 text-sm leading-6">
                        <a
                          href={directDonationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold underline"
                        >
                          {t("Continue to our donation page ↗")}{" "}
                        </a>
                        <br />
                        {t(
                          "Payment is handled on the linked page. You can also send an inquiry below.",
                        )}{" "}
                      </p>
                    )}
                    <form onSubmit={submit} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name">{t("Your name")}</Label>
                          <Input
                            id="name"
                            name="name"
                            required
                            minLength={2}
                            maxLength={120}
                            autoComplete="name"
                            className="mt-2 h-11"
                            placeholder={t("Full name")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t("Email address")}</Label>
                          <Input
                            id="email"
                            dir="ltr"
                            name="email"
                            type="email"
                            required
                            maxLength={254}
                            autoComplete="email"
                            className="mt-2 h-11"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                      {tab !== "contact" && (
                        <div>
                          <Label htmlFor="project">
                            {tab === "donate"
                              ? t("Where would you like to help?")
                              : t("Preferred campaign (optional)")}
                          </Label>
                          <select
                            id="project"
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            className="mt-2 h-12 w-full rounded-md border bg-white px-3 text-sm"
                            disabled={loading}
                          >
                            <option value="">
                              {tab === "donate"
                                ? t("General support · Let the team guide me")
                                : t("Open to any project")}
                            </option>
                            {data.projects
                              .filter((p) => p.status === "active")
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title} · {p.location}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                      {tab === "donate" && (
                        <fieldset>
                          <legend className="text-sm font-medium">
                            {t("Contribution amount (PKR)")}{" "}
                          </legend>
                          <div className="my-3 grid grid-cols-3 gap-2">
                            {["1000", "2500", "5000"].map((v) => (
                              <Button
                                type="button"
                                key={v}
                                aria-pressed={amount === v}
                                variant={amount === v ? "default" : "outline"}
                                className={amount === v ? "bg-brand-ink" : ""}
                                onClick={() => setAmount(v)}
                              >
                                {Number(v).toLocaleString()}
                              </Button>
                            ))}
                          </div>
                          <Label htmlFor="amount" className="sr-only">
                            {t("Custom amount in PKR")}{" "}
                          </Label>
                          <Input
                            id="amount"
                            dir="ltr"
                            type="number"
                            required
                            min="1"
                            max="100000000"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={t("Or enter another amount")}
                          />
                        </fieldset>
                      )}
                      <div>
                        <Label htmlFor="message">
                          {tab === "volunteer"
                            ? t("How would you like to get involved?")
                            : t("Your message")}
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          minLength={10}
                          maxLength={4000}
                          rows={4}
                          className="mt-2"
                          placeholder={
                            tab === "volunteer"
                              ? t(
                                  "Your skills, city, and when you’re available…",
                                )
                              : t("Tell us a little about your request…")
                          }
                        />
                      </div>
                      <div className="hidden" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input
                          id="website"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      <label className="flex items-start gap-3 text-xs leading-6 text-brand-slate">
                        <input
                          name="consent"
                          type="checkbox"
                          required
                          className="mt-1.5 h-4 w-4 shrink-0 accent-brand-brick"
                        />
                        {t(
                          "I agree that Koshish may store these details and contact me about this request. My information will only be visible to administrators.",
                        )}{" "}
                      </label>
                      {siteKey && <div ref={captcha} />}
                      <p
                        dir="auto"
                        role="alert"
                        className={
                          error
                            ? "rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800"
                            : "sr-only"
                        }
                      >
                        {error}
                      </p>
                      <Button
                        type="submit"
                        className="brand-button h-12 w-full"
                        disabled={busy || loading || (!!siteKey && !token)}
                      >
                        {busy
                          ? t("Sending your request…")
                          : tab === "donate"
                            ? t("Send contribution inquiry")
                            : tab === "volunteer"
                              ? t("Send volunteer interest")
                              : t("Send message")}
                        <ArrowRight size={16} />
                      </Button>
                      <p className="text-center text-xs text-brand-slate">
                        {mode === "demo"
                          ? t("Preview mode · No requests will be sent")
                          : t(
                              "Your information stays private. No public donor listing.",
                            )}
                      </p>
                    </form>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <aside>
            <div className="rounded-2xl bg-brand-sand p-7">
              <ShieldCheck size={28} className="text-brand-slate" />
              <h2 className="mt-5 font-display text-2xl font-semibold">
                {t("Here’s what happens next.")}{" "}
              </h2>
              <ol className="mt-6 space-y-6">
                {(tab === "donate"
                  ? [
                      t(
                        "Transfer your donation to the Easypaisa / SadaPay account shown here.",
                      ),
                      t(
                        "Share your transfer confirmation and preferred campaign on WhatsApp.",
                      ),
                      t(
                        "After receipt is verified, your support is included in project totals.",
                      ),
                    ]
                  : tab === "volunteer"
                    ? [
                        t(
                          "Tell us what you’d enjoy doing and when you’re available.",
                        ),
                        t(
                          "The team reviews your interest against current project needs.",
                        ),
                        t(
                          "If there’s a fit, we’ll discuss the role and next steps by email.",
                        ),
                      ]
                    : [
                        t("Send your question with a way for us to reach you."),
                        t("Your message goes to the team’s private inbox."),
                        t(
                          "The team can follow up using the email you provided.",
                        ),
                      ]
                ).map((copy, i) => (
                  <li
                    key={copy}
                    className="flex gap-4 text-sm leading-7 text-brand-slate"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-line text-xs font-bold text-brand-slate">
                      {i + 1}
                    </span>
                    {copy}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-6">
              <WhatsAppCommunity groupUrl={data.settings.whatsappGroupUrl} />
            </div>
            <div className="mt-6 rounded-xl border p-6">
              <h3 className="font-semibold">{t("Prefer a conversation?")}</h3>
              <p className="mt-3 text-sm leading-7 text-brand-slate">
                {t(
                  "Call or message the same number for questions about giving or getting involved.",
                )}{" "}
              </p>
              <a
                className="mt-4 inline-flex text-sm font-bold text-brand-brick"
                href={whatsAppChatUrl(
                  donationAccount.phone,
                  language === "ur"
                    ? "السلام علیکم کوشش، میں عطیہ دینے یا رضاکار بننے کے بارے میں معلومات چاہتا/چاہتی ہوں۔"
                    : "Hello Koshish, I have a question about donating or getting involved.",
                )!}
                target="_blank"
                rel="noreferrer"
              >
                {t("Message on WhatsApp ↗")}{" "}
              </a>
              <a
                href={`tel:+${donationAccount.phone}`}
                className="mt-4 block text-sm font-semibold"
              >
                {t("Call", "کال کریں")}{" "}
                <bdi className="latin-data">
                  {donationAccount.internationalNumber}
                </bdi>
              </a>
              <Link
                href="/transparency"
                className="mt-4 block text-sm font-semibold underline underline-offset-4"
              >
                {t("Read our transparency reports")}{" "}
              </Link>
            </div>
          </aside>
        </div>
      </section>
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onReady={() => setScriptReady(true)}
        />
      )}
    </PublicShell>
  );
}
