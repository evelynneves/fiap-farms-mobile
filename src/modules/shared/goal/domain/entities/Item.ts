import { Sale } from "./Sale";

export interface Item {
    id: string;
    name: string;
    farm: string;
    quantity: number;
    unit: string;
    lastUpdated?: string;
    createdAt?: string;
}

export interface StockEntry {
    id: string;
    date: string;
    quantity: number;
    note?: string;
}

export interface ItemInventory {
    id?: string;
    name: string;
    category: string;
    farm: string;
    quantity: number;
    minStock: number;
    unit: string;
    costPrice: number;
    lastUpdated: string;
    status?: "low" | "warning" | "normal";
    entries: StockEntry[];
    sales?: Sale[];
    hasRelatedGoal?: boolean;
}
