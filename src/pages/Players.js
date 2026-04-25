'use client'

import { useEffect, useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Shield, Trophy, Target, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const playersCollectionRef = collection(db, 'players');

  const createPlayer = async () => {
    // Basic placeholder for creating a player
    const name = prompt("Enter Player IGN:");
    if (!name) return;
    await addDoc(playersCollectionRef, { ign: name, name: name, isCaptain: false, rank: "emerald" });
    fetchPlayers();
  }

  const fetchPlayers = async () => {
    const data = await getDocs(playersCollectionRef);
    setPlayers(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(p => 
    p.ign?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#020617] text-slate-200">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">
              Player <span className="text-blue-500">Roster</span>
            </h1>
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">
              Managing {players.length} Registered Competitors
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input 
                placeholder="SEARCH PLAYERS..." 
                className="pl-12 bg-white/5 border-white/10 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={createPlayer}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black italic tracking-widest uppercase px-6"
            >
              <UserPlus className="mr-2" size={18} /> Register
            </Button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative bg-slate-900/40 border-white/10 p-6 rounded-2xl backdrop-blur-md hover:bg-slate-800/60 transition-all hover:border-blue-500/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-slate-700 group-hover:border-blue-500 transition-colors">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.ign}`} />
                        <AvatarFallback>{player.ign?.[0]}</AvatarFallback>
                      </Avatar>
                      {player.isCaptain && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 shadow-lg">
                          <Trophy size={10} className="text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black italic text-lg text-white uppercase truncate w-32">
                        {player.ign}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                        {player.rank || 'Unranked'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Position</p>
                      <p className="text-xs font-bold text-blue-400">MID/TOP</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Win Rate</p>
                      <p className="text-xs font-bold text-green-400">58%</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1 h-8 text-[10px] font-black tracking-widest uppercase hover:bg-white/5">
                      PROFILE
                    </Button>
                    <Button variant="ghost" className="flex-1 h-8 text-[10px] font-black tracking-widest uppercase hover:bg-blue-500/10 hover:text-blue-400">
                      EDIT
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="py-40 text-center">
            <Users className="mx-auto text-slate-800 mb-4" size={64} />
            <h3 className="text-xl font-black italic text-slate-700 uppercase">No Players Found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search or register a new player.</p>
          </div>
        )}
      </div>
    </div>
  );
}
