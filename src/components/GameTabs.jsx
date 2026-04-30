"use client";

import { ArrowLeftRight, Swords } from "lucide-react";
import useDraftStore from "@/stores/draftStore";

export default function GameTabs() {
  const {
    games, currentGameIndex, isFearless, user, draftId, draftOwnerId,
    setCurrentGameIndex, setIsFearless, toggleSideSwap, addNextGame,
  } = useDraftStore();

  const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);
  const currentGame = games[currentGameIndex];
  const isSwapped = currentGame?.swapped ?? false;
  const lastGame = games[games.length - 1];
  const canAddNextGame = lastGame.blue.some(Boolean) || lastGame.red.some(Boolean);

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
        {games.map((_, i) => (
          <button
            type="button"
            key={`game-tab-${i}`}
            onClick={() => setCurrentGameIndex(i)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${currentGameIndex === i
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/30 hover:text-white/70"}`}
          >
            G{i + 1}
          </button>
        ))}
        {!isReadOnly && isFearless && games.length < 5 && (
          <button
            type="button"
            onClick={addNextGame}
            disabled={!canAddNextGame}
            title={canAddNextGame ? `Add Game ${games.length + 1}` : "Add picks before proceeding"}
            className="px-3 py-1.5 rounded-xl text-xs font-black text-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 transition-all disabled:cursor-not-allowed disabled:opacity-25"
          >
            + G{games.length + 1}
          </button>
        )}
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFearless((f) => !f)}
            title={isFearless ? "Fearless Draft ON — click to disable" : "Enable Fearless Draft"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all
              ${isFearless
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                : "bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"}`}
          >
            <Swords size={13} />
            Fearless
          </button>
          {currentGameIndex > 0 && (
            <button
              type="button"
              onClick={toggleSideSwap}
              title="Swap sides for this game"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all
                ${isSwapped
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-400"
                  : "bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"}`}
            >
              <ArrowLeftRight size={13} />
              Swap
            </button>
          )}
        </div>
      )}

      {/* Proceed to next game — shown below in ChampionPool but tablet-up shows here */}
    </div>
  );
}
