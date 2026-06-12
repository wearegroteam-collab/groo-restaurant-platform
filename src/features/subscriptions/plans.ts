export type Plan = {
  name: string;
  branchLimit: number;
  amount: number;
};

export const plans: Plan[] = [
  { name: "1 sucursal", branchLimit: 1, amount: 30000 },
  { name: "2 sucursales", branchLimit: 2, amount: 60000 },
  { name: "3 sucursales", branchLimit: 3, amount: 80000 },
];

export function getPlanByBranchLimit(branchLimit: number) {
  return plans.find((plan) => plan.branchLimit === branchLimit) ?? null;
}
