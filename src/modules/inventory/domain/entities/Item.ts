import { Sale } from "@/src/modules/shared/goal";

export interface StockEntry {
    id: string;
    date: string;
    quantity: number;
    note?: string;
    showPicker: boolean;
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

    entries: StockEntry[];
    sales?: Sale[];
    hasRelatedGoal?: boolean;
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
