"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signup } from "@/features/auth/use-auth";

const inputClass =
  "min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    const result = await signup(email, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage("Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesion.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input
          autoComplete="email"
          className={inputClass}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Password
        <input
          autoComplete="new-password"
          className={inputClass}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm font-semibold text-brand-900">
          {message}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "Creando..." : "Crear cuenta"}
      </Button>
      <p className="text-xs leading-5 text-ink/55">
        Ya tienes cuenta?{" "}
        <Link className="font-semibold text-brand-600" href="/login">
          Iniciar sesion
        </Link>
      </p>
    </form>
  );
}
