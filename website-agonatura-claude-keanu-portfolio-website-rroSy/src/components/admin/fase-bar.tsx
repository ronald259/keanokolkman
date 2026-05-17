import { FASE_LABEL, FASE_ORDER, type TrajectFase } from "@/lib/engine/types";

/**
 * Visualiseert de zeven fases van het zorgtraject. De huidige fase is
 * gemarkeerd. Eerdere fases zijn "gedaan", latere fases zijn "neutraal".
 */
export function FaseBar({ current }: { current: TrajectFase }) {
  const currentIdx = FASE_ORDER.indexOf(current);
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {FASE_ORDER.map((f, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "todo";
        return (
          <li
            key={f}
            className={`rounded-2xl border px-3 py-2 text-xs sm:text-[11px] ${
              state === "active"
                ? "border-forest-700 bg-forest-700 text-cream"
                : state === "done"
                ? "border-moss-300/70 bg-moss-100 text-moss-900"
                : "border-moss-200/70 bg-cream text-moss-700"
            }`}
          >
            <div className="font-display text-base sm:text-sm">{i + 1}</div>
            <div className="mt-0.5 leading-tight">{FASE_LABEL[f]}</div>
          </li>
        );
      })}
    </ol>
  );
}
