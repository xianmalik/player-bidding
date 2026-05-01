"use client";

import { ChevronDown, LogIn, LogOut, Plus, Settings, Shield, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MyDraftsModal from "./MyDraftsModal";

export default function Header({ user, onLogout, onLoginClick, avatarUrl }) {
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  return (
    <>
      <header className="z-[100] py-2">
        <nav className="max-w-[1800px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-2 lg:gap-3">
            <Image
              src="/assets/img/arena-draft-logo.png"
              alt="ArenaDraft"
              width={64}
              height={64}
              className="w-12 h-12 lg:w-16 lg:h-16 shrink-0"
            />
            <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter text-white uppercase">
              Arena <span className="text-amber-400">Draft</span>
            </h1>
          </div>

          {/* NAV & LOGIN */}
          <div className="flex items-center gap-3 lg:gap-8">
            {/* NEW DRAFT BUTTON */}
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Plus size={16} strokeWidth={3} />
              New Draft
            </Button>

            {/* USER MENU - Using Shadcn DropdownMenu */}
            <div className="relative">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 px-2 gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all outline-none"
                    >
                      <Avatar className="w-7 h-7 border border-white/10">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                        <AvatarFallback className="bg-amber-400 text-slate-900 font-black text-[10px]">
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">
                        {user.email?.split("@")[0]}
                      </span>
                      <ChevronDown size={14} className="opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 mt-2 bg-slate-900/95 backdrop-blur-2xl border-white/10 p-2"
                  >
                    <DropdownMenuLabel className="px-3 py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                          Logged in as
                        </p>
                        <p className="text-xs font-black text-white truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5 my-2" />

                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/profile")}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <User size={16} />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest">Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setIsDraftsModalOpen(true)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all">
                        <Shield size={16} />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest">My Drafts</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5 my-2" />

                    <DropdownMenuItem
                      onClick={onLogout}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <LogOut size={16} />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest text-red-400 group-hover:text-red-300">
                        Logout
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  onClick={onLoginClick}
                  className="h-9 px-4 text-xs font-black uppercase tracking-[0.2em] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                >
                  <LogIn size={16} />
                  Login
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* My Drafts Modal */}
      <MyDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        user={user}
      />
    </>
  );
}
