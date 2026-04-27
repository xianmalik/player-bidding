import useChampionStore from '../stores/championStore';

// Legacy functions that now use Zustand store
export async function getChampionData() {
    const { champions, fetchChampions } = useChampionStore.getState();
    
    // Fetch if not already loaded
    if (!champions) {
        await fetchChampions();
    }
    
    return useChampionStore.getState().champions;
}

export async function getChampionImageUrl(championName) {
    const { getChampionImageUrl: storeGetImageUrl } = useChampionStore.getState();
    return storeGetImageUrl(championName);
}

export async function preloadChampionImages(championNames) {
    const { preloadChampionImages: storePreload } = useChampionStore.getState();
    await storePreload(championNames);
}

export function clearChampionImageCache() {
    useChampionStore.setState({
        champions: null,
        isLoading: false,
        error: null
    });
}
