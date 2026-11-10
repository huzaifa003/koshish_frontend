export type Role = "admin" | "editor";
export type ProjectStatus = "active" | "completed" | "planned";
export type EvidenceVisibility = "public" | "internal";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  location: string;
  startedOn: string;
  summary: string;
  description: string;
  goalAmount: number;
  beneficiaries: number;
  art: "ration" | "education" | "health" | "winter" | "water" | "recovery";
  createdAt: string;
}

export interface Donation {
  id: string;
  receivedOn: string;
  amount: number;
  donorName: string;
  donorPhone?: string;
  whatsappOptIn?: boolean;
  isNamePublic: boolean;
  source: string;
  method: string;
  projectId: string | null;
  reference: string;
  verified: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  spentOn: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  projectId: string | null;
  reference: string;
  verified: boolean;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  projectId: string;
  expenseId: string | null;
  title: string;
  description: string;
  url: string;
  storagePath: string | null;
  bucket: string | null;
  mimeType: string;
  visibility: EvidenceVisibility;
  capturedOn: string;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  donationUrl: string;
  instagramUrl: string;
  whatsappGroupUrl?: string;
  tagline: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  email: string | null;
  role: Role;
  createdAt: string;
}

export interface ProjectFinance {
  projectId: string | null;
  raised: number;
  spent: number;
  donations: number;
}

export interface PortalData {
  finances: ProjectFinance[];
  projects: Project[];
  donations: Donation[];
  expenses: Expense[];
  evidence: EvidenceItem[];
  settings: SiteSettings;
  team: TeamMember[];
}

export type ProjectInput = Omit<Project, "id" | "createdAt">;
export type DonationInput = Omit<Donation, "id" | "createdAt">;
export type ExpenseInput = Omit<Expense, "id" | "createdAt">;
export type EvidenceInput = Omit<
  EvidenceItem,
  "id" | "createdAt" | "url" | "storagePath" | "bucket" | "mimeType"
> & { file: File };
export type SettingsInput = Omit<SiteSettings, "id" | "updatedAt">;
