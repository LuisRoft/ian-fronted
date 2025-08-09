import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IAN — Inteligencia para Análisis de Licitaciones",
  description:
    "Automatiza la revisión de pliegos, propuestas y contratos con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 font-semibold">
                <span
                  className="inline-block h-6 w-6 rounded-md bg-primary"
                  aria-hidden
                />
                IAN
              </a>
              <nav className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                    signUpForceRedirectUrl="/dashboard"
                    signUpFallbackRedirectUrl="/dashboard"
                  >
                    <Button variant="outline" size="sm">
                      Entrar
                    </Button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                  >
                    <Button size="sm">Crear cuenta</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </nav>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
