"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, useAuth } from "@/features/auth/use-auth";

const inputClass =
  "min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@grooteam.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/admin";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo as Route);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 300);
    });

    const result = login(email, password);

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectTo as Route);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input
          autoComplete="email"
          className={inputClass}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Password
        <input
          autoComplete="current-password"
          className={inputClass}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </label>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-xs leading-5 text-ink/55">
        Usuario demo: admin@grooteam.com / 123456
      </p>
    </form>
  );
}
