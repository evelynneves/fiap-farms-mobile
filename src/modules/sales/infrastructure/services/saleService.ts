/******************************************************************************
 *                                                                             *
 * Creation Date : 06/10/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 ******************************************************************************/

import { db } from "@/src/modules/shared/infrastructure/firebase";
import { arrayRemove, arrayUnion, collection, doc, getDocs, runTransaction, serverTimestamp } from "firebase/firestore";
import { Item } from "../../domain/entities/Item";
import { Sale } from "../../domain/entities/Sale";

interface ItemSale {
    id: string;
    date: string;
    quantity: number;
    salePrice: number;
    totalValue: number;
}

/**
 * Cria uma venda e atualiza o estoque do item de forma atômica.
 */
export async function addSaleToStorage(sale: Omit<Sale, "id" | "totalValue">): Promise<Sale> {
    const salesCol = collection(db, "sales");
    const productRef = doc(db, "items", sale.productId);

    return await runTransaction(db, async (tx) => {
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists()) {
            throw new Error("Produto não encontrado");
        }

        const product = productSnap.data() as Item;
        if (sale.quantity > product.quantity) {
            throw new Error("Quantidade vendida maior que o estoque disponível");
        }

        const totalValue = sale.quantity * sale.salePrice;

        const saleRef = doc(salesCol);
        tx.set(saleRef, {
            ...sale,
            totalValue,
            createdAt: serverTimestamp(),
        });

        const itemSale: ItemSale = {
            id: saleRef.id,
            date: sale.date,
            quantity: sale.quantity,
            salePrice: sale.salePrice,
            totalValue,
        };

        tx.update(productRef, {
            quantity: product.quantity - sale.quantity,
            sales: arrayUnion(itemSale),
            lastUpdated: new Date().toISOString().split("T")[0],
        });

        const savedSale: Sale = { id: saleRef.id, ...sale, totalValue };
        return savedSale;
    });
}

/**
 * Lista todas as vendas (recalcula totalValue por segurança).
 */
export async function getSalesFromStorage(): Promise<Sale[]> {
    const qs = await getDocs(collection(db, "sales"));
    return qs.docs.map((d) => {
        const data = d.data() as Omit<Sale, "id">;
        return {
            id: d.id,
            ...data,
            totalValue: data.quantity * data.salePrice,
        };
    });
}

/**
 * Atualiza uma venda e reflete a diferença no estoque do item, de forma atômica.
 */
export async function updateSaleInStorage(id: string, sale: Omit<Sale, "id" | "totalValue">): Promise<Sale> {
    const saleRef = doc(db, "sales", id);
    const productRef = doc(db, "items", sale.productId);

    return await runTransaction(db, async (tx) => {
        const saleSnap = await tx.get(saleRef);
        if (!saleSnap.exists()) throw new Error("Venda não encontrada");

        const oldSale = saleSnap.data() as Sale;
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists()) throw new Error("Produto não encontrado");

        const product = productSnap.data() as Item;
        const totalValue = sale.quantity * sale.salePrice;

        const quantityDiff = sale.quantity - oldSale.quantity;

        tx.update(saleRef, {
            ...sale,
            totalValue,
            updatedAt: serverTimestamp(),
        });

        const oldItemSale: ItemSale = {
            id,
            date: oldSale.date,
            quantity: oldSale.quantity,
            salePrice: oldSale.salePrice,
            totalValue: oldSale.totalValue,
        };

        const newItemSale: ItemSale = {
            id,
            date: sale.date,
            quantity: sale.quantity,
            salePrice: sale.salePrice,
            totalValue,
        };

        tx.update(productRef, {
            quantity: product.quantity - quantityDiff,
            sales: arrayRemove(oldItemSale),
        });

        tx.update(productRef, {
            sales: arrayUnion(newItemSale),
            lastUpdated: new Date().toISOString().split("T")[0],
        });

        return { id, ...sale, totalValue };
    });
}

/**
 * Exclui uma venda e devolve a quantidade ao estoque do item, de forma atômica.
 */
export async function deleteSaleFromStorage(id: string): Promise<void> {
    const saleRef = doc(db, "sales", id);

    await runTransaction(db, async (tx) => {
        const saleSnap = await tx.get(saleRef);
        if (!saleSnap.exists()) return;

        const sale = saleSnap.data() as Sale;
        const productRef = doc(db, "items", sale.productId);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists()) {
            tx.delete(saleRef);
            return;
        }

        const product = productSnap.data() as Item;

        const itemSale: ItemSale = {
            id,
            date: sale.date,
            quantity: sale.quantity,
            salePrice: sale.salePrice,
            totalValue: sale.totalValue,
        };

        tx.delete(saleRef);

        tx.update(productRef, {
            quantity: product.quantity + sale.quantity,
            sales: arrayRemove(itemSale),
            lastUpdated: new Date().toISOString().split("T")[0],
        });
    });
}
