"use client";

import { useState } from "react";
import Image from "next/image";
import AppLogo from "@/app/assets/logo.png";
import { useProjects } from "@/components/dashboard/projects-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Sidebar({
  activeId,
  onSelect,
}: {
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const { projects, createProject, removeProject } = useProjects();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  return (
    <aside className="w-full md:w-64 shrink-0 border-r bg-muted/20 h-screen md:h-[100svh]">
      {/* Local dashboard header inside sidebar */}
      <div className="sticky top-0 z-10 bg-muted/20 backdrop-blur supports-[backdrop-filter]:bg-muted/30 px-3 py-3 border-b">
        <div className="h-11 rounded-xl border bg-background/80 shadow-sm flex items-center justify-between px-3">
          <div className="flex items-center gap-2 font-semibold">
            <Image
              src={AppLogo}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            IAN
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <div className="p-3 border-b">
        {creating ? (
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const p = await createProject(name);
              setName("");
              setCreating(false);
              onSelect(p.id);
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nuevo proyecto"
              autoFocus
            />
            <Button type="submit">Crear</Button>
          </form>
        ) : (
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="w-full"
          >
            <Plus className="size-4 mr-1" /> Nuevo proyecto
          </Button>
        )}
      </div>
      <nav className="p-2 space-y-1 overflow-auto h-[calc(100%-128px)]">
        {projects.length === 0 ? (
          <div className="text-xs text-muted-foreground p-3">
            Crea tu primer proyecto para comenzar
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className={cn(
                "group flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm",
                activeId === p.id ? "bg-primary/10" : "hover:bg-muted"
              )}
            >
              <button
                type="button"
                className="flex-1 flex items-center gap-2 truncate text-left"
                onClick={() => onSelect(p.id)}
              >
                <Folder className="size-4 text-muted-foreground" />
                <span className="truncate">{p.name}</span>
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Deseas eliminar &quot;{p.name}&quot; y todo su contenido?
                      Se eliminará el workspace en el backend (ChromaDB
                      collection). Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        await removeProject(p.id);
                        if (activeId === p.id) onSelect("");
                      }}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
