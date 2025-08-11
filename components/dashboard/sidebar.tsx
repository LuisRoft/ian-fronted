"use client";

import { useState } from "react";
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
    <aside className="w-full md:w-64 shrink-0 border-r bg-muted/20 h-[calc(100svh-56px)] sticky top-14">
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
      <nav className="p-2 space-y-1 overflow-auto h-[calc(100%-60px)]">
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
                      ¿Deseas eliminar "{p.name}" y todo su contenido? Se
                      eliminará el workspace en el backend (ChromaDB
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
