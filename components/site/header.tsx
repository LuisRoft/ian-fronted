"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 transition-all duration-300 pointer-events-none">
      <div
        className={
          "max-w-6xl mx-auto px-4 transition-all duration-300 " +
          (visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2")
        }
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <div className="h-12 md:h-14 rounded-full border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span
              className="inline-block h-6 w-6 rounded-md bg-primary"
              aria-hidden
            />
            IAN
          </Link>
          <nav className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button variant="outline" size="sm">
                  Entrar
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <Button size="sm">Crear cuenta</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}
