import { useState } from "react";
import { BarChart3, FolderKanban, HandCoins, Images, LogOut, ReceiptText, Settings2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { InternalLogin } from "@/components/internal/InternalLogin";
import { InternalOverview } from "@/components/internal/InternalOverview";
import { DonationsManager, EvidenceManager, ExpensesManager, ProjectsManager } from "@/components/internal/Managers";
import { TeamSettings } from "@/components/internal/TeamSettings";
import { usePortal } from "@/lib/portal-store";

const baseTabs = [{ id: "overview", label: "Overview", icon: BarChart3 }, { id: "projects", label: "Projects", icon: FolderKanban }, { id: "donations", label: "Donations", icon: HandCoins }, { id: "expenses", label: "Expenses", icon: ReceiptText }, { id: "evidence", label: "Evidence", icon: Images }];

export default function Internal() {
  const { user, role, mode, signOut } = usePortal();
  const [active, setActive] = useState("overview");
  if (!user || !role) return <InternalLogin />;
  const tabs = role === "admin" ? [...baseTabs, { id: "settings", label: "Team & settings", icon: Settings2 }] : baseTabs;
  const logout = async () => { try { await signOut(); } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to sign out."); } };
  return <div className="min-h-[100dvh] bg-[#f3f0e6] text-[#11100e] lg:grid lg:grid-cols-[248px_1fr]">
    <aside className="dark-noise sticky top-0 z-30 bg-[#171612] text-[#f3f0e6] lg:h-[100dvh] lg:flex lg:flex-col">
      <div className="flex h-[76px] items-center justify-between border-b border-[#3d3a34] px-5"><Logo inverse /><span className="rounded-full border border-[#4d4941] px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider text-[#c2bdb1] lg:hidden">{role}</span></div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:px-4 lg:py-6" aria-label="Internal navigation">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActive(id)} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-md px-4 text-left text-xs font-bold transition-colors ${active === id ? "bg-[#f54e00] text-white" : "text-[#b9b4a8] hover:bg-[#292721] hover:text-white"}`}><Icon size={16} />{label}</button>)}</nav>
      <div className="hidden border-t border-[#3d3a34] p-5 lg:block"><div className="mb-4"><p className="truncate text-xs font-bold">{user.email}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[#989387]">{role} access</p></div><Link to="/" className="flex min-h-10 items-center text-xs font-bold text-[#b9b4a8] hover:text-[#f54e00]">View public portal ↗</Link><button type="button" onClick={() => void logout()} className="mt-2 flex min-h-10 items-center gap-2 text-xs font-bold text-[#b9b4a8] hover:text-[#f54e00]"><LogOut size={14} />Sign out</button></div>
    </aside>
    <main className="paper-noise min-w-0 px-5 pb-16 pt-6 md:px-8 lg:px-10 lg:pt-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#c8c1b3] pb-4"><div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#716c61]"><span className={`h-2 w-2 rounded-full ${mode === "demo" ? "bg-[#d59427]" : "bg-[#567447]"}`} />{mode === "demo" ? "Sample workspace · Changes are session-only" : "Live Supabase workspace"}</div><div className="flex items-center gap-4 lg:hidden"><Link to="/" className="text-[11px] font-bold">Public ↗</Link><button type="button" onClick={() => void logout()} className="inline-flex min-h-10 items-center gap-1 text-[11px] font-bold"><LogOut size={13} />Sign out</button></div><span className="hidden font-mono text-[9px] uppercase tracking-wider text-[#716c61] lg:block">Last refreshed {new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}</span></div>
        {active === "overview" && <InternalOverview onNavigate={setActive} />}{active === "projects" && <ProjectsManager />}{active === "donations" && <DonationsManager />}{active === "expenses" && <ExpensesManager />}{active === "evidence" && <EvidenceManager />}{active === "settings" && role === "admin" && <TeamSettings />}
      </div>
    </main>
  </div>;
}
