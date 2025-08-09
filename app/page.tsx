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
import HeroMedia from "@/components/landing/hero-media";

export default function Home() {
  return (
    <main className="min-h-[calc(100svh-56px)]">
      <section className="relative min-h-[calc(100svh-56px)] overflow-hidden flex items-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1400px_500px_at_50%_-20%,theme(colors.primary/12%),transparent)]" />
        <div className="pointer-events-none absolute -inset-x-20 -bottom-10 -z-10 h-56 bg-[radial-gradient(600px_120px_at_70%_60%,theme(colors.primary/15%),transparent)] blur-2xl" />
        <div className="max-w-6xl mx-auto px-4 py-16 w-full">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Left: sales-focused copy */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Gana tiempo y control en cada licitación
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Analiza pliegos, propuestas y contratos con precisión. Reduce
                hasta un 60% el tiempo de revisión, evita riesgos costosos y
                toma decisiones con datos claros.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignUpButton mode="modal">
                  <Button size="lg">Empezar gratis</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline">
                    Ver demo
                  </Button>
                </SignInButton>
              </div>
              <p className="text-xs text-muted-foreground">
                14 días gratis · Sin tarjeta · Cancela cuando quieras
              </p>
            </div>
            {/* Right: interactive media with glow */}
            <HeroMedia />
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
            <SignUpButton mode="modal">
              <Button size="lg">Empezar gratis</Button>
            </SignUpButton>
            <SignInButton mode="modal">
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
