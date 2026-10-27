/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { demoData } from "@/data/demo";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Donation, DonationInput, EvidenceInput, EvidenceItem, Expense, ExpenseInput, PortalData, Project, ProjectInput, Role, SettingsInput, SiteSettings, TeamMember } from "@/types";

type User = { id: string; email: string } | null;
type RecordKind = "projects" | "donations" | "expenses";

interface PortalContextValue {
  data: PortalData;
  mode: "demo" | "live";
  loading: boolean;
  user: User;
  role: Role | null;
  loginDemo: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
  saveProject: (input: ProjectInput, id?: string) => Promise<void>;
  saveDonation: (input: DonationInput, id?: string) => Promise<void>;
  saveExpense: (input: ExpenseInput, id?: string) => Promise<void>;
  deleteRecord: (kind: RecordKind, id: string) => Promise<void>;
  uploadEvidence: (input: EvidenceInput) => Promise<void>;
  deleteEvidence: (item: EvidenceItem) => Promise<void>;
  saveSettings: (input: SettingsInput) => Promise<void>;
  saveTeamMember: (member: Pick<TeamMember, "userId" | "email" | "role">) => Promise<void>;
  removeTeamMember: (userId: string) => Promise<void>;
}

const PortalContext = createContext<PortalContextValue | null>(null);
const now = () => new Date().toISOString();
const cloneDemo = () => structuredClone(demoData);

const mapProject = (row: Record<string, unknown>): Project => ({
  id: String(row.id), slug: String(row.slug), title: String(row.title), category: String(row.category),
  status: row.status as Project["status"], location: String(row.location), startedOn: String(row.started_on),
  summary: String(row.summary), description: String(row.description), goalAmount: Number(row.goal_amount),
  beneficiaries: Number(row.beneficiaries), art: row.art as Project["art"], createdAt: String(row.created_at),
});
const mapDonation = (row: Record<string, unknown>): Donation => ({
  id: String(row.id), receivedOn: String(row.received_on), amount: Number(row.amount), donorName: String(row.donor_name ?? ""),
  isNamePublic: Boolean(row.is_name_public), source: String(row.source), method: String(row.method),
  projectId: row.project_id ? String(row.project_id) : null, reference: String(row.reference ?? ""),
  verified: Boolean(row.verified), createdAt: String(row.created_at),
});
const mapExpense = (row: Record<string, unknown>): Expense => ({
  id: String(row.id), spentOn: String(row.spent_on), amount: Number(row.amount), category: String(row.category),
  vendor: String(row.vendor), description: String(row.description), projectId: row.project_id ? String(row.project_id) : null,
  reference: String(row.reference ?? ""), verified: Boolean(row.verified), createdAt: String(row.created_at),
});
const mapEvidence = (row: Record<string, unknown>): EvidenceItem => ({
  id: String(row.id), projectId: String(row.project_id), expenseId: row.expense_id ? String(row.expense_id) : null,
  title: String(row.title), description: String(row.description ?? ""), url: String(row.public_url ?? ""),
  storagePath: row.storage_path ? String(row.storage_path) : null, bucket: row.bucket ? String(row.bucket) : null,
  mimeType: String(row.mime_type), visibility: row.visibility as EvidenceItem["visibility"], capturedOn: String(row.captured_on), createdAt: String(row.created_at),
});
const mapSettings = (row: Record<string, unknown>): SiteSettings => ({
  id: String(row.id), donationUrl: String(row.donation_url), instagramUrl: String(row.instagram_url),
  tagline: String(row.tagline), updatedAt: String(row.updated_at),
});

export function PortalProvider({ children }: { children: ReactNode }) {
  const mode = isSupabaseConfigured ? "live" : "demo";
  const [data, setData] = useState<PortalData>(() => mode === "demo" ? cloneDemo() : { ...cloneDemo(), projects: [], donations: [], expenses: [], evidence: [], team: [] });
  const [loading, setLoading] = useState(mode === "live");
  const [user, setUser] = useState<User>(null);
  const [role, setRole] = useState<Role | null>(null);

  const refreshData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let hasTeamAccess = false;
      if (sessionData.session) {
        const roleResult = await supabase.from("user_roles").select("role").eq("user_id", sessionData.session.user.id).maybeSingle();
        hasTeamAccess = roleResult.data?.role === "admin" || roleResult.data?.role === "editor";
      }
      const [projects, donations, expenses, evidence, settings] = await Promise.all([
        supabase.from("projects").select("*").order("started_on", { ascending: false }),
        supabase.from(hasTeamAccess ? "donations" : "public_donations").select("*").order("received_on", { ascending: false }),
        supabase.from("expenses").select("*").order("spent_on", { ascending: false }),
        supabase.from("evidence").select("*").order("captured_on", { ascending: false }),
        supabase.from("site_settings").select("*").eq("id", "main").maybeSingle(),
      ]);
      const failure = [projects, donations, expenses, evidence, settings].find((result) => result.error);
      if (failure?.error) throw failure.error;
      let team: TeamMember[] = [];
      if (hasTeamAccess) {
        const teamResult = await supabase.from("user_roles").select("*").order("created_at", { ascending: true });
        if (teamResult.error) throw teamResult.error;
        team = (teamResult.data ?? []).map((row) => ({ userId: String(row.user_id), email: row.email ? String(row.email) : null, role: row.role as Role, createdAt: String(row.created_at) }));
      }
      const evidenceRows = await Promise.all((evidence.data ?? []).map(async (row) => {
        if (row.bucket === "internal-evidence" && row.storage_path && sessionData.session) {
          const { data: signed, error: signedError } = await supabase!.storage.from("internal-evidence").createSignedUrl(String(row.storage_path), 3600);
          if (signedError) throw signedError;
          return { ...row, public_url: signed?.signedUrl ?? "" };
        }
        return row;
      }));
      setData({
        projects: (projects.data ?? []).map(mapProject), donations: (donations.data ?? []).map(mapDonation),
        expenses: (expenses.data ?? []).map(mapExpense), evidence: evidenceRows.map(mapEvidence),
        settings: settings.data ? mapSettings(settings.data) : cloneDemo().settings, team,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void refreshData().catch((error) => console.error("Unable to load portal data", error));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ? { id: session.user.id, email: session.user.email ?? "Team member" } : null;
      setUser(nextUser);
      if (!nextUser) {
        setRole(null);
        void refreshData().catch((error) => console.error("Unable to refresh public data", error));
        return;
      }
      void supabase!.from("user_roles").select("role").eq("user_id", nextUser.id).maybeSingle().then(({ data: roleRow, error }) => {
        if (error) console.error("Unable to verify team role", error);
        setRole(roleRow?.role === "admin" || roleRow?.role === "editor" ? roleRow.role : null);
        void refreshData().catch((refreshError) => console.error("Unable to refresh team data", refreshError));
      });
    });
    return () => listener.subscription.unsubscribe();
  }, [refreshData]);

  const loginDemo = () => {
    setUser({ id: "demo-admin", email: "admin@koshish.demo" });
    setRole("admin");
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      if (email === "admin@koshish.demo" && password === "koshish-demo") return loginDemo();
      throw new Error("Use the demo access button, or connect Supabase for your real team login.");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabase && mode === "live") {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
    setRole(null);
  };

  const requireRole = () => {
    if (!role) throw new Error("Your account does not have internal portal access.");
    return role;
  };

  const saveProject = async (input: ProjectInput, id?: string) => {
    requireRole();
    if (!supabase) {
      setData((current) => ({ ...current, projects: id ? current.projects.map((item) => item.id === id ? { ...input, id, createdAt: item.createdAt } : item) : [{ ...input, id: crypto.randomUUID(), createdAt: now() }, ...current.projects] }));
      return;
    }
    const row = { slug: input.slug, title: input.title, category: input.category, status: input.status, location: input.location, started_on: input.startedOn, summary: input.summary, description: input.description, goal_amount: input.goalAmount, beneficiaries: input.beneficiaries, art: input.art, updated_at: now() };
    const query = id ? supabase.from("projects").update(row).eq("id", id) : supabase.from("projects").insert({ ...row, created_by: user?.id });
    const { error } = await query;
    if (error) throw error;
    await refreshData();
  };

  const saveDonation = async (input: DonationInput, id?: string) => {
    requireRole();
    if (!supabase) {
      setData((current) => ({ ...current, donations: id ? current.donations.map((item) => item.id === id ? { ...input, id, createdAt: item.createdAt } : item) : [{ ...input, id: crypto.randomUUID(), createdAt: now() }, ...current.donations] }));
      return;
    }
    const row = { received_on: input.receivedOn, amount: input.amount, donor_name: input.donorName, is_name_public: input.isNamePublic, source: input.source, method: input.method, project_id: input.projectId, reference: input.reference, verified: input.verified, updated_at: now() };
    const query = id ? supabase.from("donations").update(row).eq("id", id) : supabase.from("donations").insert({ ...row, created_by: user?.id });
    const { error } = await query;
    if (error) throw error;
    await refreshData();
  };

  const saveExpense = async (input: ExpenseInput, id?: string) => {
    requireRole();
    if (!supabase) {
      setData((current) => ({ ...current, expenses: id ? current.expenses.map((item) => item.id === id ? { ...input, id, createdAt: item.createdAt } : item) : [{ ...input, id: crypto.randomUUID(), createdAt: now() }, ...current.expenses] }));
      return;
    }
    const row = { spent_on: input.spentOn, amount: input.amount, category: input.category, vendor: input.vendor, description: input.description, project_id: input.projectId, reference: input.reference, verified: input.verified, updated_at: now() };
    const query = id ? supabase.from("expenses").update(row).eq("id", id) : supabase.from("expenses").insert({ ...row, created_by: user?.id });
    const { error } = await query;
    if (error) throw error;
    await refreshData();
  };

  const deleteRecord = async (kind: RecordKind, id: string) => {
    if (requireRole() !== "admin") throw new Error("Only admins can delete records.");
    if (!supabase) {
      setData((current) => ({ ...current, [kind]: current[kind].filter((item) => item.id !== id) }));
      return;
    }
    const { error } = await supabase.from(kind).delete().eq("id", id);
    if (error) throw error;
    await refreshData();
  };

  const uploadEvidence = async (input: EvidenceInput) => {
    requireRole();
    if (!input.file) throw new Error("Choose an image or PDF to upload.");
    if (input.file.size > 10 * 1024 * 1024) throw new Error("Evidence files must be 10 MB or smaller.");
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(input.file.type)) throw new Error("Use a JPG, PNG, WebP or PDF file.");
    if (!supabase) {
      const item: EvidenceItem = { id: crypto.randomUUID(), projectId: input.projectId, expenseId: input.expenseId, title: input.title, description: input.description, visibility: input.visibility, capturedOn: input.capturedOn, url: URL.createObjectURL(input.file), storagePath: null, bucket: null, mimeType: input.file.type, createdAt: now() };
      setData((current) => ({ ...current, evidence: [item, ...current.evidence] }));
      return;
    }
    const bucket = input.visibility === "public" ? "public-evidence" : "internal-evidence";
    const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const storagePath = `${input.projectId}/${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage.from(bucket).upload(storagePath, input.file, { contentType: input.file.type });
    if (upload.error) throw upload.error;
    const publicUrl = bucket === "public-evidence" ? supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl : null;
    const { error } = await supabase.from("evidence").insert({ project_id: input.projectId, expense_id: input.expenseId, title: input.title, description: input.description, storage_path: storagePath, bucket, public_url: publicUrl, mime_type: input.file.type, visibility: input.visibility, captured_on: input.capturedOn, uploaded_by: user?.id });
    if (error) {
      await supabase.storage.from(bucket).remove([storagePath]);
      throw error;
    }
    await refreshData();
  };

  const deleteEvidence = async (item: EvidenceItem) => {
    if (requireRole() !== "admin") throw new Error("Only admins can delete evidence.");
    if (!supabase) {
      setData((current) => ({ ...current, evidence: current.evidence.filter((entry) => entry.id !== item.id) }));
      return;
    }
    if (item.bucket && item.storagePath) {
      const { error } = await supabase.storage.from(item.bucket).remove([item.storagePath]);
      if (error) throw error;
    }
    const { error } = await supabase.from("evidence").delete().eq("id", item.id);
    if (error) throw error;
    await refreshData();
  };

  const saveSettings = async (input: SettingsInput) => {
    if (requireRole() !== "admin") throw new Error("Only admins can change portal settings.");
    if (!supabase) {
      setData((current) => ({ ...current, settings: { ...input, id: "main", updatedAt: now() } }));
      return;
    }
    const { error } = await supabase.from("site_settings").upsert({ id: "main", donation_url: input.donationUrl, instagram_url: input.instagramUrl, tagline: input.tagline, updated_at: now() });
    if (error) throw error;
    await refreshData();
  };

  const saveTeamMember = async (member: Pick<TeamMember, "userId" | "email" | "role">) => {
    if (requireRole() !== "admin") throw new Error("Only admins can manage the team.");
    if (!supabase) {
      setData((current) => ({ ...current, team: [...current.team.filter((item) => item.userId !== member.userId), { ...member, createdAt: now() }] }));
      return;
    }
    const { error } = await supabase.from("user_roles").upsert({ user_id: member.userId, email: member.email, role: member.role });
    if (error) throw error;
    await refreshData();
  };

  const removeTeamMember = async (userId: string) => {
    if (requireRole() !== "admin") throw new Error("Only admins can manage the team.");
    if (userId === user?.id) throw new Error("You cannot remove your own access while signed in.");
    if (!supabase) {
      setData((current) => ({ ...current, team: current.team.filter((item) => item.userId !== userId) }));
      return;
    }
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (error) throw error;
    await refreshData();
  };

  const value: PortalContextValue = { data, mode, loading, user, role, loginDemo, signIn, signOut, refreshData, saveProject, saveDonation, saveExpense, deleteRecord, uploadEvidence, deleteEvidence, saveSettings, saveTeamMember, removeTeamMember };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal must be used inside PortalProvider");
  return context;
};
