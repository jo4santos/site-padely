/**
 * API Service - Isolated layer for all API interactions
 * Base URL: http://fredericosilva.net:8081/
 */

const BASE_URL = 'http://fredericosilva.net:8081';

// Multiple CORS proxy options with fallback
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/'
];

let currentProxyIndex = 0;

/**
 * Generic fetch wrapper with error handling and proxy fallback
 */
async function fetchData(endpoint) {
    const fullUrl = `${BASE_URL}${endpoint}`;

    // Try each proxy until one works
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length;
        const proxy = CORS_PROXIES[proxyIndex];

        try {
            const url = `${proxy}${encodeURIComponent(fullUrl)}`;
            console.log(`Attempting fetch with proxy ${proxyIndex + 1}:`, url);

            const response = await fetch(url, {
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // If successful, remember this proxy for next time
            currentProxyIndex = proxyIndex;
            console.log(`✓ Success with proxy ${proxyIndex + 1}`);

            return data;
        } catch (error) {
            console.warn(`✗ Proxy ${proxyIndex + 1} failed:`, error.message);

            // If this was the last proxy, throw the error
            if (i === CORS_PROXIES.length - 1) {
                console.error('All CORS proxies failed');
                throw new Error('Unable to fetch data. All CORS proxies failed.');
            }
            // Otherwise, try the next proxy
        }
    }
}

/**
 * Get all tournaments
 * @returns {Promise<Array>} List of tournaments
 */
export async function getTournaments() {
    return fetchData('/padely/events');
}

/**
 * Get matches for a specific tournament and day
 * @param {string} eventId - Tournament ID
 * @param {number} day - Day number
 * @returns {Promise<Array>} List of matches
 */
export async function getEventMatches(eventId, day) {
    return fetchData(`/padely/event?id=${eventId}&day=${day}`);
}

/**
 * Get match statistics
 * @param {string} eventId - Event ID (numeric)
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} Match statistics
 */
export async function getMatchStats(eventId, matchId) {
    return fetchData(`/padely/match_stats?eventId=${eventId}&matchId=${matchId}`);
}

/**
 * Get rankings by gender
 * @param {string} gender - 'men' or 'women'
 * @returns {Promise<Array>} List of ranked players
 */
export async function getRankings(gender = 'men') {
    return fetchData(`/padely/ranking?gender=${gender}`);
}
