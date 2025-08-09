"use client";

import { useState } from "react";
import { useProjects } from "@/components/dashboard/projects-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({
  activeId,
  onSelect,
}: {
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const { projects, createProject, deleteProject } = useProjects();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  return (
    <aside className="w-full md:w-64 shrink-0 border-r bg-muted/20 h-[calc(100svh-56px)] sticky top-14">
      <div className="p-3 border-b">
        {creating ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const p = createProject(name);
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
                "group flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm cursor-pointer",
                activeId === p.id ? "bg-primary/10" : "hover:bg-muted"
              )}
              onClick={() => onSelect(p.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="size-4 text-muted-foreground" />
                <span className="truncate">{p.name}</span>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(p.id);
                }}
                aria-label="Eliminar proyecto"
                title="Eliminar"
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
