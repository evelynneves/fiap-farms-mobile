export type ItemUnit = "kg" | "ton" | "sc" | "un";
export type StockStatus = "low" | "warning" | "normal";

export interface Item {
    id: string;
    name: string;
    farm: string;
    category: string;
    quantity: number;
    minStock: number;
    unit: ItemUnit;
    costPrice: number;
    lastUpdated: string;
    status?: StockStatus;
}
