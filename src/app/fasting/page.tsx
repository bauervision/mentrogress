"use client";
import { Suspense } from "react";
import FastingPageClient from "./FastingPageClient";

export default function FastingPage() {
  return (
    <Suspense fallback={null}>
      <FastingPageClient />
    </Suspense>
  );
}
