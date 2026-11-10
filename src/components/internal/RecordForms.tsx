import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortal } from "@/lib/portal-store";
import { slugify } from "@/lib/format";
import { ThankYouDraft } from "@/components/internal/DonationThankYou";
import type { Donation, DonationInput, Expense, Project } from "@/types";

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-md border border-brand-line bg-brand-paper px-3 text-sm font-normal";
const labelClass = "block text-xs font-bold text-[#4f4b43]";
const emptyDonation = () => ({
  receivedOn: new Date().toISOString().slice(0, 10),
  amount: 0,
  donorName: "",
  donorPhone: "",
  whatsappOptIn: false,
  isNamePublic: false,
  source: "Instagram",
  method: "Bank transfer",
  projectId: null as string | null,
  reference: "",
  verified: true,
});
const emptyExpense = () => ({
  spentOn: new Date().toISOString().slice(0, 10),
  amount: 0,
  category: "Ration purchases",
  vendor: "",
  description: "",
  projectId: null as string | null,
  reference: "",
  verified: true,
});

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={labelClass}>
      {label}
      {children}
    </label>
  );
}
function FormDialog({
  title,
  description,
  open,
  onClose,
  children,
  focusIntro = false,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  focusIntro?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        tabIndex={-1}
        ref={contentRef}
        onOpenAutoFocus={
          focusIntro
            ? (event) => {
                event.preventDefault();
                contentRef.current?.focus();
              }
            : undefined
        }
        className="max-h-[92dvh] sm:max-w-2xl overflow-y-auto border-brand-line bg-brand-paper"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.04em]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs leading-5">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
function Submit({ busy }: { busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-ink px-6 text-xs font-bold text-brand-paper hover:bg-brand-brick disabled:opacity-50"
    >
      {busy && <Loader2 size={14} className="animate-spin" />}
      {busy ? "Saving…" : "Save record"}
    </button>
  );
}

export function ProjectForm({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}) {
  const { saveProject, mode } = usePortal();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Food security",
    status: "active" as Project["status"],
    location: "",
    startedOn: new Date().toISOString().slice(0, 10),
    summary: "",
    description: "",
    goalAmount: 0,
    beneficiaries: 0,
    art: "ration" as Project["art"],
  });
  useEffect(() => {
    if (open)
      setForm(
        project
          ? {
              title: project.title,
              slug: project.slug,
              category: project.category,
              status: project.status,
              location: project.location,
              startedOn: project.startedOn,
              summary: project.summary,
              description: project.description,
              goalAmount: project.goalAmount,
              beneficiaries: project.beneficiaries,
              art: project.art,
            }
          : {
              title: "",
              slug: "",
              category: "Food security",
              status: "active",
              location: "",
              startedOn: new Date().toISOString().slice(0, 10),
              summary: "",
              description: "",
              goalAmount: 0,
              beneficiaries: 0,
              art: "ration",
            },
      );
  }, [open, project]);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await saveProject(form, project?.id);
      toast.success(
        mode === "demo"
          ? "Project updated for this preview session."
          : "Project saved.",
      );
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to save project.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={project ? "Edit project" : "Introduce a project"}
      description="Keep the public purpose and impact baseline clear. Financial totals come from linked ledger records."
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Project title">
          <input
            required
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!project) set("slug", slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>
        <Field label="URL slug">
          <input
            required
            pattern="[a-z0-9-]+"
            value={form.slug}
            onChange={(e) => set("slug", slugify(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Category">
          <input
            required
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as Project["status"])}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
          </select>
        </Field>
        <Field label="Location">
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Started on">
          <input
            required
            type="date"
            value={form.startedOn}
            onChange={(e) => set("startedOn", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Funding goal (PKR)">
          <input
            required
            min="0"
            type="number"
            value={form.goalAmount}
            onChange={(e) => set("goalAmount", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="People reached">
          <input
            required
            min="0"
            type="number"
            value={form.beneficiaries}
            onChange={(e) => set("beneficiaries", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Artwork">
          <select
            value={form.art}
            onChange={(e) => set("art", e.target.value as Project["art"])}
            className={inputClass}
          >
            {[
              "ration",
              "education",
              "health",
              "winter",
              "water",
              "recovery",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Short summary">
            <textarea
              required
              rows={2}
              maxLength={220}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              className={`${inputClass} py-3`}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Public description">
            <textarea
              required
              rows={4}
              maxLength={900}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} py-3`}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-brand-line pt-4 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-5 text-xs font-bold"
          >
            Cancel
          </button>
          <Submit busy={busy} />
        </div>
      </form>
    </FormDialog>
  );
}

export function DonationForm({
  open,
  onClose,
  donation,
}: {
  open: boolean;
  onClose: () => void;
  donation?: Donation | null;
}) {
  const { data, saveDonation, mode } = usePortal();
  const [saved, setSaved] = useState<DonationInput | null>(null);
  useEffect(() => {
    if (open) setSaved(null);
  }, [open, donation]);
  const [form, setForm] = useState(emptyDonation);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open)
      setForm(
        donation
          ? {
              receivedOn: donation.receivedOn,
              amount: donation.amount,
              donorName: donation.donorName,
              donorPhone: donation.donorPhone ?? "",
              whatsappOptIn: Boolean(donation.whatsappOptIn),
              isNamePublic: donation.isNamePublic,
              source: donation.source,
              method: donation.method,
              projectId: donation.projectId,
              reference: donation.reference,
              verified: donation.verified,
            }
          : emptyDonation(),
      );
  }, [open, donation]);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await saveDonation(form, donation?.id);
      toast.success(
        mode === "demo"
          ? "Donation updated for this preview session."
          : "Donation saved.",
      );
      if (form.verified && form.whatsappOptIn && form.donorPhone)
        setSaved({ ...form });
      else onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to save donation.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (saved)
    return (
      <FormDialog
        key="thank-you"
        focusIntro
        open={open}
        onClose={onClose}
        title="Donation saved · Say thank you"
        description="The contribution is recorded. Review this optional WhatsApp draft."
      >
        <ThankYouDraft
          donation={saved}
          projectTitle={
            data.projects.find((p) => p.id === saved.projectId)?.title ??
            "the general Koshish fund"
          }
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-md border px-6 text-sm font-bold"
          >
            Done
          </button>
        </div>
      </FormDialog>
    );
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={donation ? "Edit donation" : "Record a donation"}
      description="Individual donations and donor contact details are admin-only. Public reports show aggregate project totals."
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount (PKR)">
          <input
            required
            min="1"
            type="number"
            value={form.amount || ""}
            onChange={(e) => set("amount", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Received on">
          <input
            required
            type="date"
            value={form.receivedOn}
            onChange={(e) => set("receivedOn", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Source">
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            className={inputClass}
          >
            {[
              "Instagram",
              "Website",
              "Community fundraiser",
              "Corporate partner",
              "Direct referral",
              "Other",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Payment method">
          <select
            value={form.method}
            onChange={(e) => set("method", e.target.value)}
            className={inputClass}
          >
            {[
              "Bank transfer",
              "JazzCash",
              "Easypaisa",
              "SadaPay",
              "Cash deposit",
              "Other",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Project allocation">
          <select
            value={form.projectId ?? ""}
            onChange={(e) => set("projectId", e.target.value || null)}
            className={inputClass}
          >
            <option value="">General Koshish fund</option>
            {data.projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Internal reference">
          <input
            required
            value={form.reference}
            onChange={(e) => set("reference", e.target.value)}
            placeholder="KSH-2026-001"
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Donor name (private unless consent is given)">
            <input
              value={form.donorName}
              onChange={(e) => set("donorName", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Donor WhatsApp number (optional · admin-only)">
            <input
              type="tel"
              autoComplete="off"
              maxLength={24}
              placeholder="+92 3XX XXXXXXX"
              value={form.donorPhone}
              onChange={(e) => {
                set("donorPhone", e.target.value);
                set("whatsappOptIn", false);
              }}
              className={inputClass}
            />
          </Field>
        </div>
        <label className="flex items-start gap-3 rounded-md border border-brand-line p-4 text-xs leading-6 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.whatsappOptIn}
            onChange={(e) => set("whatsappOptIn", e.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-brick"
          />
          <span>
            <b>Permission to send a WhatsApp thank-you is recorded</b>
            <br />
            Confirm the donor agreed to receive a message at this number. Saving
            a verified donation will offer a personalized draft; you send it
            manually.
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-md bg-brand-sand p-4 text-xs leading-5 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isNamePublic}
            onChange={(e) => set("isNamePublic", e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#f54e00]"
          />
          <span>
            <b>Public-display consent recorded</b>
            <br />
            Names stay admin-only in this version; this preference is stored for
            any future public recognition feature.
          </span>
        </label>
        <label className="flex items-center gap-3 text-xs font-bold sm:col-span-2">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(e) => set("verified", e.target.checked)}
            className="h-4 w-4 accent-[#f54e00]"
          />
          Verified and ready for public totals
        </label>
        <div className="flex justify-end gap-3 border-t border-brand-line pt-4 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-5 text-xs font-bold"
          >
            Cancel
          </button>
          <Submit busy={busy} />
        </div>
      </form>
    </FormDialog>
  );
}

export function ExpenseForm({
  open,
  onClose,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  expense?: Expense | null;
}) {
  const { data, saveExpense, mode } = usePortal();
  const [form, setForm] = useState(emptyExpense);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open)
      setForm(
        expense
          ? {
              spentOn: expense.spentOn,
              amount: expense.amount,
              category: expense.category,
              vendor: expense.vendor,
              description: expense.description,
              projectId: expense.projectId,
              reference: expense.reference,
              verified: expense.verified,
            }
          : emptyExpense(),
      );
  }, [open, expense]);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await saveExpense(form, expense?.id);
      toast.success(
        mode === "demo"
          ? "Expense updated for this preview session."
          : "Expense saved.",
      );
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to save expense.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={expense ? "Edit expense" : "Record an expense"}
      description="Link spending to a project, then attach a receipt or field proof from the Evidence workspace."
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount (PKR)">
          <input
            required
            min="1"
            type="number"
            value={form.amount || ""}
            onChange={(e) => set("amount", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Spent on">
          <input
            required
            type="date"
            value={form.spentOn}
            onChange={(e) => set("spentOn", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Category">
          <input
            required
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Vendor / payee">
          <input
            required
            value={form.vendor}
            onChange={(e) => set("vendor", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Project allocation">
          <select
            value={form.projectId ?? ""}
            onChange={(e) => set("projectId", e.target.value || null)}
            className={inputClass}
          >
            <option value="">General Koshish fund</option>
            {data.projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Internal reference">
          <input
            required
            value={form.reference}
            onChange={(e) => set("reference", e.target.value)}
            placeholder="EXP-2026-001"
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Purpose / description">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} py-3`}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-xs font-bold sm:col-span-2">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(e) => set("verified", e.target.checked)}
            className="h-4 w-4 accent-[#f54e00]"
          />
          Verified and ready for public totals
        </label>
        <div className="flex justify-end gap-3 border-t border-brand-line pt-4 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-5 text-xs font-bold"
          >
            Cancel
          </button>
          <Submit busy={busy} />
        </div>
      </form>
    </FormDialog>
  );
}

export function EvidenceForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data, uploadEvidence, mode } = usePortal();
  const [form, setForm] = useState({
    projectId: data.projects[0]?.id ?? "",
    expenseId: null as string | null,
    title: "",
    description: "",
    capturedOn: new Date().toISOString().slice(0, 10),
    visibility: "public" as "public" | "internal",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setForm({
        projectId: data.projects[0]?.id ?? "",
        expenseId: null,
        title: "",
        description: "",
        capturedOn: new Date().toISOString().slice(0, 10),
        visibility: "public",
      });
      setFile(null);
    }
  }, [open, data.projects]);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return toast.error("Choose an evidence file.");
    setBusy(true);
    try {
      await uploadEvidence({ ...form, file });
      toast.success(
        mode === "demo"
          ? "Evidence added for this preview session only."
          : "Evidence uploaded and linked.",
      );
      onClose();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to upload evidence.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Add visual evidence"
      description="Upload JPG, PNG, WebP or PDF up to 10 MB. Remove recipient identities and sensitive payment details before publishing."
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Project">
          <select
            required
            value={form.projectId}
            onChange={(e) => set("projectId", e.target.value)}
            className={inputClass}
          >
            {data.projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Linked expense (optional)">
          <select
            value={form.expenseId ?? ""}
            onChange={(e) => set("expenseId", e.target.value || null)}
            className={inputClass}
          >
            <option value="">No linked expense</option>
            {data.expenses
              .filter((item) => item.projectId === form.projectId)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.reference} · {item.vendor}
                </option>
              ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Evidence title">
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} py-3`}
            />
          </Field>
        </div>
        <Field label="Document / capture date">
          <input
            required
            type="date"
            value={form.capturedOn}
            onChange={(e) => set("capturedOn", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Visibility">
          <select
            value={form.visibility}
            onChange={(e) =>
              set("visibility", e.target.value as "public" | "internal")
            }
            className={inputClass}
          >
            <option value="public">Public evidence</option>
            <option value="internal">Internal only</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Evidence file">
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className={`${inputClass} py-2.5`}
            />
          </Field>
          {file && (
            <p className="mt-2 font-mono text-[9px] text-brand-slate">
              {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-brand-line pt-4 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-5 text-xs font-bold"
          >
            Cancel
          </button>
          <Submit busy={busy} />
        </div>
      </form>
    </FormDialog>
  );
}
