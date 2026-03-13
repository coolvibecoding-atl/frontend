import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Mixer Pro - Professional Audio Mixing in Your Browser",
  description: "The world's first AI-powered audio mixing platform. Bring professional QC Music-grade mastering to bedroom producers.",
  keywords: ["AI mixer", "audio mixing", "music production", "mastering", "stem separation", "AI audio"],
  authors: [{ name: "AI Mixer Pro" }],
  openGraph: {
    title: "AI Mixer Pro - Professional Audio Mixing",
    description: "Bring studio-quality mastering to your bedroom with AI that understands trap, R&B, and boom bap.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0c0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`} style={{ colorScheme: "dark" }}>
      <body>
        <ClerkProvider>
          <ServiceWorkerRegister />
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}