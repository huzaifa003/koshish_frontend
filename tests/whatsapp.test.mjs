import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWhatsAppPhone,
  whatsAppChatUrl,
  isWhatsAppGroupUrl,
  buildThankYouMessage,
} from "../src/lib/whatsapp.ts";
test("WhatsApp recipients normalize Pakistani local and international numbers", () => {
  for (const input of ["0323-8999-060", "+92 323 8999060", "923238999060"])
    assert.equal(normalizeWhatsAppPhone(input), "923238999060");
  for (const input of [
    "",
    "123",
    "+92abc3238999060",
    "00000000000",
    "1".repeat(16),
  ])
    assert.equal(normalizeWhatsAppPhone(input), null);
  assert.equal(whatsAppChatUrl("bad"), null);
  const url = new URL(whatsAppChatUrl("+92 323 8999060", "Thanks & welcome!"));
  assert.equal(url.pathname, "/923238999060");
  assert.equal(url.searchParams.get("text"), "Thanks & welcome!");
});
test("group invites reject unrelated hosts, unsafe schemes, and credentials", () => {
  assert.equal(
    isWhatsAppGroupUrl("https://chat.whatsapp.com/AbCdEf1234567890123456"),
    true,
  );
  for (const url of [
    "",
    "https://example.org/invite",
    "https://chat.whatsapp.com.evil.test/AbCdEf1234567890123456",
    "javascript:alert(1)",
    "http://chat.whatsapp.com/AbCdEf1234567890123456",
    "https://user@chat.whatsapp.com/AbCdEf1234567890123456",
  ])
    assert.equal(isWhatsAppGroupUrl(url), false);
});
test("thank-you drafts personalize only the selected contribution and avoid internal references", () => {
  const message = buildThankYouMessage({
    donorName: "  Ayesha  ",
    amount: 2500,
    receivedOn: "2026-11-10",
    projectTitle: "Ration & Relief",
  });
  assert.match(message, /Hello Ayesha,/);
  assert.match(message, /PKR 2,500/);
  assert.match(message, /Ration & Relief/);
  assert.match(message, /10 November 2026/);
  assert.match(message, /Team Koshish/);
  const unnamed = buildThankYouMessage({
    donorName: "",
    amount: 100,
    receivedOn: "2026-11-10",
    projectTitle: "the general Koshish fund",
  });
  assert.ok(unnamed.startsWith("Hello,"));
});
