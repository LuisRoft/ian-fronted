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
import { Plus, Upload, Pencil, ChevronDown, Trash } from "lucide-react";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";

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
    // addContractor,
    addContractorByRuc,
    addContractorFiles,
    renameContractor,
    uploadTenderBatch,
    uploadProposalBatch,
    runAnalysis,
    deleteProject,
    deleteProjectRemote,
  } = useProjects();

  const project = useMemo<Project | undefined>(
    () => projects.find((p) => p.id === id),
    [projects, id]
  );
  // const [newContractor, setNewContractor] = useState("");
  const [newRuc, setNewRuc] = useState("");
  const [validatingRuc, setValidatingRuc] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
          disabled={deleting}
          onClick={() => setConfirmOpen(true)}
        >
          {deleting ? (
            "Eliminando..."
          ) : (
            <span className="inline-flex items-center gap-1">
              <Trash className="size-4" /> Eliminar proyecto
            </span>
          )}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{project.name}&quot;. Intentaremos borrar sus
              datos en el backend. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
              onClick={async () => {
                try {
                  setDeleting(true);
                  await deleteProjectRemote?.(project.id);
                  toast.success("Proyecto eliminado");
                } catch {
                } finally {
                  deleteProject(project.id);
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                    if (files.length) {
                      addContratanteFiles(project.id, files);
                      uploadTenderBatch(project.id, files).catch(() => {});
                    }
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
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Contratistas</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="RUC (13 dígitos)"
                value={newRuc}
                onChange={(e) => setNewRuc(e.target.value)}
                className="h-8 w-52"
                inputMode="numeric"
                maxLength={13}
              />
              <Button
                size="sm"
                disabled={validatingRuc || newRuc.trim().length !== 13}
                onClick={async () => {
                  try {
                    setValidatingRuc(true);
                    await addContractorByRuc(project.id, newRuc);
                    setNewRuc("");
                  } catch {
                  } finally {
                    setValidatingRuc(false);
                  }
                }}
              >
                {validatingRuc ? (
                  "Validando..."
                ) : (
                  <>
                    <Plus className="size-4 mr-1" /> Agregar
                  </>
                )}
              </Button>
            </div>
          </div>

          {project.contractors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Agrega contratistas y sube sus PDFs.
            </p>
          ) : (
            <div className="grid gap-3">
              {project.contractors.map((c) => {
                const status = (c.estado || "").toUpperCase();
                const disabled = status && status !== "ACTIVO";
                return (
                  <Card key={c.id} className={cn(disabled && "border-red-300")}>
                    <CardHeader className="flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pencil className="size-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <EditableText
                            value={c.name}
                            onChange={(name) =>
                              renameContractor(project.id, c.id, name)
                            }
                          />
                          {c.estado && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                                status === "ACTIVO" &&
                                  "border-green-300 text-green-700",
                                status === "INACTIVO" &&
                                  "border-red-300 text-red-700",
                                status === "SUSPENDIDO" &&
                                  "border-yellow-300 text-yellow-700"
                              )}
                            >
                              {status}
                            </span>
                          )}
                        </div>
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
                            if (files.length) {
                              addContractorFiles(project.id, c.id, files);
                              uploadProposalBatch(
                                project.id,
                                c.id,
                                files
                              ).catch(() => {});
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          disabled={!!disabled}
                        >
                          <label
                            htmlFor={`contractor-files-${c.id}`}
                            className={cn(
                              "cursor-pointer inline-flex items-center gap-2",
                              disabled && "pointer-events-none opacity-60"
                            )}
                          >
                            <Upload className="size-4" />{" "}
                            {disabled ? "No permitido" : "Subir PDFs"}
                          </label>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        {c.ruc && <span>RUC: {c.ruc}</span>}
                        {disabled && c.motivo_cancelacion && (
                          <span className="text-red-700">
                            Motivo: {c.motivo_cancelacion}
                          </span>
                        )}
                      </div>
                      {c.files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {c.files.map((f) => (
                            <FilePill key={f.id} name={f.name} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Analysis */}
        <Card className="md:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Resultado del análisis</CardTitle>
            <Button
              size="sm"
              disabled={analyzing}
              onClick={async () => {
                try {
                  setAnalyzing(true);
                  toast.info("Ejecutando análisis...");
                  await runAnalysis(project.id);
                  toast.success("Análisis completado");
                } catch {
                  toast.error("No se pudo obtener el análisis");
                } finally {
                  setAnalyzing(false);
                }
              }}
            >
              {analyzing ? "Analizando..." : "Obtener comparación"}
            </Button>
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="grid md:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : project.analysis ? (
              <div className="space-y-4">
                <Tabs defaultValue="resumen">
                  <TabsList>
                    <TabsTrigger value="resumen">Resumen</TabsTrigger>
                    <TabsTrigger value="semaforo">Semaforización</TabsTrigger>
                    <TabsTrigger value="scores">Scores</TabsTrigger>
                  </TabsList>
                  <TabsContent value="resumen">
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      {project.analysis.comparison.map((it) => (
                        <Card key={it.documentId}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {it.bidderName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            {it.summary?.summary_text && (
                              <p className="text-muted-foreground">
                                {it.summary.summary_text}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="semaforo">
                    <div className="space-y-4">
                      {(() => {
                        const allAlerts = project.analysis!.comparison.flatMap(
                          (c) => c.alerts || []
                        );
                        const g = allAlerts.filter(
                          (a) => a.level === "green"
                        ).length;
                        const r = allAlerts.filter(
                          (a) => a.level === "red"
                        ).length;
                        const y = allAlerts.filter(
                          (a) => a.level === "yellow"
                        ).length;
                        return (
                          <div className="text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-green-500"
                                aria-hidden
                              />
                              Verdes:
                              <strong className="text-foreground">{g}</strong>
                            </span>
                            <span className="mx-3">·</span>
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-red-500"
                                aria-hidden
                              />
                              Rojas:
                              <strong className="text-foreground">{r}</strong>
                            </span>
                            <span className="mx-3">·</span>
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-yellow-500"
                                aria-hidden
                              />
                              Amarillas:
                              <strong className="text-foreground">{y}</strong>
                            </span>
                          </div>
                        );
                      })()}

                      {project.analysis.comparison.map((it) => {
                        const greens = (it.alerts || []).filter(
                          (a) => a.level === "green"
                        );
                        const reds = (it.alerts || []).filter(
                          (a) => a.level === "red"
                        );
                        const yellows = (it.alerts || []).filter(
                          (a) => a.level === "yellow"
                        );
                        const order = ["green", "red", "yellow"] as const;
                        const groups = {
                          green: greens,
                          red: reds,
                          yellow: yellows,
                        } as const;
                        const counts = {
                          green: greens.length,
                          red: reds.length,
                          yellow: yellows.length,
                        };
                        return (
                          <Card key={it.documentId}>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between gap-3">
                                <span>{it.bidderName}</span>
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-3">
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="inline-block h-2 w-2 rounded-full bg-green-500"
                                      aria-hidden
                                    />
                                    {counts.green}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="inline-block h-2 w-2 rounded-full bg-red-500"
                                      aria-hidden
                                    />
                                    {counts.red}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="inline-block h-2 w-2 rounded-full bg-yellow-500"
                                      aria-hidden
                                    />
                                    {counts.yellow}
                                  </span>
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                              {(it.alerts?.length || 0) === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  Sin alertas.
                                </p>
                              ) : (
                                order.map(
                                  (lvl) =>
                                    groups[lvl].length > 0 && (
                                      <CollapsibleSection
                                        key={lvl}
                                        title={
                                          lvl === "green"
                                            ? "Verdes"
                                            : lvl === "red"
                                            ? "Rojas"
                                            : "Amarillas"
                                        }
                                        color={lvl}
                                        count={groups[lvl].length}
                                        defaultOpen={
                                          lvl !== "green" &&
                                          lvl !== "red" &&
                                          lvl !== "yellow"
                                        }
                                      >
                                        <div className="grid gap-2 sm:grid-cols-2">
                                          {groups[lvl].map((a, idx) => (
                                            <div
                                              key={idx}
                                              className={cn(
                                                "rounded-md border bg-muted/40 p-3 text-sm hover:shadow-sm transition",
                                                lvl === "green" &&
                                                  "border-l-4 border-l-green-500",
                                                lvl === "red" &&
                                                  "border-l-4 border-l-red-500",
                                                lvl === "yellow" &&
                                                  "border-l-4 border-l-yellow-500"
                                              )}
                                              title={`${a.area} — ${a.topic}`}
                                            >
                                              <div className="text-xs text-muted-foreground mb-1">
                                                {a.area} — {a.topic}
                                              </div>
                                              <div className="text-foreground line-clamp-3">
                                                {a.message}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CollapsibleSection>
                                    )
                                )
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="scores">
                    <div className="grid md:grid-cols-2 gap-3">
                      {project.analysis.comparison.map((it) => (
                        <Card key={it.documentId}>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                              <span>{it.bidderName}</span>
                              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                                {Math.round(it.overallScore)}
                              </span>
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay resultados. Sube documentos y ejecuta el análisis.
              </p>
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

function CollapsibleSection({
  title,
  color,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  color: "green" | "red" | "yellow";
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              color === "green" && "bg-green-500",
              color === "red" && "bg-red-500",
              color === "yellow" && "bg-yellow-500"
            )}
            aria-hidden
          />
          {title} ({count})
        </span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open ? "rotate-180" : "rotate-0"
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div
          className={cn(
            "overflow-hidden px-3 pb-3 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
