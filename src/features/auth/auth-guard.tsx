"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/features/auth/use-auth";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}` as Route);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Container className="grid min-h-screen place-items-center">
          <div className="rounded-lg border border-ink/10 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-ink/60">Verificando sesion...</p>
          </div>
        </Container>
      </main>
    );
  }

  return children;
}
