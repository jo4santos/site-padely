/**
 * Announcement Service - Generate match announcements using OpenAI
 */

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Generate announcement text based on match state
 * @param {Object} match - Match object
 * @param {string} announcementType - Type of announcement
 * @param {Object} previousState - Previous match state for comparison
 * @returns {Promise<string>} Generated announcement text
 */
export async function generateAnnouncement(match, announcementType, previousState = null) {
    const team1Names = getTeamNames(match.team1);
    const team2Names = getTeamNames(match.team2);

    let prompt = '';

    switch (announcementType) {
        case 'MATCH_START':
            prompt = `Announce that the match between ${team1Names} and ${team2Names} is starting. Keep it under 10 words, no commentary.`;
            break;

        case 'GAME_WON':
            prompt = generateGameWonPrompt(match, team1Names, team2Names, previousState);
            break;

        case 'SET_WON':
            prompt = generateSetWonPrompt(match, team1Names, team2Names, previousState);
            break;

        case 'TIEBREAK_POINT':
            prompt = generateTiebreakPrompt(match, team1Names, team2Names);
            break;

        case 'MATCH_END':
            prompt = generateMatchEndPrompt(match, team1Names, team2Names);
            break;

        default:
            return '';
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a concise sports announcer. State only the facts: teams, scores, and who won. No commentary, no adjectives, no excitement. Just the information.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.3
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating announcement:', error);
        return getFallbackAnnouncement(announcementType, match, team1Names, team2Names, previousState);
    }
}

/**
 * Clean player name by removing ranking numbers like (8)
 */
function cleanPlayerName(name) {
    if (!name) return '';
    // Remove ranking numbers in parentheses, e.g., "V. Virseda Sanchez (8)" -> "V. Virseda Sanchez"
    return name.replace(/\s*\(\d+\)\s*$/, '').trim();
}

/**
 * Extract country code from flag URL
 * @param {string} flagUrl - URL like "https://widget.matchscorerlive.com/images/flags/ESP.jpg"
 * @returns {string} Country code like "ESP" or null
 */
function getCountryFromFlag(flagUrl) {
    if (!flagUrl) return null;
    const match = flagUrl.match(/\/([A-Z]{2,3})\.jpg$/i);
    return match ? match[1].toUpperCase() : null;
}

/**
 * Map country code to preferred language/voice
 * @param {string} countryCode - Country code like "ESP", "ARG", "ITA"
 * @returns {string} Language code for voice selection
 */
function getLanguageForCountry(countryCode) {
    const countryToLanguage = {
        'ESP': 'es-ES',    // Spain - Spanish
        'ARG': 'es-AR',    // Argentina - Spanish (Argentine)
        'MEX': 'es-MX',    // Mexico - Spanish (Mexican)
        'ITA': 'it-IT',    // Italy - Italian
        'FRA': 'fr-FR',    // France - French
        'POR': 'pt-PT',    // Portugal - Portuguese
        'BRA': 'pt-BR',    // Brazil - Portuguese (Brazilian)
        'GER': 'de-DE',    // Germany - German
        'SWE': 'sv-SE',    // Sweden - Swedish
        'NED': 'nl-NL',    // Netherlands - Dutch
        'BEL': 'nl-BE',    // Belgium - Dutch/French
        'USA': 'en-US',    // USA - English
        'GBR': 'en-GB',    // UK - English
        'AUS': 'en-AU',    // Australia - English
    };
    
    return countryToLanguage[countryCode] || 'en-US';
}

/**
 * Get the most common language from a match's players
 * @param {Object} match - Match object with team1 and team2
 * @returns {string} Language code for voice selection
 */
function getMatchLanguage(match) {
    const countries = [];
    
    // Collect all player countries
    if (match.team1?.player1?.flag) countries.push(getCountryFromFlag(match.team1.player1.flag));
    if (match.team1?.player2?.flag) countries.push(getCountryFromFlag(match.team1.player2.flag));
    if (match.team2?.player1?.flag) countries.push(getCountryFromFlag(match.team2.player1.flag));
    if (match.team2?.player2?.flag) countries.push(getCountryFromFlag(match.team2.player2.flag));
    
    // Filter out nulls
    const validCountries = countries.filter(c => c !== null);
    
    if (validCountries.length === 0) return 'en-US';
    
    // Count occurrences of each language
    const languageCounts = {};
    validCountries.forEach(country => {
        const lang = getLanguageForCountry(country);
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
    
    // Return the most common language, or Spanish if there's a tie (padel is Spanish sport)
    const sortedLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // If Spanish is among the top languages, prefer it
    const hasSpanish = sortedLanguages.some(([lang]) => lang.startsWith('es'));
    if (hasSpanish) {
        const spanishLang = sortedLanguages.find(([lang]) => lang.startsWith('es'));
        return spanishLang[0];
    }
    
    return sortedLanguages[0][0];
}

/**
 * Get team names as a readable string
 */
function getTeamNames(team) {
    if (!team?.player1) return '';
    const player1Name = cleanPlayerName(team.player1.name);
    const player2Name = team.player2 ? cleanPlayerName(team.player2.name) : '';
    return player2Name ? `${player1Name} / ${player2Name}` : player1Name;
}

/**
 * Generate prompt for game won announcement
 */
function generateGameWonPrompt(match, team1Names, team2Names, previousState) {
    const currentSet = getCurrentSet(match);
    const team1Games = match.team1[`set${currentSet}`] || 0;
    const team2Games = match.team2[`set${currentSet}`] || 0;

    if (team1Games === team2Games) {
        return `State that the score in set ${currentSet} is ${team1Games} all. Maximum 8 words.`;
    } else if (team1Games > team2Games) {
        return `State that ${team1Names} lead ${team1Games}-${team2Games} in set ${currentSet}. Maximum 10 words.`;
    } else {
        return `State that ${team2Names} lead ${team2Games}-${team1Games} in set ${currentSet}. Maximum 10 words.`;
    }
}

/**
 * Generate prompt for set won announcement
 */
function generateSetWonPrompt(match, team1Names, team2Names, previousState) {
    const setNumber = getCurrentSet(match) - 1; // Previous set that was just won
    const team1Score = match.team1[`set${setNumber}`] || 0;
    const team2Score = match.team2[`set${setNumber}`] || 0;
    const winner = team1Score > team2Score ? team1Names : team2Names;
    const score = team1Score > team2Score ? `${team1Score}-${team2Score}` : `${team2Score}-${team1Score}`;

    return `State that ${winner} won set ${setNumber}, ${score}. Maximum 8 words.`;
}

/**
 * Generate prompt for tiebreak point
 */
function generateTiebreakPrompt(match, team1Names, team2Names) {
    // Points in tiebreak are stored in the 'points' field
    const team1Points = match.team1.points || '0';
    const team2Points = match.team2.points || '0';

    return `State the tiebreak score: ${team1Names} ${team1Points}, ${team2Names} ${team2Points}. Maximum 8 words.`;
}

/**
 * Generate prompt for match end
 */
function generateMatchEndPrompt(match, team1Names, team2Names) {
    const winner = match.team1.isWinner ? team1Names : team2Names;
    const loser = match.team1.isWinner ? team2Names : team1Names;
    const isTeam1Winner = match.team1.isWinner;
    
    // Build score from winner's perspective (winner's score first)
    const sets = [];
    for (let i = 1; i <= 3; i++) {
        const team1Score = match.team1[`set${i}`];
        const team2Score = match.team2[`set${i}`];
        if (team1Score !== undefined && team1Score !== '') {
            // Put winner's score first in each set
            if (isTeam1Winner) {
                sets.push(`${team1Score}-${team2Score}`);
            } else {
                sets.push(`${team2Score}-${team1Score}`);
            }
        }
    }
    const finalScore = sets.join(', ');

    return `State that ${winner} defeated ${loser}, ${finalScore}. Maximum 10 words.`;
}

/**
 * Get current set number
 */
function getCurrentSet(match) {
    if (match.team1.set3 !== undefined && match.team1.set3 !== '') return 3;
    if (match.team1.set2 !== undefined && match.team1.set2 !== '') return 2;
    return 1;
}

/**
 * Fallback announcements when OpenAI is unavailable
 */
function getFallbackAnnouncement(type, match, team1Names, team2Names, previousState) {
    switch (type) {
        case 'MATCH_START':
            return `${team1Names} versus ${team2Names}`;

        case 'GAME_WON': {
            const currentSet = getCurrentSet(match);
            const team1Games = match.team1[`set${currentSet}`] || 0;
            const team2Games = match.team2[`set${currentSet}`] || 0;

            if (team1Games === team2Games) {
                return `${team1Games} all, set ${currentSet}`;
            } else if (team1Games > team2Games) {
                return `${team1Names} lead ${team1Games}-${team2Games}, set ${currentSet}`;
            } else {
                return `${team2Names} lead ${team2Games}-${team1Games}, set ${currentSet}`;
            }
        }

        case 'SET_WON': {
            const setNumber = getCurrentSet(match) - 1;
            const team1Score = match.team1[`set${setNumber}`] || 0;
            const team2Score = match.team2[`set${setNumber}`] || 0;
            const winner = team1Score > team2Score ? team1Names : team2Names;
            const score = team1Score > team2Score ? `${team1Score}-${team2Score}` : `${team2Score}-${team1Score}`;
            return `${winner} win set ${setNumber}, ${score}`;
        }

        case 'TIEBREAK_POINT': {
            const team1Points = match.team1.points || '0';
            const team2Points = match.team2.points || '0';
            return `Tiebreak: ${team1Names} ${team1Points}, ${team2Names} ${team2Points}`;
        }

        case 'MATCH_END': {
            const winner = match.team1.isWinner ? team1Names : team2Names;
            const loser = match.team1.isWinner ? team2Names : team1Names;
            const isTeam1Winner = match.team1.isWinner;
            
            // Build score from winner's perspective (winner's score first)
            const sets = [];
            for (let i = 1; i <= 3; i++) {
                const team1Score = match.team1[`set${i}`];
                const team2Score = match.team2[`set${i}`];
                if (team1Score !== undefined && team1Score !== '') {
                    // Put winner's score first in each set
                    if (isTeam1Winner) {
                        sets.push(`${team1Score}-${team2Score}`);
                    } else {
                        sets.push(`${team2Score}-${team1Score}`);
                    }
                }
            }
            const finalScore = sets.join(', ');
            return `${winner} defeat ${loser}, ${finalScore}`;
        }

        default:
            return '';
    }
}

// Keep track of current audio
let currentAudio = null;

/**
 * Speak announcement using OpenAI Text-to-Speech API
 * @param {string} text - Text to speak
 * @param {Object} match - Match object (kept for backward compatibility but not used)
 */
export async function speakAnnouncement(text, match = null) {
    if (!text) return;

    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    try {
        // Generate speech using OpenAI TTS API
        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
            input: text,
            speed: 0.9 // Slightly slower for clarity
        });

        // Convert response to audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio
        currentAudio = new Audio(audioUrl);
        currentAudio.play();

        // Clean up URL when done
        currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
        };
    } catch (error) {
        console.error('Error generating speech with OpenAI TTS:', error);
        // Fallback to browser speech synthesis
        fallbackToWebSpeech(text);
    }
}

/**
 * Fallback to browser's Web Speech API if OpenAI TTS fails
 */
function fallbackToWebSpeech(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
}
