'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Ban, Shield, X, Command, Check, RotateCcw, Download, Share2, Link2, Save, LogIn, LogOut, MoreVertical, Globe, Lock } from 'lucide-react';
import html2canvas from 'html2canvas';

import Image from 'next/image';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PATCH_NO } from '@/lib/const';

import { createClient } from '@/lib/supabaseClient';

export default function DraftTool() {
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [draftId, setDraftId] = useState(null);
    const [draftOwnerId, setDraftOwnerId] = useState(null);
    
    const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Action Bar State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const [champions, setChampions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSide, setCurrentSide] = useState('blue');
    const [currentSelection, setCurrentSelection] = useState(0);
    const [draftMode, setDraftMode] = useState('Draft');
    const searchInputRef = useRef(null);
    const pageRef = useRef(null);
    const blueRef = useRef(null);
    const redRef = useRef(null);

    const [selected, setSelected] = useState({
        blueBan: Array(5).fill(null),
        redBan: Array(5).fill(null),
        blue: Array(5).fill(null),
        red: Array(5).fill(null)
    });

    useEffect(() => {
        // Load session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('draft');
        
        if (id) {
            setIsLoadingDraft(true);
            setDraftId(id);
            const fetchDraft = async () => {
                try {
                    const { data, error } = await supabase
                        .from('drafts')
                        .select('draft_data, user_id, is_public')
                        .eq('id', id)
                        .single();
                    if (data && data.draft_data) {
                        setSelected(data.draft_data);
                        setDraftOwnerId(data.user_id);
                        setIsPublic(data.is_public);
                    } else if (error) {
                        console.error('Error fetching draft:', error);
                        alert('Draft not found or is private.');
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoadingDraft(false);
                }
            };
            fetchDraft();
        }
    }, [supabase]);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        
        let result;
        if (authMode === 'signup') {
            result = await supabase.auth.signUp({ email, password });
        } else {
            result = await supabase.auth.signInWithPassword({ email, password });
        }

        if (result.error) {
            setAuthError(result.error.message);
        } else {
            setIsAuthModalOpen(false);
            if (authMode === 'signup') {
                alert('Signup successful! Please check your email for verification.');
            }
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleSaveDraft = async () => {
        if (!user) {
            alert('Please log in with Google to save your draft.');
            return;
        }

        const stripChamp = (c) => c ? { id: c.id, key: c.key } : null;
        const minimalDraftData = {
            blueBan: selected.blueBan.map(stripChamp),
            redBan: selected.redBan.map(stripChamp),
            blue: selected.blue.map(stripChamp),
            red: selected.red.map(stripChamp)
        };

        if (draftId && user.id === draftOwnerId) {
            // Update existing draft
            const { error } = await supabase
                .from('drafts')
                .update({ draft_data: minimalDraftData, is_public: isPublic })
                .eq('id', draftId);

            if (error) {
                console.error('Error updating draft:', error);
                alert('Failed to update draft. Check console for details.');
            } else {
                alert('Draft updated successfully!');
            }
        } else {
            // Insert new draft
            const { data, error } = await supabase
                .from('drafts')
                .insert([{ 
                    user_id: user.id, 
                    draft_data: minimalDraftData,
                    name: `Draft ${new Date().toLocaleDateString()}`,
                    is_public: isPublic
                }])
                .select()
                .single();

            if (error) {
                console.error('Error saving draft:', error);
                alert('Failed to save draft. Check console for details.');
            } else {
                setDraftId(data.id);
                setDraftOwnerId(user.id);
                const link = `${window.location.origin}/?draft=${data.id}`;
                navigator.clipboard.writeText(link);
                alert(`Draft saved successfully!\nLink copied to clipboard:\n${link}`);
            }
        }
    };

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
        if (isReadOnly) return;
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
    }, [champions, currentSide, currentSelection, selected, isReadOnly]);

    const handleRemove = (side, index) => {
        if (isReadOnly) return;
        setSelected(prev => {
            const next = { ...prev, [side]: [...prev[side]] };
            next[side][index] = null;
            return next;
        });
    };

    const handleDragStart = (e, payload) => {
        if (isReadOnly) return;
        e.dataTransfer.setData('payload', JSON.stringify(payload));
        // preload splash art so it's cached by the time the user drops
        if (payload.type === 'champion') {
            const img = new window.Image();
            img.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[payload.champKey]?.id}_0.jpg`;
        }
    };

    const handleDrop = (e, targetSide, targetIndex) => {
        e.preventDefault();
        if (isReadOnly) return;
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
                draggable={!isReadOnly && !!data}
                onDragStart={(e) => !isReadOnly && data && handleDragStart(e, { type: 'slot', side, index })}
                onClick={() => { if (!isReadOnly) { setCurrentSide(side); setCurrentSelection(index); } }}
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
                                <p className="font-black text-lg text-white uppercase tracking-tighter italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{data.name || data.id}</p>
                            </div>
                        )}
                        {!isReadOnly && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemove(side, index); }}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white/50 hover:text-white hover:bg-red-600/80 opacity-0 group-hover:opacity-100 transition-all z-10"
                            >
                                <X size={12} />
                            </button>
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

    if (isLoadingDraft) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-white text-2xl font-black italic tracking-widest animate-pulse">Loading Draft...</div>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 px-8 py-4 relative">
            


            <div className="max-w-[1600px] mx-auto grid grid-cols-8 gap-6 pt-12">
                
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
                    <div className="flex flex-col items-start gap-4">
                        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
                            Champion <span className="text-amber-400">Draft</span>
                        </h1>
                        <div className="relative flex items-center gap-8 border-b border-white/10 w-full justify-start min-h-[40px]">
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
                            
                            {/* Login on the right side of nav menu */}
                            <div className="absolute right-2 bottom-0 flex items-center pb-2">
                                {user ? (
                                    <div className="relative flex items-center h-full" onMouseLeave={() => setIsUserMenuOpen(false)}>
                                        <button 
                                            onMouseEnter={() => setIsUserMenuOpen(true)}
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center gap-2 text-xs font-black uppercase text-white/50 hover:text-white transition-colors tracking-[0.2em] cursor-pointer px-2 py-1 rounded-md hover:bg-white/5"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black">
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                            {user.email}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isUserMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute right-0 top-full w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 origin-top-right"
                                                >
                                                    <div className="p-2">
                                                        <button 
                                                            onClick={handleLogout} 
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                                                        >
                                                            <LogOut size={14} />
                                                            Logout
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors pb-1">
                                        <LogIn size={14} />
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar + Action Bar */}
                    <div className="flex items-center gap-3 w-full z-20 relative">
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
                        <div className="flex items-center h-14 px-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] shrink-0 relative">
                            {/* Reset & Download */}
                            {[
                                { icon: RotateCcw, label: 'Reset', onClick: resetDraft, color: 'text-red-400', hover: 'hover:bg-red-500/15 hover:border-red-500/30', hide: isReadOnly },
                                { icon: Download, label: 'Download', onClick: handleDownload, color: 'text-amber-400', hover: 'hover:bg-amber-500/15 hover:border-amber-500/30' },
                            ].filter(a => !a.hide).map(({ icon: Icon, label, onClick, color, hover }) => (
                                <div key={label} className="relative group/btn">
                                    <button onClick={onClick} className={`flex items-center justify-center w-9 h-9 rounded-xl border border-transparent transition-all duration-200 ${hover} ${color}`}>
                                        <Icon size={18} />
                                    </button>
                                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-800 border border-white/10 text-[10px] font-black text-white/70 uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-50">{label}</div>
                                </div>
                            ))}

                            {/* Divider */}
                            <div className="w-[1px] h-5 bg-white/10 mx-2" />

                            {/* Settings Dropdown */}
                            <div className="relative group/btn" onMouseLeave={() => setIsSettingsOpen(false)}>
                                <button
                                    onMouseEnter={() => setIsSettingsOpen(true)}
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-transparent transition-all duration-200 hover:bg-white/10 text-white/70 hover:text-white"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                <AnimatePresence>
                                    {isSettingsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 origin-top-right p-2 flex flex-col gap-1"
                                        >
                                            {/* Visibility Toggle */}
                                            {!isReadOnly && (
                                                <div className="px-2 py-2 mb-1 border-b border-white/10 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {isPublic ? <Globe size={14} className="text-emerald-400" /> : <Lock size={14} className="text-amber-400" />}
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                                                            {isPublic ? 'Public' : 'Private'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsPublic(!isPublic)}
                                                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                    >
                                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {[
                                                { icon: Save, label: 'Save Draft', onClick: handleSaveDraft, color: 'text-emerald-400', hover: 'hover:bg-emerald-500/10 hover:text-emerald-300', hide: isReadOnly },
                                                { icon: Link2, label: 'Copy Link', onClick: () => navigator.clipboard.writeText(window.location.href), color: 'text-purple-400', hover: 'hover:bg-purple-500/10 hover:text-purple-300' },
                                                { icon: Share2, label: 'Share', onClick: () => navigator.share?.({ title: 'Draft', url: window.location.href }), color: 'text-blue-400', hover: 'hover:bg-blue-500/10 hover:text-blue-300' },
                                            ].filter(a => !a.hide).map(({ icon: Icon, label, onClick, color, hover }) => (
                                                <button
                                                    key={label}
                                                    onClick={onClick}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold tracking-widest ${color} ${hover} rounded-lg transition-colors`}
                                                >
                                                    <Icon size={14} />
                                                    {label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden z-10">
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
                                                draggable={!isUnavailable && !isReadOnly}
                                                onDragStart={(e) => !isReadOnly && handleDragStart(e, { type: 'champion', champKey: key })}
                                                onClick={() => !isUnavailable && !isReadOnly && selectChamp(key)}
                                                className={`relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500
                                                    ${isUnavailable || isReadOnly ? 'cursor-not-allowed scale-95 border-transparent' : 'border-white/5 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:-translate-y-1'}`}
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

            {/* AUTH MODAL */}
            <AnimatePresence>
                {isAuthModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500" />
                            <button
                                onClick={() => setIsAuthModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase text-center mb-6">
                                {authMode === 'login' ? 'Welcome Back' : 'Join the Draft'}
                            </h2>
                            
                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400 transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                                
                                {authError && (
                                    <div className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-center">
                                        {authError}
                                    </div>
                                )}
                                
                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                                </button>
                            </form>
                            
                            <div className="relative py-6 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <span className="relative bg-slate-900 px-4 text-xs font-bold text-white/30 uppercase tracking-widest">Or</span>
                            </div>
                            
                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                            
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                        setAuthError('');
                                    }}
                                    className="text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
