import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useChampionStore = create(
  persist(
    (set, get) => ({
      champions: null,
      patch: null,
      isLoading: false,
      error: null,

      // Fetch latest patch from /api/version.
      // If it differs from the stored patch, clears champions and re-fetches them.
      // Call this once on app mount — stale champions from localStorage are available
      // immediately while this runs in the background.
      syncPatch: async () => {
        try {
          const res = await fetch("/api/version");
          if (!res.ok) return;
          const { patch: latestPatch } = await res.json();
          const { patch: storedPatch } = get();
          if (latestPatch !== storedPatch) {
            set({ patch: latestPatch, champions: null });
            await get().fetchChampions();
          }
        } catch {}
      },

      fetchChampions: async () => {
        const { champions } = get();
        if (champions) return champions;

        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/champions");
          if (!res.ok) throw new Error("Failed to fetch champion data");
          const data = await res.json();
          set({ champions: data, isLoading: false, error: null });
          return data;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return null;
        }
      },

      getChampionImageUrl: (identifier) => {
        const { champions, patch } = get();
        if (!champions || !identifier || !patch) return null;

        // 1. Try direct ID lookup (fastest and most accurate for stored drafts)
        if (champions[identifier]) {
          return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${identifier}.png`;
        }

        // 2. Try case-insensitive name lookup (fallback for legacy or manual data)
        const championKey = Object.keys(champions).find(
          (key) => champions[key].name.toLowerCase() === identifier.toLowerCase()
        );

        if (championKey) {
          return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championKey}.png`;
        }

        return null;
      },

      preloadChampionImages: async (championNames) => {
        const { champions } = get();
        if (!champions) return;

        const promises = championNames.map(async (championName) => {
          try {
            const imageUrl = get().getChampionImageUrl(championName);
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(imageUrl);
              img.onerror = () => reject(new Error(`Failed to load image for ${championName}`));
              img.src = imageUrl;
            });
          } catch {
            return null;
          }
        });

        try {
          await Promise.allSettled(promises);
        } catch {}
      },
    }),
    {
      name: "champion-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ champions: state.champions, patch: state.patch }),
    }
  )
);

export default useChampionStore;
