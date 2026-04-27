'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Sword, ChevronDown, User, Settings, Shield } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header({ 
    user, 
    onLogout, 
    onLoginClick, 
    draftMode, 
    setDraftMode 
}) {
    return (
        <header className="z-[100] py-2">
            <nav className="max-w-[1800px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
                {/* LOGO */}
                <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <Sword className="text-white w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter text-white uppercase">
                        Champion <span className="text-amber-400">Draft</span>
                    </h1>
                </div>

                {/* NAV & LOGIN */}
                <div className="flex items-center gap-3 lg:gap-8">
                    <div className="hidden sm:flex items-center">
                        <Menubar className="bg-transparent border-none shadow-none">
                            <MenubarMenu>
                                <MenubarTrigger 
                                    onClick={() => setDraftMode('Draft')}
                                    className={draftMode === 'Draft' ? 'text-amber-400' : 'text-white/30'}
                                >
                                    Draft
                                </MenubarTrigger>
                            </MenubarMenu>
                            <MenubarMenu>
                                <MenubarTrigger 
                                    disabled
                                    className="text-white/10"
                                >
                                    Fearless <span className="ml-1 text-[8px] normal-case tracking-normal opacity-50">(soon)</span>
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem disabled>
                                        Classic Fearless
                                    </MenubarItem>
                                    <MenubarItem disabled>
                                        Hardcore Fearless
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* USER MENU - Using Shadcn DropdownMenu */}
                    <div className="relative">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 text-xs font-black uppercase text-white/50 hover:text-white transition-colors tracking-[0.2em] cursor-pointer pl-2 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 outline-none">
                                        <Avatar className="w-6 h-6 border border-white/10">
                                            <AvatarFallback className="bg-amber-400 text-slate-900 font-black text-[10px]">
                                                {user.email?.[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                                        <ChevronDown size={14} className="opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Logged in as</p>
                                            <p className="text-xs font-black text-white truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User size={14} className="mr-2 opacity-70" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings size={14} className="mr-2 opacity-70" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Shield size={14} className="mr-2 opacity-70" />
                                        <span>My Drafts</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={onLogout}
                                        className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                    >
                                        <LogOut size={14} className="mr-2" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button 
                                variant="ghost" 
                                onClick={onLoginClick} 
                                className="h-auto px-0 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-transparent transition-colors flex items-center gap-2"
                            >
                                <LogIn size={16} />
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
