import { useMemo } from "react";

export function useFilteredChampions(champions, searchTerm, roleFilter) {
  return useMemo(
    () =>
      champions
        ? Object.entries(champions).filter(([_, champ]) => {
            const matchesSearch = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = !roleFilter || champ.roles?.includes(roleFilter);
            return matchesSearch && matchesRole;
          })
        : [],
    [champions, searchTerm, roleFilter]
  );
}
