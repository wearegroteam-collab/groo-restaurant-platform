"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return { ok: true };
}

export async function signup(email: string, password: string): Promise<AuthResult> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    return {
      ok: false,
      error: data.error ?? "No se pudo crear la cuenta.",
    };
  }

  return { ok: true };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAuthenticated: Boolean(user),
    isLoading,
    session: user,
    user,
  };
}
