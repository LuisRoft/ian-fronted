"use client";

import { useMemo, useState } from "react";
import {
  useProjects,
  type Project,
} from "@/components/dashboard/projects-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Pencil } from "lucide-react";

function FilePill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs">
      {name}
    </span>
  );
}

export default function ProjectWorkspace({ id }: { id: string }) {
  const {
    projects,
    addContratanteFiles,
    addContractor,
    addContractorFiles,
    renameContractor,
  } = useProjects();
  const project = useMemo<Project | undefined>(
    () => projects.find((p) => p.id === id),
    [projects, id]
  );
  const [newContractor, setNewContractor] = useState("");

  if (!project)
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Selecciona o crea un proyecto.
      </div>
    );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold truncate">{project.name}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contratante */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos del contratante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="contratante-files">Subir PDFs</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="contratante-files"
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) addContratanteFiles(project.id, files);
                    e.currentTarget.value = "";
                  }}
                />
                <Button asChild size="sm" variant="outline">
                  <label
                    htmlFor="contratante-files"
                    className="cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="size-4" /> Seleccionar PDFs
                  </label>
                </Button>
              </div>
            </div>
            {project.contratanteFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.contratanteFiles.map((f) => (
                  <FilePill key={f.id} name={f.name} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contratistas */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Contratistas</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nombre del contratista"
                value={newContractor}
                onChange={(e) => setNewContractor(e.target.value)}
                className="h-8 w-44"
              />
              <Button
                size="sm"
                onClick={() => {
                  const name = newContractor.trim();
                  if (!name) return;
                  addContractor(project.id, name);
                  setNewContractor("");
                }}
              >
                <Plus className="size-4 mr-1" /> Añadir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.contractors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Agrega contratistas y sube sus PDFs.
              </p>
            ) : (
              <div className="grid gap-3">
                {project.contractors.map((c) => (
                  <div key={c.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Pencil className="size-4 text-muted-foreground" />
                        <EditableText
                          value={c.name}
                          onChange={(name) =>
                            renameContractor(project.id, c.id, name)
                          }
                        />
                      </div>
                      <div>
                        <input
                          id={`contractor-files-${c.id}`}
                          type="file"
                          accept="application/pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length)
                              addContractorFiles(project.id, c.id, files);
                            e.currentTarget.value = "";
                          }}
                        />
                        <Button asChild size="sm" variant="outline">
                          <label
                            htmlFor={`contractor-files-${c.id}`}
                            className="cursor-pointer inline-flex items-center gap-2"
                          >
                            <Upload className="size-4" /> Subir PDFs
                          </label>
                        </Button>
                      </div>
                    </div>
                    {c.files.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.files.map((f) => (
                          <FilePill key={f.id} name={f.name} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EditableText({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return editing ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(val.trim() || value);
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-8 w-60"
        autoFocus
      />
      <Button type="submit" size="sm">
        Guardar
      </Button>
    </form>
  ) : (
    <button
      className="text-sm font-medium hover:underline"
      onClick={() => setEditing(true)}
    >
      {value}
    </button>
  );
}
