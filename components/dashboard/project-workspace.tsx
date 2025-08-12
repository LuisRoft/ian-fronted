"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useProjects } from "@/components/dashboard/projects-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Upload,
  Loader2,
  Pencil,
  Plus,
  ChevronDown,
  Trash2,
  FileText,
  FileSignature,
  Users,
  Play,
} from "lucide-react";

type Props = { id: string };

export default function ProjectWorkspace({ id }: Props) {
  const {
    projects,
    addContratanteFiles,
    addContractor,
    addContractorByRuc,
    renameContractor,
    addContractorFiles,
    uploadTenderBatch,
    uploadProposalBatch,
    runAnalysis,
    deleteBidder,
    deleteDocument,
    removeContractorLocal,
  } = useProjects();

  const project = useMemo(
    () => projects.find((p) => p.id === id),
    [projects, id]
  );
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedBidderId, setSelectedBidderId] = useState<string | undefined>(
    undefined
  );

  if (!project) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Selecciona un proyecto</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Elige un proyecto en la barra lateral o crea uno nuevo.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preconditions for running analysis: need tender files and at least one contractor with files
  const hasTender = (project.contratanteFiles?.length || 0) > 0;
  const hasBidderWithFiles =
    project.contractors?.some((c) => (c.files?.length || 0) > 0) || false;
  const canAnalyze = hasTender && hasBidderWithFiles;

  const tenderCount = project.contratanteFiles?.length || 0;
  const biddersCount = project.contractors?.length || 0;

  async function handleRunAnalysis() {
    if (!canAnalyze || analyzing) return;
    setAnalyzing(true);
    try {
      await runAnalysis(project!.id);
      toast.success("Análisis iniciado");
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "No se pudo iniciar el análisis";
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleTenderFiles(files: File[]) {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) {
      toast.error("Selecciona archivos PDF");
      return;
    }
    if (uploading) {
      toast.warning("Subida en curso. Espera a que termine.");
      return;
    }
    setUploading(true);
    try {
      // Optimistic: add locally first so uploadBatch can attach backendDocumentId
      addContratanteFiles(project!.id, pdfs);
      await uploadTenderBatch(project!.id, pdfs);
      toast.success(`Subidos ${pdfs.length} PDF(s)`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleProposalFiles(contractorId: string, files: File[]) {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) {
      toast.error("Selecciona archivos PDF");
      return;
    }
    if (uploading) {
      toast.warning("Subida en curso. Espera a que termine.");
      return;
    }
    // contractor status check
    const c = project!.contractors.find((x) => x.id === contractorId);
    const status = (c?.estado || "").toUpperCase();
    if (status && status !== "ACTIVO") {
      toast.error("Contratista no habilitado para subir documentos");
      return;
    }
    setUploading(true);
    try {
      // Optimistic: add locally first so uploadBatch can attach backendDocumentId
      addContractorFiles(project!.id, contractorId, pdfs);
      await uploadProposalBatch(project!.id, contractorId, pdfs);
      toast.success(`Subidos ${pdfs.length} PDF(s)`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="stage1" className="space-y-4">
        {/* Sticky sub-header */}
        <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base md:text-lg font-semibold tracking-tight">
                {project.name || "Proyecto"}
              </h2>
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <FileText className="size-3" /> {tenderCount} pliego(s)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <Users className="size-3" /> {biddersCount} oferente(s)
                </span>
              </div>
            </div>
          </div>

          {/* Tabs segmented control */}
          <div className="mt-3">
            <TabsList className="rounded-xl bg-muted/50 p-1">
              <TabsTrigger
                value="stage1"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Etapa 1: Análisis de documentos
              </TabsTrigger>
              <TabsTrigger
                value="stage2"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Etapa 2: Proceso de contratación
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Etapa 1 */}
        <TabsContent value="stage1" className="mt-2">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Entidad contratante + Oferentes */}
            <Card>
              <CardHeader>
                <CardTitle>Entidad contratante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  id="tender-files"
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    e.currentTarget.value = "";
                    await handleTenderFiles(files);
                  }}
                />
                <div
                  role="button"
                  tabIndex={0}
                  aria-disabled={uploading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (!uploading)
                        document.getElementById("tender-files")?.click();
                    }
                  }}
                  onClick={() => {
                    if (!uploading)
                      document.getElementById("tender-files")?.click();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    if (uploading) return;
                    const files = Array.from(e.dataTransfer.files || []);
                    await handleTenderFiles(files);
                  }}
                  className={cn(
                    "flex min-h-24 items-center justify-center gap-2 rounded-md border border-dashed px-3 py-6 text-sm",
                    uploading && "opacity-60 pointer-events-none"
                  )}
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Subiendo…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Upload className="size-4" /> Subir o arrastrar Pliego
                      (PDF)
                    </span>
                  )}
                </div>

                {project.contratanteFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.contratanteFiles.map((f) => (
                      <AlertDialog key={f.id}>
                        <AlertDialogTrigger asChild>
                          <div>
                            <FilePill name={f.name} onDelete={() => {}} />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Eliminar documento
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Deseas eliminar &quot;{f.name}&quot;? Esta acción
                              no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                const backendId = f.backendDocumentId || f.id;
                                try {
                                  await deleteDocument(
                                    project.id,
                                    null,
                                    backendId
                                  );
                                  toast.success("Documento eliminado");
                                } catch {
                                  toast.error(
                                    "No se pudo eliminar el documento"
                                  );
                                }
                              }}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oferentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add by RUC */}
                <AddContractorControls
                  onAddByName={(name) => addContractor(project.id, name)}
                  onAddByRuc={(ruc) => addContractorByRuc(project.id, ruc)}
                />
                <div className="grid gap-3">
                  {project.contractors.map((c) => {
                    const status = (c.estado || "").toUpperCase();
                    const disabled = status && status !== "ACTIVO";
                    return (
                      <Card
                        key={c.id}
                        className={cn(disabled && "border-red-300")}
                      >
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
                          <div className="flex items-center gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Eliminar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Eliminar oferente
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Seguro que deseas eliminar &quot;{c.name}
                                    &quot; y todos sus documentos? Esta acción
                                    no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        await deleteBidder(project.id, c.id);
                                        toast.success("Oferente eliminado");
                                      } catch {
                                        removeContractorLocal(project.id, c.id);
                                        toast.message(
                                          "Oferente removido localmente; backend no disponible"
                                        );
                                      }
                                    }}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <input
                              id={`contractor-files-${c.id}`}
                              type="file"
                              accept="application/pdf"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                e.currentTarget.value = "";
                                await handleProposalFiles(c.id, files);
                              }}
                            />
                            <div
                              role="button"
                              tabIndex={0}
                              aria-disabled={uploading || !!disabled}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  if (!uploading && !disabled)
                                    document
                                      .getElementById(
                                        `contractor-files-${c.id}`
                                      )
                                      ?.click();
                                }
                              }}
                              onClick={() => {
                                if (!uploading && !disabled)
                                  document
                                    .getElementById(`contractor-files-${c.id}`)
                                    ?.click();
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={async (e) => {
                                e.preventDefault();
                                if (uploading || disabled) return;
                                const files = Array.from(
                                  e.dataTransfer.files || []
                                );
                                await handleProposalFiles(c.id, files);
                              }}
                              className={cn(
                                "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm",
                                (uploading || disabled) &&
                                  "opacity-60 pointer-events-none"
                              )}
                            >
                              {uploading ? (
                                <span className="inline-flex items-center gap-2 text-muted-foreground">
                                  <Loader2 className="size-4 animate-spin" />{" "}
                                  Subiendo…
                                </span>
                              ) : disabled ? (
                                <span className="inline-flex items-center gap-2 text-muted-foreground">
                                  <Upload className="size-4" /> No permitido
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2">
                                  <Upload className="size-4" /> Subir o
                                  arrastrar PDFs
                                </span>
                              )}
                            </div>
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
                                <AlertDialog key={f.id}>
                                  <AlertDialogTrigger asChild>
                                    <div>
                                      <FilePill
                                        name={f.name}
                                        onDelete={() => {}}
                                      />
                                    </div>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Eliminar documento
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ¿Deseas eliminar &quot;{f.name}&quot; de{" "}
                                        {c.name}? Esta acción no se puede
                                        deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          const backendId =
                                            f.backendDocumentId || f.id;
                                          try {
                                            await deleteDocument(
                                              project.id,
                                              c.id,
                                              backendId
                                            );
                                            toast.success(
                                              "Documento eliminado"
                                            );
                                          } catch {
                                            toast.error(
                                              "No se pudo eliminar el documento"
                                            );
                                          }
                                        }}
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="md:col-span-2">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Resultado del análisis</CardTitle>
                <Button
                  size="sm"
                  disabled={analyzing || !canAnalyze}
                  onClick={async () => {
                    if (!canAnalyze) {
                      toast.error(
                        "Para ejecutar el análisis, sube al menos 1 documento del pliego y 1 propuesta de algún oferente."
                      );
                      return;
                    }
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
                        <TabsTrigger value="semaforo">
                          Semaforización
                        </TabsTrigger>
                      </TabsList>

                      {/* Resumen: master-detail */}
                      <TabsContent value="resumen">
                        {(() => {
                          const items = project.analysis!.comparison || [];
                          if (!items.length) {
                            return (
                              <p className="text-sm text-muted-foreground mt-3">
                                Sin resúmenes disponibles.
                              </p>
                            );
                          }
                          const active =
                            items.find(
                              (i) => i.documentId === selectedBidderId
                            ) || items[0];
                          const activeSummary =
                            active.summary?.summary_text || "";
                          return (
                            <div className="mt-3 grid gap-4 md:grid-cols-[260px_1fr]">
                              {/* Master list */}
                              <Card className="h-full">
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm">
                                    Oferentes ({items.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                  <ul className="max-h-[360px] overflow-auto divide-y">
                                    {items.map((i) => {
                                      const isActive =
                                        i.documentId === active.documentId;
                                      return (
                                        <li key={i.documentId}>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedBidderId(i.documentId)
                                            }
                                            className={cn(
                                              "w-full text-left px-3 py-2 hover:bg-muted/70 focus:outline-none",
                                              isActive && "bg-muted"
                                            )}
                                          >
                                            <div className="flex items-center justify-between gap-3">
                                              <span className="truncate text-sm font-medium">
                                                {i.bidderName}
                                              </span>
                                              <Badge className="shrink-0 bg-primary text-primary-foreground">
                                                {Math.round(i.overallScore)}
                                              </Badge>
                                            </div>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </CardContent>
                              </Card>

                              {/* Detail panel */}
                              <Card>
                                <CardHeader className="flex-row items-center justify-between gap-3">
                                  <CardTitle className="text-base truncate flex items-center gap-2">
                                    {active.bidderName}
                                    <Badge className="bg-primary text-primary-foreground">
                                      {Math.round(active.overallScore)}
                                    </Badge>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                  {activeSummary ? (
                                    <div>
                                      <p className="text-muted-foreground whitespace-pre-wrap">
                                        {activeSummary}
                                      </p>
                                      <div className="flex items-center gap-2 pt-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={async () => {
                                            try {
                                              await navigator.clipboard.writeText(
                                                activeSummary
                                              );
                                              toast.success("Resumen copiado");
                                            } catch {
                                              toast.error(
                                                "No se pudo copiar el resumen"
                                              );
                                            }
                                          }}
                                        >
                                          Copiar resumen
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-muted-foreground">
                                      Sin resumen disponible.
                                    </p>
                                  )}

                                  {(() => {
                                    const topics =
                                      active.summary?.by_topics || [];
                                    if (!topics.length) return null;
                                    return (
                                      <div className="space-y-3">
                                        <h4 className="text-sm font-medium">
                                          Puntos clave por subtema
                                        </h4>
                                        <div className="grid gap-3">
                                          {topics.map((t, idx) => {
                                            const alerts = t.alerts || [];
                                            const greens = alerts.filter(
                                              (a) => a.level === "green"
                                            ).length;
                                            const reds = alerts.filter(
                                              (a) => a.level === "red"
                                            ).length;
                                            const yellows = alerts.filter(
                                              (a) => a.level === "yellow"
                                            ).length;
                                            const color =
                                              reds > 0
                                                ? "red"
                                                : yellows > 0
                                                ? "yellow"
                                                : ("green" as const);
                                            return (
                                              <CollapsibleSection
                                                key={`${t.topic}-${idx}`}
                                                title={t.topic}
                                                color={color}
                                                count={alerts.length}
                                                defaultOpen={false}
                                              >
                                                <div className="space-y-3">
                                                  <div className="flex items-center justify-between gap-2">
                                                    <div className="text-xs text-muted-foreground inline-flex items-center gap-3">
                                                      <span className="inline-flex items-center gap-1">
                                                        <span
                                                          className="inline-block h-2 w-2 rounded-full bg-green-500"
                                                          aria-hidden
                                                        />
                                                        {greens}
                                                      </span>
                                                      <span className="inline-flex items-center gap-1">
                                                        <span
                                                          className="inline-block h-2 w-2 rounded-full bg-red-500"
                                                          aria-hidden
                                                        />
                                                        {reds}
                                                      </span>
                                                      <span className="inline-flex items-center gap-1">
                                                        <span
                                                          className="inline-block h-2 w-2 rounded-full bg-yellow-500"
                                                          aria-hidden
                                                        />
                                                        {yellows}
                                                      </span>
                                                    </div>
                                                    {typeof t.overallScore ===
                                                      "number" && (
                                                      <Badge className="bg-primary text-primary-foreground">
                                                        {Math.round(
                                                          t.overallScore
                                                        )}
                                                      </Badge>
                                                    )}
                                                  </div>

                                                  {t.summary?.summary_text && (
                                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                                      {t.summary.summary_text}
                                                    </p>
                                                  )}

                                                  {alerts.length > 0 && (
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                      {alerts.map((a, i2) => (
                                                        <div
                                                          key={i2}
                                                          className={cn(
                                                            "rounded-md border bg-muted/40 p-3 text-xs",
                                                            a.level ===
                                                              "green" &&
                                                              "border-l-4 border-l-green-500",
                                                            a.level === "red" &&
                                                              "border-l-4 border-l-red-500",
                                                            a.level ===
                                                              "yellow" &&
                                                              "border-l-4 border-l-yellow-500"
                                                          )}
                                                          title={`${
                                                            a.area || ""
                                                          } ${
                                                            a.topic
                                                              ? `— ${a.topic}`
                                                              : ""
                                                          }`.trim()}
                                                        >
                                                          <div className="text-[11px] text-muted-foreground mb-1">
                                                            {a.area}
                                                            {a.topic
                                                              ? ` — ${a.topic}`
                                                              : ""}
                                                          </div>
                                                          <div className="text-foreground line-clamp-3">
                                                            {a.message}
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}

                                                  {(t.evidence?.tender
                                                    ?.length ||
                                                    t.evidence?.proposal
                                                      ?.length) && (
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                      {t.evidence?.tender && (
                                                        <div>
                                                          <div className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                                                            <FileText className="h-3.5 w-3.5" />{" "}
                                                            Pliego
                                                          </div>
                                                          <ul className="space-y-2">
                                                            {t.evidence.tender.map(
                                                              (ev, i3) => (
                                                                <li
                                                                  key={`t-${i3}`}
                                                                >
                                                                  <div className="rounded-md border bg-muted/30 p-2">
                                                                    <div className="text-xs text-foreground flex items-center gap-2">
                                                                      <span
                                                                        className="font-medium truncate"
                                                                        title={
                                                                          ev.file_name
                                                                        }
                                                                      >
                                                                        {
                                                                          ev.file_name
                                                                        }
                                                                      </span>
                                                                      {typeof ev.chunk_number ===
                                                                        "number" && (
                                                                        <span className="ml-auto text-[11px] text-muted-foreground">
                                                                          #{" "}
                                                                          {
                                                                            ev.chunk_number
                                                                          }
                                                                        </span>
                                                                      )}
                                                                    </div>
                                                                    {ev.preview && (
                                                                      <blockquote
                                                                        className="mt-1 text-[11px] text-muted-foreground border-l pl-2 italic line-clamp-4"
                                                                        title={
                                                                          ev.preview
                                                                        }
                                                                      >
                                                                        “
                                                                        {
                                                                          ev.preview
                                                                        }
                                                                        ”
                                                                      </blockquote>
                                                                    )}
                                                                  </div>
                                                                </li>
                                                              )
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}
                                                      {t.evidence?.proposal && (
                                                        <div>
                                                          <div className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                                                            <FileSignature className="h-3.5 w-3.5" />{" "}
                                                            Propuesta
                                                          </div>
                                                          <ul className="space-y-2">
                                                            {t.evidence.proposal.map(
                                                              (ev, i4) => (
                                                                <li
                                                                  key={`p-${i4}`}
                                                                >
                                                                  <div className="rounded-md border bg-muted/30 p-2">
                                                                    <div className="text-xs text-foreground flex items-center gap-2">
                                                                      <span
                                                                        className="font-medium truncate"
                                                                        title={
                                                                          ev.file_name
                                                                        }
                                                                      >
                                                                        {
                                                                          ev.file_name
                                                                        }
                                                                      </span>
                                                                      {typeof ev.chunk_number ===
                                                                        "number" && (
                                                                        <span className="ml-auto text-[11px] text-muted-foreground">
                                                                          #{" "}
                                                                          {
                                                                            ev.chunk_number
                                                                          }
                                                                        </span>
                                                                      )}
                                                                    </div>
                                                                    {ev.preview && (
                                                                      <blockquote
                                                                        className="mt-1 text-[11px] text-muted-foreground border-l pl-2 italic line-clamp-4"
                                                                        title={
                                                                          ev.preview
                                                                        }
                                                                      >
                                                                        “
                                                                        {
                                                                          ev.preview
                                                                        }
                                                                        ”
                                                                      </blockquote>
                                                                    )}
                                                                  </div>
                                                                </li>
                                                              )
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </CollapsibleSection>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })()}
                      </TabsContent>

                      {/* Semaforización */}
                      <TabsContent value="semaforo">
                        <div className="space-y-4">
                          {(() => {
                            const allAlerts =
                              project.analysis!.comparison.flatMap(
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
                                  <strong className="text-foreground">
                                    {g}
                                  </strong>
                                </span>
                                <span className="mx-3">·</span>
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="inline-block h-2 w-2 rounded-full bg-red-500"
                                    aria-hidden
                                  />
                                  Rojas:
                                  <strong className="text-foreground">
                                    {r}
                                  </strong>
                                </span>
                                <span className="mx-3">·</span>
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="inline-block h-2 w-2 rounded-full bg-yellow-500"
                                    aria-hidden
                                  />
                                  Amarillas:
                                  <strong className="text-foreground">
                                    {y}
                                  </strong>
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
                    </Tabs>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay resultados. Sube documentos y ejecuta el
                    análisis.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Etapa 2: placeholder */}
        <TabsContent value="stage2" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Proceso de contratación
                <Badge>En desarrollo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Aquí podrás subir el contrato adjudicado (PDF) para su análisis
                automático. Esta sección aún está en construcción.
              </p>
              <div className="rounded-md border bg-muted/40 p-4">
                <Label htmlFor="contract-file" className="text-foreground">
                  Subir contrato (próximamente)
                </Label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="contract-file"
                    type="file"
                    disabled
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" disabled>
                    <Upload className="size-4 mr-2" /> Seleccionar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddContractorControls({
  onAddByName,
  onAddByRuc,
}: {
  onAddByName: (name: string) => void;
  onAddByRuc: (ruc: string) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Agregar oferente manualmente"
          className="border-muted"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          size="sm"
          disabled={!name.trim() || busy}
          onClick={() => {
            onAddByName(name.trim());
            setName("");
          }}
        >
          <Plus className="size-4 mr-1" /> Agregar
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Agregar por RUC (13 dígitos)"
          className="border-muted"
          value={ruc}
          onChange={(e) => setRuc(e.target.value)}
        />
        <Button
          size="sm"
          disabled={!/^\d{13}$/.test(ruc) || busy}
          onClick={async () => {
            try {
              setBusy(true);
              await onAddByRuc(ruc);
              setRuc("");
            } finally {
              setBusy(false);
            }
          }}
        >
          Validar RUC
        </Button>
      </div>
    </div>
  );
}

function FilePill({
  name,
  onDelete,
}: {
  name: string;
  onDelete?: () => void | Promise<void>;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-muted/40 pl-2 pr-1 py-1 text-xs">
      <span className="truncate max-w-[200px]" title={name}>
        {name}
      </span>
      <button
        type="button"
        title="Eliminar"
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted focus:outline-none"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </button>
    </span>
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
