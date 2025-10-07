export interface Sale {
    id: string;
    productId: string;
    productName: string;
    farmName: string;
    quantity: number;
    salePrice: number;
    totalValue: number;
    date: string;
}

export interface DashboardSale {
    product: string;
    revenue: number;
    profit: number;
    growth: number;
    units: number;
    date: string;
    farmName: string;
    category: string;
}
