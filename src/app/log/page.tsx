import { Suspense } from "react";
import LogClient from "./LogClient";
export default function Page() {
  return (
    <Suspense fallback={null}>
      <LogClient />
    </Suspense>
  );
}
