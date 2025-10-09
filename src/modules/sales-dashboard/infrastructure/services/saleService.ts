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
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { toDashboardSales } from "../../application/usecases/transformSalesToDashboard";
import { DashboardSale, Sale } from "../../domain/entities/Sale";

export async function getSalesFromStorage(): Promise<Sale[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const qs = await getDocs(collection(db, `users/${user.uid}/sales`));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Sale, "id">;
        return {
            id: d.id,
            ...data,
            totalValue: data.quantity * data.salePrice,
        };
    });
}

export function getCategoryDistributionFromSales(sales: DashboardSale[]) {
    const categoryMap: Record<string, number> = {};

    sales.forEach((sale) => {
        categoryMap[sale.category] = (categoryMap[sale.category] || 0) + sale.revenue;
    });

    const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0);
    const palette = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

    return Object.keys(categoryMap).map((cat, idx) => ({
        name: cat,
        value: categoryMap[cat],
        percentage: total > 0 ? (categoryMap[cat] / total) * 100 : 0,
        color: palette[idx % palette.length],
    }));
}

export async function getCategoryDistributionFromFirestore() {
    const [sales] = await Promise.all([getSalesFromStorage(), getItemsFromStorage()]);
    const dashboardSales = toDashboardSales(sales);
    return getCategoryDistributionFromSales(dashboardSales);
}
