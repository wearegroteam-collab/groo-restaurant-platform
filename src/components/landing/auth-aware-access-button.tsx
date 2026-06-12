"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

export function AuthAwareAccessButton() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Button asChild variant="outline">
      <Link href={isAuthenticated ? "/admin" : "/login"}>
        {isLoading ? "Ingresar" : isAuthenticated ? "Ir al panel" : "Iniciar sesion"}
      </Link>
    </Button>
  );
}
