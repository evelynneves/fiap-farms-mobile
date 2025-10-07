import { Goal } from "../../domain/entities/Goal";
import { deleteGoalFirestore } from "../../infrastructure/services/goalsService";

export async function deleteGoal(goals: Goal[], id: string): Promise<Goal[]> {
    await deleteGoalFirestore(id);
    return goals.filter((g) => g.id !== id);
}
