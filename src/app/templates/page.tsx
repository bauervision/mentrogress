import { Suspense } from "react";
import TemplatesClient from "./TemplatesClient";
export default function Page() {
  return (
    <Suspense fallback={null}>
      <TemplatesClient />
    </Suspense>
  );
}
