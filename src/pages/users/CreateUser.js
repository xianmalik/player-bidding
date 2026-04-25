'use client'

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { rankList, posList } from '../../lib/const';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, User, Star, MapPin, CheckCircle2 } from 'lucide-react';

export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: '',
    ign: '',
    rank: 'emerald',
    rankPeak: 'emerald',
    posPrimary: 'mid',
    posSecondary: 'top',
    isCaptain: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'players'), formData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating player:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#020617] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-black">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2"
          >
            Player <span className="text-indigo-500">Registration</span>
          </motion.h1>
          <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Join the Professional Circuit</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-slate-900/40 border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black tracking-widest text-indigo-400 uppercase flex items-center gap-2">
                    <User size={14} /> Identity
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Legal Name</label>
                      <Input 
                        placeholder="e.g. John Doe"
                        className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-indigo-500/20"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">In-Game Name (IGN)</label>
                      <Input 
                        placeholder="e.g. FAKER_123"
                        className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-indigo-500/20 font-black italic tracking-widest"
                        value={formData.ign}
                        onChange={(e) => updateField('ign', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Rank & Stats */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black tracking-widest text-indigo-400 uppercase flex items-center gap-2">
                    <Star size={14} /> Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Current Rank</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-sm font-bold text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={formData.rank}
                        onChange={(e) => updateField('rank', e.target.value)}
                      >
                        {rankList.map(r => <option key={r.value} value={r.value}>{r.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Peak Rank</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-sm font-bold text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={formData.rankPeak}
                        onChange={(e) => updateField('rankPeak', e.target.value)}
                      >
                        {rankList.map(r => <option key={r.value} value={r.value}>{r.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Positions */}
              <div className="space-y-6">
                <h3 className="text-xs font-black tracking-widest text-indigo-400 uppercase flex items-center gap-2">
                  <MapPin size={14} /> Positions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {posList.map(pos => (
                    <div 
                      key={pos.value}
                      onClick={() => updateField('posPrimary', pos.value)}
                      className={`cursor-pointer group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                        ${formData.posPrimary === pos.value ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                    >
                      <img src={pos.img} className={`w-8 h-8 ${formData.posPrimary === pos.value ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} alt={pos.name} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{pos.name}</span>
                      {formData.posPrimary === pos.value && (
                        <CheckCircle2 size={12} className="absolute top-2 right-2 text-indigo-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Captain & Submit */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-white/5">
                <div 
                  onClick={() => updateField('isCaptain', !formData.isCaptain)}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all
                    ${formData.isCaptain ? 'bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-white/10 bg-white/5 group-hover:border-white/20'}`}>
                    <Shield className={formData.isCaptain ? 'text-white' : 'text-slate-600'} />
                  </div>
                  <div>
                    <p className="text-sm font-black italic text-white uppercase">Team Captain Status</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enables drafting capabilities</p>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`h-16 px-12 rounded-2xl font-black italic tracking-[0.2em] uppercase text-lg transition-all
                    ${isSuccess ? 'bg-green-600 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20'}`}
                >
                  {isSubmitting ? 'Processing...' : isSuccess ? 'Registration Complete!' : 'Complete Registration'}
                </Button>
              </div>

            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
