/**
 * API Service - Isolated layer for all API interactions
 * Base URL: https://padely.fredericosilva.net/
 */


const BASE_URL = 'https://padely.fredericosilva.net';





/**
 * Generic fetch wrapper with error handling (no proxy, direct fetch)
 */
async function fetchData(endpoint) {
    const fullUrl = `${BASE_URL}${endpoint}`;
    try {
        const response = await fetch(fullUrl, {
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error.message);
        throw new Error('Unable to fetch data.');
    }
}

/**
 * Get all tournaments
 * @returns {Promise<Array>} List of tournaments
 */
export async function getTournaments() {
    return fetchData('/events');
}

/**
 * Get matches for a specific tournament and day
 * @param {string} eventId - Tournament ID
 * @param {number} day - Day number
 * @returns {Promise<Array>} List of matches
 */
export async function getEventMatches(eventId, day) {
    return fetchData(`/event?id=${eventId}&day=${day}`);
}

/**
 * Get match statistics
 * @param {string} eventId - Event ID (numeric)
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} Match statistics
 */
export async function getMatchStats(eventId, matchId) {
    return fetchData(`/match_stats?eventId=${eventId}&matchId=${matchId}`);
}

/**
 * Get rankings by gender
 * @param {string} gender - 'men' or 'women'
 * @returns {Promise<Array>} List of ranked players
 */
export async function getRankings(gender = 'men') {
    return fetchData(`/ranking?gender=${gender}`);
}
