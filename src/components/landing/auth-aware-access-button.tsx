"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

type AuthAwareAccessButtonProps = {
  className?: string;
};

export function AuthAwareAccessButton({ className }: AuthAwareAccessButtonProps) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Button asChild className={className} variant="outline">
      <Link href={isAuthenticated ? "/admin" : "/login"}>
        {isLoading ? "Ingresar" : isAuthenticated ? "Ir al panel" : "Iniciar sesion"}
      </Link>
    </Button>
  );
}
