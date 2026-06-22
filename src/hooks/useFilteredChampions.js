import Fuse from "fuse.js";
import { useMemo } from "react";

const FUSE_OPTIONS = {
  keys: ["name"],
  threshold: 0.2,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function useFilteredChampions(champions, searchTerm, roleFilter) {
  const entries = useMemo(() => (champions ? Object.entries(champions) : []), [champions]);

  const fuse = useMemo(
    () =>
      new Fuse(
        entries.map(([_, champ]) => champ),
        FUSE_OPTIONS
      ),
    [entries]
  );

  return useMemo(() => {
    const trimmed = searchTerm.trim();
    const bySearch = trimmed
      ? fuse.search(trimmed).map((result) => [result.item.id, result.item])
      : entries;

    return bySearch.filter(([_, champ]) => !roleFilter || champ.roles?.includes(roleFilter));
  }, [fuse, entries, searchTerm, roleFilter]);
}
