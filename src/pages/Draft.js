'use client'

import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Search, Ban, Shield, Swords } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PATCH_NO } from '@/lib/const';

export default function HomePage() {
    const [champions, setChampions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSide, setCurrentSide] = useState('blue');
    const [currentSelection, setCurrentSelection] = useState(0);
    const [selected, setSelected] = useState({
        blueBan: Array(5).fill(null),
        redBan: Array(5).fill(null),
        blue: Array(5).fill(null),
        red: Array(5).fill(null)
    });

    useEffect(() => {
        const fetchChampions = async () => {
            try {
                const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/data/en_US/champion.json`);
                setChampions(response.data.data);
            } catch (error) {
                console.error('Error fetching champions:', error);
            }
        };
        fetchChampions();
    }, []);

    const selectChamp = useCallback((champKey, side = currentSide, index = currentSelection) => {
        const champ = champions[champKey];
        if (!champ) return;

        const isAlreadySelected = Object.values(selected).flat().some(s => s?.id === champ.id);
        if (isAlreadySelected) return;

        setSelected(prev => {
            const next = { ...prev };
            next[side] = [...prev[side]];
            next[side][index] = champ;
            return next;
        });
    }, [champions, currentSide, currentSelection, selected]);

    const handleDragStart = (e, champKey) => {
        e.dataTransfer.setData("champKey", champKey);
    };

    const handleDrop = (e, side, index) => {
        e.preventDefault();
        const champKey = e.dataTransfer.getData("champKey");
        selectChamp(champKey, side, index);
    };

    const filteredChampions = Object.entries(champions).filter(([_, champ]) => 
        champ.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const Slot = ({ side, index, type = 'pick' }) => {
        const isBan = type === 'ban';
        const data = selected[side][index];
        const isActive = currentSide === side && currentSelection === index;
        const sideColor = side.startsWith('blue') ? 'blue' : 'red';
        
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCurrentSide(side); setCurrentSelection(index); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, side, index)}
                className={`relative cursor-pointer overflow-hidden transition-all duration-300
                    ${isBan ? 'w-12 h-12 rounded-sm' : 'h-24 w-full rounded-lg'}
                    ${isActive ? `ring-2 ring-${sideColor}-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]` : 'opacity-80'}
                    bg-gray-800/40 backdrop-blur-md border border-white/10`}
            >
                {data ? (
                    <div className="relative w-full h-full group">
                        <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${data.id}.png`}
                            className={`w-full h-full object-cover ${isBan ? 'grayscale contrast-125' : ''}`}
                            alt={data.name}
                        />
                        {!isBan && (
                            <div className={`absolute inset-0 bg-gradient-to-t from-${sideColor}-900/80 to-transparent flex flex-col justify-end p-3`}>
                                <p className="font-bold text-sm text-white uppercase tracking-tighter">{data.name}</p>
                                <p className="text-[10px] text-white/60 font-medium">LOCKED</p>
                            </div>
                        )}
                        {isBan && <Ban className="absolute inset-0 m-auto text-red-500/80 w-6 h-6 stroke-[3px]" />}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-white/20">
                        {isBan ? <Ban size={16} /> : <Shield size={24} />}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 p-8">
            <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-8">
                
                {/* BLUE SIDE */}
                <div className="col-span-3 space-y-6">
                    <div className="flex items-center gap-3 border-b border-blue-500/30 pb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Shield className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic tracking-tighter text-blue-400">BLUE TEAM</h2>
                            <p className="text-[10px] text-blue-300/50 font-bold tracking-widest">PICKING PHASE</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                        {[0,1,2,3,4].map(i => <Slot key={i} side="blueBan" index={i} type="ban" />)}
                    </div>

                    <div className="space-y-3">
                        {[0,1,2,3,4].map(i => <Slot key={i} side="blue" index={i} />)}
                    </div>
                </div>

                {/* CHAMPION SELECTION */}
                <div className="col-span-6 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-400 transition-colors" size={20} />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="FIND YOUR CHAMPION..."
                            className="h-14 pl-12 bg-white/5 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 text-lg font-bold tracking-widest rounded-xl backdrop-blur-xl"
                        />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-2xl">
                        <ScrollArea className="h-[650px] pr-4">
                            <div className="grid grid-cols-6 gap-4">
                                <AnimatePresence mode='popLayout'>
                                    {filteredChampions.map(([key, champ]) => {
                                        const isSelected = Object.values(selected).flat().some(s => s?.id === champ.id);
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                key={champ.id}
                                                draggable={!isSelected}
                                                onDragStart={(e) => handleDragStart(e, key)}
                                                onClick={() => !isSelected && selectChamp(key)}
                                                className={`relative group cursor-pointer aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300
                                                    ${isSelected ? 'opacity-20 grayscale border-transparent cursor-not-allowed' : 'border-white/5 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]'}`}
                                            >
                                                <img 
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${champ.id}.png`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    alt={champ.name}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                    <p className="text-[10px] font-black text-white truncate w-full">{champ.name.toUpperCase()}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* RED SIDE */}
                <div className="col-span-3 space-y-6">
                    <div className="flex items-center justify-end gap-3 border-b border-red-500/30 pb-4">
                        <div className="text-right">
                            <h2 className="text-xl font-black italic tracking-tighter text-red-400">RED TEAM</h2>
                            <p className="text-[10px] text-red-300/50 font-bold tracking-widest">PICKING PHASE</p>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Swords className="text-red-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 justify-items-end">
                        {[0,1,2,3,4].map(i => <Slot key={i} side="redBan" index={i} type="ban" />)}
                    </div>

                    <div className="space-y-3">
                        {[0,1,2,3,4].map(i => <Slot key={i} side="red" index={i} />)}
                    </div>
                </div>

            </div>
        </div>
    );
}
