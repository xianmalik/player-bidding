'use client'

import { motion } from 'framer-motion';
import { Sword, Gavel, Users, Trophy, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-40 pb-20 px-6">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px]">
                    <div className="absolute top-20 left-0 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-20 right-0 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-[1200px] mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">Version 2.0 Now Live</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-none"
                    >
                        Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Draft</span><br />
                        Rule the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Arena</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                    >
                        The ultimate esports management platform for professional drafting, player bidding, and roster optimization. Designed for captains, by champions.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/">
                            <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black italic tracking-widest uppercase text-lg rounded-2xl shadow-2xl shadow-blue-500/20">
                                Start Drafting <ChevronRight className="ml-2" />
                            </Button>
                        </Link>
                        <Link href="/bid">
                            <Button size="lg" variant="ghost" className="h-16 px-10 text-white border border-white/10 hover:bg-white/5 font-black italic tracking-widest uppercase text-lg rounded-2xl">
                                Enter Bidding
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-[1200px] mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Sword className="text-blue-500" />}
                        title="Pro Drafting"
                        description="Advanced pick/ban interface with real-time analytics and drag-and-drop champion selection."
                        delay={0.4}
                    />
                    <FeatureCard 
                        icon={<Gavel className="text-amber-500" />}
                        title="Live Bidding"
                        description="High-stakes auction system for player recruitment with dynamic pricing and bidding history."
                        delay={0.5}
                    />
                    <FeatureCard 
                        icon={<Users className="text-purple-500" />}
                        title="Roster Management"
                        description="Comprehensive player database with performance stats, rankings, and position tracking."
                        delay={0.6}
                    />
                </div>
            </div>

            {/* Visual Teaser */}
            <div className="max-w-[1400px] mx-auto px-6 py-20 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" 
                        alt="Esports Arena"
                        className="w-full h-[600px] object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-8 cursor-pointer hover:scale-110 transition-transform shadow-2xl shadow-blue-500/40">
                            <Play className="text-white fill-current ml-1" />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">The Future of Competitive Play</h2>
                        <p className="text-slate-400 font-medium max-w-xl">Experience the most fluid and powerful management suite ever built for competitive gaming ecosystems.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
        >
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-white mb-3">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
        </motion.div>
    );
}
