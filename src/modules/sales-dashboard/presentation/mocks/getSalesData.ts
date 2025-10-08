import { DashboardSale } from "../../domain/entities/Sale";

export function getSalesData(): DashboardSale[] {
    return [
        {
            product: "Milho",
            revenue: 89500,
            profit: 23400,
            growth: 12,
            units: 450,
            date: "2025-09-25",
            farmName: "Fazenda São João",
            category: "Grãos",
        },
        {
            product: "Soja",
            revenue: 156800,
            profit: 41200,
            growth: 8,
            units: 320,
            date: "2025-09-27",
            farmName: "Fazenda Boa Esperança",
            category: "Grãos",
        },
        {
            product: "Trigo",
            revenue: 67300,
            profit: 18900,
            growth: -3,
            units: 280,
            date: "2025-09-28",
            farmName: "Fazenda Horizonte",
            category: "Grãos",
        },
        {
            product: "Café",
            revenue: 234500,
            profit: 67800,
            growth: 18,
            units: 180,
            date: "2025-09-29",
            farmName: "Sítio do Café",
            category: "Bebidas",
        },
        {
            product: "Feijão",
            revenue: 45600,
            profit: 12300,
            growth: 5,
            units: 220,
            date: "2025-09-30",
            farmName: "Chácara Verde",
            category: "Leguminosas",
        },
    ];
}
