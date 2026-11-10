"use client";
import { useRef, useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  buildThankYouMessage,
  normalizeWhatsAppPhone,
  whatsAppChatUrl,
} from "@/lib/whatsapp";
import { usePortal } from "@/lib/portal-store";
import type { DonationInput } from "@/types";

export function ThankYouDraft({
  donation,
  projectTitle,
}: {
  donation: DonationInput;
  projectTitle: string;
}) {
  const { role, mode } = usePortal();
  if (role !== "admin") return null;
  const phone = normalizeWhatsAppPhone(donation.donorPhone ?? "");
  if (!donation.verified || !donation.whatsappOptIn || !phone)
    return (
      <p className="text-sm leading-7 text-brand-slate">
        A WhatsApp thank-you is available after receipt is verified, a valid
        donor number is saved, and permission to message them is recorded.
      </p>
    );
  const message = buildThankYouMessage({ ...donation, projectTitle });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Thank-you message copied.");
    } catch {
      toast.error("Copy is unavailable. Please select the message text.");
    }
  };
  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-brand-slate">
        Review the recipient and message before opening WhatsApp. Nothing is
        sent automatically.
      </p>
      <p className="rounded-md bg-brand-sand p-4 text-sm">
        <b>Recipient:</b> +{phone}
      </p>
      <div className="whitespace-pre-wrap rounded-md border bg-white p-5 text-sm leading-7">
        {message}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void copy()} type="button" variant="outline">
          <Copy size={16} />
          Copy message
        </Button>
        {mode === "live" ? (
          <Button asChild className="brand-button">
            <a
              href={whatsAppChatUrl(phone, message)!}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              Open WhatsApp draft
            </a>
          </Button>
        ) : (
          <Button disabled>WhatsApp sending disabled in preview</Button>
        )}
      </div>
      <p className="text-xs leading-6 text-brand-slate">
        Send the message yourself in WhatsApp. Opening a draft does not confirm
        sending or delivery; this site does not mark it as sent.
      </p>
    </div>
  );
}

export function DonationThankYou({
  donation,
  projectTitle,
}: {
  donation: DonationInput;
  projectTitle: string;
}) {
  const { role } = usePortal();
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  if (
    role !== "admin" ||
    !donation.verified ||
    !donation.whatsappOptIn ||
    !normalizeWhatsAppPhone(donation.donorPhone ?? "")
  )
    return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Review WhatsApp thank-you"
        title="Review WhatsApp thank-you"
        className="grid h-10 w-10 place-items-center rounded-full border border-brand-line text-brand-ink hover:border-brand-brick hover:text-brand-brick"
      >
        <MessageCircle size={15} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          tabIndex={-1}
          ref={contentRef}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
          className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        >
          <DialogHeader>
            <DialogTitle>Thank a contributor</DialogTitle>
            <DialogDescription>
              A personal message for this verified donation.
            </DialogDescription>
          </DialogHeader>
          <ThankYouDraft donation={donation} projectTitle={projectTitle} />
        </DialogContent>
      </Dialog>
    </>
  );
}
