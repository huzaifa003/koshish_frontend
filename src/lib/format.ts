export const formatPKR = (value: number, compact = false) => {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `PKR ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
    if (Math.abs(value) >= 1_000) return `PKR ${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value)}`;
};

export const formatNumber = (value: number) => new Intl.NumberFormat("en-PK").format(value);

export const formatDate = (value: string, long = false) =>
  new Intl.DateTimeFormat("en-PK", long
    ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
    : { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }
  ).format(new Date(`${value}T00:00:00Z`));

export const getProjectName = (projects: { id: string; title: string }[], id: string | null) =>
  id ? projects.find((project) => project.id === id)?.title ?? "Archived project" : "General Koshish fund";

export const donorLabel = (donation: { donorName: string; isNamePublic: boolean }) =>
  donation.isNamePublic && donation.donorName.trim() ? donation.donorName : "Anonymous supporter";

export const toCSV = (rows: (string | number)[][]) =>
  rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

export const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
