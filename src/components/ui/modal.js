'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    className = "",
    showCloseButton = true 
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                        onClick={onClose}
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                    >
                        <div 
                            className={`relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-visible ${className}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Floating Close Button */}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="absolute -top-4 -right-4 z-10 p-2.5 rounded-lg bg-slate-900/95 backdrop-blur-2xl border border-white/10 hover:bg-slate-800 text-white/50 hover:text-white transition-all shadow-lg"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            
                            {/* Header */}
                            {title && (
                                <div className="p-6 border-b border-white/5">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {title}
                                    </h2>
                                </div>
                            )}
                            
                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
