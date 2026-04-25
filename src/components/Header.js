'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Gavel, Sword, Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Draft', href: '/', icon: Sword },
  { name: 'Bidding', href: '/bid', icon: Gavel },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  // Note: usePathname might not work if this is rendered via React Router in index.js, 
  // but I'll stick to a modern implementation that works for both if possible.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">
      <nav className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sword className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black italic tracking-tighter text-white">
              ARENA<span className="text-blue-500">PRO</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-bold tracking-widest uppercase transition-colors
                    ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon size={16} />
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-300">SERVER ONLINE</span>
          </button>
          
          <button 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-bold tracking-widest uppercase text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { AnimatePresence } from 'framer-motion';
