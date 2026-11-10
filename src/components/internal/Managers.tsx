import { useState } from "react";
import {
  FileText,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { DonationThankYou } from "@/components/internal/DonationThankYou";
import { ProjectArtwork } from "@/components/ProjectArtwork";
import {
  DonationForm,
  EvidenceForm,
  ExpenseForm,
  ProjectForm,
} from "@/components/internal/RecordForms";
import { usePortal } from "@/lib/portal-store";
import {
  donorLabel,
  formatDate,
  formatNumber,
  formatPKR,
  getProjectName,
} from "@/lib/format";
import type { Donation, Expense, Project } from "@/types";

const inputClass =
  "min-h-11 rounded-md border border-brand-line bg-brand-paper px-3 text-xs";
function Heading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-brand-slate">
          {eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.055em]">
          {title}
        </h1>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-brand-brick px-5 text-xs font-bold text-white hover:bg-brand-brick"
      >
        <Plus size={15} />
        {action}
      </button>
    </div>
  );
}
function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative mt-7 block max-w-md">
      <span className="sr-only">Search records</span>
      <Search size={15} className="absolute left-3 top-3.5 text-brand-slate" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputClass} w-full pl-9`}
      />
    </label>
  );
}
function IconButton({
  label,
  onClick,
  children,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-full border border-brand-line transition-colors ${danger ? "hover:border-[#a63c25] hover:text-[#a63c25]" : "hover:border-brand-brick hover:text-brand-brick"}`}
    >
      {children}
    </button>
  );
}

export function ProjectsManager() {
  const { data, role, deleteRecord } = usePortal();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const projects = data.projects.filter((item) =>
    `${item.title} ${item.category} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const remove = async (project: Project) => {
    if (
      !window.confirm(
        `Delete “${project.title}”? Projects with financial records cannot be deleted. Mark them completed to preserve their history.`,
      )
    )
      return;
    try {
      await deleteRecord("projects", project.id);
      toast.success("Project deleted.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to delete project.",
      );
    }
  };
  return (
    <div>
      <Heading
        eyebrow="Impact catalogue"
        title="Projects"
        action="Introduce project"
        onAction={() => {
          setEditing(null);
          setOpen(true);
        }}
      />
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search projects…"
      />
      <div className="mt-7 divide-y divide-[#cec7b8] border-y border-brand-line">
        {projects.map((project) => {
          const raised =
            data.finances.find((f) => f.projectId === project.id)?.raised ?? 0;
          const spent =
            data.finances.find((f) => f.projectId === project.id)?.spent ?? 0;
          return (
            <article
              key={project.id}
              className="grid gap-4 py-5 md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              <div className="flex items-center gap-4">
                <ProjectArtwork
                  type={project.art}
                  className="hidden h-16 w-24 shrink-0 rounded-md sm:block"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">
                      {project.title}
                    </h2>
                    <span className="rounded-full bg-brand-sand px-2 py-0.5 font-mono text-[8px] uppercase">
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-slate">
                    {project.category} · {project.location} ·{" "}
                    {formatNumber(project.beneficiaries)} reached
                  </p>
                </div>
              </div>
              <div className="flex gap-8 font-mono text-[10px]">
                <span>
                  Received{" "}
                  <b className="block text-xs">{formatPKR(raised, true)}</b>
                </span>
                <span>
                  Spent{" "}
                  <b className="block text-xs">{formatPKR(spent, true)}</b>
                </span>
              </div>
              <div className="flex gap-2">
                <IconButton
                  label={`Edit ${project.title}`}
                  onClick={() => {
                    setEditing(project);
                    setOpen(true);
                  }}
                >
                  <Pencil size={15} />
                </IconButton>
                {role === "admin" && (
                  <IconButton
                    danger
                    label={`Delete ${project.title}`}
                    onClick={() => void remove(project)}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!projects.length && (
        <p className="py-12 text-center text-sm">
          No projects match this search.
        </p>
      )}
      <ProjectForm
        open={open}
        onClose={() => setOpen(false)}
        project={editing}
      />
    </div>
  );
}

export function DonationsManager() {
  const { data, role, deleteRecord } = usePortal();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Donation | null>(null);
  const donations = data.donations
    .filter((item) =>
      `${item.donorName} ${item.source} ${item.reference} ${item.method}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.receivedOn.localeCompare(a.receivedOn));
  const remove = async (item: Donation) => {
    if (!window.confirm(`Delete donation ${item.reference}?`)) return;
    try {
      await deleteRecord("donations", item.id);
      toast.success("Donation deleted.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to delete donation.",
      );
    }
  };
  return (
    <div>
      <Heading
        eyebrow="Money in"
        title="Donations"
        action="Record donation"
        onAction={() => {
          setEditing(null);
          setOpen(true);
        }}
      />
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search donor, source or reference…"
      />
      <div className="mt-7 overflow-x-auto">
        <div className="hidden grid-cols-[110px_1.2fr_1fr_1fr_120px_132px] gap-4 border-b border-brand-line pb-3 font-mono text-[9px] uppercase tracking-wider text-brand-slate md:grid">
          <span>Date</span>
          <span>Donor / source</span>
          <span>Project</span>
          <span>Reference</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        <div className="divide-y divide-[#d3ccbd]">
          {donations.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 py-4 md:grid-cols-[110px_1.2fr_1fr_1fr_120px_88px] md:items-center md:gap-4"
            >
              <span className="font-mono text-[10px] text-brand-slate">
                {formatDate(item.receivedOn)}
              </span>
              <div>
                <p className="text-xs font-bold">{donorLabel(item)}</p>
                <p className="mt-0.5 text-[10px] text-brand-slate">
                  {item.source} · {item.method}
                  {!item.isNamePublic && item.donorName
                    ? " · name private"
                    : ""}
                </p>
              </div>
              <span className="text-xs">
                {getProjectName(data.projects, item.projectId)}
              </span>
              <div>
                <span className="font-mono text-[10px]">{item.reference}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 font-mono text-[8px] ${item.verified ? "bg-brand-sand text-brand-slate" : "bg-[#eee1b9] text-[#6e5417]"}`}
                >
                  {item.verified ? "Verified" : "Pending"}
                </span>
              </div>
              <span className="font-display numeric text-left font-semibold text-brand-brick md:text-right">
                +{formatPKR(item.amount)}
              </span>
              <div className="flex gap-2">
                <DonationThankYou
                  donation={item}
                  projectTitle={getProjectName(data.projects, item.projectId)}
                />
                <IconButton
                  label="Edit donation"
                  onClick={() => {
                    setEditing(item);
                    setOpen(true);
                  }}
                >
                  <Pencil size={14} />
                </IconButton>
                {role === "admin" && (
                  <IconButton
                    danger
                    label="Delete donation"
                    onClick={() => void remove(item)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      {!donations.length && (
        <p className="py-12 text-center text-sm">
          No donations match this search.
        </p>
      )}
      <DonationForm
        open={open}
        onClose={() => setOpen(false)}
        donation={editing}
      />
    </div>
  );
}

export function ExpensesManager() {
  const { data, role, deleteRecord } = usePortal();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const expenses = data.expenses
    .filter((item) =>
      `${item.vendor} ${item.category} ${item.reference} ${item.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.spentOn.localeCompare(a.spentOn));
  const remove = async (item: Expense) => {
    if (
      !window.confirm(
        `Delete expense ${item.reference}? Linked evidence may also need review.`,
      )
    )
      return;
    try {
      await deleteRecord("expenses", item.id);
      toast.success("Expense deleted.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to delete expense.",
      );
    }
  };
  return (
    <div>
      <Heading
        eyebrow="Work funded"
        title="Expenses"
        action="Record expense"
        onAction={() => {
          setEditing(null);
          setOpen(true);
        }}
      />
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search vendor, purpose or reference…"
      />
      <div className="mt-7 overflow-x-auto">
        <div className="hidden grid-cols-[110px_1.2fr_1fr_1fr_120px_88px] gap-4 border-b border-brand-line pb-3 font-mono text-[9px] uppercase tracking-wider text-brand-slate md:grid">
          <span>Date</span>
          <span>Vendor / purpose</span>
          <span>Project</span>
          <span>Reference</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        <div className="divide-y divide-[#d3ccbd]">
          {expenses.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 py-4 md:grid-cols-[110px_1.2fr_1fr_1fr_120px_88px] md:items-center md:gap-4"
            >
              <span className="font-mono text-[10px] text-brand-slate">
                {formatDate(item.spentOn)}
              </span>
              <div>
                <p className="text-xs font-bold">{item.vendor}</p>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-brand-slate">
                  {item.category} · {item.description}
                </p>
              </div>
              <span className="text-xs">
                {getProjectName(data.projects, item.projectId)}
              </span>
              <div>
                <span className="font-mono text-[10px]">{item.reference}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 font-mono text-[8px] ${item.verified ? "bg-brand-sand text-brand-slate" : "bg-[#eee1b9] text-[#6e5417]"}`}
                >
                  {item.verified ? "Verified" : "Pending"}
                </span>
              </div>
              <span className="font-display numeric text-left font-semibold md:text-right">
                −{formatPKR(item.amount)}
              </span>
              <div className="flex gap-2">
                <IconButton
                  label="Edit expense"
                  onClick={() => {
                    setEditing(item);
                    setOpen(true);
                  }}
                >
                  <Pencil size={14} />
                </IconButton>
                {role === "admin" && (
                  <IconButton
                    danger
                    label="Delete expense"
                    onClick={() => void remove(item)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      {!expenses.length && (
        <p className="py-12 text-center text-sm">
          No expenses match this search.
        </p>
      )}
      <ExpenseForm
        open={open}
        onClose={() => setOpen(false)}
        expense={editing}
      />
    </div>
  );
}

export function EvidenceManager() {
  const { data, role, deleteEvidence } = usePortal();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const evidence = data.evidence.filter((item) =>
    `${item.title} ${item.description} ${getProjectName(data.projects, item.projectId)}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete evidence “${title}”?`)) return;
    const item = data.evidence.find((entry) => entry.id === id);
    if (!item) return;
    try {
      await deleteEvidence(item);
      toast.success("Evidence deleted.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to delete evidence.",
      );
    }
  };
  return (
    <div>
      <Heading
        eyebrow="Proof library"
        title="Evidence"
        action="Upload evidence"
        onAction={() => setOpen(true)}
      />
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search documents…"
      />
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {evidence.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-lg border border-brand-line bg-brand-paper"
          >
            <div className="relative aspect-[4/3] bg-brand-sand">
              {item.mimeType === "application/pdf" ? (
                <div className="grid h-full place-items-center">
                  <FileText size={38} />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              <span
                className={`absolute left-3 top-3 rounded-full px-3 py-1 font-mono text-[8px] uppercase ${item.visibility === "public" ? "bg-brand-ink text-brand-paper" : "bg-brand-brick text-white"}`}
              >
                {item.visibility}
              </span>
            </div>
            <div className="p-4">
              <p className="font-mono text-[8px] uppercase tracking-wider text-brand-slate">
                {getProjectName(data.projects, item.projectId)} /{" "}
                {formatDate(item.capturedOn)}
              </p>
              <h2 className="font-display mt-2 text-lg font-semibold">
                {item.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-brand-slate">
                {item.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center text-[11px] font-bold text-brand-brick underline"
                >
                  Open file
                </a>
                {role === "admin" && (
                  <IconButton
                    danger
                    label={`Delete ${item.title}`}
                    onClick={() => void remove(item.id, item.title)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!evidence.length && (
        <div className="mt-7 border-y border-brand-line py-14 text-center">
          <ImagePlus className="mx-auto text-brand-brick" />
          <p className="mt-3 text-sm">
            No evidence found. Upload the first document.
          </p>
        </div>
      )}
      <EvidenceForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
