"use client";
import { LanguageProvider } from "@/lib/language";
import { PortalProvider } from "@/lib/portal-store";
import { Toaster } from "sonner";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PortalProvider>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </PortalProvider>
    </LanguageProvider>
  );
}
