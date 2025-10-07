import { Sale } from "../../domain/entities/Sale";

export const mockSales: Sale[] = [
    {
        id: "s1",
        productId: "1",
        productName: "Milho",
        farmName: "Fazenda São João",
        quantity: 50,
        salePrice: 18.5,
        totalValue: 925,
        date: "2024-02-01",
    },
    {
        id: "s2",
        productId: "2",
        productName: "Soja",
        farmName: "Fazenda Vista Alegre",
        quantity: 30,
        salePrice: 52.0,
        totalValue: 1560,
        date: "2024-02-05",
    },
    {
        id: "s3",
        productId: "3",
        productName: "Café Arábica",
        farmName: "Fazenda Monte Verde",
        quantity: 100,
        salePrice: 15.0,
        totalValue: 1500,
        date: "2024-02-07",
    },
];
