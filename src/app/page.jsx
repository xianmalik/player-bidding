'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Search, Ban, Shield, X, Command, Check, RotateCcw, Download, Share2, Link2 } from 'lucide-react';
import html2canvas from 'html2canvas';

import Image from 'next/image';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PATCH_NO } from '@/lib/const';

export default function HomePage() {
    const [champions, setChampions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSide, setCurrentSide] = useState('blue');
    const [currentSelection, setCurrentSelection] = useState(0);
    const [draftMode, setDraftMode] = useState('Draft');
    const searchInputRef = useRef(null);
    const pageRef = useRef(null);
    const blueRef = useRef(null);
    const redRef = useRef(null);

    const handleDownload = async () => {
        const TARGET_W = 1920;
        const TARGET_H = 1080;

        const canvas = await html2canvas(pageRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#020617',
            scale: 2,
        });

        // fit the full captured page into 1920x1080, preserving aspect ratio
        const ratio = Math.min(TARGET_W / canvas.width, TARGET_H / canvas.height);
        const destW = canvas.width * ratio;
        const destH = canvas.height * ratio;
        const destX = (TARGET_W - destW) / 2;
        const destY = (TARGET_H - destH) / 2;

        const out = document.createElement('canvas');
        out.width = TARGET_W;
        out.height = TARGET_H;
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, destX, destY, destW, destH);

        const link = document.createElement('a');
        link.download = 'draft.png';
        link.href = out.toDataURL('image/png');
        link.click();
    };

    const [selected, setSelected] = useState({
        blueBan: Array(5).fill(null),
        redBan: Array(5).fill(null),
        blue: Array(5).fill(null),
        red: Array(5).fill(null)
    });

    const resetDraft = () => {
        setSelected({
            blueBan: Array(5).fill(null),
            redBan: Array(5).fill(null),
            blue: Array(5).fill(null),
            red: Array(5).fill(null)
        });
        setCurrentSide('blue');
        setCurrentSelection(0);
        setSearchTerm('');
    };

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

    const handleRemove = (side, index) => {
        setSelected(prev => {
            const next = { ...prev, [side]: [...prev[side]] };
            next[side][index] = null;
            return next;
        });
    };

    const handleDragStart = (e, payload) => {
        e.dataTransfer.setData('payload', JSON.stringify(payload));
        // preload splash art so it's cached by the time the user drops
        if (payload.type === 'champion') {
            const img = new window.Image();
            img.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[payload.champKey]?.id}_0.jpg`;
        }
    };

    const handleDrop = (e, targetSide, targetIndex) => {
        e.preventDefault();
        let payload;
        try { payload = JSON.parse(e.dataTransfer.getData('payload')); } catch { return; }

        if (payload.type === 'champion') {
            selectChamp(payload.champKey, targetSide, targetIndex);
        } else if (payload.type === 'slot') {
            const { side: srcSide, index: srcIndex } = payload;
            if (srcSide === targetSide && srcIndex === targetIndex) return;
            setSelected(prev => {
                const next = { ...prev, [srcSide]: [...prev[srcSide]], [targetSide]: [...prev[targetSide]] };
                // swap: put src into target, target into src
                [next[targetSide][targetIndex], next[srcSide][srcIndex]] =
                    [next[srcSide][srcIndex], next[targetSide][targetIndex]];
                return next;
            });
        }
    };

    const filteredChampions = Object.entries(champions).filter(([_, champ]) => {
        return champ.name.toLowerCase().includes(searchTerm.toLowerCase());
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
                draggable={!!data}
                onDragStart={(e) => data && handleDragStart(e, { type: 'slot', side, index })}
                onClick={() => { setCurrentSide(side); setCurrentSelection(index); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, side, index)}
                className={`relative cursor-pointer overflow-hidden transition-all duration-300
                    ${isBan ? 'w-16 h-16 rounded-md' : `h-32 w-full rounded-xl`}
                    ${isActive ? (isBlue ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]') : 'opacity-80'}
                    bg-gray-800/40 backdrop-blur-md border border-white/10 group`}
            >
                {data ? (
                    <div className="relative w-full h-full">
                        {/* bg-image instead of img so html2canvas renders cover correctly */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: isBan ? 'center' : 'center 20%',
                            }}
                            className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                        />
                        {!isBan && (
                            <div className={`absolute inset-0 bg-gradient-to-t ${isBlue ? 'from-blue-950/90 via-blue-900/20' : 'from-red-950/90 via-red-900/20'} to-transparent flex flex-col justify-end p-3`}>
                                <p className="font-black text-lg text-white uppercase tracking-tighter italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{data.name}</p>
                            </div>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(side, index); }}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white/50 hover:text-white hover:bg-red-600/80 opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <X size={12} />
                        </button>
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
        <div ref={pageRef} className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 px-8 py-4">
            <div className="max-w-[1600px] mx-auto grid grid-cols-8 gap-6">
                
                {/* BLUE SIDE */}
                <div ref={blueRef} className="col-span-2 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black italic tracking-tighter text-blue-400 uppercase">Blue Team</h2>
                        <div className="flex items-center justify-between w-full">
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
                <div className="col-span-4 space-y-4">

                    {/* Title + Mode Nav */}
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
                            Champion <span className="text-amber-400">Draft</span>
                        </h1>
                        <div className="flex items-center gap-8 border-b border-white/10 w-full justify-center">
                            {[
                                { label: 'Draft', disabled: false },
                                { label: 'Fearless Draft', disabled: true },
                            ].map(({ label, disabled }) => (
                                <button
                                    key={label}
                                    onClick={() => !disabled && setDraftMode(label)}
                                    disabled={disabled}
                                    className={`relative pb-3 text-sm font-black uppercase tracking-[0.2em] transition-colors duration-200 flex items-center gap-2
                                        ${disabled ? 'text-white/20 cursor-not-allowed' : draftMode === label ? 'text-amber-400' : 'text-white/30 hover:text-white/60'}`}
                                >
                                    {label}
                                    {disabled && <span className="text-[10px] font-bold normal-case tracking-normal text-white/20">(in progress)</span>}
                                    {!disabled && draftMode === label && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                                        {/* Search Bar + Action Bar */}
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="relative group flex-1">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-amber-500/20 to-red-600/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition-all duration-500" />
                                                <div className="relative flex items-center bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden group-focus-within:border-white/20 transition-all">
                                                    <div className="pl-4 text-white/20 group-focus-within:text-amber-400 transition-colors">
                                                        <Search size={18} />
                                                    </div>
                                                    <input
                                                        ref={searchInputRef}
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Search Champions..."
                                                        className="w-full h-14 bg-transparent border-none focus:ring-0 focus:outline-none text-base font-bold tracking-wider px-3 text-white placeholder:text-white/10"
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

                                            {/* ACTION BAR */}
                                            <div className="flex items-center h-14 px-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] shrink-0">
                                                {/* Reset */}
                                                {[{ icon: RotateCcw, label: 'Reset', onClick: resetDraft, color: 'text-red-400', hover: 'hover:bg-red-500/15 hover:border-red-500/30' }].map(({ icon: Icon, label, onClick, color, hover }) => (
                                                    <div key={label} className="relative group/btn">
                                                        <button onClick={onClick} className={`flex items-center justify-center w-9 h-9 rounded-xl border border-transparent transition-all duration-200 ${hover} ${color}`}>
                                                            <Icon size={18} />
                                                        </button>
                                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-800 border border-white/10 text-[10px] font-black text-white/70 uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-50">{label}</div>
                                                    </div>
                                                ))}

                                                {/* Divider */}
                                                <div className="w-[1px] h-5 bg-white/10 mx-2" />

                                                {/* Download, Copy Link, Share */}
                                                {[
                                                    { icon: Download, label: 'Download',  onClick: handleDownload, color: 'text-amber-400', hover: 'hover:bg-amber-500/15 hover:border-amber-500/30' },
                                                    { icon: Link2,    label: 'Copy Link',  onClick: () => navigator.clipboard.writeText(window.location.href), color: 'text-purple-400', hover: 'hover:bg-purple-500/15 hover:border-purple-500/30' },
                                                    { icon: Share2,   label: 'Share',      onClick: () => navigator.share?.({ title: 'Draft', url: window.location.href }), color: 'text-blue-400', hover: 'hover:bg-blue-500/15 hover:border-blue-500/30' },
                                                ].map(({ icon: Icon, label, onClick, color, hover }) => (
                                                    <div key={label} className="relative group/btn">
                                                        <button onClick={onClick} className={`flex items-center justify-center w-9 h-9 rounded-xl border border-transparent transition-all duration-200 ${hover} ${color}`}>
                                                            <Icon size={18} />
                                                        </button>
                                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-800 border border-white/10 text-[10px] font-black text-white/70 uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-50">{label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <ScrollArea className="h-[680px]">
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
                                                onDragStart={(e) => handleDragStart(e, { type: 'champion', champKey: key })}
                                                onClick={() => !isUnavailable && selectChamp(key)}
                                                className={`relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500
                                                    ${isUnavailable ? 'cursor-not-allowed scale-95 border-transparent' : 'border-white/5 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:-translate-y-1'}`}
                                            >
                                                <Image
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${champ.id}.png`}
                                                    alt={champ.name}
                                                    fill
                                                    className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isUnavailable ? 'grayscale opacity-30' : ''}`}
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
                <div ref={redRef} className="col-span-2 space-y-6">
                    <div className="space-y-3 text-right">
                        <h2 className="text-2xl font-black italic tracking-tighter text-red-400 uppercase">Red Team</h2>
                        <div className="flex items-center justify-between w-full">
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
