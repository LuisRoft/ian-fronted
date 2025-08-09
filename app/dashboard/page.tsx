import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-2xl font-semibold">Acceso restringido</h1>
        <p className="text-muted-foreground mt-2">
          Inicia sesión para continuar.
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/sign-in"
            className="h-9 px-3 rounded-md border inline-flex items-center"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground inline-flex items-center"
          >
            Crear cuenta
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Bienvenido a IAN</h1>
      <p className="text-muted-foreground mt-2">
        Sube documentos de licitación para analizarlos con IA.
      </p>
      {/* TODO: upload widget & analysis results */}
    </main>
  );
}
