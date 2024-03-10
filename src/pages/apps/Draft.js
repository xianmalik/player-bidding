import React, { useState, useEffect } from 'react';
import { Input, Card, CardBody, Avatar } from '@nextui-org/react';
import axios from 'axios';

import { PATCH_NO } from '../../utils/const';

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // A function that increment 👆🏻 the previous state like here 
    // is better than directly setting `setValue(value + 1)`
}

export default function Draft() {
    const forceUpdate = useForceUpdate();
    const [champions, setChampions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSide, setCurrentSide] = useState('blue');
    const [currentSelection, setCurrentSelection] = useState({});
    const [selected, setSelected] = useState({
        blueBan: Array.from({ length: 5 }),
        redBan: Array.from({ length: 5 }),
        blue: Array.from({ length: 5 }),
        red: Array.from({ length: 5 })
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
    
    const selectChamp = (key) => {
        let newValue = selected;
        newValue[currentSide][currentSelection] = champions.data[key];
        setSelected(newValue);
        forceUpdate();
    }
    
    return (
        <div className="flex flex-col items-center py-12 px-4 min-h-screen bg-gray-900">
            <div className="grid grid-cols-4 gap-8 max-w-screen-2xl">
                <div className="h-full grid gap-0">
                    <div className="grid grid-cols-5 w-full gap-2">
                        {selected.blueBan.map((sel, index) => (
                            <Card
                                radius="none" shadow="none"
                                className="overflow-visible p-0 m-0 bg-transparent"
                                isPressable onPress={() => { setCurrentSide('blueBan'); setCurrentSelection(index); }}>
                                <div className={(currentSide === 'blueBan' && index === currentSelection) ? "ring-2 ring-red-500" : "opacity-75"}>
                                    <Avatar
                                        showFallback
                                        radius="none" size="lg"
                                        src={sel?.id ? `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${sel?.id || 'u'}.png` : "/avatars/avatar-1.png"}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="grid grid-rows grid-rows-5 gap-4">
                        {selected.blue.map((sel, index) => (
                            <Card
                                isPressable onPress={() => { setCurrentSide('blue'); setCurrentSelection(index); }}
                                className={`max-h-[120px] ${(currentSide === 'blue' && index === currentSelection) && "bg-gradient-to-r from-amber-500/20 to-transparent"} max-w-full bg-transparent border-amber-200/50 border-y-2 py-1 px-4 flex items-center justify-center`}
                                radius="none">
                                <CardBody className="grid items-center">
                                    <div className="flex gap-5 w-full">
                                        <Avatar isBordered radius="full" size="lg" src={sel?.id ? `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${sel?.id}.png` : "/avatars/avatar-1.png"} />
                                        <div className="flex flex-col gap-1 items-start justify-center">
                                            <h4 className="font-semibold leading-none text-lg text-amber-400">{sel?.name || "Picking..."}</h4>
                                            <h5 className="text-small tracking-tight text-amber-400 opacity-50">TOP</h5>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card> 
                            ))}
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="w-full">
                        <Input
                            radius="none"
                            size="md"
                            type="text"
                            placeholder="Search..."
                            className="mb-4 bg-transparent text-white"
                            classNames={{
                                inputWrapper: [
                                    "!bg-gray-700 hover:ring-2 focus:ring-2 ring-amber-200 acive:ring-2",
                                ],
                            }}
                            onValueChange={(value) => setSearchTerm(value)}
                        />
                    </div>
                    <div className="grid grid-cols-8 bg-gray-700 items-start justify-start p-2 min-w-full h-[536px] overflow-y-scroll">
                        {champions.data && Object.entries(champions.data).filter(([key, value]) => key.toLowerCase().includes(searchTerm.toLowerCase())).map(([key, champion]) => (
                            <Card
                                shadow="none" radius="none" key={champion.key}
                                className={`overflow-visible group bg-transparent p-2 ${[...selected.red, ...selected.blue, ...selected.redBan, ...selected.blueBan].includes(champion) && 'opacity-50 grayscale-0'}`}
                                isDisabled={!![...selected.red, ...selected.blue, ...selected.redBan, ...selected.blueBan].includes(champion)}
                                isPressable={![...selected.red, ...selected.blue, ...selected.redBan, ...selected.blueBan].includes(champion)}
                                onPress={() => selectChamp(key)}>
                                <CardBody className="text-amber-50 text-center p-0 overflow-visible">
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${champion.id}.png`}
                                        alt={champion.name}
                                        className="mx-auto mb-2 group-hover:ring-2 group-hover:ring-amber-200 h-full w-full"
                                    />
                                    <p className="text-[10px] tracking-tight">{champion.name}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="h-full grid">
                    <div className="grid grid-cols-5 w-full gap-2">
                        {selected.redBan.map((sel, index) => (
                            <Card
                                radius="none" shadow="none"
                                className="overflow-visible p-0 m-0 bg-transparent"
                                isPressable onPress={() => { setCurrentSide('redBan'); setCurrentSelection(index); }}>
                                <div className={(currentSide === 'redBan' && index === currentSelection) ? "ring-2 ring-red-500" : "opacity-75"}>
                                    <Avatar
                                        showFallback
                                        radius="none" size="lg"
                                        src={sel?.id ? `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${sel?.id || 'u'}.png` : "/avatars/avatar-1.png"}
                                    />
                                </div>
                            </Card>
                            ))}
                    </div>
                    <div className="grid grid-rows grid-rows-5 gap-4">
                        {selected.red.map((sel, index) => (
                            <Card
                                isPressable onPress={() => { setCurrentSide('red'); setCurrentSelection(index); }}
                                className={`max-h-[120px] ${(currentSide === 'red' && index === currentSelection) && "bg-gradient-to-l from-amber-500/20 to-transparent"} max-w-full bg-transparent border-amber-200/50 border-y-2 py-1 px-4 flex items-center justify-center`}
                                radius="none">
                                <CardBody className="grid items-center">
                                    <div className="flex flex-row-reverse justify-content-end gap-5 w-full">
                                        <Avatar isBordered radius="full" size="lg" src={sel?.id ? `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/img/champion/${sel?.id}.png` : "/avatars/avatar-1.png"} />
                                        <div className="flex flex-col gap-1 items-end justify-center">
                                            <h4 className="font-semibold leading-none text-lg text-amber-400">{sel?.name || "...Picking"}</h4>
                                            <h5 className="text-small tracking-tight text-amber-400 opacity-50">TOP</h5>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>     
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
