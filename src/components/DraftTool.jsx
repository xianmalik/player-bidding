'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, Ban, User, X, Command, Check, RotateCcw, Download, Share2, Link2, Save, LogIn, LogOut, MoreVertical, Globe, Lock, Pencil, Swords, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';

import Image from 'next/image';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PATCH_NO, posList } from '@/lib/const';

import { createClient } from '@/lib/supabaseClient';

import Header from '@/components/Header';

const emptyGame = () => ({
    blueBan: Array(5).fill(null),
    redBan: Array(5).fill(null),
    blue: Array(5).fill(null),
    red: Array(5).fill(null),
});

export default function DraftTool() {
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [draftId, setDraftId] = useState(null);
    const [draftOwnerId, setDraftOwnerId] = useState(null);

    const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);

    // Team Names State
    const [blueTeamName, setBlueTeamName] = useState('Blue Team');
    const [redTeamName, setRedTeamName] = useState('Red Team');
    const [isEditingBlue, setIsEditingBlue] = useState(false);
    const [isEditingRed, setIsEditingRed] = useState(false);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Action Bar State
    const [isPublic, setIsPublic] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const [champions, setChampions] = useState({});
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [currentSide, setCurrentSide] = useState('blue');
    const [currentSelection, setCurrentSelection] = useState(0);
    const [draftMode, setDraftMode] = useState('Draft');
    const searchInputRef = useRef(null);
    const pageRef = useRef(null);
    const blueRef = useRef(null);
    const redRef = useRef(null);

    // Series / Fearless state
    const [isFearless, setIsFearless] = useState(false);
    const [games, setGames] = useState([emptyGame()]);
    const [currentGameIndex, setCurrentGameIndex] = useState(0);

    // Derived: current game's picks/bans
    const selected = games[currentGameIndex] ?? emptyGame();

    // Derived: fearless bans = all picks from all previous games in this series
    const fearlessBans = isFearless
        ? games
            .slice(0, currentGameIndex)
            .flatMap(g => [...(g.blue ?? []), ...(g.red ?? [])])
            .filter(Boolean)
        : [];

    const canAddNextGame =
        selected.blue.some(Boolean) || selected.red.some(Boolean);

    // Update current game's state (mirrors the old setSelected API)
    const setCurrentGame = useCallback((updater) => {
        setGames(prev => {
            const next = [...prev];
            const cur = prev[currentGameIndex] ?? emptyGame();
            next[currentGameIndex] =
                typeof updater === 'function' ? updater(cur) : updater;
            return next;
        });
    }, [currentGameIndex]);

    const addNextGame = () => {
        setGames(prev => [...prev, emptyGame()]);
        setCurrentGameIndex(games.length); // games.length is the new index
    };

    useEffect(() => {
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

        if (!id) return;

        setIsLoadingDraft(true);
        setDraftId(id);

        const fetchDraft = async () => {
            try {
                const { data, error } = await supabase
                    .from('drafts')
                    .select('draft_data, user_id, is_public')
                    .eq('id', id)
                    .single();

                if (data?.draft_data) {
                    const dd = data.draft_data;
                    setDraftOwnerId(data.user_id);
                    setIsPublic(data.is_public);
                    if (dd.blueTeamName) setBlueTeamName(dd.blueTeamName);
                    if (dd.redTeamName) setRedTeamName(dd.redTeamName);

                    if (dd.games) {
                        // New series format
                        setGames(dd.games.map(g => ({
                            blueBan: g.blueBan ?? Array(5).fill(null),
                            redBan:  g.redBan  ?? Array(5).fill(null),
                            blue:    g.blue    ?? Array(5).fill(null),
                            red:     g.red     ?? Array(5).fill(null),
                        })));
                        setCurrentGameIndex(dd.currentGame ?? 0);
                        setIsFearless(dd.isFearless ?? false);
                    } else {
                        // Legacy single-game format
                        setGames([{
                            blueBan: dd.blueBan ?? Array(5).fill(null),
                            redBan:  dd.redBan  ?? Array(5).fill(null),
                            blue:    dd.blue    ?? Array(5).fill(null),
                            red:     dd.red     ?? Array(5).fill(null),
                        }]);
                    }
                } else if (error) {
                    console.error('Error fetching draft:', error);
                    toast.error('Draft not found or is private.');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingDraft(false);
            }
        };
        fetchDraft();
    }, [supabase]);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
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
                toast.success('Signup successful! Please check your email for verification.');
            }
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleSaveDraft = async () => {
        if (!user) {
            toast.error('Please log in with Google to save your draft.');
            return;
        }

        const stripChamp = (c) => c ? { id: c.id, key: c.key } : null;
        const minimalDraftData = {
            isFearless,
            blueTeamName,
            redTeamName,
            currentGame: currentGameIndex,
            games: games.map(g => ({
                blueBan: g.blueBan.map(stripChamp),
                redBan:  g.redBan.map(stripChamp),
                blue:    g.blue.map(stripChamp),
                red:     g.red.map(stripChamp),
            })),
        };
        const seriesName = `${blueTeamName} vs ${redTeamName}`;

        if (draftId && user.id === draftOwnerId) {
            const { error } = await supabase
                .from('drafts')
                .update({ draft_data: minimalDraftData, name: seriesName, is_public: isPublic })
                .eq('id', draftId);

            if (error) {
                console.error('Error updating draft:', error);
                toast.error('Failed to update draft.');
            } else {
                toast.success('Draft updated successfully!');
            }
        } else {
            const { data, error } = await supabase
                .from('drafts')
                .insert([{ user_id: user.id, draft_data: minimalDraftData, name: seriesName, is_public: isPublic }])
                .select()
                .single();

            if (error) {
                console.error('Error saving draft:', error);
                toast.error('Failed to save draft.');
            } else {
                setDraftId(data.id);
                setDraftOwnerId(user.id);
                window.history.pushState(null, '', `/?draft=${data.id}`);
                toast.success('Draft saved!');
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
            onclone: (clonedDoc) => {
                const header = clonedDoc.querySelector('header');
                if (header) header.style.display = 'none';
            }
        });

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

        const gamePart = isFearless ? `Game${currentGameIndex + 1}` : 'Draft';
        const fileName = `${blueTeamName.replace(/\s+/g, '_')}_vs_${redTeamName.replace(/\s+/g, '_')}_${gamePart}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = out.toDataURL('image/png');
        link.click();
    };

    const resetDraft = () => {
        setGames([emptyGame()]);
        setCurrentGameIndex(0);
        setIsFearless(false);
        setBlueTeamName('Blue Team');
        setRedTeamName('Red Team');
        setCurrentSide('blue');
        setCurrentSelection(0);
        setInputValue('');
        setSearchTerm('');
    };

    useEffect(() => {
        const id = setTimeout(() => setSearchTerm(inputValue), 200);
        return () => clearTimeout(id);
    }, [inputValue]);

    useEffect(() => {
        const fetchChampions = async () => {
            try {
                const response = await axios.get('/api/champions');
                setChampions(response.data);
            } catch (error) {
                console.error('Error fetching champions:', error);
            }
        };
        fetchChampions();

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

        setGames(prev => {
            const cur = prev[currentGameIndex] ?? emptyGame();
            const isAlreadySelected = Object.values(cur).flat().some(s => s?.id === champ.id);
            const isFearlessLocked = isFearless && prev
                .slice(0, currentGameIndex)
                .flatMap(g => [...(g.blue ?? []), ...(g.red ?? [])])
                .some(s => s?.id === champ.id);
            if (isAlreadySelected || isFearlessLocked) return prev;

            const next = [...prev];
            next[currentGameIndex] = { ...cur, [side]: [...cur[side]] };
            next[currentGameIndex][side][index] = champ;
            return next;
        });
    }, [champions, currentSide, currentSelection, currentGameIndex, isReadOnly, isFearless]);

    const handleRemove = (side, index) => {
        if (isReadOnly) return;
        setCurrentGame(prev => {
            const next = { ...prev, [side]: [...prev[side]] };
            next[side][index] = null;
            return next;
        });
    };

    const handleDragStart = (e, payload) => {
        if (isReadOnly) return;
        e.dataTransfer.setData('payload', JSON.stringify(payload));
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
            setCurrentGame(prev => {
                const next = { ...prev, [srcSide]: [...prev[srcSide]], [targetSide]: [...prev[targetSide]] };
                [next[targetSide][targetIndex], next[srcSide][srcIndex]] =
                    [next[srcSide][srcIndex], next[targetSide][targetIndex]];
                return next;
            });
        }
    };

    const filteredChampions = Object.entries(champions).filter(([_, champ]) => {
        const matchesSearch = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !selectedRole || champ.roles?.includes(selectedRole);
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
                draggable={!isReadOnly && !!data}
                onDragStart={(e) => !isReadOnly && data && handleDragStart(e, { type: 'slot', side, index })}
                onClick={() => { if (!isReadOnly) { setCurrentSide(side); setCurrentSelection(index); } }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, side, index)}
                className={`relative cursor-pointer overflow-hidden transition-all duration-300
                    ${isBan ? 'w-16 h-16 rounded-md' : 'h-32 w-full rounded-xl'}
                    ${isActive ? (isBlue ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]') : 'opacity-80'}
                    bg-gray-800/40 backdrop-blur-md border border-white/10 group`}
            >
                {data ? (
                    <div className="relative w-full h-full">
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
                            <div className={`absolute inset-0 bg-gradient-to-t ${isBlue ? 'from-blue-950/90 via-blue-900/20' : 'from-red-950/90 via-red-900/20'} to-transparent flex flex-col justify-end p-3 ${!isBlue ? 'items-end' : 'items-start'}`}>
                                <p className={`font-black text-lg text-white uppercase tracking-tighter italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${!isBlue ? 'text-right' : 'text-left'}`}>
                                    {data.name || data.id}
                                </p>
                            </div>
                        )}
                        {!isReadOnly && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemove(side, index); }}
                                className={`absolute top-1.5 ${isBlue ? 'right-1.5' : 'left-1.5'} p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-red-500 hover:border-red-400 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl`}
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full relative overflow-hidden">
                        {!isBan && (
                            <div className={`absolute inset-0 ${isBlue ? '[background:radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.12)_0%,transparent_70%)]' : '[background:radial-gradient(ellipse_at_bottom_right,rgba(239,68,68,0.12)_0%,transparent_70%)]'}`} />
                        )}
                        <div className="relative z-10 text-white opacity-10">
                            {isBan ? <Ban size={28} /> : <User size={32} />}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    // Per-slot fearless history: square avatars at half pick-slot height (h-16 = 64px)
    const SlotHistory = ({ side, index, align }) => {
        if (!isFearless || currentGameIndex === 0) return null;
        const history = games
            .slice(0, currentGameIndex)
            .map((g, gi) => ({ champ: (g[side] ?? [])[index], gameNum: gi + 1 }))
            .filter(({ champ }) => champ);
        if (history.length === 0) return null;

        return (
            <div className={`flex flex-col gap-1 items-center justify-center shrink-0 w-16 h-32 ${align === 'right' ? 'order-last' : 'order-first'}`}>
                {history.map(({ champ, gameNum }) => (
                    <div
                        key={gameNum}
                        title={`G${gameNum}: ${champ.id}`}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/25 shrink-0"
                    >
                        <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${champ.id}.png`}
                            alt={champ.id}
                            fill
                            className="object-cover grayscale opacity-50"
                        />
                        <div className="absolute inset-0 bg-amber-950/25" />
                        <span className="absolute bottom-0.5 right-1 text-[7px] font-black text-amber-400/80 leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                            G{gameNum}
                        </span>
                    </div>
                ))}
            </div>
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
        <div ref={pageRef} className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 relative">
            <Header
                user={user}
                onLogout={handleLogout}
                onLoginClick={() => setIsAuthModalOpen(true)}
                draftMode={draftMode}
                setDraftMode={setDraftMode}
            />

            <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 px-4 md:px-8 pb-12 items-stretch">

                {/* BLUE SIDE */}
                <div ref={blueRef} className="md:col-span-3 order-2 md:order-1 space-y-6 flex flex-col">
                    <div className="space-y-3 shrink-0">
                        {isEditingBlue && !isReadOnly ? (
                            <input
                                autoFocus
                                value={blueTeamName}
                                onChange={(e) => setBlueTeamName(e.target.value)}
                                onBlur={() => setIsEditingBlue(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingBlue(false)}
                                className="w-full bg-white/5 border-b border-blue-500 outline-none text-2xl font-black italic tracking-tighter text-blue-400 placeholder:text-blue-400/50 px-2 py-1 rounded-t-md"
                                placeholder="Blue Team"
                            />
                        ) : (
                            <div className="flex items-center group gap-2">
                                <h2 className="text-2xl font-black italic tracking-tighter text-blue-400">
                                    {blueTeamName}
                                </h2>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => setIsEditingBlue(true)}
                                        className="transition-opacity p-1 hover:bg-white/5 rounded-md text-blue-400/50 hover:text-blue-400"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                            </div>
                        )}
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

                    {/* PICKS — fearless history icon left of each slot */}
                    <div className="space-y-4 flex-1">
                        {[0,1,2].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <SlotHistory side="blue" index={i} align="left" />
                                <div className="flex-1"><Slot side="blue" index={i} /></div>
                            </div>
                        ))}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-blue-500/20" />
                            </div>
                        </div>
                        {[3,4].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <SlotHistory side="blue" index={i} align="left" />
                                <div className="flex-1"><Slot side="blue" index={i} /></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAMPION SELECTION */}
                <div className="md:col-span-6 order-1 md:order-2 flex flex-col gap-4">

                    {/* Game Tabs */}
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
                            {games.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentGameIndex(i)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                                        ${currentGameIndex === i
                                            ? 'bg-white/10 text-white shadow-sm'
                                            : 'text-white/30 hover:text-white/70'}`}
                                >
                                    G{i + 1}
                                </button>
                            ))}
                            {!isReadOnly && isFearless && games.length < 7 && (
                                <button
                                    onClick={addNextGame}
                                    disabled={!canAddNextGame}
                                    title={canAddNextGame ? `Add Game ${games.length + 1}` : 'Add picks before proceeding'}
                                    className="px-3 py-1.5 rounded-xl text-xs font-black text-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 transition-all disabled:cursor-not-allowed disabled:opacity-25"
                                >
                                    + G{games.length + 1}
                                </button>
                            )}
                        </div>

                        {!isReadOnly && (
                            <button
                                onClick={() => setIsFearless(f => !f)}
                                title={isFearless ? 'Fearless Draft ON — click to disable' : 'Enable Fearless Draft'}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all
                                    ${isFearless
                                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                        : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'}`}
                            >
                                <Swords size={13} />
                                Fearless
                            </button>
                        )}
                    </div>

                    {/* Search Bar + Action Bar */}
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
                                                onClick={() => { setInputValue(''); setSearchTerm(''); }}
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
                                    key={pos.value}
                                    onClick={() => setSelectedRole(selectedRole === pos.value ? null : pos.value)}
                                    title={pos.name}
                                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                                        ${selectedRole === pos.value
                                            ? 'bg-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                                            : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Image src={pos.img} alt={pos.name} width={22} height={22} className="object-contain" />
                                </button>
                            ))}
                        </div>

                        {/* ACTION BAR */}
                        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] shrink-0 relative w-full md:w-auto">
                            {!isReadOnly && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={resetDraft}
                                        className="w-10 h-10 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                                    >
                                        <RotateCcw size={18} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleSaveDraft}
                                        className="w-10 h-10 rounded-xl text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
                                    >
                                        <Save size={18} />
                                    </Button>
                                    <div className="w-[1px] h-5 bg-white/10 mx-1" />
                                </>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-10 h-10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <MoreVertical size={18} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 bg-slate-900/95 backdrop-blur-2xl border-white/10 p-2">
                                    <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all">
                                            <Download size={16} />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Download PNG</span>
                                    </DropdownMenuItem>

                                    {!isReadOnly && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                                            <DropdownMenuLabel className="text-[10px] text-white/20 px-3 py-1">Visibility</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => setIsPublic(!isPublic)}
                                                className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg transition-all ${isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                                                    </div>
                                                    <span className="font-bold text-xs uppercase tracking-widest">{isPublic ? 'Public' : 'Private'}</span>
                                                </div>
                                                <div className={`w-8 h-4 rounded-full transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-slate-700'} relative`}>
                                                    <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${isPublic ? 'left-4.5' : 'left-0.5'}`} />
                                                </div>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuSeparator className="bg-white/5 my-2" />

                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                            <Link2 size={16} />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Copy Link</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => navigator.share?.({ title: 'Draft', url: window.location.href })} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <Share2 size={16} />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Share Draft</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Champion pool */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden z-10 flex-1 flex flex-col max-h-[700px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <ScrollArea className="flex-1 w-full">
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 p-4">
                                <AnimatePresence mode='popLayout'>
                                    {filteredChampions.map(([key, champ]) => {
                                        const isBanned = [...selected.blueBan, ...selected.redBan].some(s => s?.id === champ.id);
                                        const isPicked = [...selected.blue, ...selected.red].some(s => s?.id === champ.id);
                                        const isFearlessBanned = fearlessBans.some(s => s?.id === champ.id);
                                        const isUnavailable = isBanned || isPicked || isFearlessBanned;

                                        return (
                                            <motion.div
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
                                                    <p className="text-[10px] font-black text-white italic tracking-widest w-full uppercase">{champ.name}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Proceed to next game button */}
                    {!isReadOnly && isFearless && canAddNextGame && games.length < 7 && currentGameIndex === games.length - 1 && (
                        <button
                            onClick={addNextGame}
                            className="w-full py-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-400 font-black text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Swords size={14} />
                            Proceed to Game {games.length + 1}
                            <ChevronRight size={14} />
                        </button>
                    )}

                </div>

                {/* RED SIDE */}
                <div ref={redRef} className="md:col-span-3 order-3 md:order-3 space-y-6 flex flex-col">
                    <div className="space-y-3 text-right shrink-0">
                        {isEditingRed && !isReadOnly ? (
                            <input
                                autoFocus
                                value={redTeamName}
                                onChange={(e) => setRedTeamName(e.target.value)}
                                onBlur={() => setIsEditingRed(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingRed(false)}
                                className="w-full bg-white/5 border-b border-red-500 outline-none text-2xl font-black italic tracking-tighter text-red-400 text-right placeholder:text-red-400/50 px-2 py-1 rounded-t-md"
                                placeholder="Red Team"
                            />
                        ) : (
                            <div className="flex items-center justify-end group gap-2">
                                {!isReadOnly && (
                                    <button
                                        onClick={() => setIsEditingRed(true)}
                                        className="transition-opacity p-1 hover:bg-white/5 rounded-md text-red-400/50 hover:text-red-400"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                                <h2 className="text-2xl font-black italic tracking-tighter text-red-400">
                                    {redTeamName}
                                </h2>
                            </div>
                        )}
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

                    {/* PICKS — fearless history icon right of each slot */}
                    <div className="space-y-4 flex-1">
                        {[0,1,2].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="flex-1"><Slot side="red" index={i} /></div>
                                <SlotHistory side="red" index={i} align="right" />
                            </div>
                        ))}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-red-500/20" />
                            </div>
                        </div>
                        {[3,4].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="flex-1"><Slot side="red" index={i} /></div>
                                <SlotHistory side="red" index={i} align="right" />
                            </div>
                        ))}
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
                                    <div className="w-full border-t border-white/10" />
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
