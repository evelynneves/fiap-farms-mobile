export interface SalesEvolutionPoint {
    month: string;
    sales: number;
}

export function getSalesEvolution(): SalesEvolutionPoint[] {
    return [
        { month: "Ago", sales: 420000 },
        { month: "Set", sales: 450000 },
        { month: "Out", sales: 480000 },
        { month: "Nov", sales: 520000 },
        { month: "Dez", sales: 560000 },
        { month: "Jan", sales: 593700 },
    ];
}
