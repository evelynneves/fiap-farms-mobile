import { Sale } from "@/src/modules/shared/goal";
import { db } from "@/src/modules/shared/infrastructure/firebase";
import { auth } from "@/src/modules/shared/infrastructure/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { Goal } from "../../domain/entities/Goal";

export async function updateGoalProgress(goal: Goal, allSales: Sale[]) {
    const salesForGoal = allSales.filter(
        (s) =>
            s.productId === goal.productId &&
            new Date(s.date) >= new Date(goal.startDate ?? goal.createdAt ?? "1970-01-01") &&
            new Date(s.date) <= new Date(goal.deadline)
    );

    const totalQty = salesForGoal.reduce((sum, s) => sum + s.quantity, 0);

    const status = totalQty >= goal.target ? "completed" : new Date() > new Date(goal.deadline) ? "expired" : "active";

    const ref = doc(db, `users/${auth.currentUser?.uid}/goals/${goal.id}`);
    await updateDoc(ref, {
        current: totalQty,
        status,
        updatedAt: new Date().toISOString(),
    });
}
