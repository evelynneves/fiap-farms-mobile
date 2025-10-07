export type GoalType = "sales" | "production";
export type GoalStatus = "active" | "completed" | "overdue";

export interface Goal {
    id: string;
    title: string;
    type: GoalType;
    productId: string;
    productName: string;
    target: number;
    current: number;
    unit: string;
    deadline: string;
    status: GoalStatus;
    description?: string;
}
