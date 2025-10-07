/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { getItemsFromStorage } from "@/src/modules/shared/goal/infrastructure/goalService";
import { db } from "@/src/modules/shared/infrastructure/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toDashboardSales } from "../../application/usecases/transformSalesToDashboard";
import { DashboardSale, Sale } from "../../domain/entities/Sale";

/**
 * Busca todas as vendas no Firestore.
 * Recalcula `totalValue` por segurança.
 */
export async function getSalesFromStorage(): Promise<Sale[]> {
    const qs = await getDocs(collection(db, "sales"));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Sale, "id">;
        return {
            id: d.id,
            ...data,
            totalValue: data.quantity * data.salePrice,
        };
    });
}

/**
 * A partir de uma lista de vendas transformadas (DashboardSale),
 * calcula a distribuição de receita por categoria.
 */
export function getCategoryDistributionFromSales(sales: DashboardSale[]) {
    const categoryMap: Record<string, number> = {};

    sales.forEach((sale) => {
        categoryMap[sale.category] = (categoryMap[sale.category] ?? 0) + sale.revenue;
    });

    const palette = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

    return Object.keys(categoryMap).map((cat, idx) => ({
        name: cat,
        value: categoryMap[cat],
        color: palette[idx % palette.length],
    }));
}

/**
 * Consulta Firestore, transforma as vendas para o modelo de dashboard
 * (combinando com dados de itens) e retorna a distribuição por categoria.
 */
export async function getCategoryDistributionFromFirestore() {
    const [sales] = await Promise.all([getSalesFromStorage(), getItemsFromStorage()]);
    const dashboardSales = toDashboardSales(sales);
    return getCategoryDistributionFromSales(dashboardSales);
}
