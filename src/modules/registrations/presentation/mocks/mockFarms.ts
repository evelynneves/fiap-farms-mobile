import { Farm } from "../../domain/entities/Farm";

export const mockFarms: Farm[] = [
    {
        id: "1",
        name: "Fazenda Boa Vista",
        location: "Uberlândia, MG",
        totalArea: 150,
        productionType: "Grãos",
        manager: "Ana Paula",
    },
    {
        id: "2",
        name: "Sítio Santa Clara",
        location: "Londrina, PR",
        totalArea: 60,
        productionType: "Café",
        manager: "José Almeida",
    },
];
