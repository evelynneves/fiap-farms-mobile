import { Sale } from "../../domain/entities/Sale";
import { updateSaleInStorage } from "../../infrastructure/services/saleService";

const toNumber = (v: unknown) => (typeof v === "string" ? Number(v.replace(",", ".")) : Number(v));

export async function updateSale(sales: Sale[], updated: Sale): Promise<Sale[]> {
    const quantity = toNumber(updated.quantity);
    const salePrice = toNumber(updated.salePrice);

    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantidade deve ser maior que zero");
    if (!Number.isFinite(salePrice) || salePrice <= 0) throw new Error("Preço de venda deve ser maior que zero");

    // O service faz a transação: ajusta estoque e array de sales no item
    const persisted = await updateSaleInStorage(updated.id, {
        ...updated,
        quantity,
        salePrice,
    });

    // usa o retornado (vem com totalValue recalculado)
    return sales.map((s) => (s.id === updated.id ? persisted : s));
}
