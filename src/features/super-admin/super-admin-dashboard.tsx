"use client";

import { useState } from "react";
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
  updateSubscriptionAction,
} from "@/features/super-admin/actions";
import {
  superAdminPlans,
  type SuperAdminRestaurant,
  type SuperAdminUser,
} from "@/features/super-admin/super-admin";
import type { Subscription, SubscriptionStatus } from "@/features/subscriptions/subscriptions";

type SuperAdminDashboardProps = {
  users: SuperAdminUser[];
  restaurants: SuperAdminRestaurant[];
  subscriptions: Subscription[];
};

type SuperAdminTab = "users" | "restaurants" | "subscriptions";

const tabs: Array<{ id: SuperAdminTab; label: string }> = [
  { id: "users", label: "Usuarios" },
  { id: "restaurants", label: "Restaurantes" },
  { id: "subscriptions", label: "Suscripciones" },
];

const statuses: SubscriptionStatus[] = ["trialing", "active", "expired", "cancelled", "past_due"];

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
  users,
  restaurants,
  subscriptions,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("users");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

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
        <section className="grid gap-3 sm:grid-cols-3">
          <Metric label="Usuarios" value={users.length} />
          <Metric label="Restaurantes" value={restaurants.length} />
          <Metric label="Suscripciones" value={subscriptions.length} />
        </section>

        <nav className="sticky top-0 z-20 overflow-x-auto rounded-lg border border-ink/10 bg-white p-2 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-ink text-white"
                    : "text-ink/65 hover:bg-ink/5 hover:text-ink"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === "users" ? (
          <Panel title="Usuarios">
            <div className="grid gap-3">
              {users.map((user) => (
                <Row key={user.id}>
                  <div className="min-w-0">
                    <p className="font-bold">{user.email}</p>
                    <p className="text-sm text-ink/60">Registro: {formatDate(user.createdAt)}</p>
                    <p className="text-sm text-ink/60">Rol: {user.role}</p>
                  </div>
                  <div className="grid gap-1 text-sm sm:text-right">
                    <span>Suscripcion: {user.subscription?.status ?? "Sin plan"}</span>
                    <span>Restaurantes: {user.restaurantCount}</span>
                    <Button onClick={() => setSelectedUserId(user.id)} variant="outline">
                      Ver detalle
                    </Button>
                  </div>
                </Row>
              ))}
            </div>
          </Panel>
        ) : null}

        {selectedUser ? (
          <Panel title="Detalle de usuario">
            <div className="grid gap-2 text-sm">
              <p>
                <span className="font-bold">Email:</span> {selectedUser.email}
              </p>
              <p>
                <span className="font-bold">Rol:</span> {selectedUser.role}
              </p>
              <p>
                <span className="font-bold">Restaurantes creados:</span>{" "}
                {selectedUser.restaurantCount}
              </p>
              <p>
                <span className="font-bold">Estado:</span>{" "}
                {selectedUser.subscription?.status ?? "Sin plan"}
              </p>
            </div>
          </Panel>
        ) : null}

        {activeTab === "restaurants" ? (
          <Panel title="Restaurantes">
            <div className="grid gap-3">
              {restaurants.map((restaurant) => (
                <Row key={restaurant.id}>
                  <div className="min-w-0">
                    <p className="font-bold">{restaurant.name}</p>
                    <p className="break-all text-sm text-ink/60">/{restaurant.slug}/menu</p>
                    <p className="text-sm text-ink/60">Dueño: {restaurant.ownerEmail}</p>
                  </div>
                  <div className="grid gap-2 sm:min-w-64">
                    <p className="text-sm font-semibold">
                      Plan: {restaurant.ownerSubscriptionStatus}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button asChild variant="outline">
                        <a href={restaurant.menuUrl}>
                          Ver menu <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/admin`}>Editar restaurante</Link>
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
                  </div>
                </Row>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeTab === "subscriptions" ? (
          <Panel title="Suscripciones">
            <div className="grid gap-4">
              {subscriptions.map((subscription) => {
                const user = users.find((currentUser) => currentUser.id === subscription.user_id);

                return (
                  <article
                    className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4"
                    key={subscription.id}
                  >
                    <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-start">
                      <div>
                        <p className="font-bold">{user?.email ?? subscription.user_id}</p>
                        <p className="text-sm text-ink/60">Plan: {subscription.plan_name}</p>
                        <p className="text-sm text-ink/60">Estado: {subscription.status}</p>
                        <p className="text-sm text-ink/60">
                          Sucursales permitidas: {subscription.branch_limit}
                        </p>
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
              })}
            </div>
          </Panel>
        ) : null}
      </Container>
    </main>
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
