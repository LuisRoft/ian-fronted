export type CreateProjectResponse = {
  project_id: string;
  name: string;
};

export type DocumentUploadResponse = {
  document_id: string;
  file_name: string;
  status?: string;
};

// Partial shape based on API.md
export type ComparisonResponse = {
  project_id: string;
  project_name: string;
  tender_summary?: {
    resumen: string;
    fragmentos_totales: number;
  };
  comparison: Array<{
    bidderName: string;
    documentId: string;
    overallScore: number;
    summary?: {
      compliance?: string;
      summary_text?: string;
    };
    ruc_validation?: {
      isValid: boolean;
      canPerformWork: boolean;
      details?: string;
    };
    alerts?: Array<{
      level: string; // "red" | "yellow" | "green" etc.
      area: string;
      message: string;
      topic: string;
    }>;
  }>;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type RucValidationResponse = {
  status: "success" | "error";
  razon_social: string | null;
  estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | string | null;
  motivo_cancelacion?: string | null;
  message: string | null;
};

type HttpError = Error & { status?: number; body?: unknown };

export async function createProject(
  name: string
): Promise<CreateProjectResponse> {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err: HttpError = Object.assign(new Error(`HTTP ${res.status}`), {
      status: res.status as number,
    });
    try {
      err.body = (await res.json()) as unknown;
    } catch {
      try {
        err.body = (await res.text()) as unknown;
      } catch {}
    }
    throw err;
  }
  return res.json();
}

export async function uploadDocuments(params: {
  project_id: string;
  document_type: "TENDER" | "PROPOSAL";
  files: File[];
  bidder_name?: string;
}): Promise<DocumentUploadResponse[]> {
  const { project_id, document_type, files, bidder_name } = params;
  const formData = new FormData();
  formData.set("document_type", document_type);
  if (document_type === "PROPOSAL") {
    if (!bidder_name) throw new Error("bidder_name es requerido para PROPOSAL");
    formData.set("bidder_name", bidder_name);
  }
  for (const f of files) {
    formData.append("files", f);
  }
  const res = await fetch(
    `${BASE_URL}/projects/${encodeURIComponent(project_id)}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    const err: HttpError = Object.assign(new Error(`HTTP ${res.status}`), {
      status: res.status as number,
    });
    try {
      err.body = (await res.json()) as unknown;
    } catch {}
    throw err;
  }
  return res.json();
}

export async function getComparison(
  project_id: string
): Promise<ComparisonResponse> {
  const res = await fetch(
    `${BASE_URL}/projects/${encodeURIComponent(project_id)}/comparison`
  );
  if (!res.ok) throw new Error(`Error obteniendo comparacion: ${res.status}`);
  return res.json();
}

export async function deleteProjectBackend(project_id: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/projects/${encodeURIComponent(project_id)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const err: HttpError = Object.assign(new Error(`HTTP ${res.status}`), {
      status: res.status as number,
    });
    try {
      err.body = (await res.json()) as unknown;
    } catch {}
    throw err;
  }
}

export async function validateRuc(ruc: string): Promise<RucValidationResponse> {
  const res = await fetch(
    `${BASE_URL}/validate-ruc/${encodeURIComponent(ruc)}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) {
    let detail = `Error validando RUC: ${res.status}`;
    try {
      const j = await res.json();
      detail = j?.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}
