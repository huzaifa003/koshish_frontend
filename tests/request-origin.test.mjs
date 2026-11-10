import test from "node:test";
import assert from "node:assert/strict";
import { isSameOriginRequest } from "../src/lib/request-origin.ts";

test("local forms accept the actual requested hostname and port", () => {
  assert.equal(isSameOriginRequest("http://127.0.0.1:3000", "127.0.0.1:3000", "http:"), true);
  assert.equal(isSameOriginRequest("http://localhost:3000", "localhost:3000", "http:"), true);
  assert.equal(isSameOriginRequest("http://localhost:3000", "127.0.0.1:3000", "http:"), false);
  assert.equal(isSameOriginRequest("http://localhost:3001", "localhost:3000", "http:"), false);
});

test("production forms require the same origin and reject missing or forged origins", () => {
  assert.equal(isSameOriginRequest("https://giving.example.org", "giving.example.org", "https:"), true);
  for (const origin of [null, "null", "https://unrelated.example", "http://giving.example.org", "https://giving.example.org.evil.example", "https://giving.example.org/path", "https://evil@giving.example.org"]) {
    assert.equal(isSameOriginRequest(origin, "giving.example.org", "https:"), false);
  }
  assert.equal(isSameOriginRequest("https://giving.example.org", null, "https:"), false);
});
