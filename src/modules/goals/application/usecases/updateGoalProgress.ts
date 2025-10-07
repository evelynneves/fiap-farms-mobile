import { Goal } from "../../domain/entities/Goal";
import { updateGoalFirestore } from "../../infrastructure/services/goalsService";

export async function updateGoalProgress(
    goals: Goal[],
    id: string,
    newCurrent: number
): Promise<Goal[]> {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return goals;

    const updated: Goal = {
        ...goal,
        current: newCurrent,
        status: newCurrent >= goal.target ? "completed" : goal.status,
    };

    await updateGoalFirestore(updated);

    return goals.map((g) => (g.id === id ? updated : g));
}
