"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Copy, 
  Download, 
  Globe, 
  Lock, 
  Settings, 
  X, 
  Share2,
  Eye,
  EyeOff,
  Link as LinkIcon
} from "lucide-react";
import { useState } from "react";
import useDraftStore from "@/stores/draftStore";
import { toast } from "sonner";

export default function DraftSettingsModal({ isOpen, onClose, onDownload }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const { isPublic, setIsPublic, draftId, draftOwnerId, user } = useDraftStore();
  
  const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success("Draft link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleVisibility = () => {
    if (isReadOnly) return;
    setIsPublic(!isPublic);
    toast.success(`Draft is now ${!isPublic ? "Public" : "Private"}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 z-50" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all z-50"
              >
                <X size={20} />
              </button>

              <div className="p-8 pt-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    Draft Settings
                  </h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                    Manage your draft experience
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Visibility Toggle */}
                  {!isReadOnly && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                        Draft Visibility
                      </label>
                      <button
                        onClick={toggleVisibility}
                        className={`w-full group flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 ${
                          isPublic 
                            ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" 
                            : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl transition-all duration-300 ${
                            isPublic ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                          }`}>
                            {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-white uppercase tracking-tight">
                              {isPublic ? "Public Access" : "Private Draft"}
                            </p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                              {isPublic ? "Anyone with the link can view" : "Only you can see this draft"}
                            </p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${
                          isPublic ? "bg-emerald-500" : "bg-slate-700"
                        }`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            isPublic ? "translate-x-6" : "translate-x-0"
                          }`} />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Share Link - Only visible if public */}
                  {isPublic && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                        Share with others
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative flex items-center gap-2 p-2 pl-4 bg-black/40 border border-white/10 rounded-3xl group-focus-within:border-blue-500/50 transition-all">
                          <LinkIcon size={16} className="text-white/20" />
                          <input
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-mono text-white/60 truncate"
                          />
                          <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              linkCopied 
                                ? "bg-emerald-500 text-white" 
                                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                            }`}
                          >
                            {linkCopied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                            {linkCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Export Options */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <button
                      onClick={() => { onDownload(); onClose(); }}
                      className="w-full h-14 flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_20px_rgba(251,191,36,0.2)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Download size={18} strokeWidth={3} />
                      Export as Image
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
