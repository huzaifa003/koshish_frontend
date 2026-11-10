export const donationAccount = {
  holder: "Mobeen Ahmed Faheem",
  providers: "Easypaisa / SadaPay",
  localNumber: "0323-8999-060",
  internationalNumber: "+92 323 8999060",
  phone: "923238999060",
} as const;

export function normalizeWhatsAppPhone(value: string) {
  let phone = value.trim().replace(/[\s()+-]/g, "");
  if (/^03\d{9}$/.test(phone)) phone = "92" + phone.slice(1);
  if (!/^[1-9]\d{7,14}$/.test(phone)) return null;
  return phone;
}

export function whatsAppChatUrl(phone: string, message = "") {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function isWhatsAppGroupUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "chat.whatsapp.com" &&
      !url.username &&
      !url.password &&
      !url.port &&
      /^\/[A-Za-z0-9_-]{10,128}\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function buildThankYouMessage(input: {
  donorName: string;
  amount: number;
  receivedOn: string;
  projectTitle: string;
}) {
  const name = input.donorName.trim().replace(/\s+/g, " ").slice(0, 120);
  const amount = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 2,
  }).format(input.amount);
  const date = new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(input.receivedOn + "T00:00:00Z"));
  return `${name ? `Hello ${name},` : "Hello,"}\n\nThank you for your contribution of PKR ${amount} towards ${input.projectTitle}. We received and verified your donation dated ${date}.\n\nYour generosity helps us turn small efforts into meaningful support for our communities. Thank you for being part of Koshish.\n\nWith gratitude,\nTeam Koshish`;
}
