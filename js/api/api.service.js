/**
 * API Service - Isolated layer for all API interactions
 * Base URL: https://fredericosilva.net:8081/
 */

const ApiService = (() => {
    const BASE_URL = 'https://fredericosilva.net:8081';

    // Use CORS proxy for local development to bypass CORS restrictions
    // Set to empty string when deploying to production if API adds CORS headers
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

    /**
     * Generic fetch wrapper with error handling
     */
    async function fetchData(endpoint) {
        try {
            // Encode the full URL to handle query parameters properly
            const fullUrl = `${BASE_URL}${endpoint}`;
            const encodedUrl = encodeURIComponent(fullUrl);
            const url = `${CORS_PROXY}${encodedUrl}`;

            console.log('Fetching from:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get all tournaments
     * @returns {Promise<Array>} List of tournaments
     */
    async function getTournaments() {
        return fetchData('/padely/events');
    }

    /**
     * Get matches for a specific tournament and day
     * @param {string} eventId - Tournament ID
     * @param {number} day - Day number
     * @returns {Promise<Array>} List of matches
     */
    async function getEventMatches(eventId, day) {
        return fetchData(`/padely/event?id=${eventId}&day=${day}`);
    }

    /**
     * Get match statistics
     * @param {string} eventId - Event ID (numeric)
     * @param {string} matchId - Match ID
     * @returns {Promise<Object>} Match statistics
     */
    async function getMatchStats(eventId, matchId) {
        return fetchData(`/padely/match_stats?eventId=${eventId}&matchId=${matchId}`);
    }

    /**
     * Get rankings by gender
     * @param {string} gender - 'men' or 'women'
     * @returns {Promise<Array>} List of ranked players
     */
    async function getRankings(gender = 'men') {
        return fetchData(`/padely/ranking?gender=${gender}`);
    }

    // Public API
    return {
        getTournaments,
        getEventMatches,
        getMatchStats,
        getRankings
    };
})();
