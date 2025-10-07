export interface Production {
    id: string;
    product: string;
    farm: string;
    location: string;
    status: "waiting" | "production" | "harvested";
    area: number;
    expectedYield: string;
    plantingDate: string;
    harvestDate: string;
    progress: number;
}
