import { useMemo } from "react";

export function useFearlessLocks(games, currentGameIndex, isFearless) {
  const lockedChamps = useMemo(
    () =>
      isFearless
        ? games
            .slice(0, currentGameIndex)
            .flatMap((g) => [...(g.blue ?? []), ...(g.red ?? [])])
            .filter(Boolean)
        : [],
    [games, currentGameIndex, isFearless]
  );

  const isLocked = (champId) => lockedChamps.some((c) => c?.id === champId);

  return { lockedChamps, isLocked };
}
