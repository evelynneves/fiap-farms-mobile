import { Goal } from "../../domain/entities/Goal";
import { createGoal } from "../../infrastructure/services/goalsService";

export async function addGoal(goals: Goal[], goal: Omit<Goal, "id">): Promise<Goal[]> {
    const duplicate = goals.some(
        (g) => g.title.trim().toLowerCase() === goal.title.trim().toLowerCase() && g.productId === goal.productId
    );
    if (duplicate) {
        throw new Error("Já existe uma meta com este título para este produto");
    }

    const saved = await createGoal(goal); // <<-- recebe Goal com id
    return [...goals, saved];
}
