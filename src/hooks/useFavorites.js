import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'padely_favorites';
const FAVORITES_UPDATED_EVENT = 'padely_favorites_updated';

/**
 * Custom hook for managing tournament favorites in localStorage
 * Uses custom events to sync favorites across all components in realtime
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    });

    // Listen for favorites changes from other components
    useEffect(() => {
        const handleFavoritesUpdate = () => {
            try {
                const stored = localStorage.getItem(FAVORITES_KEY);
                setFavorites(stored ? JSON.parse(stored) : []);
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        };

        window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdate);
        return () => {
            window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdate);
        };
    }, []);

    const saveFavorites = (newFavorites) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            // Dispatch custom event to notify all components
            window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    const isFavorite = (tournamentId) => {
        return favorites.some(fav => fav.id === tournamentId);
    };

    const toggleFavorite = (tournament) => {
        const exists = favorites.some(fav => fav.id === tournament.id);
        let newFavorites;

        if (exists) {
            newFavorites = favorites.filter(fav => fav.id !== tournament.id);
        } else {
            newFavorites = [...favorites, tournament];
        }

        setFavorites(newFavorites);
        saveFavorites(newFavorites);
    };

    const getFavorites = () => favorites;

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        getFavorites
    };
}
