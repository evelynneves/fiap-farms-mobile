import { Sale } from "../../domain/entities/Sale";
import { addSaleToStorage } from "../../infrastructure/services/saleService";

const toNumber = (v: unknown) => (typeof v === "string" ? Number(v.replace(",", ".")) : Number(v));

export async function addSale(sales: Sale[], newSale: Omit<Sale, "id" | "totalValue">): Promise<Sale[]> {
    const quantity = toNumber(newSale.quantity);
    const salePrice = toNumber(newSale.salePrice);

    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantidade deve ser maior que zero");
    if (!Number.isFinite(salePrice) || salePrice <= 0) throw new Error("Preço de venda deve ser maior que zero");

    // O service valida estoque e faz a transação (ajuste de inventory)
    const persisted = await addSaleToStorage({
        ...newSale,
        quantity,
        salePrice,
    });

    return [...sales, persisted];
}
