"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePortal } from "@/lib/portal-store";
import { supabase } from "@/lib/supabase";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
type Inquiry = {
  id: string;
  kind: string;
  name: string;
  email: string;
  message: string;
  project_id: string | null;
  amount: number | null;
  status: string;
  created_at: string;
};
export function Inbox() {
  const { role, mode, data } = usePortal();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (role !== "admin") return;
    setLoading(true);
    setError("");
    try {
      if (!supabase) {
        setItems([]);
        return;
      }
      const { data: rows, error } = await supabase
        .from("inquiries")
        .select(
          "id,kind,name,email,message,project_id,amount,status,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setItems(rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  }, [role]);
  useEffect(() => {
    void load();
  }, [load]);
  const update = async (id: string, status: string) => {
    if (!supabase || role !== "admin") return;
    setSaving(id);
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setItems((current) =>
        current.map((i) => (i.id === id ? { ...i, status } : i)),
      );
      toast.success("Request status updated.");
    } catch {
      toast.error("Unable to update the request.");
    } finally {
      setSaving(null);
    }
  };
  if (role !== "admin") return null;
  const shown = items.filter((i) => filter === "all" || i.kind === filter);
  return (
    <div>
      <p className="eyebrow">Private admin inbox</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        Contributions & conversations
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-slate">
        Donation inquiries, volunteer interests, and contact messages. An
        inquiry is not a received donation; record funds separately after
        payment is verified.
      </p>
      <div className="my-7 flex flex-wrap justify-between gap-4">
        <label className="text-sm">
          Show{" "}
          <select
            className="ml-2 rounded-md border bg-white p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All requests</option>
            <option value="donate">Donation inquiries</option>
            <option value="volunteer">Volunteer interests</option>
            <option value="contact">Contact messages</option>
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh inbox
        </Button>
      </div>
      {loading ? (
        <p role="status">Loading private requests…</p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      ) : !shown.length ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-brand-slate">
          {mode === "demo"
            ? "Preview inbox · Connect Supabase to receive real requests."
            : "No requests match this view yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((i) => (
            <article key={i.id} className="rounded-xl border bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="capitalize">
                    {i.kind === "donate" ? "Donation inquiry" : i.kind}
                  </Badge>
                  <h2 className="mt-3 font-bold">{i.name}</h2>
                  <p className="mt-1 text-sm text-brand-slate">{i.email}</p>
                  <p className="mt-2 text-xs text-brand-slate">
                    {new Intl.DateTimeFormat("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Karachi",
                    }).format(new Date(i.created_at))}{" "}
                    (Pakistan)
                  </p>
                </div>
                <label className="text-xs font-semibold">
                  Status
                  <select
                    value={i.status}
                    disabled={saving === i.id}
                    onChange={(e) => void update(i.id, e.target.value)}
                    className="ml-2 rounded-md border bg-white px-3 py-2"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>
              <p className="mt-5 text-xs font-semibold">
                {data.projects.find((p) => p.id === i.project_id)?.title ??
                  "General inquiry"}
                {i.amount ? " · " + formatPKR(Number(i.amount)) : ""}
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-brand-slate">
                {i.message}
              </p>
            </article>
          ))}
        </div>
      )}
      <p className="mt-5 text-xs text-brand-slate">
        Showing the latest 200 requests. Personal details remain admin-only.
      </p>
    </div>
  );
}
