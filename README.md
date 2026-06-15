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
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL="Groo Team <no-reply@grooteam.com>"`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL=https://menus.grooteam.com`

La capa inicial esta en `src/lib/supabase`.

## Mercado Pago

La ruta `/api/payments/mercadopago/create-subscription` crea una suscripcion recurrente
con Mercado Pago usando `preapproval`. El webhook en
`/api/payments/mercadopago/webhook` consulta la suscripcion real en Mercado Pago antes
de actualizar Supabase.

## Correos transaccionales

Los correos se envian con Resend desde `src/lib/email`. Las plantillas React estan en
`/emails` y usan el branding verde, negro y blanco de Groo Team.

- Registro: `/api/auth/signup` genera el enlace de Supabase Auth y envia la confirmacion con Resend.
- Bienvenida: se envia al confirmar correo en `/auth/callback`.
- Suscripciones: el webhook de Mercado Pago envia activacion, renovacion, pago fallido y cancelacion.
- Trial por vencer: programa un cron diario hacia `/api/emails/trial-reminders` con `Authorization: Bearer CRON_SECRET`.
