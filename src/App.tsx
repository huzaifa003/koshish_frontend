import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { PortalProvider } from "@/lib/portal-store";
import Home from "./pages/Home";
import Internal from "./pages/Internal";

export default function App() {
  return (
    <PortalProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/internal" element={<Internal />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster position="bottom-right" richColors closeButton />
    </PortalProvider>
  );
}
