import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { usePortal } from "@/lib/portal-store";
import { formatNumber, formatPKR } from "@/lib/format";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const tooltipStyle = { background: "#171612", border: "0", borderRadius: "8px", color: "#f3f0e6", fontSize: "12px" };

export function ImpactCharts() {
  const { data } = usePortal();
  const years = useMemo(() => Array.from(new Set([...data.donations.map((d) => d.receivedOn.slice(0, 4)), ...data.expenses.map((e) => e.spentOn.slice(0, 4))])).sort().reverse(), [data.donations, data.expenses]);
  const [year, setYear] = useState(years[0] ?? new Date().getFullYear().toString());
  const donations = data.donations.filter((d) => d.verified && d.receivedOn.startsWith(year));
  const expenses = data.expenses.filter((e) => e.verified && e.spentOn.startsWith(year));
  const raised = donations.reduce((sum, d) => sum + d.amount, 0);
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const chart = months.map((month, index) => ({
    month,
    Received: donations.filter((d) => Number(d.receivedOn.slice(5, 7)) === index + 1).reduce((sum, d) => sum + d.amount, 0),
    Spent: expenses.filter((e) => Number(e.spentOn.slice(5, 7)) === index + 1).reduce((sum, e) => sum + e.amount, 0),
  }));
  const sources = Object.entries(donations.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.source]: (acc[d.source] ?? 0) + d.amount }), {})).sort((a, b) => b[1] - a[1]);
  const categories = Object.entries(expenses.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }), {})).sort((a, b) => b[1] - a[1]);
  const maxSource = Math.max(...sources.map(([, value]) => value), 1);

  return (
    <section id="impact" className="mx-auto max-w-[1480px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="font-mono mb-4 text-[10px] uppercase tracking-[0.18em] text-[#716c61]">The financial picture / {year}</p>
          <h2 className="font-display max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">Money in. Work out.<br /><span className="text-[#f54e00]">Nothing in between.</span></h2>
        </div>
        <label className="flex items-center gap-3 text-xs font-semibold">Reporting year
          <select value={year} onChange={(event) => setYear(event.target.value)} className="min-h-11 rounded-full border border-[#bdb6a8] bg-transparent px-4 font-mono text-xs focus:border-[#f54e00]">
            {years.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="mb-12 grid border-y border-[#bdb6a8] sm:grid-cols-3">
        <div className="border-b border-[#bdb6a8] py-6 sm:border-b-0 sm:border-r sm:pr-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#5d584f]"><ArrowDownLeft size={15} className="text-[#f54e00]" /> Verified donations</div>
          <p className="font-display numeric text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{formatPKR(raised)}</p>
        </div>
        <div className="border-b border-[#bdb6a8] py-6 sm:border-b-0 sm:border-r sm:px-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#5d584f]"><ArrowUpRight size={15} /> Verified expenses</div>
          <p className="font-display numeric text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{formatPKR(spent)}</p>
        </div>
        <div className="py-6 sm:pl-6">
          <div className="mb-2 text-xs font-semibold text-[#5d584f]">Net movement</div>
          <p className="font-display numeric text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{raised - spent >= 0 ? "+" : "−"}{formatPKR(Math.abs(raised - spent))}</p>
        </div>
      </div>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><h3 className="font-display text-xl font-semibold tracking-[-0.03em]">Monthly cash movement</h3><p className="mt-1 text-xs text-[#69645a]">Verified entries only · amounts in PKR</p></div>
            <div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#f54e00]" />Received</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#4c4942]" />Spent</span></div>
          </div>
          <div className="h-[310px] w-full" aria-label={`Monthly donation and expense chart for ${year}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 10, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#d3ccbd" strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b665c" }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b665c" }} tickFormatter={(value) => value === 0 ? "0" : `${value / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatPKR(Number(value))} />
                <Area type="monotone" dataKey="Received" stroke="#f54e00" strokeWidth={3} fill="#f54e00" fillOpacity={0.1} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="Spent" stroke="#4c4942" strokeWidth={2} fill="#4c4942" fillOpacity={0.04} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-4 lg:border-l lg:border-[#c8c1b3] lg:pl-8">
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em]">Where support came from</h3>
          <p className="mt-1 text-xs text-[#69645a]">{formatNumber(donations.length)} verified contributions</p>
          <div className="mt-7 space-y-6">
            {sources.map(([source, value], index) => <div key={source}>
              <div className="mb-2 flex items-baseline justify-between gap-4 text-xs"><span className="font-semibold">{source}</span><span className="font-mono text-[10px] text-[#5f5a51]">{raised ? Math.round(value / raised * 100) : 0}%</span></div>
              <div className="h-1.5 bg-[#d8d1c3]"><div className={`h-full ${index === 0 ? "bg-[#f54e00]" : "bg-[#4c4942]"}`} style={{ width: `${value / maxSource * 100}%` }} /></div>
              <p className="mt-1.5 font-mono text-[10px] text-[#69645a]">{formatPKR(value)}</p>
            </div>)}
            {!sources.length && <p className="text-sm text-[#69645a]">No verified donations for this year.</p>}
          </div>
        </div>
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-5 border-t border-[#c8c1b3] pt-7 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 4).map(([category, value]) => <div key={category}><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#716c61]">{category}</p><p className="font-display numeric mt-2 text-xl font-semibold">{formatPKR(value, true)}</p><p className="text-xs text-[#69645a]">{spent ? (value / spent * 100).toFixed(1) : 0}% of annual spending</p></div>)}
      </div>
    </section>
  );
}
