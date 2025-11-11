import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import ToneLoader from "@/components/ToneLoader";

export const metadata: Metadata = {
  title: "Mentrogress",
  description: "Measured intensity. Intelligent progress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <ToneLoader />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
