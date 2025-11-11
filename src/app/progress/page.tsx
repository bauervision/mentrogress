import { Suspense } from "react";
import ProgressClient from "./ProgressClient";
export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProgressClient />
    </Suspense>
  );
}
