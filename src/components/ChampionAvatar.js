'use client'

import React, { useState, useEffect } from 'react';
import useChampionStore from '../stores/championStore';

export default function ChampionAvatar({ 
    championName, 
    size = 'small', 
    className = "",
    showTooltip = false 
}) {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const { champions, getChampionImageUrl, isLoading: isStoreLoading } = useChampionStore();

    // Size configurations
    const sizeConfig = {
        tiny: 'w-6 h-6',
        small: 'w-8 h-8',
        medium: 'w-10 h-10',
        large: 'w-12 h-12'
    };

    useEffect(() => {
        let mounted = true;
        
        const loadImage = () => {
            if (!championName) return;
            
            // Get image URL directly from store
            const url = getChampionImageUrl(championName);
            
            if (mounted) {
                if (url) {
                    setImageUrl(url);
                    setIsLoading(false);
                    setHasError(false);
                } else {
                    // Handle case where champion not found or data not loaded
                    if (champions) {
                        setHasError(true);
                        setIsLoading(false);
                    } else {
                        // Still loading champion data
                        setIsLoading(true);
                    }
                }
            }
        };

        loadImage();

        return () => {
            mounted = false;
        };
    }, [championName, champions, getChampionImageUrl]);

    const handleImageError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div 
                className={`${sizeConfig[size]} bg-slate-700 rounded-lg flex items-center justify-center ${className}`}
                title={championName}
            >
                <div className="w-3 h-3 bg-slate-600 rounded-full animate-pulse"></div>
            </div>
        );
    }

    if (hasError || !imageUrl) {
        return (
            <div 
                className={`${sizeConfig[size]} bg-slate-700 rounded-lg flex items-center justify-center ${className}`}
                title={championName}
            >
                <span className="text-slate-400 text-xs font-bold">?</span>
            </div>
        );
    }

    return (
        <div className={`relative aspect-square ${className}`}>
            <img
                src={imageUrl}
                alt={championName}
                className={`w-full h-full rounded-lg object-cover border border-white/10 ${showTooltip ? 'cursor-pointer' : ''}`}
                title={showTooltip ? championName : undefined}
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
}
