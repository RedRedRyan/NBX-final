import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import LightRays from "@/components/LightRays";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/context/AuthContext";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});
const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBX - Nairobi Block Exchange",
  description: "Tokenize and trade equities and bonds supporting business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
        <AuthProvider>
          <Sidebar />
          <div className="absolute inset-0 top-0 z-[-1] overflow-hidden min-h-screen">
            <LightRays
              raysOrigin="top-center-offset"
              raysColor="#fb4f1f"
              raysSpeed={1.5}
              lightSpread={1.8}
              rayLength={1.2}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
              className="custom-rays"
            />
          </div>
          <main className="ml-[16.67%] w-[83.33%]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
