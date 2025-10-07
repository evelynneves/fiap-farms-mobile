import { Sale } from "../../domain/entities/Sale";
import { deleteSaleFromStorage } from "../../infrastructure/services/saleService";

export async function deleteSale(sales: Sale[], id: string): Promise<Sale[]> {
    await deleteSaleFromStorage(id);
    return sales.filter((s) => s.id !== id);
}
