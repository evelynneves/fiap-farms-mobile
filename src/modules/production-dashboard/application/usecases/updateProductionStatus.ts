import { Production } from "../../domain/entities/Production";

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

/**
 * Atualiza o status de produção (waiting/production/harvested) e sincroniza o progress:
 * - waiting  -> progress = 0
 * - production -> se progress for 0, sobe para 50 (estado inicial visual); mantém se já > 0
 * - harvested  -> progress = 100
 */
export function updateProductionStatus(
    productions: Production[],
    itemId: string,
    newStatus: Production["status"]
): Production[] {
    let changed = false;

    const next = productions.map((p) => {
        if (p.id !== itemId) return p;

        let newProgress = p.progress;
        if (newStatus === "waiting") newProgress = 0;
        if (newStatus === "production") newProgress = p.progress === 0 ? 50 : p.progress;
        if (newStatus === "harvested") newProgress = 100;

        newProgress = clamp(newProgress);

        if (p.status === newStatus && p.progress === newProgress) {
            return p;
        }

        changed = true;
        return { ...p, status: newStatus, progress: newProgress };
    });

    return changed ? next : productions;
}
