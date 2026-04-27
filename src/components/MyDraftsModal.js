'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Calendar, Clock } from 'lucide-react';
import { Modal } from './ui/modal';
import { Input } from './ui/input';
import ChampionAvatar from './ChampionAvatar';
import useChampionStore from '../stores/championStore';
import { getUserDrafts, transformDraftsForModal } from '../lib/drafts';

export default function MyDraftsModal({ isOpen, onClose, user }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { champions, preloadChampionImages } = useChampionStore();

    // Fetch user drafts when modal opens
    useEffect(() => {
        if (isOpen && user?.id) {
            fetchUserDrafts();
        }
    }, [isOpen, user?.id]);

    const fetchUserDrafts = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const rawDrafts = await getUserDrafts(user.id);
            const transformedDrafts = transformDraftsForModal(rawDrafts);
            setDrafts(transformedDrafts);
            
            // Preload champion images using cached data from store
            if (transformedDrafts.length > 0 && champions) {
                const allChampions = transformedDrafts.flatMap(draft => [
                    ...draft.blueTeam.champions,
                    ...draft.redTeam.champions
                ]);
                preloadChampionImages(allChampions).catch(console.error);
            }
        } catch (err) {
            console.error('Error fetching drafts:', err);
            setError('Failed to load drafts');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDrafts = useMemo(() => {
        if (!searchQuery) return drafts;
        
        const query = searchQuery.toLowerCase();
        return drafts.filter(draft => 
            draft.name.toLowerCase().includes(query) ||
            draft.blueTeam.name.toLowerCase().includes(query) ||
            draft.redTeam.name.toLowerCase().includes(query) ||
            draft.blueTeam.champions.some(champ => champ.toLowerCase().includes(query)) ||
            draft.redTeam.champions.some(champ => champ.toLowerCase().includes(query))
        );
    }, [searchQuery, drafts]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleDraftClick = (draftId) => {
        // Navigate to draft page
        window.location.href = `/?draft=${draftId}`;
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title=""
            className="p-6"
        >   
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" size={20} />
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
                            <Shield className="text-red-600" size={32} />
                        </div>
                        <p className="text-red-400 font-medium text-sm">{error}</p>
                        <button
                            onClick={fetchUserDrafts}
                            className="mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredDrafts.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="text-slate-600" size={32} />
                        </div>
                        <p className="text-white/50 font-medium text-sm">
                            {searchQuery ? 'No drafts found matching your search' : 'No saved drafts'}
                        </p>
                        <p className="text-white/30 text-xs mt-2">
                            {searchQuery ? 'Try adjusting your search terms' : 'Create your first draft to get started'}
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
                                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                                    {draft.name}
                                </h3>
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
                                        {draft.blueTeam.champions.map((champion, idx) => (
                                            <ChampionAvatar
                                                key={idx}
                                                championName={champion}
                                                size="small"
                                                showTooltip={true}
                                            />
                                        ))}
                                        {/* Fill empty slots to maintain 5 columns */}
                                        {Array.from({ length: Math.max(0, 5 - draft.blueTeam.champions.length) }).map((_, idx) => (
                                            <div
                                                key={`empty-blue-${idx}`}
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
                                        {draft.redTeam.champions.map((champion, idx) => (
                                            <ChampionAvatar
                                                key={idx}
                                                championName={champion}
                                                size="small"
                                                showTooltip={true}
                                            />
                                        ))}
                                        {/* Fill empty slots to maintain 5 columns */}
                                        {Array.from({ length: Math.max(0, 5 - draft.redTeam.champions.length) }).map((_, idx) => (
                                            <div
                                                key={`empty-red-${idx}`}
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
