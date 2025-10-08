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
import { collection, getDocs } from "firebase/firestore";
import { DashboardStat } from "../../domain/entities/DashboardStat";

/**
 * Formata um número para o padrão monetário brasileiro.
 */
function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Retorna estatísticas gerais para o dashboard principal do app.
 * Inclui dados de vendas, produção, fazendas e itens.
 */
export async function getDashboardStats(): Promise<DashboardStat[]> {
    try {
        const [salesSnap, farmsSnap, itemsSnap, productionSnap] = await Promise.all([
            getDocs(collection(db, "sales")),
            getDocs(collection(db, "farms")),
            getDocs(collection(db, "items")),
            getDocs(collection(db, "production")),
        ]);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthlySales = 0;
        salesSnap.forEach((docSnap) => {
            const data = docSnap.data();
            const saleDate = new Date(data.date);
            if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                monthlySales += data.totalValue ?? 0;
            }
        });

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
                change: "+0%",
                positive: true,
            },
            {
                title: "Produção Ativa",
                value: `${activeProduction} ton`,
                change: "+0%",
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
