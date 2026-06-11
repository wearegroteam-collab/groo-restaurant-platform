import type { Restaurant } from "@/types/menu";
import { formatMoney } from "@/features/menus/format-money";

type MenuTableProps = {
  restaurant: Restaurant;
};

export function MenuTable({ restaurant }: MenuTableProps) {
  const items = restaurant.menu.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryName: category.name,
    })),
  );

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <div className="border-b border-ink/10 p-5">
        <h2 className="text-xl font-bold">Productos del menu</h2>
        <p className="mt-1 text-sm text-ink/60">Vista inicial para administrar platos y bebidas.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-ink/5 text-ink/70">
            <tr>
              <th className="px-5 py-3 font-semibold">Producto</th>
              <th className="px-5 py-3 font-semibold">Categoria</th>
              <th className="px-5 py-3 font-semibold">Precio</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4 font-medium">{item.name}</td>
                <td className="px-5 py-4 text-ink/65">{item.categoryName}</td>
                <td className="px-5 py-4">{formatMoney(item.price)}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
                    {item.isAvailable ? "Disponible" : "Pausado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
