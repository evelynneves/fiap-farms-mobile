import { Goal } from "../../domain/entities/Goal";
import { Item } from "../../domain/entities/Item";
import { Sale } from "../../domain/entities/Sale";

type Deps = {
    getSales: () => Promise<Sale[]>;
    getItems: () => Promise<Item[]>;
};

export async function recalculateGoalsProgress(goals: Goal[], { getSales, getItems }: Deps): Promise<Goal[]> {
    const [sales, production] = await Promise.all([getSales(), getItems()]);

    return goals.map((goal) => {
        let current = 0;

        if (goal.type === "production") {
            const relatedProduction = production.filter((p) => p.id === goal.productId);
            current = relatedProduction.reduce((sum, p) => sum + p.quantity, 0);
        } else if (goal.type === "sales") {
            const relatedSales = sales.filter((s) => s.productId === goal.productId);
            current = relatedSales.reduce((sum, s) => sum + s.quantity, 0);
        }

        const status =
            current >= goal.target ? "completed" : new Date(goal.deadline) < new Date() ? "overdue" : "active";

        return { ...goal, current, status };
    });
}
