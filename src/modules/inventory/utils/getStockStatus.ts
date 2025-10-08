import { Item } from "../domain/entities/Item";

export function getStockStatus(item: Item): {
    status: "low" | "warning" | "normal";
    label: string;
} {
    if (item.quantity < item.minStock) {
        return {
            status: "low",
            label: "Estoque Baixo",
        };
    } else if (item.quantity <= item.minStock * 1.5) {
        return {
            status: "warning",
            label: "Atenção",
        };
    } else {
        return {
            status: "normal",
            label: "Normal",
        };
    }
}
