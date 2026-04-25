'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Search, Ban, Shield, Swords, X, Command, Check, LayoutGrid, Sword, Trees, Zap, Target, Heart } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PATCH_NO } from '@/lib/const';

export default function HomePage() {
    const [champions, setChampions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRole, setActiveRole] = useState('All');
    const [currentSide, setCurrentSide] = useState('blue');
    const [currentSelection, setCurrentSelection] = useState(0);
    const searchInputRef = useRef(null);

    const roles = [
        { name: 'All', icon: LayoutGrid },
        { name: 'Top', icon: Sword },
        { name: 'Jungle', icon: Trees },
        { name: 'Mid', icon: Zap },
        { name: 'ADC', icon: Target },
        { name: 'Support', icon: Heart }
    ];

    const roleMapping = {
        'Top': ['Fighter', 'Tank'],
        'Jungle': ['Fighter', 'Tank', 'Assassin'],
        'Mid': ['Mage', 'Assassin'],
        'ADC': ['Marksman'],
        'Support': ['Support', 'Tank', 'Mage']
    };

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

        // Keyboard shortcut to focus search
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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

    const filteredChampions = Object.entries(champions).filter(([_, champ]) => {
        const matchesSearch = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = activeRole === 'All' || champ.tags.some(tag => roleMapping[activeRole]?.includes(tag));
        return matchesSearch && matchesRole;
    });

    const Slot = ({ side, index, type = 'pick' }) => {
        const isBan = type === 'ban';
        const data = selected[side][index];
        const isActive = currentSide === side && currentSelection === index;
        const isBlue = side.startsWith('blue');
        
        const imageUrl = data 
            ? (isBan 
                ? `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${data.id}.png`
                : `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${data.id}_0.jpg`)
            : null;

        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCurrentSide(side); setCurrentSelection(index); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, side, index)}
                className={`relative cursor-pointer overflow-hidden transition-all duration-300
                    ${isBan ? 'w-16 h-16 rounded-md' : `h-28 w-[92%] rounded-xl ${isBlue ? 'mr-auto' : 'ml-auto'}`}
                    ${isActive ? (isBlue ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]') : 'opacity-80'}
                    bg-gray-800/40 backdrop-blur-md border border-white/10 group`}
            >
                {data ? (
                    <div className="relative w-full h-full">
                        <motion.img 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={imageUrl}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isBan ? '' : 'object-[center_20%]'}`}
                            alt={data.name}
                        />
                        {!isBan && (
                            <div className={`absolute inset-0 bg-gradient-to-t ${isBlue ? 'from-blue-950/90 via-blue-900/20' : 'from-red-950/90 via-red-900/20'} to-transparent flex flex-col justify-end p-3`}>
                                <p className="font-black text-lg text-white uppercase tracking-tighter italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{data.name}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-white/10">
                        {isBan ? <div className="w-1 h-1 rounded-full bg-white/20" /> : <Shield size={32} className="opacity-20" />}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 px-8 py-4">
            <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-10">
                
                {/* BLUE SIDE */}
                <div className="col-span-3 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black italic tracking-tighter text-blue-400 uppercase">Blue Team</h2>
                        <div className="flex items-center justify-between w-[92%] mr-auto">
                            <div className="grid grid-cols-3 gap-2">
                                {[0,1,2].map(i => <Slot key={i} side="blueBan" index={i} type="ban" />)}
                            </div>
                            <div className="h-10 w-[1px] bg-blue-500/20" />
                            <div className="grid grid-cols-2 gap-2">
                                {[3,4].map(i => <Slot key={i} side="blueBan" index={i} type="ban" />)}
                            </div>
                        </div>
                    </div>

                    {/* PICKS SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-400/40 uppercase tracking-[0.3em]">Picks - Phase 1</span>
                        </div>
                        {[0,1,2].map(i => <Slot key={i} side="blue" index={i} />)}
                        
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-blue-500/20"></div>
                            </div>
                            <div className="relative flex justify-start">
                                <span className="bg-[#020617] pr-3 text-[10px] font-black text-blue-400/40 uppercase tracking-[0.3em]">Phase 2</span>
                            </div>
                        </div>

                        {[3,4].map(i => <Slot key={i} side="blue" index={i} />)}
                    </div>
                </div>

                {/* CHAMPION SELECTION */}
                <div className="col-span-6 space-y-8">
                    {/* Modern Search Bar */}
                    <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
                        <div className="relative group flex-1">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-amber-500/20 to-red-600/20 rounded-xl blur opacity-25 group-focus-within:opacity-100 transition-all duration-500" />
                            <div className="relative flex items-center bg-white/5 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden group-focus-within:border-white/20 transition-all">
                                <div className="pl-4 text-white/20 group-focus-within:text-amber-400 transition-colors">
                                    <Search size={18} />
                                </div>
                                <input 
                                    ref={searchInputRef}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search Champions..."
                                    className="w-full h-12 bg-transparent border-none focus:ring-0 focus:outline-none text-base font-bold tracking-wider px-3 text-white placeholder:text-white/10"
                                />
                                
                                <div className="flex items-center gap-2 pr-4">
                                    <AnimatePresence>
                                        {searchTerm && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={() => setSearchTerm('')}
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

                        {/* Role Filters - Commented out for now
                        <div className="flex items-center bg-white/5 backdrop-blur-3xl border border-white/10 rounded-xl p-1 gap-1">
                            {roles.map(role => (
                                <button
                                    key={role.name}
                                    onClick={() => setActiveRole(role.name)}
                                    title={role.name}
                                    className={`p-2.5 rounded-lg transition-all duration-300 group/role relative
                                        ${activeRole === role.name 
                                            ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                            : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <role.icon size={18} />
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-black px-2 py-1 rounded border border-white/10 opacity-0 group-hover/role:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
                                        {role.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                        */}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <ScrollArea className="h-[750px]">
                            <div className="grid grid-cols-8 gap-2 p-4">
                                <AnimatePresence mode='popLayout'>
                                    {filteredChampions.map(([key, champ]) => {
                                        const isBanned = [...selected.blueBan, ...selected.redBan].some(s => s?.id === champ.id);
                                        const isPicked = [...selected.blue, ...selected.red].some(s => s?.id === champ.id);
                                        const isUnavailable = isBanned || isPicked;

                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                key={champ.id}
                                                draggable={!isUnavailable}
                                                onDragStart={(e) => handleDragStart(e, key)}
                                                onClick={() => !isUnavailable && selectChamp(key)}
                                                className={`relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500
                                                    ${isUnavailable ? 'cursor-not-allowed scale-95 border-transparent' : 'border-white/5 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:-translate-y-1'}`}
                                            >
                                                <img 
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${champ.id}.png`}
                                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isUnavailable ? 'grayscale opacity-30' : ''}`}
                                                    alt={champ.name}
                                                />
                                                
                                                {isBanned && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <Ban className="text-red-600 w-8 h-8 stroke-[3px] drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                                        </motion.div>
                                                    </div>
                                                )}

                                                {isPicked && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <Check className="text-emerald-500 w-10 h-10 stroke-[4px] drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                                        </motion.div>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-center">
                                                    <p className="text-[10px] font-black text-white italic tracking-widest w-full uppercase">{champ.name}</p>
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
                    <div className="space-y-3 text-right">
                        <h2 className="text-2xl font-black italic tracking-tighter text-red-400 uppercase">Red Team</h2>
                        <div className="flex items-center justify-between w-[92%] ml-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {[3,4].map(i => <Slot key={i} side="redBan" index={i} type="ban" />)}
                            </div>
                            <div className="h-10 w-[1px] bg-red-500/20" />
                            <div className="grid grid-cols-3 gap-2">
                                {[0,1,2].map(i => <Slot key={i} side="redBan" index={i} type="ban" />)}
                            </div>
                        </div>
                    </div>

                    {/* PICKS SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] font-black text-red-400/40 uppercase tracking-[0.3em]">Picks - Phase 1</span>
                        </div>
                        {[0,1,2].map(i => <Slot key={i} side="red" index={i} />)}
                        
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-red-500/20"></div>
                            </div>
                            <div className="relative flex justify-end">
                                <span className="bg-[#020617] pl-3 text-[10px] font-black text-red-400/40 uppercase tracking-[0.3em]">Phase 2</span>
                            </div>
                        </div>

                        {[3,4].map(i => <Slot key={i} side="red" index={i} />)}
                    </div>
                </div>

            </div>
        </div>
    );
}
