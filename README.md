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
- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL=https://menus.grooteam.com`

La capa inicial esta en `src/lib/supabase`.

## Mercado Pago

La ruta `/api/payments/mercadopago/create-subscription` crea una suscripcion recurrente
con Mercado Pago usando `preapproval`. El webhook en
`/api/payments/mercadopago/webhook` consulta la suscripcion real en Mercado Pago antes
de actualizar Supabase.
