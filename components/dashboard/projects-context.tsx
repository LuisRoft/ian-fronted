"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type FileMeta = {
  id: string;
  name: string;
  size: number;
  lastModified?: number;
};

export type Contractor = {
  id: string;
  name: string;
  files: FileMeta[];
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  contratanteFiles: FileMeta[];
  contractors: Contractor[];
};

type ProjectsContextValue = {
  projects: Project[];
  createProject: (name: string) => Project;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  addContratanteFiles: (projectId: string, files: File[]) => void;
  addContractor: (projectId: string, name: string) => Contractor;
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
      createProject: (name: string) => {
        const p: Project = {
          id: uid(),
          name: name.trim() || "Proyecto sin nombre",
          createdAt: new Date().toISOString(),
          contratanteFiles: [],
          contractors: [],
        };
        setProjects((arr) => [p, ...arr]);
        return p;
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
