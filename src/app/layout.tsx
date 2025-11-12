import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import ToneLoader from "@/components/ToneLoader";
import { New_Amsterdam, Yesteryear } from "next/font/google";
import { ActiveWorkoutProvider } from "@/providers/ActiveWorkoutProvider";

const newAmsterdam = New_Amsterdam({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brand",
});

const yesterYear = Yesteryear({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brand2",
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
      <body className={`${yesterYear.variable} ${newAmsterdam.variable}`}>
        <ToneLoader />
        <AuthProvider>
          <ActiveWorkoutProvider>{children}</ActiveWorkoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
