"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Check,
  ChevronRight,
  Command,
  RotateCcw,
  Save,
  Search,
  Settings,
  Swords,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilteredChampions } from "@/hooks/useFilteredChampions";
import { useFearlessLocks } from "@/hooks/useFearlessLocks";
import { DEBOUNCE_MS, posList } from "@/lib/const";
import useChampionStore from "@/stores/championStore";
import useDraftStore from "@/stores/draftStore";
import GameTabs from "@/components/GameTabs";
import DraftSettingsModal from "@/components/DraftSettingsModal";

export default function ChampionPool({ onSave, onDownload, onReset }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchTerm = useDebounce(inputValue, DEBOUNCE_MS.SEARCH);

  const {
    games,
    currentGameIndex,
    isFearless,
    currentSide,
    currentSelection,
    user,
    draftId,
    draftOwnerId,
    selectChamp,
    addNextGame,
  } = useDraftStore();
  const { champions, patch } = useChampionStore();

  const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);
  const currentGame = games[currentGameIndex];
  const { isLocked } = useFearlessLocks(games, currentGameIndex, isFearless);
  const filteredChampions = useFilteredChampions(champions, searchTerm, selectedRole);
  const lastGame = games[games.length - 1];
  const canAddNextGame = lastGame?.blue.some(Boolean) || lastGame?.red.some(Boolean);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="md:col-span-6 order-1 md:order-2 flex flex-col gap-4">
      <GameTabs />

      {/* Search Bar + Role Filter + Action Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full z-20 relative">
        <div className="relative group flex-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-amber-500/20 to-red-600/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition-all duration-500" />
          <div className="relative flex items-center bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden group-focus-within:border-white/20 transition-all">
            <div className="pl-4 text-white/20 group-focus-within:text-amber-400 transition-colors">
              <Search size={18} />
            </div>
            <input
              ref={searchInputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search Champions..."
              className="w-full h-14 bg-transparent border-none focus:ring-0 focus:outline-none text-base font-bold tracking-wider px-3 text-white placeholder:text-white/10"
            />
            <div className="flex items-center gap-2 pr-4">
              <AnimatePresence>
                {inputValue && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setInputValue("")}
                    className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
              <div className="h-5 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[9px] font-black text-white/30 tracking-tighter">
                <Command size={9} />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] shrink-0">
          {posList.map((pos) => (
            <button
              type="button"
              key={pos.value}
              onClick={() => setSelectedRole(selectedRole === pos.value ? null : pos.value)}
              title={pos.name}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                ${selectedRole === pos.value
                  ? "bg-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.15)]"
                  : "hover:bg-white/10"}`}
            >
              <Image src={pos.img} alt={pos.name} width={22} height={22} className="object-contain" />
            </button>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] shrink-0 relative w-full md:w-auto">
          {!isReadOnly && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                className="w-10 h-10 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
              >
                <RotateCcw size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="w-10 h-10 rounded-xl text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
              >
                <Save size={18} />
              </Button>
              <div className="w-[1px] h-5 bg-white/10 mx-1" />
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Champion pool grid */}
      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden z-10 flex-1 flex flex-col max-h-[700px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <ScrollArea className="flex-1 w-full">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 p-4">
            <AnimatePresence mode="popLayout">
              {filteredChampions.map(([key, champ]) => {
                const isBanned = [
                  ...(currentGame?.blueBan ?? []),
                  ...(currentGame?.redBan ?? []),
                ].some((s) => s?.id === champ.id);
                const isPicked = [
                  ...(currentGame?.blue ?? []),
                  ...(currentGame?.red ?? []),
                ].some((s) => s?.id === champ.id);
                const isFearlessBanned = isLocked(champ.id);
                const isUnavailable = isBanned || isPicked || isFearlessBanned;

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={champ.id}
                    draggable={!isUnavailable && !isReadOnly}
                    onDragStart={(e) => {
                      if (!isReadOnly && !isUnavailable) {
                        e.dataTransfer.setData(
                          "payload",
                          JSON.stringify({ type: "champion", champKey: key })
                        );
                      }
                    }}
                    onClick={() => {
                      if (!isUnavailable && !isReadOnly && champions?.[key]) {
                        selectChamp(champions[key], currentSide, currentSelection);
                      }
                    }}
                    className={`relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500
                      ${isUnavailable || isReadOnly
                        ? "cursor-not-allowed scale-95 border-transparent"
                        : "border-white/5 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:-translate-y-1"}`}
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.id}.png`}
                      alt={champ.name}
                      fill
                      className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isUnavailable ? "grayscale opacity-30" : ""}`}
                    />

                    {isBanned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <Ban className="text-red-600 w-8 h-8 stroke-[3px] drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                        </motion.div>
                      </div>
                    )}

                    {isPicked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <Check className="text-emerald-500 w-10 h-10 stroke-[4px] drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        </motion.div>
                      </div>
                    )}

                    {isFearlessBanned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <Swords className="text-amber-400 w-8 h-8 stroke-[3px] drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        </motion.div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-center">
                      <p className="text-[10px] font-black text-white italic tracking-widest w-full uppercase">
                        {champ.name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Proceed to next game */}
      {!isReadOnly &&
        isFearless &&
        canAddNextGame &&
        games.length < 5 &&
        currentGameIndex === games.length - 1 && (
          <button
            type="button"
            onClick={addNextGame}
            className="w-full py-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-400 font-black text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2"
          >
            <Swords size={14} />
            Proceed to Game {games.length + 1}
            <ChevronRight size={14} />
          </button>
        )}

      {/* Settings Modal */}
      <DraftSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDownload={onDownload}
      />
    </div>
  );
}
