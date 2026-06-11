# Plataforma SaaS para restaurantes

Aplicacion Next.js 15 con TypeScript y Tailwind, preparada para menus publicos, panel administrativo y arquitectura multi-restaurante.

## Comandos

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Rutas iniciales

- `/`: vista de entrada del SaaS.
- `/demo/menu`: menu publico de restaurante.
- `/admin`: panel administrativo inicial.

## Supabase

Copia `.env.example` a `.env.local` y completa:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

La capa inicial esta en `src/lib/supabase`.
