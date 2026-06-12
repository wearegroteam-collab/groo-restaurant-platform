"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/features/menus/format-money";
import {
  cancelAccessAction,
  extendTrialAction,
  manualAccessAction,
  reactivateSubscriptionAction,
  toggleRestaurantActiveAction,
  updateProfileRoleAction,
  updateSubscriptionAction,
} from "@/features/super-admin/actions";
import {
  superAdminPlans,
  type ProfileRole,
  type SuperAdminRestaurant,
  type SuperAdminUser,
} from "@/features/super-admin/super-admin";
import type { Subscription, SubscriptionStatus } from "@/features/subscriptions/subscriptions";

type SuperAdminDashboardProps = {
  users: SuperAdminUser[];
  restaurants: SuperAdminRestaurant[];
  subscriptions: Subscription[];
  errorMessage?: string;
};

type UserDetailTab = "summary" | "subscription" | "restaurants" | "permissions";

const detailTabs: Array<{ id: UserDetailTab; label: string }> = [
  { id: "summary", label: "Resumen" },
  { id: "subscription", label: "Suscripcion" },
  { id: "restaurants", label: "Restaurantes" },
  { id: "permissions", label: "Permisos" },
];

const statuses: SubscriptionStatus[] = ["trialing", "active", "expired", "cancelled", "past_due"];
const roles: ProfileRole[] = ["user", "super_admin"];

const inputClass =
  "min-h-11 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function formatDate(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateInput(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getPlanValue(planName: string) {
  return (
    superAdminPlans.find((plan) => plan.label === planName || plan.value === planName)?.value ??
    "1_sucursal"
  );
}

export function SuperAdminDashboard({
  errorMessage,
  users,
  restaurants,
  subscriptions,
}: SuperAdminDashboardProps) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<UserDetailTab>("summary");
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const selectedRestaurants = restaurants.filter(
    (restaurant) => restaurant.userId === selectedUser?.id,
  );
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active",
  ).length;
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => user.email.toLowerCase().includes(query));
  }, [search, users]);

  function openUser(userId: string) {
    setSelectedUserId(userId);
    setActiveDetailTab("summary");
  }

  return (
    <main className="min-h-screen bg-brand-50 text-ink">
      <header className="border-b border-ink/10 bg-white">
        <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">Super Admin</p>
            <h1 className="text-3xl font-bold">Control del SaaS</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Volver al admin</Link>
          </Button>
        </Container>
      </header>

      <Container className="grid gap-6 py-6">
        {errorMessage ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </section>
        ) : null}

        {!selectedUser ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <Metric label="Usuarios totales" value={users.length} />
              <Metric label="Restaurantes totales" value={restaurants.length} />
              <Metric label="Suscripciones activas" value={activeSubscriptions} />
            </section>

            <Panel title="Usuarios">
              <div className="grid gap-4">
                <input
                  className={inputClass}
                  placeholder="Buscar usuario por email"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <div className="grid gap-3">
                  {filteredUsers.map((user) => (
                    <Row key={user.id}>
                      <div className="min-w-0">
                        <p className="break-all font-bold">{user.email}</p>
                        <p className="text-sm text-ink/60">Rol: {user.role}</p>
                        <p className="text-sm text-ink/60">
                          Suscripcion: {user.subscription?.status ?? "Sin plan"}
                        </p>
                      </div>
                      <div className="grid gap-1 text-sm sm:text-right">
                        <span>Plan: {user.subscription?.plan_name ?? "Sin plan"}</span>
                        <span>Restaurantes: {user.restaurantCount}</span>
                        <Button onClick={() => openUser(user.id)} variant="outline">
                          Gestionar
                        </Button>
                      </div>
                    </Row>
                  ))}
                  {!filteredUsers.length ? (
                    <p className="rounded-md border border-dashed border-ink/15 p-4 text-sm text-ink/60">
                      No encontramos usuarios con ese email.
                    </p>
                  ) : null}
                </div>
              </div>
            </Panel>
          </>
        ) : (
          <>
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-semibold text-brand-700">Detalle de usuario</p>
                  <h2 className="break-all text-2xl font-bold">{selectedUser.email}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-ink/60">
                    <span>Rol: {selectedUser.role}</span>
                    <span>Estado: {selectedUser.subscription?.status ?? "Sin plan"}</span>
                  </div>
                </div>
                <Button onClick={() => setSelectedUserId(null)} variant="outline">
                  Volver a usuarios
                </Button>
              </div>
            </section>

            <nav className="sticky top-0 z-20 overflow-x-auto rounded-lg border border-ink/10 bg-white p-2 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max gap-2">
                {detailTabs.map((tab) => (
                  <button
                    className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                      activeDetailTab === tab.id
                        ? "bg-ink text-white"
                        : "text-ink/65 hover:bg-ink/5 hover:text-ink"
                    }`}
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {activeDetailTab === "summary" ? (
              <Panel title="Resumen">
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard label="Email" value={selectedUser.email} />
                  <InfoCard label="Rol" value={selectedUser.role} />
                  <InfoCard label="Fecha de registro" value={formatDate(selectedUser.createdAt)} />
                  <InfoCard
                    label="Estado de suscripcion"
                    value={selectedUser.subscription?.status ?? "Sin plan"}
                  />
                  <InfoCard
                    label="Plan actual"
                    value={selectedUser.subscription?.plan_name ?? "Sin plan"}
                  />
                  <InfoCard label="Restaurantes creados" value={selectedRestaurants.length} />
                  <InfoCard
                    label="Sucursales permitidas"
                    value={selectedUser.subscription?.branch_limit ?? 0}
                  />
                </section>
              </Panel>
            ) : null}

            {activeDetailTab === "subscription" ? (
              <Panel title="Suscripcion">
                {selectedUser.subscription ? (
                  <SubscriptionEditor subscription={selectedUser.subscription} />
                ) : (
                  <p className="rounded-md border border-dashed border-ink/15 p-4 text-sm text-ink/60">
                    Este usuario no tiene suscripcion creada.
                  </p>
                )}
              </Panel>
            ) : null}

            {activeDetailTab === "restaurants" ? (
              <Panel title="Restaurantes">
                <div className="grid gap-3">
                  {selectedRestaurants.map((restaurant) => (
                    <Row key={restaurant.id}>
                      <div className="min-w-0">
                        <p className="font-bold">{restaurant.name}</p>
                        <p className="break-all text-sm text-ink/60">Slug: {restaurant.slug}</p>
                        <p className="text-sm text-ink/60">
                          Estado: {restaurant.isActive ? "Activo" : "Inactivo"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button asChild variant="outline">
                          <a href={restaurant.menuUrl}>
                            Ver menu <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/admin">Editar restaurante</Link>
                        </Button>
                        <form action={toggleRestaurantActiveAction}>
                          <input name="restaurantId" type="hidden" value={restaurant.id} />
                          <input
                            name="isActive"
                            type="hidden"
                            value={restaurant.isActive ? "false" : "true"}
                          />
                          <Button className="w-full" type="submit" variant="outline">
                            {restaurant.isActive ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                      </div>
                    </Row>
                  ))}
                  {!selectedRestaurants.length ? (
                    <p className="rounded-md border border-dashed border-ink/15 p-4 text-sm text-ink/60">
                      Este usuario todavia no tiene restaurantes.
                    </p>
                  ) : null}
                </div>
              </Panel>
            ) : null}

            {activeDetailTab === "permissions" ? (
              <Panel title="Permisos">
                <form
                  action={updateProfileRoleAction}
                  className="grid gap-4 md:max-w-lg"
                  onSubmit={(event) => {
                    const form = event.currentTarget;
                    const nextRole = new FormData(form).get("role");

                    if (
                      selectedUser.role === "super_admin" &&
                      nextRole === "user" &&
                      !window.confirm("Vas a quitar permisos de super_admin. Continuar?")
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="userId" type="hidden" value={selectedUser.id} />
                  <label className="grid gap-1 text-xs font-bold text-ink/60">
                    Rol
                    <select className={inputClass} name="role" defaultValue={selectedUser.role}>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedUser.role === "super_admin" ? (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                      Si cambias este usuario a user, perdera acceso al panel Super Admin.
                    </p>
                  ) : null}
                  <Button type="submit">Guardar rol</Button>
                </form>
              </Panel>
            ) : null}
          </>
        )}
      </Container>
    </main>
  );
}

function SubscriptionEditor({ subscription }: { subscription: Subscription }) {
  return (
    <article className="grid gap-4">
      <div className="grid gap-2 rounded-lg border border-ink/10 bg-white p-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="font-bold">{subscription.plan_name}</p>
          <p className="text-sm text-ink/60">Estado: {subscription.status}</p>
          <p className="text-sm text-ink/60">
            Valor: {formatMoney({ amount: subscription.amount, currency: "COP" })}
          </p>
        </div>
        <div className="grid gap-1 text-sm text-ink/60 md:text-right">
          <span>Trial start: {formatDate(subscription.trial_start)}</span>
          <span>Trial end: {formatDate(subscription.trial_end)}</span>
          <span>Current end: {formatDate(subscription.current_period_end)}</span>
          <span>Cancelled at: {formatDate(subscription.cancelled_at)}</span>
          <span>Provider: {subscription.provider ?? "Sin provider"}</span>
        </div>
      </div>

      <form action={updateSubscriptionAction} className="grid gap-3 lg:grid-cols-6">
        <input name="subscriptionId" type="hidden" value={subscription.id} />
        <label className="grid gap-1 text-xs font-bold text-ink/60">
          Estado
          <select className={inputClass} name="status" defaultValue={subscription.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-bold text-ink/60">
          Plan
          <select className={inputClass} name="planName" defaultValue={getPlanValue(subscription.plan_name)}>
            {superAdminPlans.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.value}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-bold text-ink/60">
          Branch limit manual
          <input
            className={inputClass}
            min={1}
            name="manualBranchLimit"
            placeholder={String(subscription.branch_limit)}
            type="number"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-ink/60">
          Amount manual
          <input
            className={inputClass}
            min={0}
            name="manualAmount"
            placeholder={String(subscription.amount)}
            type="number"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-ink/60">
          Trial end
          <input
            className={inputClass}
            defaultValue={formatDateInput(subscription.trial_end)}
            name="trialEnd"
            type="date"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-ink/60">
          Provider
          <select
            className={inputClass}
            name="provider"
            defaultValue={subscription.provider ?? "mercadopago"}
          >
            <option value="mercadopago">mercadopago</option>
            <option value="manual">manual</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-bold text-ink/60 lg:col-span-2">
          Current period end
          <input
            className={inputClass}
            defaultValue={formatDateInput(subscription.current_period_end)}
            name="currentPeriodEnd"
            type="date"
          />
        </label>
        <Button className="lg:col-span-2" type="submit">
          Guardar cambios
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {[7, 14, 30].map((days) => (
          <form action={extendTrialAction} key={days}>
            <input name="subscriptionId" type="hidden" value={subscription.id} />
            <input name="currentTrialEnd" type="hidden" value={subscription.trial_end} />
            <input name="days" type="hidden" value={days} />
            <Button type="submit" variant="outline">
              +{days} dias
            </Button>
          </form>
        ))}
        <form action={manualAccessAction}>
          <input name="subscriptionId" type="hidden" value={subscription.id} />
          <input name="planName" type="hidden" value="1_sucursal" />
          <Button type="submit" variant="outline">
            Acceso manual
          </Button>
        </form>
        <form action={reactivateSubscriptionAction}>
          <input name="subscriptionId" type="hidden" value={subscription.id} />
          <Button type="submit" variant="outline">
            Reactivar usuario
          </Button>
        </form>
        <form
          action={cancelAccessAction}
          onSubmit={(event) => {
            if (!window.confirm("Cancelar acceso de este usuario?")) {
              event.preventDefault();
            }
          }}
        >
          <input name="subscriptionId" type="hidden" value={subscription.id} />
          <Button type="submit" variant="outline">
            Cancelar acceso
          </Button>
        </form>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-4">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-4">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-2 break-words text-xl font-bold">{value}</p>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
