import { Sale } from "@/src/modules/shared/goal";

export interface StockEntry {
    id: string;
    date: string;
    quantity: number;
    note?: string;
}

export interface Item {
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
    productionStage?: "waiting" | "production" | "harvested";
    entries: StockEntry[];
    sales?: Sale[];
}

export interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Item, isEdit: boolean) => Promise<void>;
    editingItem?: Item | null;
    categories: string[];
    farms: string[];
    units: string[];
    sales?: Sale[];
}
