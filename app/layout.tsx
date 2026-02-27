import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import LightRays from "@/components/LightRays";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CompanyProvider } from "@/lib/context/CompanyContext";
import { WalletProvider } from "@/lib/context/WalletContext";
import "@/lib/pollyfills";

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
  icons: {
    icon: "/icons/logo.png",
    shortcut: "/icons/logo.png",
    apple: "/icons/logo.png",
  },
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
          <CompanyProvider>
            <WalletProvider>
              <div className="flex min-h-screen">
                <div className="hidden md:flex">
                  <Sidebar />
                </div>
                <div className="relative flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
                  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
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
                  <main className="flex-1 px-4 pt-6 md:px-10">
                    {children}
                  </main>
                  <Footer />
                  <BottomNav />
                </div>
              </div>
            </WalletProvider>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
