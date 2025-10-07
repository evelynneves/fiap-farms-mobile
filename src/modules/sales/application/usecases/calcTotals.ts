import { Sale } from "../../domain/entities/Sale";

export function calcTotalRevenue(sales: Sale[]): number {
    return sales.reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
}

export function calcTotalQuantity(sales: Sale[]): number {
    return sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
}
