# Flujo de Arquitectura y Procesos (Versión para Hackathon)

Este documento describe una arquitectura **simplificada y directa** para la plataforma de análisis de licitaciones, diseñada para ser implementada rápidamente en un entorno de hackathon (2 días).

## 1. Componentes Principales

- **Frontend:** Una aplicación web que consume la API.
- **API (Backend):** Un servidor **FastAPI** (`main.py`) que expone los endpoints y **realiza todo el procesamiento de forma síncrona**. Esto significa que la API esperará a que el análisis termine antes de responder.
- **Agentes (LangChain):** La lógica de IA (`agents/`) que orquesta el análisis, clasificación y comparación.
- **Base de Datos Vectorial (ChromaDB):** Es la **única base de datos del proyecto**. Se usa para almacenar los vectores y todos los metadatos de los documentos. Un "proyecto" es simplemente una "colección" dentro de ChromaDB.

## 2. Modelo de Datos en ChromaDB

- **Una Colección por Proyecto:** Se creará una nueva colección en ChromaDB por cada `projectId`. Esto mantiene los datos aislados y es fácil de gestionar.
- **Metadatos Enriquecidos:** Cada chunk de texto almacenado en ChromaDB irá acompañado de metadatos para poder hacer filtros precisos.

**Ejemplo de un objeto en ChromaDB:**

```python
collection.add(
    documents=["El contratista deberá presentar una garantía..."],
    embeddings=[...],
    metadatas=[{
        "document_id": "doc_tender_01",
        "file_name": "pliego.pdf-a1b2c3d4",
        "document_type": "TENDER", # o "PROPOSAL"
        "bidder_name": "Empresa A",
  "section": "legal_conditions",
  "chunk_number": 12
    }],
    ids=["doc_tender_01_chunk_012"]
)

Notas:
- `file_name` corresponde al `document_id` devuelto por el endpoint de carga y es la clave para borrar documentos específicos.
- `chunk_number` permite recuperar vecinos (±1, ±2) para dar contexto adicional coherente a los LLMs.
```

## 3. Flujo de Proceso Síncrono

A continuación se detalla el flujo paso a paso. Es un flujo directo donde cada paso se completa antes de iniciar el siguiente.

### **Endpoint de Utilidad: Validación de RUC**

Antes de cargar una propuesta, el frontend debe validar el RUC del proponente.

1.  **UI:** El usuario introduce el RUC de un proponente (13 dígitos).
2.  **API (`POST /validate-ruc/{ruc}`):**
    - La API hace una consulta directa a un servicio interno del SRI (no es scraping).
    - **Respuesta Exitosa (200 OK):** Devuelve un JSON con el estado del contribuyente y su razón social.
      ```json
      {
        "status": "success",
        "razon_social": "NOMBRE DE LA EMPRESA",
        "estado": "ACTIVO",
        "motivo_cancelacion": null, // O contendrá la razón si el estado es INACTIVO/SUSPENDIDO
        "message": null
      }
      ```
    - **Respuesta de Error (404 Not Found):** Si el RUC no existe o es inválido, la API devuelve un error con el mensaje en el campo `detail`.
      ```json
      {
        "detail": "El RUC 1234567890123 no existe o no pudo ser consultado."
      }
      ```
3.  **UI:**
    - Si la respuesta es exitosa y el `estado` es "ACTIVO", la UI rellena automáticamente el campo del nombre del proponente con la `razon_social` y permite continuar.
    - Si el estado no es "ACTIVO" o si hay un error, la UI debe mostrar un mensaje al usuario y deshabilitar la carga de documentos para ese proponente.

### **Paso 1: Creación del Proyecto**

1.  **UI:** El usuario introduce un nombre para el proyecto.
2.  **API (`POST /projects`):**

- Recibe el nombre.
- Verifica si ya existe un proyecto con ese nombre. Si es así, devuelve un error `409 Conflict`.
- Si no existe, usa `chroma_connection.py` para crear una nueva colección en ChromaDB.
- Devuelve el ID del proyecto (`project_id`) a la UI.

### **Paso 2: Carga y Procesamiento de Documentos (Síncrono)**

1.  **UI:**
    - Para documentos de tipo `TENDER` (pliego), el usuario selecciona uno o más archivos para subir.
    - Para documentos de tipo `PROPOSAL` (propuesta), el flujo es:
      1. Validar el RUC del proponente como se describe en el paso anterior.
      2. Con el campo "Nombre del Proponente" ya relleno con la razón social, el usuario selecciona uno o más archivos de la propuesta para subir.
2.  **API (`POST /projects/{projectId}/documents`):**

- **a. Recibe la lista de archivos** y los metadatos (incluyendo `bidder_name` que es la razón social obtenida en la validación).
- **b. Itera sobre cada archivo y lo procesa:**
  - **Lectura y Chunking (`utils/`):** Lee el PDF y lo divide en fragmentos.
  - **Vectorización y Almacenamiento (`utils/`, `chroma_connection.py`):** Genera los embeddings y guarda todo en la colección de ChromaDB del proyecto.
  - Si un archivo falla (p. ej. no se puede leer), se registra el fallo para ese archivo y el proceso continúa con los siguientes.
- **c. Responde a la UI:** Devuelve una lista de objetos JSON, uno por cada archivo, indicando el estado de cada uno.

  ```json
  [
    {
      "document_id": "pliego-parte1.pdf-a1b2c3d4",
      "file_name": "pliego-parte1.pdf",
      "status": "COMPLETED"
    },
    {
      "document_id": null,
      "file_name": "scan-ilegible.pdf",
      "status": "FAILED: No se pudo extraer texto suficiente."
    }
  ]
  ```

### **Paso 3: Generación de Análisis y Comparativas (Síncrono)**

1.  **UI:** El usuario hace clic en "Comparar". El navegador **esperará** a que la comparación se complete.
2.  **API (`GET /projects/{projectId}/comparison`):**

- **a. Llama al `agents/orchestrator.py`**.
- **b. El orquestador ejecuta toda la lógica de comparación:** Usa el `retriever.py` para obtener los datos de ChromaDB y el `comparison_agent.py` para evaluarlos.
- **c. Ensambla la respuesta JSON** con el formato definido en `schemas/schemas.py`.
- **d. Devuelve el JSON completo** a la UI para que se muestre el dashboard. Ahora incluye:
  - `summary.summary_text`: párrafo + bullets por subtemas.
  - `summary.by_topics`: desglose por subtemas con `overallScore`, `summary`, `alerts` y `evidence`.
  - Cada alerta incluye el campo `topic` para ser pintada en la sección correcta.

Ejemplo abreviado de comparación (por oferente):

```json
{
  "bidderName": "Empresa A",
  "documentId": "propuestaA.pdf-1a2b3c4d",
  "overallScore": 78.5,
  "summary": {
    "compliance": "calculated",
    "summary_text": "Resumen ejecutivo...\n- Legal: ...\n- Técnico: ...",
    "by_topics": [
      {
        "topic": "Precios, costos, formas de pago y condiciones económicas",
        "overallScore": 75,
        "summary": { "compliance": "partial", "summary_text": "..." },
        "alerts": [
          {
            "level": "yellow",
            "area": "Económico",
            "topic": "Precios...",
            "message": "Monto inferior... \"forma de pago mensual\""
          }
        ],
        "evidence": {
          "tender": [
            {
              "file_name": "pliego.pdf-a1b2",
              "chunk_number": 10,
              "preview": "El contratista deberá..."
            }
          ],
          "proposal": [
            {
              "file_name": "propA.pdf-1a2b",
              "chunk_number": 7,
              "preview": "Se propone pago mensual..."
            }
          ]
        }
      }
    ]
  },
  "alerts": [
    {
      "level": "red",
      "area": "Documental",
      "topic": "Garantías...",
      "message": "No se encontró contenido..."
    }
  ],
  "ruc_validation": {
    "isValid": true,
    "canPerformWork": true,
    "details": "RUC validado (simulación)."
  }
}
```

## 4. Definición de Endpoints (API REST)

Esta es la interfaz que el frontend usará.

#### **Utilidades**

- `POST /validate-ruc/{ruc}`: Valida un RUC en el SRI.

#### **Proyectos**

- `POST /projects`: Crea un nuevo proyecto.
- `DELETE /projects/{projectId}`: Elimina un proyecto completo con todos sus datos.

#### **Documentos**

- `POST /projects/{projectId}/documents`: Sube uno o más documentos (pliego o propuesta) a un proyecto.
- `DELETE /projects/{projectId}/documents/{documentId}`: Elimina un documento específico y todos sus fragmentos de un proyecto.
  - `documentId` es el valor devuelto en `document_id` al subir (se almacena como `file_name` en los metadatos de ChromaDB).
  - Reglas:
    - Documentos `TENDER`: no requieren `bidderName`.
    - Documentos `PROPOSAL`: requieren `bidderName` (query param) y debe coincidir con el dueño del documento.
  - Respuestas: `204 No Content` si se elimina o si ya no existe (idempotente). `400` si falta `bidderName` para `PROPOSAL`. `404` si el documento no existe o el `bidderName` no coincide.
- `DELETE /projects/{projectId}/bidders/{bidderName}`: Elimina todos los documentos asociados a un oferente específico en un proyecto.

#### **Dashboard**

- `GET /projects/{projectId}/comparison`: Dispara el análisis y devuelve el informe comparativo.

## 5. Recuperación (RAG) y Precisión — Cómo logramos respuestas más fiables

- Recuperación con diversidad: se usa MMR por defecto para evitar redundancia y cubrir distintas facetas del tema.
- Coherencia de contexto: se añaden chunks vecinos (±1 por defecto) del mismo documento usando `chunk_number`.
- Re-ranking heurístico: tras recuperar, se reordena por solapamiento de palabras clave del tópico para priorizar evidencia más pertinente.
- Filtros precisos: combinación de metadatos con `$and` al buscar (p. ej., `document_type` y `bidder_name`).
- Tunings por subtema (internos):
  - Económico: `k=8`, `fetch_k=32`, `neighbor_window=2`.
  - Sanciones/multas: `strategy=similarity`, `max_distance=0.32`.
  - Resto: valores por defecto (MMR, vecinos, re-ranking).
- Guardrails de prompts:
  - Las alertas deben basarse en evidencia; si la afirmación es decisiva, incluir una cita breve (3–12 palabras) entre comillas.
  - Si no hay evidencia suficiente, el agente declara la ausencia; no inventa contenido.

## 6. Guía para el Frontend — Cómo pintar la información

- Encabezado: usa `summary.summary_text` (párrafo + bullets) como visión general.
- Secciones por subtema: recorre `summary.by_topics` y pinta por `topic` con:
  - `overallScore` del subtema y `summary.summary_text` del subtema.
  - `alerts` con semáforo (level: red/yellow/green) y el `topic` ya incluido.
  - Evidencias: mostrar `file_name`, `chunk_number` y un `preview` (140 chars aprox.).
- Comparación entre oferentes: usa la lista `comparison` que ya viene segmentada por `bidderName` y `documentId`.

Sugerencia UX: permitir expandir cada subtema para ver evidencias y copiar citas rápidas (las entre comillas en los mensajes de alerta) para trazabilidad.
