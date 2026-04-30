"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Globe, Lock, Search, Swords } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserDrafts, transformDraftsForModal } from "../lib/drafts";
import { formatDate, formatTime } from "../lib/dateUtils";
import useChampionStore from "../stores/championStore";
import ChampionAvatar from "./ChampionAvatar";
import { Input } from "./ui/input";
import { Modal } from "./ui/modal";

export default function MyDraftsModal({ isOpen, onClose, user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { champions, preloadChampionImages } = useChampionStore();

  const fetchUserDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rawDrafts = await getUserDrafts(user.id);
      const transformedDrafts = transformDraftsForModal(rawDrafts);
      setDrafts(transformedDrafts);

      if (transformedDrafts.length > 0 && champions) {
        const allChampions = transformedDrafts.flatMap((draft) => [
          ...draft.blueTeam.champions,
          ...draft.redTeam.champions,
        ]);
        preloadChampionImages(allChampions).catch(() => {});
      }
    } catch (_err) {
      setError("Failed to load drafts");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, champions, preloadChampionImages]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserDrafts();
    }
  }, [isOpen, user?.id, fetchUserDrafts]);

  const filteredDrafts = useMemo(() => {
    if (!searchQuery) return drafts;

    const query = searchQuery.toLowerCase();
    return drafts.filter(
      (draft) =>
        draft.name.toLowerCase().includes(query) ||
        draft.blueTeam.name.toLowerCase().includes(query) ||
        draft.redTeam.name.toLowerCase().includes(query) ||
        draft.blueTeam.champions.some((champ) => champ.toLowerCase().includes(query)) ||
        draft.redTeam.champions.some((champ) => champ.toLowerCase().includes(query))
    );
  }, [searchQuery, drafts]);

  const handleDraftClick = (draftId) => {
    // Navigate to draft page
    window.location.href = `/?draft=${draftId}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" className="p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search drafts by name, team, or champion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-blue-500 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Drafts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white/50 font-medium text-sm">Loading drafts...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Swords className="text-red-600" size={32} />
            </div>
            <p className="text-red-400 font-medium text-sm">{error}</p>
            <button
              type="button"
              onClick={fetchUserDrafts}
              className="mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-medium"
            >
              Try Again
            </button>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Swords className="text-slate-600" size={32} />
            </div>
            <p className="text-white/50 font-medium text-sm">
              {searchQuery ? "No drafts found matching your search" : "No saved drafts"}
            </p>
            <p className="text-white/30 text-xs mt-2">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first draft to get started"}
            </p>
          </div>
        ) : (
          filteredDrafts.map((draft, index) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 border border-white/5 rounded-xl p-4 hover:bg-slate-800/70 hover:border-white/10 transition-all cursor-pointer group"
              onClick={() => handleDraftClick(draft.id)}
            >
              {/* Draft Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1 flex-1">
                    {draft.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    {draft.isFearless && (
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-400"
                        title={`Fearless · ${draft.gameCount} game${draft.gameCount !== 1 ? "s" : ""}`}
                      >
                        <Swords size={10} />
                        <span className="text-[8px] font-black uppercase tracking-wider">
                          G{draft.gameCount}
                        </span>
                      </div>
                    )}
                    {draft.isPublic ? (
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400"
                        title="Public"
                      >
                        <Globe size={10} />
                        <span className="text-[8px] font-medium">PUBLIC</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-600/10 text-slate-400"
                        title="Private"
                      >
                        <Lock size={10} />
                        <span className="text-[8px] font-medium">PRIVATE</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{formatDate(draft.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{formatTime(draft.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Teams */}
              <div className="space-y-3">
                {/* Blue Team */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {draft.blueTeam.name}
                    </h4>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {draft.blueTeam.champions.map((champion) => (
                      <ChampionAvatar
                        key={champion}
                        championName={champion}
                        size="small"
                        showTooltip={true}
                      />
                    ))}
                    {/* Fill empty slots to maintain 5 columns */}
                    {Array.from(
                      { length: Math.max(0, 5 - draft.blueTeam.champions.length) },
                      (_, i) => draft.blueTeam.champions.length + i
                    ).map((slotIndex) => (
                      <div
                        key={`empty-blue-${slotIndex}`}
                        className="aspect-square bg-slate-800/50 border border-dashed border-blue-500/20 rounded-lg"
                      />
                    ))}
                  </div>
                </div>

                {/* Red Team */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      {draft.redTeam.name}
                    </h4>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {draft.redTeam.champions.map((champion) => (
                      <ChampionAvatar
                        key={champion}
                        championName={champion}
                        size="small"
                        showTooltip={true}
                      />
                    ))}
                    {/* Fill empty slots to maintain 5 columns */}
                    {Array.from(
                      { length: Math.max(0, 5 - draft.redTeam.champions.length) },
                      (_, i) => draft.redTeam.champions.length + i
                    ).map((slotIndex) => (
                      <div
                        key={`empty-red-${slotIndex}`}
                        className="aspect-square bg-slate-800/50 border border-dashed border-red-500/20 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Modal>
  );
}
