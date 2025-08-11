"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ComparisonResponse, RucValidationResponse } from "@/lib/api";
import {
  createProject as apiCreateProject,
  uploadDocuments,
  getComparison,
  validateRuc,
  deleteProjectBackend as apiDeleteProjectBackend,
} from "@/lib/api";

export type FileMeta = {
  id: string;
  name: string;
  size: number;
  lastModified?: number;
};

export type Contractor = {
  id: string;
  name: string; // display name (same as embedding_name by default)
  embedding_name?: string; // razon_social used for embeddings
  ruc?: string;
  estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | string;
  motivo_cancelacion?: string | null;
  files: FileMeta[];
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  contratanteFiles: FileMeta[];
  contractors: Contractor[];
  // backend linkage
  backend?: {
    project_id: string; // Chroma collection name
  };
  // latest analysis result
  analysis?: ComparisonResponse | null;
};

type ProjectsContextValue = {
  projects: Project[];
  createProject: (name: string) => Promise<Project>;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  deleteProjectRemote?: (id: string) => Promise<void>;
  addContratanteFiles: (projectId: string, files: File[]) => void;
  addContractor: (projectId: string, name: string) => Contractor;
  addContractorByRuc: (projectId: string, ruc: string) => Promise<Contractor>;
  renameContractor: (
    projectId: string,
    contractorId: string,
    name: string
  ) => void;
  addContractorFiles: (
    projectId: string,
    contractorId: string,
    files: File[]
  ) => void;
  // backend sync actions
  ensureBackendProject: (projectId: string) => Promise<string>; // returns project_id
  uploadTender: (projectId: string, file: File) => Promise<void>;
  uploadTenderBatch: (projectId: string, files: File[]) => Promise<void>;
  uploadProposal: (
    projectId: string,
    contractorId: string,
    file: File
  ) => Promise<void>;
  uploadProposalBatch: (
    projectId: string,
    contractorId: string,
    files: File[]
  ) => Promise<void>;
  runAnalysis: (projectId: string) => Promise<ComparisonResponse>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY = "ian.projects";

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
  }, []);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects]);

  const api = useMemo<ProjectsContextValue>(
    () => ({
      projects,
      createProject: async (name: string) => {
        const exists = projects.some(
          (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
        if (exists) {
          toast.error("Ya existe un proyecto con ese nombre");
          throw new Error("duplicate_project_name");
        }
        const local: Project = {
          id: uid(),
          name: name.trim() || "Proyecto sin nombre",
          createdAt: new Date().toISOString(),
          contratanteFiles: [],
          contractors: [],
          backend: undefined,
          analysis: null,
        };
        // Try backend first to catch 409 conflicts
        try {
          const res = await apiCreateProject(local.name);
          local.backend = { project_id: res.project_id };
          setProjects((arr) => [local, ...arr]);
          return local;
        } catch (e: unknown) {
          const err = e as { status?: number } | undefined;
          if (err?.status === 409) {
            toast.error("Ese nombre ya existe en el backend");
            throw new Error("backend_conflict");
          }
          // Fallback to local add with warning
          toast.warning(
            "Proyecto creado localmente; fallo al crear en backend"
          );
          setProjects((arr) => [local, ...arr]);
          return local;
        }
      },
      renameProject: (id: string, name: string) => {
        setProjects((arr) =>
          arr.map((p) => (p.id === id ? { ...p, name } : p))
        );
      },
      deleteProject: (id: string) => {
        setProjects((arr) => arr.filter((p) => p.id !== id));
      },
      addContratanteFiles: (projectId: string, files: File[]) => {
        const metas: FileMeta[] = files.map((f) => ({
          id: uid(),
          name: f.name,
          size: f.size,
          lastModified: f.lastModified,
        }));
        setProjects((arr) =>
          arr.map((p) =>
            p.id === projectId
              ? { ...p, contratanteFiles: [...p.contratanteFiles, ...metas] }
              : p
          )
        );
      },
      addContractor: (projectId: string, name: string) => {
        const c: Contractor = {
          id: uid(),
          name: name.trim() || "Contratista",
          embedding_name: name.trim() || "Contratista",
          files: [],
        };
        setProjects((arr) =>
          arr.map((p) =>
            p.id === projectId
              ? { ...p, contractors: [...p.contractors, c] }
              : p
          )
        );
        return c;
      },
      addContractorByRuc: async (projectId: string, ruc: string) => {
        const r = (ruc || "").trim();
        if (!/^\d{13}$/.test(r)) {
          toast.error("RUC inválido: Debe tener 13 dígitos");
          throw new Error("invalid_ruc");
        }
        let data: RucValidationResponse;
        try {
          data = await validateRuc(r);
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "No se pudo validar el RUC";
          toast.error(msg);
          throw e as Error;
        }
        const razon = (data.razon_social || "").trim();
        const estado = (
          data.estado || ""
        ).toUpperCase() as Contractor["estado"];
        if (!razon) {
          toast.error("La validación no retornó razón social");
          throw new Error("missing_razon_social");
        }
        const c: Contractor = {
          id: uid(),
          name: razon,
          embedding_name: razon,
          ruc: r,
          estado,
          motivo_cancelacion: data.motivo_cancelacion ?? null,
          files: [],
        };
        setProjects((arr) =>
          arr.map((p) =>
            p.id === projectId
              ? { ...p, contractors: [...p.contractors, c] }
              : p
          )
        );
        toast.success(`RUC válido: ${razon} (${estado || "SIN ESTADO"})`);
        return c;
      },
      renameContractor: (
        projectId: string,
        contractorId: string,
        name: string
      ) => {
        setProjects((arr) =>
          arr.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  contractors: p.contractors.map((c) =>
                    c.id === contractorId ? { ...c, name } : c
                  ),
                }
              : p
          )
        );
      },
      addContractorFiles: (
        projectId: string,
        contractorId: string,
        files: File[]
      ) => {
        const metas: FileMeta[] = files.map((f) => ({
          id: uid(),
          name: f.name,
          size: f.size,
          lastModified: f.lastModified,
        }));
        setProjects((arr) =>
          arr.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  contractors: p.contractors.map((c) =>
                    c.id === contractorId
                      ? { ...c, files: [...c.files, ...metas] }
                      : c
                  ),
                }
              : p
          )
        );
      },
      ensureBackendProject: async (projectId: string) => {
        const proj = projects.find((p) => p.id === projectId);
        if (!proj) throw new Error("Proyecto no encontrado");
        if (proj.backend?.project_id) return proj.backend.project_id;
        const res = await apiCreateProject(proj.name);
        setProjects((arr) =>
          arr.map((p) =>
            p.id === projectId
              ? { ...p, backend: { project_id: res.project_id } }
              : p
          )
        );
        return res.project_id;
      },
      uploadTender: async (projectId: string, file: File) => {
        const project_id = await (async () => {
          const p = projects.find((px) => px.id === projectId);
          return (
            p?.backend?.project_id ||
            (await apiCreateProject(p!.name)).project_id
          );
        })();
        await uploadDocuments({
          project_id,
          document_type: "TENDER",
          files: [file],
        });
      },
      uploadTenderBatch: async (projectId: string, files: File[]) => {
        if (!files.length) return;
        const project_id = await (async () => {
          const p = projects.find((px) => px.id === projectId);
          return (
            p?.backend?.project_id ||
            (await apiCreateProject(p!.name)).project_id
          );
        })();
        await uploadDocuments({ project_id, document_type: "TENDER", files });
      },
      uploadProposal: async (
        projectId: string,
        contractorId: string,
        file: File
      ) => {
        const p = projects.find((px) => px.id === projectId);
        if (!p) throw new Error("Proyecto no encontrado");
        const contractor = p.contractors.find((c) => c.id === contractorId);
        if (!contractor) throw new Error("Contratista no encontrado");
        if (contractor.estado && contractor.estado !== "ACTIVO") {
          throw new Error("Contratista no habilitado para subir documentos");
        }
        const project_id =
          p.backend?.project_id || (await apiCreateProject(p.name)).project_id;
        await uploadDocuments({
          project_id,
          document_type: "PROPOSAL",
          files: [file],
          bidder_name: contractor.embedding_name || contractor.name,
        });
      },
      uploadProposalBatch: async (
        projectId: string,
        contractorId: string,
        files: File[]
      ) => {
        if (!files.length) return;
        const p = projects.find((px) => px.id === projectId);
        if (!p) throw new Error("Proyecto no encontrado");
        const contractor = p.contractors.find((c) => c.id === contractorId);
        if (!contractor) throw new Error("Contratista no encontrado");
        if (contractor.estado && contractor.estado !== "ACTIVO") {
          throw new Error("Contratista no habilitado para subir documentos");
        }
        const project_id =
          p.backend?.project_id || (await apiCreateProject(p.name)).project_id;
        await uploadDocuments({
          project_id,
          document_type: "PROPOSAL",
          files,
          bidder_name: contractor.embedding_name || contractor.name,
        });
      },
      // Optional: server-side delete (best-effort)
      deleteProjectRemote: async (id: string) => {
        const proj = projects.find((p) => p.id === id);
        if (!proj?.backend?.project_id) return;
        try {
          await apiDeleteProjectBackend(proj.backend.project_id);
          toast.success("Proyecto eliminado en backend");
        } catch {
          toast.error("No se pudo eliminar en backend");
        }
      },
      runAnalysis: async (projectId: string) => {
        const p = projects.find((px) => px.id === projectId);
        if (!p) throw new Error("Proyecto no encontrado");
        const project_id =
          p.backend?.project_id || (await apiCreateProject(p.name)).project_id;
        const res = await getComparison(project_id);
        setProjects((arr) =>
          arr.map((pp) => (pp.id === projectId ? { ...pp, analysis: res } : pp))
        );
        return res;
      },
    }),
    [projects]
  );

  return (
    <ProjectsContext.Provider value={api}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
