/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { DashboardStat } from "../../domain/entities/DashboardStat";

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function getDashboardStats(): Promise<DashboardStat[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    try {
        const [salesSnap, farmsSnap, itemsSnap, productionSnap] = await Promise.all([
            getDocs(collection(db, `users/${user.uid}/sales`)),
            getDocs(collection(db, `users/${user.uid}/farms`)),
            getDocs(collection(db, `users/${user.uid}/items`)),
            getDocs(collection(db, `users/${user.uid}/production`)),
        ]);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthlySales = 0;
        salesSnap.forEach((docSnap) => {
            const data = docSnap.data();
            const saleDate = data.date ? new Date(data.date) : null;

            if (saleDate && !isNaN(saleDate.valueOf())) {
                if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                    monthlySales += data.totalValue ?? 0;
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let activeProduction = 0;
        productionSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (["ativo", "in-progress"].includes(data.status)) {
                activeProduction += data.quantity ?? 0;
            }
        });

        const farmsCount = farmsSnap.size;
        const itemsCount = itemsSnap.size;

        return [
            {
                title: "Vendas do Mês",
                value: formatCurrency(monthlySales),
                change: "+0%", // TODO: calcular variação com mês anterior
                positive: true,
            },
            {
                title: "Fazendas Ativas",
                value: farmsCount.toString(),
                change: "+0%",
                positive: true,
            },
            {
                title: "Produtos Cadastrados",
                value: itemsCount.toString(),
                change: "+0%",
                positive: true,
            },
        ];
    } catch (error) {
        console.error("Erro ao carregar estatísticas do dashboard:", error);

        return [
            {
                title: "Erro ao carregar dados",
                value: "—",
                change: "0%",
                positive: false,
            },
        ];
    }
}
