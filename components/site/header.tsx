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

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 transition-colors duration-300 border-b " +
        (scrolled
          ? "backdrop-blur supports-[backdrop-filter]:bg-background/70 border-border"
          : "bg-transparent border-transparent")
      }
    >
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
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Crear cuenta</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
