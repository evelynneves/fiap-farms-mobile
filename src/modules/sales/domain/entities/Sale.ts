export interface Sale {
    id: string;
    productId: string;
    productName: string;
    farmName: string;
    quantity: number;
    salePrice: number;
    totalValue: number;
    date: string;
    hasRelatedGoal?: boolean;
}
