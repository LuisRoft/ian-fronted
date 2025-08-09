import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldAlert, ClipboardList, Building2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[calc(100svh-56px)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_400px_at_50%_-40%,theme(colors.primary/10%),transparent)]" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Inteligencia para licitaciones, sin dolor.
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                IAN lee pliegos, propuestas y contratos, clasifica secciones
                clave, detecta vacíos y riesgos, y compara oferentes con señales
                claras. Menos errores, más control y velocidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignUpButton
                  mode="modal"
                  forceRedirectUrl="/dashboard"
                  fallbackRedirectUrl="/dashboard"
                >
                  <Button size="lg">Crear cuenta</Button>
                </SignUpButton>
                <SignInButton
                  mode="modal"
                  forceRedirectUrl="/dashboard"
                  fallbackRedirectUrl="/dashboard"
                >
                  <Button size="lg" variant="outline">
                    Entrar
                  </Button>
                </SignInButton>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl border bg-card p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg h-28 bg-primary/10 border" />
                  <div className="rounded-lg h-28 bg-accent border" />
                  <div className="rounded-lg h-28 bg-muted border" />
                  <div className="col-span-3 h-28 rounded-lg border bg-background" />
                  <div className="col-span-2 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    Semáforo de riesgos
                  </div>
                  <div className="h-10 rounded-md border flex items-center justify-center text-sm">
                    Comparativo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" /> Lectura inteligente
              </CardTitle>
              <CardDescription>
                Ingesta de PDFs y extracción con NLP.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Identifica tablas, anexos y cláusulas clave aún con formatos
              irregulares.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" /> Clasificación automática
              </CardTitle>
              <CardDescription>Legal, técnico y económico.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Normaliza información crítica para navegación y búsqueda rápida.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" /> Valida RUC
              </CardTitle>
              <CardDescription>Verificación de razón social.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Comprueba si el contratista puede ejecutar legalmente el trabajo.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5" /> Riesgos y alertas
              </CardTitle>
              <CardDescription>
                Semáforo de riesgos y faltantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Detecta ambigüedades, contradicciones y vacíos contractuales.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground mt-1">
              Del documento a la decisión en minutos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex items-start gap-3">
                <Badge>1</Badge>
                <div>
                  <CardTitle>Sube tus documentos</CardTitle>
                  <CardDescription>
                    Pliegos, propuestas, contratos.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                IAN los procesa con NLP y estructura la información relevante.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-start gap-3">
                <Badge>2</Badge>
                <div>
                  <CardTitle>Analiza y valida</CardTitle>
                  <CardDescription>RUC, requisitos, cláusulas.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ve el semáforo de riesgos y sugerencias de mejora con
                trazabilidad.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-start gap-3">
                <Badge>3</Badge>
                <div>
                  <CardTitle>Compara y decide</CardTitle>
                  <CardDescription>Oferentes y condiciones.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Un resumen comparativo señala cumplimiento, costos y plazos.
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 flex gap-3">
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
            >
              <Button size="lg">Empezar gratis</Button>
            </SignUpButton>
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
            >
              <Button size="lg" variant="outline">
                Ver demo con datos
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>
    </main>
  );
}
