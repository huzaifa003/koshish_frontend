import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { submissionSchema } from "../src/lib/submissions.ts";
const admin = "00000000-0000-4000-8000-000000000001";
const editor = "00000000-0000-4000-8000-000000000002";
const project = "10000000-0000-4000-8000-000000000001";
test("submission validation rejects missing consent, invalid campaign IDs, zero donations, and honeypots", () => {
  const good = {
    kind: "donate",
    name: "Test contributor",
    email: "test@example.com",
    amount: 2500,
    message: "I would like to support this project.",
    consent: true,
  };
  assert.equal(submissionSchema.safeParse(good).success, true);
  for (const change of [
    { consent: false },
    { amount: 0 },
    { projectId: "not-a-uuid" },
    { website: "bot-filled" },
    { email: "broken" },
    { message: "short" },
  ])
    assert.equal(
      submissionSchema.safeParse({ ...good, ...change }).success,
      false,
    );
  assert.equal(
    submissionSchema.safeParse({ ...good, kind: "volunteer", amount: null })
      .success,
    true,
  );
});
test("real PostgreSQL policies protect transactions and inquiries while exposing reconciled aggregates", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean);create table storage.objects(id uuid,bucket_id text);alter table storage.objects enable row level security;
 insert into auth.users values ('${admin}'),('${editor}');`);
    const schema = (
      await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8")
    ).replace("create extension if not exists pgcrypto;", "");
    await db.exec(schema);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611100001_whatsapp_manual.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    // Reapply the upgrade to verify an existing installation can safely use it.
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611090001_fundraising_privacy.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(`grant usage on schema public to anon,authenticated,service_role;
 insert into public.user_roles(user_id,role) values ('${admin}','admin'),('${editor}','editor');
 insert into public.projects(id,slug,title,category,status,location,started_on,summary,description) values ('${project}','test','Test campaign','Food','active','Lahore',current_date,'Food support','A test mission');
 insert into public.donations(received_on,amount,donor_name,source,method,project_id,reference,verified) values(current_date,1000,'PRIVATE DONOR','Web','Bank','${project}','SECRET REF',true),(current_date,500,'PRIVATE DONOR','Web','Bank','${project}','UNVERIFIED',false),(current_date,200,'','Web','Bank',null,'GENERAL',true);
 insert into public.expenses(spent_on,amount,category,vendor,description,project_id,reference,verified) values(current_date,400,'Food','PRIVATE VENDOR','Food','${project}','SECRET EXPENSE',true),(current_date,50,'Food','PRIVATE VENDOR','Food','${project}','UNVERIFIED',false);`);
    await assert.rejects(
      db.query("delete from public.projects where id=$1", [project]),
      /foreign key constraint/,
    );
    await assert.rejects(
      db.query("update public.donations set donor_phone='not-a-phone'"),
      /check constraint/,
    );
    await assert.rejects(
      db.query("update public.donations set whatsapp_opt_in=true"),
      /check constraint/,
    );
    await db.exec(
      "update public.donations set donor_phone='923001234567',whatsapp_opt_in=true",
    );
    assert.ok(
      (
        await db.query(
          "select whatsapp_opt_in_at from public.donations limit 1",
        )
      ).rows[0].whatsapp_opt_in_at,
    );
    await assert.rejects(
      db.query(
        "update public.site_settings set whatsapp_group_url='https://evil.example/invite'",
      ),
      /check constraint/,
    );
    await db.exec("set role anon");
    const result = await db.query(
      "select * from public.public_project_finances()",
    );
    assert.deepEqual(Object.keys(result.rows[0]).sort(), [
      "donation_count",
      "project_id",
      "raised",
      "spent",
    ]);
    assert.equal(
      Number(result.rows.find((r) => r.project_id === project).raised),
      1000,
    );
    assert.equal(
      Number(result.rows.find((r) => r.project_id === project).spent),
      400,
    );
    assert.equal(
      Number(result.rows.find((r) => r.project_id === null).raised),
      200,
    );
    await assert.rejects(
      db.query("select * from public.donations"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from public.expenses"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from public.inquiries"),
      /permission denied/,
    );
    await db.exec(
      `reset role;set role authenticated;set request.jwt.claim.sub='${editor}'`,
    );
    assert.equal(
      (await db.query("select * from public.donations")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.expenses")).rows.length,
      0,
    );
    await assert.rejects(
      db.query(
        `insert into public.donations(received_on,amount,source,method,reference) values(current_date,1,'x','x','x')`,
      ),
      /row-level security/,
    );
    await db.exec(`set request.jwt.claim.sub='${admin}'`);
    assert.equal(
      (await db.query("select * from public.donations")).rows.length,
      3,
    );
    assert.equal(
      (await db.query("select * from public.expenses")).rows.length,
      2,
    );
    await db.exec("reset role;set role service_role");
    for (let i = 0; i < 5; i++)
      await db.query("select public.submit_inquiry($1,$2,$3,$4,$5,$6,$7)", [
        "donate",
        "Test person",
        "test@example.com",
        project,
        1000,
        "Interested in this project",
        "test-rate-key",
      ]);
    await assert.rejects(
      db.query("select public.submit_inquiry($1,$2,$3,$4,$5,$6,$7)", [
        "donate",
        "Test person",
        "test@example.com",
        project,
        1000,
        "Interested in this project",
        "test-rate-key",
      ]),
      /rate_limit/,
    );
    await db.exec(
      `reset role;set role authenticated;set request.jwt.claim.sub='${editor}'`,
    );
    assert.equal(
      (await db.query("select * from public.inquiries")).rows.length,
      0,
    );
    await assert.rejects(
      db.query("select public.submit_inquiry($1,$2,$3,$4,$5,$6,$7)", [
        "contact",
        "Test person",
        "test@example.com",
        null,
        null,
        "Interested in this project",
        "other",
      ]),
      /permission denied/,
    );
    await db.exec(`set request.jwt.claim.sub='${admin}'`);
    assert.equal(
      (await db.query("select * from public.inquiries")).rows.length,
      5,
    );
  } finally {
    await db.close();
  }
});
