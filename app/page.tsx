import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
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
import Link from "next/link";
import Image from "next/image";
import Cells from "@/app/assets/image-of-cells.png";
import Robots from "@/app/assets/robots-hero.svg";
import AppLogo from "@/app/assets/logo.png";

export default async function Home() {
  const { userId } = await auth();
  return (
    <main className="min-h-screen">
      <section className="relative h-screen overflow-hidden flex items-start">
        {/* Top background grid/cells */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] md:h-[380px]"
          style={{
            backgroundImage: `url(${
              (Cells as unknown as { src: string }).src
            })`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        />
        {/* Subtle radial glow (placed behind robots) */}
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(1400px_500px_at_50%_-20%,theme(colors.primary/10%),transparent)]" />

        <div className="max-w-6xl mx-auto px-4 py-16 w-full pb-24 md:pb-32">
          <div className="flex flex-col items-center text-center gap-6">
            <p className="text-xl font-bold tracking-wide text-secondary flex items-center gap-2">
              <Image
                src={AppLogo}
                alt="Logo"
                className="object-contain h-10 w-10"
              />
              IAN
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="block bg-[linear-gradient(90deg,#FF3BFF_0%,#ECBFBF_38%,#5C24FF_76%,#D94FD5_100%)] bg-clip-text text-transparent">
                Demasiados documentos, muy poco tiempo
              </span>
            </h1>
            <p className="text-muted-foreground text-md md:text-2xl max-w-2xl">
              Organiza y analiza tus licitaciones en minutos, no semanas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              {userId ? (
                <Link href="/dashboard">
                  <Button size="lg">Ir al Dashboard</Button>
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <Button size="lg">Quiero verlo en acción</Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="outline">
                      Ver demo
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
          {/* Robots illustration removed from flow (now absolutely positioned at bottom) */}
        </div>
        {/* Full-bleed robots illustration anchored to bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
          <Image
            src={Robots}
            alt="Ilustración de robots"
            priority
            className="w-screen h-auto max-w-none select-none"
            sizes="100vw"
          />
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
            {userId ? (
              <Link href="/dashboard">
                <Button size="lg">Ir al Dashboard</Button>
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button size="lg">Empezar gratis</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline">
                    Ver demo con datos
                  </Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
