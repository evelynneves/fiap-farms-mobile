import { Goal } from "../../domain/entities/Goal";
import { updateGoalFirestore } from "../../infrastructure/services/goalsService";

export async function updateGoal(
    goals: Goal[],
    updated: Goal
): Promise<Goal[]> {
    const duplicate = goals.some(
        (g) =>
            g.id !== updated.id &&
            g.title.trim().toLowerCase() ===
                updated.title.trim().toLowerCase() &&
            g.productId === updated.productId
    );
    if (duplicate)
        throw new Error("Já existe uma meta com este título para este produto");

    await updateGoalFirestore(updated);
    return goals.map((g) => (g.id === updated.id ? updated : g));
}
