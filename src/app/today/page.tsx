import { Suspense } from "react";
import TodayClient from "./TodayClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TodayClient />
    </Suspense>
  );
}
