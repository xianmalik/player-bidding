"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Ban, User, X } from "lucide-react";
import Image from "next/image";
import useDraftStore from "@/stores/draftStore";
import useChampionStore from "@/stores/championStore";

export default function DraftSlot({ side, index, type = "pick", displayAs }) {
  const {
    games, currentGameIndex, currentSide, currentSelection,
    user, draftId, draftOwnerId,
    setCurrentSide, setCurrentSelection,
    removeChamp, selectChamp, swapSlots, setCurrentGame,
  } = useDraftStore();
  const { champions, patch } = useChampionStore();

  const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);
  const currentGame = games[currentGameIndex];
  const isBan = type === "ban";
  const data = currentGame?.[side]?.[index] ?? null;
  const isActive = currentSide === side && currentSelection === index;
  const isBlue = (displayAs ?? side).startsWith("blue");

  const imageUrl = data
    ? isBan
      ? `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${data.id}.png`
      : `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${data.id}_0.jpg`
    : null;

  const handleDragStart = (e) => {
    if (isReadOnly || !data) return;
    e.dataTransfer.setData("payload", JSON.stringify({ type: "slot", side, index }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData("payload"));
    } catch {
      return;
    }
    if (payload.type === "champion") {
      const champ = champions?.[payload.champKey];
      if (champ) selectChamp(champ, side, index);
    } else if (payload.type === "slot") {
      swapSlots(payload.side, payload.index, side, index);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      draggable={!isReadOnly && !!data}
      onDragStart={handleDragStart}
      onClick={() => {
        if (!isReadOnly) {
          setCurrentSide(side);
          setCurrentSelection(index);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`relative cursor-pointer overflow-hidden transition-all duration-300
        ${isBan ? "w-16 h-16 rounded-md" : "h-32 w-full rounded-xl"}
        ${isActive
          ? isBlue
            ? "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            : "ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          : "opacity-80"}
        bg-gray-800/40 backdrop-blur-md border border-white/10 group`}
    >
      {data ? (
        <div className="relative w-full h-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: isBan ? "center" : "center 20%",
            }}
            className="w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
          {!isBan && (
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                isBlue ? "from-blue-950/90 via-blue-900/20" : "from-red-950/90 via-red-900/20"
              } to-transparent flex flex-col justify-end p-3 ${!isBlue ? "items-end" : "items-start"}`}
            >
              <p
                className={`font-black text-lg text-white uppercase tracking-tighter italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${!isBlue ? "text-right" : "text-left"}`}
              >
                {data.name || data.id}
              </p>
            </div>
          )}
          {!isReadOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChamp(side, index);
              }}
              className={`absolute top-1.5 ${isBlue ? "right-1.5" : "left-1.5"} p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-red-500 hover:border-red-400 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl`}
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full relative overflow-hidden">
          {!isBan && (
            <div
              className={`absolute inset-0 ${
                isBlue
                  ? "[background:radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.12)_0%,transparent_70%)]"
                  : "[background:radial-gradient(ellipse_at_bottom_right,rgba(239,68,68,0.12)_0%,transparent_70%)]"
              }`}
            />
          )}
          <div className="relative z-10 text-white opacity-10">
            {isBan ? <Ban size={28} /> : <User size={32} />}
          </div>
        </div>
      )}
    </motion.div>
  );
}
