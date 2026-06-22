"use client";

import Image from "next/image";
import DraftSlot from "@/components/DraftSlot";
import EditableTeamName from "@/components/EditableTeamName";
import useDraftStore from "@/stores/draftStore";
import useChampionStore from "@/stores/championStore";

function SlotHistory({ side, index, align }) {
  const { games, currentGameIndex, isFearless } = useDraftStore();
  const { patch } = useChampionStore();
  if (!isFearless || currentGameIndex === 0) return null;

  const history = games
    .slice(0, currentGameIndex)
    .map((g, gi) => ({ champ: (g[side] ?? [])[index], gameNum: gi + 1 }))
    .filter(({ champ }) => champ);

  if (history.length === 0) return null;

  return (
    <div
      className={`grid grid-rows-2 grid-flow-col gap-1 shrink-0 ${align === "right" ? "order-last" : "order-first"}`}
    >
      {history.map(({ champ, gameNum }) => (
        <div
          key={gameNum}
          title={`G${gameNum}: ${champ.id}`}
          className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0"
        >
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.id}.png`}
            alt={champ.id}
            fill
            sizes="64px"
            className="object-cover grayscale opacity-40"
          />
          <span className="absolute bottom-1 right-1 text-[11px] font-black text-white/70 leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
            G{gameNum}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DraftSidebar({ side }) {
  const { games, currentGameIndex } = useDraftStore();
  const isBlue = side === "blue";
  const isSwapped = games[currentGameIndex]?.swapped ?? false;

  const dataSide = isBlue ? (isSwapped ? "red" : "blue") : (isSwapped ? "blue" : "red");
  const dataBanSide = isBlue ? (isSwapped ? "redBan" : "blueBan") : (isSwapped ? "blueBan" : "redBan");
  const teamNameSide = isBlue ? (isSwapped ? "red" : "blue") : (isSwapped ? "blue" : "red");
  const displayBan = isBlue ? "blueBan" : "redBan";
  const dividerClass = isBlue ? "border-blue-500/20" : "border-red-500/20";

  return (
    <div
      className={`md:col-span-3 ${isBlue ? "order-2 md:order-1" : "order-3 md:order-3"} space-y-6 flex flex-col`}
    >
      <div className={`space-y-3 shrink-0 ${!isBlue ? "text-right" : ""}`}>
        <EditableTeamName side={teamNameSide} />

        <div className="flex items-center justify-between w-full">
          {isBlue ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <DraftSlot key={i} side={dataBanSide} index={i} type="ban" displayAs={displayBan} />
                ))}
              </div>
              <div className="h-10 w-[1px] bg-blue-500/20" />
              <div className="grid grid-cols-2 gap-2">
                {[3, 4].map((i) => (
                  <DraftSlot key={i} side={dataBanSide} index={i} type="ban" displayAs={displayBan} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {[3, 4].map((i) => (
                  <DraftSlot key={i} side={dataBanSide} index={i} type="ban" displayAs={displayBan} />
                ))}
              </div>
              <div className="h-10 w-[1px] bg-red-500/20" />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <DraftSlot key={i} side={dataBanSide} index={i} type="ban" displayAs={displayBan} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            {isBlue && <SlotHistory side={dataSide} index={i} align="left" />}
            <div className="flex-1">
              <DraftSlot side={dataSide} index={i} displayAs={side} />
            </div>
            {!isBlue && <SlotHistory side={dataSide} index={i} align="right" />}
          </div>
        ))}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className={`w-full border-t ${dividerClass}`} />
          </div>
        </div>
        {[3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            {isBlue && <SlotHistory side={dataSide} index={i} align="left" />}
            <div className="flex-1">
              <DraftSlot side={dataSide} index={i} displayAs={side} />
            </div>
            {!isBlue && <SlotHistory side={dataSide} index={i} align="right" />}
          </div>
        ))}
      </div>
    </div>
  );
}
