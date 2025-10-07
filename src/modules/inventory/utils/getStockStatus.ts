import { Item } from "../domain/entities/Item";

export function getStockStatus(item: Item): {
    status: "low" | "warning" | "normal";
    label: string;
    className: string;
} {
    if (item.quantity < item.minStock) {
        return {
            status: "low",
            label: "Estoque Baixo",
            className: "status status--low",
        };
    } else if (item.quantity <= item.minStock * 1.5) {
        return {
            status: "warning",
            label: "Atenção",
            className: "status status--warning",
        };
    } else {
        return {
            status: "normal",
            label: "Normal",
            className: "status status--ok",
        };
    }
}
