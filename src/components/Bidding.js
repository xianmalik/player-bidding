'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gavel, TrendingUp, Users, Shield, Zap, DollarSign } from 'lucide-react';
import { getPlayers } from '../lib/db';

export default function Bidding() {
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(100);
  const [bidValue, setBidValue] = useState(110);
  const [bidHistory, setBidHistory] = useState([
    { id: 1, user: 'CaptainX', amount: 100, time: '2 mins ago' },
    { id: 2, user: 'ProGamer', amount: 80, time: '5 mins ago' },
  ]);

  useEffect(() => {
    getPlayers().then(data => {
      if (data && data.length > 0) {
        setPlayers(data);
      }
    });
  }, []);

  const currentPlayer = players[currentIndex];

  const handleBid = (amount) => {
    const newBid = Number(amount);
    if (newBid > currentBid) {
      setBidValue(newBid + 10);
      setCurrentBid(newBid);
      setBidHistory(prev => [{
        id: Date.now(),
        user: 'You',
        amount: newBid,
        time: 'Just now'
      }, ...prev.slice(0, 4)]);
    }
  };

  const nextPlayer = () => {
    setCurrentIndex((prev) => (prev + 1) % players.length);
    setCurrentBid(100);
    setBidValue(110);
    setBidHistory([]);
  };

  if (!currentPlayer && players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-pulse text-blue-500 font-black tracking-widest italic text-2xl">LOADING ROSTER...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#020617] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Player Card */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlayer?.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-3xl blur opacity-25" />
              <Card className="relative bg-slate-900/90 border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <Avatar className="h-40 w-40 border-4 border-blue-500/50 shadow-2xl">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentPlayer?.ign || 'player'}`} />
                      <AvatarFallback className="bg-slate-800 text-3xl font-black">{currentPlayer?.ign?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
                      RANK S
                    </div>
                  </div>

                  <h2 className="text-4xl font-black italic tracking-tighter text-white mb-1 uppercase">
                    {currentPlayer?.ign || "UNKNOWN PLAYER"}
                  </h2>
                  <p className="text-blue-400 font-bold tracking-widest text-sm mb-8">
                    {currentPlayer?.rank?.toUpperCase() || "EMERALD"} • {currentPlayer?.role || "FLEX"}
                  </p>

                  <div className="grid grid-cols-3 gap-4 w-full mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold">AGGRO</p>
                      <p className="text-white font-black">92</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <Shield className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold">DEF</p>
                      <p className="text-white font-black">88</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold">CONS</p>
                      <p className="text-white font-black">95</p>
                    </div>
                  </div>

                  <Button 
                    onClick={nextPlayer}
                    variant="ghost" 
                    className="w-full text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 font-bold tracking-widest uppercase py-6"
                  >
                    SKIP TO NEXT PLAYER
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Bidding Interface */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <Card className="bg-slate-900/50 border-white/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Gavel size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <DollarSign className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-slate-400 font-bold tracking-widest text-xs uppercase">Current Bid Price</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white italic">${currentBid}</span>
                    <span className="text-amber-500 font-bold text-sm tracking-widest">USD</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-4 text-xs font-black tracking-widest text-slate-400 uppercase">
                    <span>Quick Bid Increments</span>
                    <span className="text-blue-400">Next Bid: ${bidValue}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[10, 50, 100].map(val => (
                      <Button
                        key={val}
                        onClick={() => handleBid(currentBid + val)}
                        className="bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-400 py-8 text-lg font-black italic transition-all group"
                      >
                        <span className="group-hover:scale-110 transition-transform">+{val}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="relative pt-4">
                  <input
                    type="range"
                    min={currentBid + 10}
                    max={2000}
                    step={10}
                    value={bidValue}
                    onChange={(e) => setBidValue(Number(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-[10px] font-black text-slate-600">$MIN</span>
                    <div className="px-6 py-2 bg-blue-600 rounded-xl text-white font-black italic shadow-lg shadow-blue-500/30">
                      SELECTED: ${bidValue}
                    </div>
                    <span className="text-[10px] font-black text-slate-600">$MAX</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleBid(bidValue)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black italic tracking-widest text-xl py-10 rounded-2xl shadow-xl shadow-blue-500/20 uppercase"
                >
                  Place Confirmed Bid
                </Button>
              </div>
            </div>
          </Card>

          {/* Bid History */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase flex items-center gap-2">
              <Users size={14} /> LIVE BIDDING HISTORY
            </h4>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {bidHistory.map((bid) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[10px] bg-slate-800">{bid.user[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{bid.user}</p>
                        <p className="text-[10px] text-slate-500">{bid.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black italic text-blue-400">${bid.amount}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
