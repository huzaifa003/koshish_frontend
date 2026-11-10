import { Suspense } from "react";
import { Contribute } from "@/views/Contribute";
export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="p-10" role="status">
          Loading ways to help…
        </p>
      }
    >
      <Contribute />
    </Suspense>
  );
}
