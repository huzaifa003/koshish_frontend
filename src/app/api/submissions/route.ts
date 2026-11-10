import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { submissionSchema } from "@/lib/submissions";
import { isSameOriginRequest } from "@/lib/request-origin";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request.headers.get("origin"), request.headers.get("host"), request.nextUrl.protocol))
    return NextResponse.json(
      { error: "Please submit this form from the Koshish website." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") ?? 0) > 16000)
    return NextResponse.json(
      { error: "The message is too long." },
      { status: 413 },
    );
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    return NextResponse.json(
      {
        error:
          "Online requests are not connected yet. Please message @kosshissh on Instagram.",
      },
      { status: 503 },
    );
  let input: unknown;
  try {
    const body = await request.text();
    if (body.length > 16000)
      return NextResponse.json(
        { error: "The message is too long." },
        { status: 413 },
      );
    input = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please check your details.",
      },
      { status: 400 },
    );
  const data = parsed.data;
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken)
      return NextResponse.json(
        { error: "Please complete the verification." },
        { status: 400 },
      );
    try {
      const verification = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: data.turnstileToken,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      const result = await verification.json();
      if (!result.success)
        return NextResponse.json(
          { error: "Verification expired. Please try again." },
          { status: 400 },
        );
    } catch {
      return NextResponse.json(
        { error: "Verification is unavailable. Please try again." },
        { status: 503 },
      );
    }
  }
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (data.projectId) {
    const { data: project, error } = await db
      .from("projects")
      .select("id,status")
      .eq("id", data.projectId)
      .maybeSingle();
    if (error)
      return NextResponse.json(
        { error: "Project details are unavailable. Please try again." },
        { status: 503 },
      );
    if (!project || project.status !== "active")
      return NextResponse.json(
        {
          error:
            "This campaign is no longer accepting contributions. Please choose another.",
        },
        { status: 400 },
      );
  }
  const { error } = await db.rpc("submit_inquiry", {
    p_kind: data.kind,
    p_name: data.name,
    p_email: data.email,
    p_project_id: data.projectId,
    p_amount: data.amount,
    p_message: data.message,
    p_rate_key: createHash("sha256").update(data.email).digest("hex"),
  });
  if (error) {
    if (error.message.includes("rate_limit"))
      return NextResponse.json(
        { error: "You’ve sent several requests. Please try again in an hour." },
        { status: 429 },
      );
    console.error("Inquiry save failed", error.code);
    return NextResponse.json(
      { error: "Your request could not be saved. Please try again." },
      { status: 503 },
    );
  }
  return NextResponse.json(
    {
      message:
        "Your request has been received. The team can follow up using the email you provided.",
    },
    { status: 201 },
  );
}
