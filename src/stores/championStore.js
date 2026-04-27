import { create } from 'zustand';
import { PATCH_NO } from '../lib/const';

const useChampionStore = create((set, get) => ({
  champions: null,
  isLoading: false,
  error: null,
  
  // Actions
  setChampions: (champions) => set({ champions, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  
  // Fetch champions and cache them
  fetchChampions: async () => {
    const { champions: cachedChampions } = get();
    
    // Return cached data if already loaded
    if (cachedChampions) {
      return cachedChampions;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/champions');
      if (!response.ok) {
        throw new Error('Failed to fetch champion data');
      }
      
      const data = await response.json();
      set({ champions: data, isLoading: false, error: null });
      return data;
    } catch (error) {
      console.error('Error fetching champions:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Get champion image URL
  getChampionImageUrl: (championName) => {
    const { champions } = get();
    if (!champions || !championName) return null;
    
    // Find the champion key (case-insensitive search)
    const championKey = Object.keys(champions).find(
      key => champions[key].name.toLowerCase() === championName.toLowerCase()
    );
    
    if (!championKey) {
      console.warn(`Champion not found: ${championName}`);
      return '/assets/img/champion-placeholder.png';
    }
    
    return `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${championKey}.png`;
  },
  
  // Preload champion images
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
      } catch (error) {
        console.error(`Failed to preload image for ${championName}:`, error);
        return null;
      }
    });
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error preloading champion images:', error);
    }
  }
}));

export default useChampionStore;
