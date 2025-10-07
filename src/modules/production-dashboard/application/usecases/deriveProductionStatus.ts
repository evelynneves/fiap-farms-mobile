import { Item } from "../../domain/entities/Item";

export type ProductionStatus = "waiting" | "production" | "harvested";

export interface DerivedProduction {
    stage: ProductionStatus;
    progress: number;
}

const DEFAULT_MIN_STOCK = 1;

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

/**
 * Deriva o status de produção a partir de quantity e (opcionalmente) minStock.
 * - waiting: quantity <= 0
 * - production: 0 < quantity < minStock
 * - harvested: quantity >= minStock
 */
export function deriveProductionStatus(item: Item & Partial<{ minStock: number }>): DerivedProduction {
    const quantity = Number(item.quantity) || 0;
    const minStock = Math.max(Number(item.minStock) || DEFAULT_MIN_STOCK, 0.000001);

    if (quantity <= 0) {
        return { stage: "waiting", progress: 0 };
    }
    if (quantity < minStock) {
        const pct = clamp(Math.round((quantity / minStock) * 100));
        return { stage: "production", progress: pct };
    }
    return { stage: "harvested", progress: 100 };
}
