import { create } from "zustand";
import { DRAFT_LIMITS } from "@/lib/const";

export const emptyGame = () => ({
  blueBan: Array(5).fill(null),
  redBan: Array(5).fill(null),
  blue: Array(5).fill(null),
  red: Array(5).fill(null),
  swapped: false,
});

const VALID_SIDES = ["blue", "red", "blueBan", "redBan"];

const useDraftStore = create((set, get) => ({
  // Auth
  user: null,

  // Draft identity
  draftId: null,
  draftOwnerId: null,
  isPublic: false,

  // Game state
  games: [emptyGame()],
  currentGameIndex: 0,
  isFearless: false,

  // Team names
  blueTeamName: "Blue Team",
  redTeamName: "Red Team",

  // Champion selection UI
  currentSide: "blue",
  currentSelection: 0,
  draftMode: "Draft",

  // Auth
  setUser: (user) => set({ user }),

  // Draft identity
  setDraftId: (draftId) => set({ draftId }),
  setDraftOwnerId: (draftOwnerId) => set({ draftOwnerId }),
  setIsPublic: (isPublic) => set({ isPublic }),

  // Game navigation
  setCurrentGameIndex: (i) => set({ currentGameIndex: i }),
  setIsFearless: (v) =>
    set({ isFearless: typeof v === "function" ? v(get().isFearless) : v }),

  // Team names — capped at TEAM_NAME_MAX
  setTeamName: (side, name) => {
    if (name.length > DRAFT_LIMITS.TEAM_NAME_MAX) return;
    set(side === "blue" ? { blueTeamName: name } : { redTeamName: name });
  },

  // Selection
  setCurrentSide: (side) => set({ currentSide: side }),
  setCurrentSelection: (index) => set({ currentSelection: index }),
  setDraftMode: (draftMode) => set({ draftMode }),

  // Mutate only the current game
  setCurrentGame: (updater) => {
    const { games, currentGameIndex } = get();
    const next = [...games];
    const cur = games[currentGameIndex] ?? emptyGame();
    next[currentGameIndex] =
      typeof updater === "function" ? updater(cur) : updater;
    set({ games: next });
  },

  toggleSideSwap: () => {
    const { games, currentGameIndex } = get();
    const next = [...games];
    next[currentGameIndex] = {
      ...next[currentGameIndex],
      swapped: !next[currentGameIndex].swapped,
    };
    set({ games: next });
  },

  addNextGame: () => {
    const { games } = get();
    set({ games: [...games, emptyGame()], currentGameIndex: games.length });
  },

  // Place a champion in a slot — keeps all fearless + duplicate validation
  selectChamp: (champ, side, index) => {
    const { user, draftId, draftOwnerId, isFearless, games, currentGameIndex } = get();
    if (Boolean(draftId && user?.id !== draftOwnerId) || !champ) return;

    const cur = games[currentGameIndex] ?? emptyGame();
    const isAlreadySelected = Object.values(cur)
      .flat()
      .some((s) => s?.id === champ.id);
    const isFearlessLocked =
      isFearless &&
      games
        .slice(0, currentGameIndex)
        .flatMap((g) => [...(g.blue ?? []), ...(g.red ?? [])])
        .some((s) => s?.id === champ.id);

    if (isAlreadySelected || isFearlessLocked) return;

    const next = [...games];
    next[currentGameIndex] = { ...cur, [side]: [...cur[side]] };
    next[currentGameIndex][side][index] = champ;
    set({ games: next });
  },

  // Remove a champion from a slot
  removeChamp: (side, index) => {
    const { user, draftId, draftOwnerId, games, currentGameIndex } = get();
    if (Boolean(draftId && user?.id !== draftOwnerId)) return;
    const next = [...games];
    const cur = { ...games[currentGameIndex] };
    cur[side] = [...cur[side]];
    cur[side][index] = null;
    next[currentGameIndex] = cur;
    set({ games: next });
  },

  // Swap two slots — keeps full side/index validation (security feature)
  swapSlots: (srcSide, srcIndex, targetSide, targetIndex) => {
    const { user, draftId, draftOwnerId } = get();
    if (Boolean(draftId && user?.id !== draftOwnerId)) return;
    if (
      !VALID_SIDES.includes(srcSide) ||
      !VALID_SIDES.includes(targetSide) ||
      !Number.isInteger(srcIndex) || srcIndex < 0 || srcIndex > 4 ||
      !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex > 4
    ) return;
    if (srcSide === targetSide && srcIndex === targetIndex) return;

    get().setCurrentGame((prev) => {
      const next = {
        ...prev,
        [srcSide]: [...prev[srcSide]],
        [targetSide]: [...prev[targetSide]],
      };
      [next[targetSide][targetIndex], next[srcSide][srcIndex]] = [
        next[srcSide][srcIndex],
        next[targetSide][targetIndex],
      ];
      return next;
    });
  },

  resetDraft: () =>
    set({
      games: [emptyGame()],
      currentGameIndex: 0,
      isFearless: false,
      blueTeamName: "Blue Team",
      redTeamName: "Red Team",
      currentSide: "blue",
      currentSelection: 0,
      draftId: null,
      draftOwnerId: null,
      isPublic: false,
    }),

  // Populate store from a validated DB record
  loadDraftData: (dd, ownerId, isPublicFlag) => {
    const updates = { draftOwnerId: ownerId, isPublic: isPublicFlag };
    if (dd.blueTeamName) updates.blueTeamName = dd.blueTeamName;
    if (dd.redTeamName) updates.redTeamName = dd.redTeamName;

    if (dd.games) {
      updates.games = dd.games.map((g) => ({
        blueBan: g.blueBan ?? Array(5).fill(null),
        redBan: g.redBan ?? Array(5).fill(null),
        blue: g.blue ?? Array(5).fill(null),
        red: g.red ?? Array(5).fill(null),
        swapped: g.swapped ?? false,
      }));
      updates.currentGameIndex = dd.currentGame ?? 0;
      updates.isFearless = dd.isFearless ?? false;
    } else {
      // Legacy single-game format
      updates.games = [{
        blueBan: dd.blueBan ?? Array(5).fill(null),
        redBan: dd.redBan ?? Array(5).fill(null),
        blue: dd.blue ?? Array(5).fill(null),
        red: dd.red ?? Array(5).fill(null),
        swapped: false,
      }];
    }
    set(updates);
  },
}));

export default useDraftStore;
