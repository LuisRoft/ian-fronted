"use client";

import { useState } from "react";
import { ProjectsProvider } from "@/components/dashboard/projects-context";
import Sidebar from "@/components/dashboard/sidebar";
import ProjectWorkspace from "@/components/dashboard/project-workspace";

export default function DashboardShell() {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  return (
    <ProjectsProvider>
      <div className="flex">
        <Sidebar activeId={activeId} onSelect={setActiveId} />
        <main className="flex-1 min-h-screen">
          <ProjectWorkspace id={activeId || ""} />
        </main>
      </div>
    </ProjectsProvider>
  );
}
