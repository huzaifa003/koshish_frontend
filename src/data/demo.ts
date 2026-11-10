import type { Donation, EvidenceItem, Expense, PortalData, Project } from "@/types";

export const demoProjects: Project[] = [
  { id: "p1", slug: "ration-and-relief", title: "Ration & Relief", category: "Food security", status: "active", location: "Lahore", startedOn: "2021-03-12", summary: "Monthly groceries and emergency food support for families facing a difficult month.", description: "Our longest-running initiative provides thoughtfully packed ration bags, with each distribution recorded against a family count and a verified expense. The focus is consistent help, not one-off visibility.", goalAmount: 1200000, beneficiaries: 860, art: "ration", createdAt: "2021-03-12T10:00:00Z" },
  { id: "p2", slug: "taleem-kits", title: "Taleem Kits", category: "Education", status: "active", location: "Lahore", startedOn: "2022-01-20", summary: "School bags, books, stationery and fee support that help children stay in class.", description: "Taleem Kits began with a simple belief: a missing notebook should never be the reason a child falls behind. Kits are planned with local teachers and delivered before each school term.", goalAmount: 650000, beneficiaries: 420, art: "education", createdAt: "2022-01-20T10:00:00Z" },
  { id: "p3", slug: "sehat-camps", title: "Sehat Camps", category: "Healthcare", status: "completed", location: "Multan", startedOn: "2023-06-10", summary: "Community check-ups, essential medicines and guided referrals for follow-up care.", description: "A volunteer-led series of local health camps combining basic screening with access to a doctor. Medicine purchases and camp logistics are recorded separately for clearer review.", goalAmount: 480000, beneficiaries: 610, art: "health", createdAt: "2023-06-10T10:00:00Z" },
  { id: "p4", slug: "winter-warmth", title: "Winter Warmth", category: "Seasonal relief", status: "completed", location: "Lahore", startedOn: "2023-11-01", summary: "Blankets and warm clothing distributed through neighbourhood volunteers.", description: "A seasonal response built around dignity and local knowledge. Volunteers identify need privately, then record distribution totals without exposing recipient identities.", goalAmount: 350000, beneficiaries: 300, art: "winter", createdAt: "2023-11-01T10:00:00Z" },
  { id: "p5", slug: "clean-water", title: "Clean Water", category: "Water & sanitation", status: "active", location: "Kasur", startedOn: "2024-04-18", summary: "Water filters, storage and small community repairs for safer everyday access.", description: "This initiative supports practical, maintainable water improvements. Each installation includes a field note, expense record and follow-up check by the project team.", goalAmount: 900000, beneficiaries: 740, art: "water", createdAt: "2024-04-18T10:00:00Z" },
  { id: "p6", slug: "flood-recovery", title: "Flood Recovery", category: "Emergency response", status: "completed", location: "Sindh", startedOn: "2025-08-02", summary: "Immediate essentials and recovery support for flood-affected households.", description: "A time-bound emergency response for essential supplies and household recovery. The project closed after the final distribution and reconciliation of its remaining funds.", goalAmount: 750000, beneficiaries: 380, art: "recovery", createdAt: "2025-08-02T10:00:00Z" },
];

const donation = (id: string, receivedOn: string, amount: number, source: string, method: string, projectId: string | null, donorName = "", isNamePublic = false): Donation => ({ id, receivedOn, amount, source, method, projectId, donorName, isNamePublic, reference: `KSH-${id.toUpperCase()}`, verified: true, createdAt: `${receivedOn}T09:00:00Z` });

export const demoDonations: Donation[] = [
  donation("d1", "2021-03-15", 180000, "Instagram", "Bank transfer", "p1"),
  donation("d2", "2021-11-10", 120000, "Community fundraiser", "Cash deposit", "p1"),
  donation("d3", "2022-02-05", 210000, "Instagram", "Bank transfer", "p2"),
  donation("d4", "2022-08-19", 95000, "Website", "JazzCash", "p2"),
  donation("d5", "2023-05-28", 260000, "Instagram", "Bank transfer", "p3"),
  donation("d6", "2023-07-14", 110000, "Corporate partner", "Bank transfer", "p3", "Sample Community Partner", true),
  donation("d7", "2023-12-02", 185000, "Instagram", "EasyPaisa", "p4"),
  donation("d8", "2024-04-25", 310000, "Website", "Bank transfer", "p5"),
  donation("d9", "2024-09-13", 140000, "Community fundraiser", "Cash deposit", "p5"),
  donation("d10", "2025-08-06", 400000, "Instagram", "Bank transfer", "p6"),
  donation("d11", "2025-09-18", 175000, "Corporate partner", "Bank transfer", "p6", "Sample Local Business", true),
  donation("d12", "2025-12-20", 125000, "Website", "JazzCash", null),
  donation("d13", "2026-01-16", 240000, "Instagram", "Bank transfer", "p1"),
  donation("d14", "2026-02-07", 180000, "Website", "EasyPaisa", "p2"),
  donation("d15", "2026-03-22", 320000, "Instagram", "Bank transfer", "p5"),
  donation("d16", "2026-05-11", 150000, "Corporate partner", "Bank transfer", "p3", "Sample Community Partner", true),
  donation("d17", "2026-07-03", 205000, "Community fundraiser", "Cash deposit", "p1"),
  donation("d18", "2026-09-15", 275000, "Instagram", "Bank transfer", "p2"),
  donation("d19", "2026-10-18", 90000, "Website", "JazzCash", null),
];

const expense = (id: string, spentOn: string, amount: number, category: string, vendor: string, description: string, projectId: string | null): Expense => ({ id, spentOn, amount, category, vendor, description, projectId, reference: `EXP-${id.toUpperCase()}`, verified: true, createdAt: `${spentOn}T11:00:00Z` });

export const demoExpenses: Expense[] = [
  expense("e1", "2021-04-02", 135000, "Ration purchases", "Sample Wholesale Supplier", "Staples for the first monthly ration distribution.", "p1"),
  expense("e2", "2021-12-01", 85000, "Ration purchases", "Sample Wholesale Supplier", "Winter ration packing and essential groceries.", "p1"),
  expense("e3", "2022-02-18", 160000, "Education materials", "Sample Book Depot", "School bags, notebooks and term stationery.", "p2"),
  expense("e4", "2022-09-01", 70000, "School support", "Sample Education Partner", "Fee support and replacement learning materials.", "p2"),
  expense("e5", "2023-06-18", 190000, "Medical supplies", "Sample Medical Supplier", "Essential medicines and screening consumables.", "p3"),
  expense("e6", "2023-07-22", 75000, "Camp logistics", "Sample Local Vendor", "Camp equipment, transport and volunteer meals.", "p3"),
  expense("e7", "2023-12-12", 130000, "Winter supplies", "Sample Textile Supplier", "Blankets and warm clothing packs.", "p4"),
  expense("e8", "2024-05-08", 240000, "Water equipment", "Sample Filter Works", "Community water filters and installation parts.", "p5"),
  expense("e9", "2024-10-04", 100000, "Field implementation", "Sample Field Services", "Storage repairs and follow-up maintenance.", "p5"),
  expense("e10", "2025-08-16", 290000, "Emergency supplies", "Sample Relief Supplier", "Essential household and hygiene supplies.", "p6"),
  expense("e11", "2025-09-25", 120000, "Recovery support", "Sample Recovery Partner", "Household recovery grants and materials.", "p6"),
  expense("e12", "2025-10-02", 60000, "Transport", "Sample Transport Co.", "Emergency distribution transport and loading.", "p6"),
  expense("e13", "2026-01-28", 180000, "Ration purchases", "Sample Wholesale Supplier", "Monthly ration bags and packing materials.", "p1"),
  expense("e14", "2026-02-20", 125000, "Education materials", "Sample Book Depot", "New-term Taleem Kits and classroom supplies.", "p2"),
  expense("e15", "2026-04-06", 210000, "Water equipment", "Sample Filter Works", "Second-phase filters and community fittings.", "p5"),
  expense("e16", "2026-05-20", 85000, "Medical supplies", "Sample Medical Supplier", "Final reconciled health-camp medicine order.", "p3"),
  expense("e17", "2026-07-12", 60000, "Distribution", "Sample Transport Co.", "Ration distribution and volunteer transport.", "p1"),
];

export const demoEvidence: EvidenceItem[] = [
  { id: "v1", projectId: "p1", expenseId: "e13", title: "Ration supplier invoice", description: "Sample invoice demonstrating how a public expense proof is attached to a ledger entry.", url: "/evidence/ration-receipt.svg", storagePath: null, bucket: null, mimeType: "image/svg+xml", visibility: "public", capturedOn: "2026-01-28", createdAt: "2026-01-28T12:00:00Z" },
  { id: "v2", projectId: "p2", expenseId: "e14", title: "Taleem Kit packing list", description: "Sample packing list showing quantities linked to the education materials expense.", url: "/evidence/taleem-list.svg", storagePath: null, bucket: null, mimeType: "image/svg+xml", visibility: "public", capturedOn: "2026-02-20", createdAt: "2026-02-20T12:00:00Z" },
  { id: "v3", projectId: "p3", expenseId: "e16", title: "Medical order summary", description: "Sample supplier summary with sensitive recipient details intentionally excluded.", url: "/evidence/sehat-summary.svg", storagePath: null, bucket: null, mimeType: "image/svg+xml", visibility: "public", capturedOn: "2026-05-20", createdAt: "2026-05-20T12:00:00Z" },
  { id: "v4", projectId: "p4", expenseId: "e7", title: "Winter distribution note", description: "Sample field note recording quantities without publishing recipient identities.", url: "/evidence/winter-note.svg", storagePath: null, bucket: null, mimeType: "image/svg+xml", visibility: "public", capturedOn: "2023-12-12", createdAt: "2023-12-12T12:00:00Z" },
  { id: "v5", projectId: "p5", expenseId: "e15", title: "Water fittings invoice", description: "Sample itemised invoice for filter fittings and installation supplies.", url: "/evidence/water-invoice.svg", storagePath: null, bucket: null, mimeType: "image/svg+xml", visibility: "public", capturedOn: "2026-04-06", createdAt: "2026-04-06T12:00:00Z" },
  { id: "v6", projectId: "p6", expenseId: "e10", title: "Relief supplies manifest", description: "Sample dispatch manifest linked to the emergency supplies ledger entry.", url: "/evidence/recovery-manifest.svg", storagePath: null, bucket: null, mimeType: "image/svg+xml", visibility: "public", capturedOn: "2025-08-16", createdAt: "2025-08-16T12:00:00Z" },
];

export const demoData: PortalData = {
  finances: [...demoProjects.map(p => p.id), null].map(projectId => ({ projectId, raised: demoDonations.filter(d => d.verified && d.projectId === projectId).reduce((s,d) => s+d.amount,0), spent: demoExpenses.filter(e => e.verified && e.projectId === projectId).reduce((s,e) => s+e.amount,0), donations: demoDonations.filter(d => d.verified && d.projectId === projectId).length })),
  projects: demoProjects,
  donations: demoDonations,
  expenses: demoExpenses,
  evidence: demoEvidence,
  settings: { id: "main", donationUrl: "https://www.instagram.com/kosshissh/", instagramUrl: "https://www.instagram.com/kosshissh/", tagline: "Small efforts. Clearly accounted for.", updatedAt: "2026-10-20T12:00:00Z" },
  team: [
    { userId: "demo-admin", email: "admin@koshish.demo", role: "admin", createdAt: "2021-01-01T00:00:00Z" },
    { userId: "demo-editor", email: "editor@koshish.demo", role: "editor", createdAt: "2023-01-01T00:00:00Z" },
  ],
};
