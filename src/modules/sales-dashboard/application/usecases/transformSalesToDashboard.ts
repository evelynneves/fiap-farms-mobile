import type { DashboardSale, Sale as FirestoreSale } from "../../domain/entities/Sale";

const toNum = (v: unknown, fallback = 0) => {
    if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
    if (typeof v === "string") {
        const n = Number(v.replace(",", "."));
        return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
};

type ToDashboardOpts = {
    /** Mapa opcional para enriquecer categoria por productId: { [productId]: { category?: string } } */
    itemsById?: Record<string, { category?: string }>;
};

export function toDashboardSales(sales: FirestoreSale[], opts?: ToDashboardOpts): DashboardSale[] {
    const itemsById = opts?.itemsById ?? {};

    return sales.map((s) => {
        const quantity = toNum(s.quantity);
        const salePrice = toNum((s as any).salePrice);
        const totalValue = toNum((s as any).totalValue, quantity * salePrice);

        const categoryFromItem = itemsById[s.productId]?.category;
        const category = (s as any).category ?? categoryFromItem ?? "Outros";

        return {
            product: s.productName,
            revenue: totalValue,
            profit: totalValue * 0.25,
            growth: 0,
            units: quantity,
            date: s.date,
            farmName: (s as any).farmName ?? (s as any).farm ?? "Fazenda Desconhecida",
            category,
        };
    });
}
