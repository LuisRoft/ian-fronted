"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";

export default function HeroMedia() {
  const [tab, setTab] = useState<"riesgos" | "comparativo">("riesgos");

  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="pointer-events-none absolute -inset-6 -z-10">
        <div className="h-full w-full blur-3xl opacity-50 bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.primary/20%),transparent_30%,theme(colors.accent/20%),transparent_60%,theme(colors.primary/20%))]" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-2 px-3 pt-3">
          {(
            [
              { key: "riesgos", label: "Riesgos" },
              { key: "comparativo", label: "Comparativo" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "text-xs h-7 px-2.5 rounded-md border transition",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Media area */}
        <div className="relative p-4">
          <div className="aspect-video w-full rounded-lg border bg-background overflow-hidden">
            {/* Variant: Riesgos */}
            {tab === "riesgos" ? (
              <div className="h-full w-full grid grid-rows-3 gap-2 p-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-red-500/15 border" />
                  <div className="rounded-md bg-yellow-500/15 border" />
                  <div className="rounded-md bg-green-500/15 border" />
                </div>
                <div className="rounded-md bg-muted border" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-primary/10 border" />
                  <div className="rounded-md bg-accent border" />
                </div>
              </div>
            ) : (
              // Variant: Comparativo
              <div className="h-full w-full grid grid-cols-6 gap-2 p-3">
                <div className="col-span-3 rounded-md bg-background border" />
                <div className="col-span-3 rounded-md bg-muted border" />
                <div className="col-span-6 rounded-md bg-primary/10 border" />
                <div className="col-span-2 rounded-md bg-accent border" />
                <div className="col-span-4 rounded-md bg-background border" />
              </div>
            )}
            {/* Play overlay */}
            <button
              aria-label="Reproducir demo"
              className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-background/80 backdrop-blur border flex items-center justify-center shadow-sm hover:scale-105 transition"
            >
              <PlayCircle className="size-7 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
