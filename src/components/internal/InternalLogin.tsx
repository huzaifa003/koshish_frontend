import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "@/components/Logo";
import { usePortal } from "@/lib/portal-store";

export function InternalLogin() {
  const { mode, user, loginDemo, signIn, signOut } = usePortal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try { await signIn(email, password); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to sign in."); } finally { setLoading(false); }
  };

  if (user) return (
    <div className="paper-noise grid min-h-[100dvh] place-items-center bg-[#f3f0e6] px-5 py-12">
      <div className="w-full max-w-md border-y border-[#bdb6a8] py-10 text-center"><LockKeyhole className="mx-auto text-[#f54e00]" size={34} /><h1 className="font-display mt-5 text-3xl font-semibold tracking-[-0.05em]">Access not assigned.</h1><p className="mt-4 text-sm leading-7 text-[#625e55]">You’re signed in as <b>{user.email}</b>, but this account does not have an admin or editor role. Ask your Koshish administrator to grant access.</p><button type="button" onClick={() => void signOut()} className="mt-7 min-h-12 rounded-full bg-[#171612] px-6 text-sm font-bold text-[#f3f0e6]">Sign out</button><Link to="/" className="mt-5 block text-xs font-bold underline">Return to public portal</Link></div>
    </div>
  );

  return (
    <div className="grid min-h-[100dvh] bg-[#f3f0e6] lg:grid-cols-2">
      <section className="dark-noise relative hidden flex-col justify-between overflow-hidden bg-[#171612] p-12 text-[#f3f0e6] lg:flex">
        <Logo inverse />
        <div className="relative z-10"><p className="font-mono mb-5 text-[10px] uppercase tracking-[0.18em] text-[#aaa599]">Koshish / Internal workspace</p><h1 className="font-display max-w-xl text-6xl font-semibold leading-[0.96] tracking-[-0.065em]">Good work.<br /><span className="text-[#f54e00]">Careful records.</span></h1><p className="mt-7 max-w-md text-sm leading-7 text-[#b9b4a8]">One secure place to maintain projects, reconcile the ledger and publish responsible evidence.</p></div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#aaa599]"><ShieldCheck size={17} className="text-[#f54e00]" />Role-based access · Row-level security</div>
        <div className="font-display pointer-events-none absolute -bottom-20 -right-10 select-none text-[330px] font-bold leading-none tracking-[-0.1em] text-[#211f1a]">K.</div>
      </section>
      <section className="paper-noise flex items-center justify-center px-5 py-10 md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-between"><Logo /><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#625e55] hover:text-[#f54e00]"><ArrowLeft size={14} />Public portal</Link></div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#716c61]">Permitted team members only</p><h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.055em]">Welcome back.</h2><p className="mt-3 text-sm text-[#69645a]">Sign in to maintain the Koshish record.</p>
          {mode === "demo" && <div className="mt-8 border-l-2 border-[#f54e00] bg-[#e9e4d8] p-4 text-xs leading-6 text-[#575349]"><b>Preview mode.</b> Explore as an admin with sample records. Changes last only for this session; connect Supabase for permanent storage.</div>}
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-xs font-bold">Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@koshish.org" className="mt-2 min-h-12 w-full rounded-md border border-[#bdb6a8] bg-[#faf7ef] px-4 text-sm font-normal" /></label>
            <label className="block text-xs font-bold">Password<span className="relative mt-2 block"><input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your secure password" className="min-h-12 w-full rounded-md border border-[#bdb6a8] bg-[#faf7ef] px-4 pr-12 text-sm font-normal" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-1 top-1 grid h-10 w-10 place-items-center text-[#69645a]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            {error && <p role="alert" className="rounded-md bg-[#f7ddd4] p-3 text-xs leading-5 text-[#8d2d16]">{error}</p>}
            <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#171612] text-sm font-bold text-[#f3f0e6] transition-colors hover:bg-[#f54e00] disabled:opacity-50">{loading ? "Signing in…" : "Sign in securely"}<ArrowRight size={16} /></button>
          </form>
          {mode === "demo" && <><div className="my-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#777166]"><span className="h-px flex-1 bg-[#c8c1b3]" />or<span className="h-px flex-1 bg-[#c8c1b3]" /></div><button type="button" onClick={loginDemo} className="min-h-12 w-full rounded-full border border-[#aaa396] text-sm font-bold transition-colors hover:border-[#f54e00] hover:text-[#d94100]">Explore the demo workspace</button><p className="mt-4 text-center font-mono text-[9px] text-[#777166]">Demo login: admin@koshish.demo / koshish-demo</p></>}
        </div>
      </section>
    </div>
  );
}
