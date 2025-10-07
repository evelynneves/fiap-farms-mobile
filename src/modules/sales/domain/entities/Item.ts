export interface ItemSale {
    id: string;
    date: string;
    quantity: number;
    salePrice: number;
    totalValue: number;
}

export interface StockEntry {
    id: string;
    date: string;
    quantity: number;
    note?: string;
}

export interface Item {
    id: string;
    name: string;
    farm: string;
    category: string;
    quantity: number;
    minStock: number;
    unit: string;
    costPrice: number;
    lastUpdated: string;
    entries: StockEntry[];
    sales?: ItemSale[];
}
