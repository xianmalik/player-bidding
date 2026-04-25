'use client'

import { useState, useEffect } from 'react';

import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import axios from 'axios';

import { PATCH_NO } from '@/lib/const';

export default function HomePage() {
    const [champions, setChampions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedChamp, setDraggedChamp] = useState(null);
    const [dragOverSlot, setDragOverSlot] = useState(null);
    const [selected, setSelected] = useState({
        blueBan: Array.from({ length: 5 }, () => null),
        redBan: Array.from({ length: 5 }, () => null),
        blue: Array.from({ length: 5 }, () => null),
        red: Array.from({ length: 5 }, () => null)
    });

    useEffect(() => {
        const fetchChampions = async () => {
            try {
                const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/data/en_US/champion.json`);
                setChampions(response.data);
            } catch (error) {
                console.error('Error fetching champions:', error);
            }
        };

        fetchChampions();
    }, []);

    const allSelected = [
        ...selected.blue,
        ...selected.red,
        ...selected.blueBan,
        ...selected.redBan
    ].filter(Boolean);

    const isSelected = (champion) => allSelected.some(c => c?.id === champion?.id);

    const champImageUrl = (id) =>
        `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${id}.png`;

    const handleDragStart = (e, champion) => {
        setDraggedChamp(champion);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e, side, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOverSlot(`${side}-${index}`);
    };

    const handleDragLeave = () => {
        setDragOverSlot(null);
    };

    const handleDrop = (e, side, index) => {
        e.preventDefault();
        setDragOverSlot(null);
        if (!draggedChamp || isSelected(draggedChamp)) return;

        setSelected(prev => {
            const updated = { ...prev, [side]: [...prev[side]] };
            updated[side][index] = draggedChamp;
            return updated;
        });
        setDraggedChamp(null);
    };

    const handleRemove = (side, index) => {
        setSelected(prev => {
            const updated = { ...prev, [side]: [...prev[side]] };
            updated[side][index] = null;
            return updated;
        });
    };

    const BanSlot = ({ side, index }) => {
        const sel = selected[side][index];
        const slotKey = `${side}-${index}`;
        const isOver = dragOverSlot === slotKey;

        return (
            <div
                onDragOver={(e) => handleDragOver(e, side, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, side, index)}
                onClick={() => sel && handleRemove(side, index)}
                title={sel ? `${sel.name} — click to remove` : 'Drop a champion here to ban'}
                className={`w-12 h-12 bg-gray-800 border-2 flex items-center justify-center transition-colors
                    ${isOver ? 'border-red-400 bg-red-900/30' : 'border-red-500/40'}
                    ${sel ? 'cursor-pointer hover:border-red-400' : 'cursor-default'}`}>
                {sel ? (
                    <img
                        src={champImageUrl(sel.id)}
                        alt={sel.name}
                        className="w-full h-full object-cover grayscale brightness-75"
                    />
                ) : (
                    <span className="text-red-500/40 text-[10px] font-bold">BAN</span>
                )}
            </div>
        );
    };

    const PickSlot = ({ side, index }) => {
        const sel = selected[side][index];
        const slotKey = `${side}-${index}`;
        const isOver = dragOverSlot === slotKey;
        const isBlue = side === 'blue';

        return (
            <div
                onDragOver={(e) => handleDragOver(e, side, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, side, index)}
                onClick={() => sel && handleRemove(side, index)}
                title={sel ? `${sel.name} — click to remove` : 'Drop a champion here to pick'}
                className={`max-h-[120px] border-y-2 py-1 px-4 flex items-center transition-colors
                    ${isOver ? 'bg-amber-500/20 border-amber-300' : 'border-amber-200/40 bg-transparent'}
                    ${sel ? 'cursor-pointer hover:border-amber-300' : 'cursor-default'}
                    ${isBlue ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-5 w-full ${!isBlue && 'flex-row-reverse'}`}>
                    <Avatar className="shrink-0">
                        {sel ? (
                            <AvatarImage src={champImageUrl(sel.id)} alt={sel.name} />
                        ) : (
                            <AvatarFallback className="bg-gray-700 text-amber-400/40 text-lg">?</AvatarFallback>
                        )}
                    </Avatar>
                    <div className={`flex flex-col gap-1 justify-center ${isBlue ? 'items-start' : 'items-end'}`}>
                        <h4 className="font-semibold leading-none text-lg text-amber-400">
                            {sel?.name || (isBlue ? 'Picking...' : '...Picking')}
                        </h4>
                    </div>
                </div>
            </div>
        );
    };

    const filteredChampions = champions.data
        ? Object.entries(champions.data).filter(([key]) =>
            key.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="flex flex-col items-center py-12 px-4 min-h-screen bg-gray-900">
            <div className="grid grid-cols-3 gap-8 w-full max-w-screen-xl">

                {/* Blue Side */}
                <div className="flex flex-col gap-4">
                    <p className="text-blue-400 font-bold text-center tracking-widest text-sm uppercase">Blue Side</p>

                    {/* Blue Bans */}
                    <div className="grid grid-cols-5 gap-2">
                        {selected.blueBan.map((_, index) => (
                            <BanSlot key={index} side="blueBan" index={index} />
                        ))}
                    </div>

                    {/* Blue Picks */}
                    <div className="flex flex-col gap-3">
                        {selected.blue.map((_, index) => (
                            <PickSlot key={index} side="blue" index={index} />
                        ))}
                    </div>
                </div>

                {/* Champion Picker */}
                <div className="flex flex-col">
                    <p className="text-amber-400 font-bold text-center tracking-widest text-sm uppercase mb-4">Champion Select</p>
                    <Input
                        type="text"
                        placeholder="Search champion..."
                        className="mb-3 bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="grid grid-cols-8 bg-gray-800 p-2 gap-1 overflow-y-auto"
                        style={{ height: '520px' }}>
                        {filteredChampions.map(([, champion]) => {
                            const taken = isSelected(champion);
                            return (
                                <div
                                    key={champion.key}
                                    draggable={!taken}
                                    onDragStart={(e) => handleDragStart(e, champion)}
                                    className={`flex flex-col items-center p-1 select-none transition-opacity
                                        ${taken
                                            ? 'opacity-35 grayscale cursor-not-allowed'
                                            : 'cursor-grab hover:ring-2 hover:ring-amber-300 hover:bg-gray-700 rounded'
                                        }`}>
                                    <img
                                        loading="lazy"
                                        alt={champion.name}
                                        src={champImageUrl(champion.id)}
                                        draggable={false}
                                        className="w-full h-auto mb-0.5"
                                    />
                                    <p className="text-amber-50 text-[9px] tracking-tight text-center leading-tight">
                                        {champion.name}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-gray-500 text-xs text-center mt-2">
                        Drag champions into pick/ban slots &bull; Click a slot to remove
                    </p>
                </div>

                {/* Red Side */}
                <div className="flex flex-col gap-4">
                    <p className="text-red-400 font-bold text-center tracking-widest text-sm uppercase">Red Side</p>

                    {/* Red Bans */}
                    <div className="grid grid-cols-5 gap-2">
                        {selected.redBan.map((_, index) => (
                            <BanSlot key={index} side="redBan" index={index} />
                        ))}
                    </div>

                    {/* Red Picks */}
                    <div className="flex flex-col gap-3">
                        {selected.red.map((_, index) => (
                            <PickSlot key={index} side="red" index={index} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
