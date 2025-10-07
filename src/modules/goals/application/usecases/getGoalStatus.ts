import { Goal, GoalStatus } from "../../domain/entities/Goal";

export type GoalStatusMeta = {
    status: GoalStatus;
    label: string;
};

export function getGoalStatus(goal: Goal): GoalStatusMeta {
    const overdue = new Date(goal.deadline) < new Date() && goal.status !== "completed";

    if (goal.status === "completed") {
        return { status: "completed", label: "Concluída" };
    }
    if (overdue || goal.status === "overdue") {
        return { status: "overdue", label: "Atrasada" };
    }
    return { status: "active", label: "Ativa" };
}
