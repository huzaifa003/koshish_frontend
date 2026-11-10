import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/lora";
import "@fontsource-variable/noto-sans-arabic";
import "@fontsource/noto-nastaliq-urdu/arabic-400.css";
import "@/index.css";
import "@/App.css";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "Koshish | کوشش — Small efforts. Shared hope.",
  description:
    "Support community projects in Pakistan. Explore clear fundraising goals, verified project finances, and ways to volunteer.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
