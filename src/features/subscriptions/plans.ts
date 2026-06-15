export type Plan = {
  value: "1_sucursal" | "2_sucursales" | "3_sucursales";
  name: string;
  branchLimit: number;
  amount: number;
};

export const plans: Plan[] = [
  { value: "1_sucursal", name: "1 sucursal", branchLimit: 1, amount: 30000 },
  { value: "2_sucursales", name: "2 sucursales", branchLimit: 2, amount: 60000 },
  { value: "3_sucursales", name: "3 sucursales", branchLimit: 3, amount: 80000 },
];

export function getPlanByBranchLimit(branchLimit: number) {
  return plans.find((plan) => plan.branchLimit === branchLimit) ?? null;
}

export function getPlanByValue(value: string) {
  return plans.find((plan) => plan.value === value || plan.name === value) ?? null;
}
