import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import ToneLoader from "@/components/ToneLoader";
import { New_Amsterdam } from "next/font/google";

const newAmsterdam = New_Amsterdam({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brand",
});

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
      <body className={newAmsterdam.variable}>
        <ToneLoader />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
