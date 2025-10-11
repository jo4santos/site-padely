/**
 * Player Names Context - Manage custom player name mappings
 * Allows users to customize how player names are displayed throughout the app
 */

import { createContext, useContext, useState, useEffect } from 'react';

const PlayerNamesContext = createContext();

/**
 * Default player name mappings
 * Format: "Full API Name" -> "Preferred Display Name"
 */
const DEFAULT_MAPPINGS = {
    'A. Salazar Bengoechea': 'Ale Salazar',
    'M. Calvo Santamaria': 'Martina Calvo',
    'A. Sanchez Fallada': 'Ari Sanchez',
    'P. Josemaria Martin': 'Paulita',
    'A. Tapia': 'Agustin Tapia',
    'A. Coello': 'Arturo Coello',
    'L. Campagnolo': 'Lucas Campagnolo',
    'J. Garrido': 'Javi Garrido',
    'D. Brea Senesi': 'Delfi Brea',
    'G. Triay Pons': 'Gemma Triay',
    'E. Alonso': 'Edu Alonso',
    'J. Tello': 'Juan Tello',
    'F. Chingotto': 'Fede Chingotto',
    'A. Galan': 'Ale Galan',
    'A. Ustero Prieto': 'Andrea Ustero',
    'S. Araujo': 'Sofia Araújo',
    'J. Sanz': 'Jon Sanz',
    'F. Navarro': 'Paquito Navarro',
    'A. Osoro Ulrich': 'Osoro',
    'V. Iglesias Segador': 'Victor Iglesias',
    'M. Ortega Gallego': 'Marta Ortega',
    'T. Icardo Alcorisa': 'Tamara Icaro',
    'C. Fernandez Sanchez': 'Claudia Fernandez',
    'B. Gonzalez Fernandez': 'Bea Gonzalez',
    'A. Alonso De Villa': 'Alejandra Alonso',
    'C. Jensen': 'Claudia Jensen',
    'J. Leal': 'Javi Leal',
    'L. Bergamini': 'Luca Bergamini',
    'M. Arce Simo': 'Maxi Arce',
    'P. Lijo': 'Pablo Lijó',
    'J. De Pascual': 'Juani de Pascual',
    'M. Lamperti': 'Lamperti',
    'M. Di Nenno': 'Martin Di Nenno',
    'L. Roman Augsburguer': 'Leo Augsburguer',
    'V. Virseda Sanchez': 'Vera Virseda',
    'J. Gonzalez': 'Momo Gonzalez',
    'F. Guerrero': 'Fran Guerrero',
    'M. Deus': 'Miguel Deus',
    'N. Deus': 'Nuno Deus',
    'J. Lebron': 'Juan Lebron',
    'F. Stupaczuk': 'Franco Stupaczuk',
    'J. Nieto Ruiz': 'Coki Nieto',
    'M. Yanguas': 'Mike Yanguas',
    'M. Sanchez Aguero': 'Maxi Sanchez',
    'F. Gil Morales': 'Xisco Gil',
    'C. Goenaga Garcia': 'Carmen Goenaga',
    'B. Caldera Sanchez': 'Bea Caldera',
    'V. Libaak': 'Tino Libaak',
    'M. Guinart España': 'Marina Guinart',
};

const STORAGE_KEY = 'padely_player_name_mappings';

/**
 * Custom hook to use player names context
 */
export function usePlayerNames() {
    const context = useContext(PlayerNamesContext);
    if (!context) {
        throw new Error('usePlayerNames must be used within PlayerNamesProvider');
    }
    return context;
}

/**
 * Provider component for managing player name mappings
 */
export function PlayerNamesProvider({ children }) {
    const [mappings, setMappings] = useState(() => {
        // Load from localStorage or use defaults
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading player name mappings:', error);
        }
        return { ...DEFAULT_MAPPINGS };
    });

    // Persist to localStorage whenever mappings change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
        } catch (error) {
            console.error('Error saving player name mappings:', error);
        }
    }, [mappings]);

    /**
     * Transform a player name using the mappings
     * Preserves ranking numbers and qualifiers in parentheses
     * @param {string} name - Original name from API (e.g., "P. Josemaria Martin (2)" or "Player Name (Q)")
     * @returns {string} - Transformed name (e.g., "Paulita (2)" or "Display Name (Q)")
     */
    const transformPlayerName = (name) => {
        if (!name) return '';

        // Extract ranking/qualifier if present: "Name (2)" or "Name (Q)" -> ["Name", "(2)"] or ["Name", "(Q)"]
        const rankingMatch = name.match(/^(.+?)(\s*\([A-Z0-9]+\))?\s*$/);
        if (!rankingMatch) return name;

        const [, baseName, qualifier = ''] = rankingMatch;
        const cleanBase = baseName.trim();

        // Check if we have a mapping for this name
        const mapped = mappings[cleanBase];
        if (mapped) {
            return mapped + qualifier;
        }

        // No mapping found, return original
        return name;
    };

    /**
     * Add or update a player name mapping
     */
    const setMapping = (originalName, preferredName) => {
        setMappings(prev => ({
            ...prev,
            [originalName]: preferredName
        }));
    };

    /**
     * Remove a player name mapping
     */
    const removeMapping = (originalName) => {
        setMappings(prev => {
            const newMappings = { ...prev };
            delete newMappings[originalName];
            return newMappings;
        });
    };

    /**
     * Reset to default mappings
     */
    const resetToDefaults = () => {
        setMappings({ ...DEFAULT_MAPPINGS });
    };

    /**
     * Clear all mappings
     */
    const clearAll = () => {
        setMappings({});
    };

    const value = {
        mappings,
        transformPlayerName,
        setMapping,
        removeMapping,
        resetToDefaults,
        clearAll,
    };

    return (
        <PlayerNamesContext.Provider value={value}>
            {children}
        </PlayerNamesContext.Provider>
    );
}
