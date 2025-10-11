/**
 * Announcement Context - Manage match announcement subscriptions and state tracking
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { generateAnnouncement, speakAnnouncement, setPlayerNameTransformer } from '../api/announcement.service';
import { usePlayerNames } from './PlayerNamesContext';

const AnnouncementContext = createContext();

/**
 * Custom hook to use announcement context
 */
export function useAnnouncements() {
    const context = useContext(AnnouncementContext);
    if (!context) {
        throw new Error('useAnnouncements must be used within AnnouncementProvider');
    }
    return context;
}

/**
 * Provider component for managing match announcements
 */
export function AnnouncementProvider({ children }) {
    // Get player name transformer from context
    const { transformPlayerName } = usePlayerNames();

    // Set up the transformer in announcement service on mount
    useEffect(() => {
        setPlayerNameTransformer(transformPlayerName);
    }, [transformPlayerName]);

    // Map of matchId -> { voiceEnabled: boolean, notificationEnabled: boolean, lastState: object }
    const [subscriptions, setSubscriptions] = useState({});
    const [matches, setMatches] = useState({}); // Current match states
    const previousMatchesRef = useRef({});
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [currentNotification, setCurrentNotification] = useState(null); // For in-app notifications

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
            });
        } else if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    /**
     * Show a notification (native OS or in-app depending on page visibility)
     */
    const showNotification = useCallback((matchId, match, message, type) => {
        const team1Names = getTeamNames(match.team1);
        const team2Names = getTeamNames(match.team2);
        const matchName = `${team1Names} vs ${team2Names}`;

        // Check if page is in background/hidden
        const isPageHidden = document.hidden || document.visibilityState === 'hidden';

        if (!('Notification' in window)) {
            // Fallback to in-app notification
            setCurrentNotification({ matchId, matchName, message, type });
            return;
        }

        if (Notification.permission !== 'granted') {
            // Fallback to in-app notification
            setCurrentNotification({ matchId, matchName, message, type });
            return;
        }

        // If page is visible/focused, use in-app notification for better UX
        // Native notifications might not show or might be suppressed by the browser
        if (!isPageHidden) {
            setCurrentNotification({ matchId, matchName, message, type });
            return;
        }

        // Page is hidden, use native OS notification
        try {
            const notification = new Notification(matchName, {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: matchId,
                requireInteraction: false,
                silent: false,
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            // Focus window when notification is clicked
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('Failed to create notification:', error);
            // Fallback to in-app notification on error
            setCurrentNotification({ matchId, matchName, message, type });
        }
    }, []);

    /**
     * Close in-app notification
     */
    const closeNotification = useCallback(() => {
        setCurrentNotification(null);
    }, []);

    /**
     * Get team names helper (using transformed player names)
     */
    const getTeamNames = useCallback((team) => {
        if (!team?.player1) return '';
        const cleanName = (name) => name ? name.replace(/\s*\(\d+\)\s*$/, '').trim() : '';
        const player1Name = transformPlayerName(cleanName(team.player1.name));
        const player2Name = team.player2 ? transformPlayerName(cleanName(team.player2.name)) : '';
        return player2Name ? `${player1Name} / ${player2Name}` : player1Name;
    }, [transformPlayerName]);

    /**
     * Toggle voice announcements for a specific match
     */
    const toggleVoiceAnnouncements = useCallback(async (matchId, match) => {
        const isCurrentlyEnabled = subscriptions[matchId]?.voiceEnabled || false;
        const newEnabled = !isCurrentlyEnabled;

        if (newEnabled) {
            // When enabling, check if match has ended or not started
            const matchEnded = await handleInitialAnnouncement(matchId, match, true);
            
            if (matchEnded) {
                // Don't enable announcements for finished matches
                // Just announce and return without enabling
                return;
            }
        }

        setSubscriptions(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                voiceEnabled: newEnabled,
                lastState: match
            }
        }));
    }, [subscriptions, showNotification]);

    /**
     * Toggle notifications for a specific match
     */
    const toggleNotifications = useCallback(async (matchId, match) => {
        // Request permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission !== 'granted') {
                alert('Please enable notifications to receive match updates');
                return;
            }
        }
        
        if (Notification.permission !== 'granted') {
            alert('Notifications are blocked. Please enable them in your browser settings.');
            return;
        }
        
        const isCurrentlyEnabled = subscriptions[matchId]?.notificationEnabled || false;
        const newEnabled = !isCurrentlyEnabled;

        if (newEnabled) {
            // When enabling, show immediate notification with current state
            await handleInitialAnnouncement(matchId, match, false);
            
            // Check if match has ended
            const hasEnded = match.team1.isWinner || match.team2.isWinner;
            if (hasEnded) {
                // Don't enable for finished matches, just showed notification above
                return;
            }
        }

        setSubscriptions(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                notificationEnabled: newEnabled,
                lastState: match
            }
        }));
    }, [subscriptions, showNotification]);

    /**
     * Handle initial announcement when user first enables notifications
     * @param {string} matchId - The match ID
     * @param {object} match - The match object
     * @param {boolean} isVoice - Whether this is for voice (true) or notification (false)
     * @returns {boolean} Whether the match has ended
     */
    const handleInitialAnnouncement = async (matchId, match, isVoice = true) => {

        // Consider match started only if points or set1/set2/set3 have a numeric value
        function isSetStarted(set) {
            return typeof set === 'number' && !isNaN(set);
        }
        const hasStarted =
            (match.team1.points && match.team1.points !== '0') ||
            (match.team2.points && match.team2.points !== '0') ||
            isSetStarted(match.team1.set1) || isSetStarted(match.team2.set1) ||
            isSetStarted(match.team1.set2) || isSetStarted(match.team2.set2) ||
            isSetStarted(match.team1.set3) || isSetStarted(match.team2.set3);

        const hasEnded = match.team1.isWinner || match.team2.isWinner;

        if (hasEnded) {
            // Match has ended - announce final result
            const announcement = await generateAnnouncement(match, 'MATCH_END');
            if (isVoice) {
                speakAnnouncement(announcement, match);
            } else {
                showNotification(matchId, match, announcement, 'MATCH_END');
            }
            return true; // Match has ended
        } else if (!hasStarted) {
            // Match hasn't started
            const announcement = "I'll let you know when the game begins and then update you on the score.";
            if (isVoice) {
                speakAnnouncement(announcement, match);
            } else {
                showNotification(matchId, match, announcement, 'MATCH_START');
            }
        } else {
            // Match is ongoing - show current score
            if (!isVoice) {
                const announcement = await generateAnnouncement(match, 'GAME_WON');
                showNotification(matchId, match, announcement, 'GAME_WON');
            }
        }
        // If match is ongoing, wait for next state change
        return false;
    };

    /**
     * Update match state - called from components when match data changes
     */
    const updateMatchState = useCallback((matchId, newMatchState) => {
        setMatches(prev => {
            const updated = { ...prev, [matchId]: newMatchState };
            return updated;
        });
    }, []);

    /**
     * Detect and announce changes in match state
     */
    useEffect(() => {
        Object.keys(matches).forEach(async matchId => {
            const subscription = subscriptions[matchId];
            if (!subscription || (!subscription.voiceEnabled && !subscription.notificationEnabled)) return;

            const currentMatch = matches[matchId];
            const previousMatch = previousMatchesRef.current[matchId];

            if (!previousMatch) {
                // First time seeing this match in current session
                previousMatchesRef.current[matchId] = currentMatch;
                return;
            }

            // Detect changes and generate announcements
            await detectAndAnnounceChanges(matchId, previousMatch, currentMatch, subscription);

            // Update previous state
            previousMatchesRef.current[matchId] = currentMatch;
        });
    }, [matches, subscriptions]);

    /**
     * Detect changes between match states and announce them
     */
    const detectAndAnnounceChanges = async (matchId, previous, current, subscription) => {
        const { voiceEnabled, notificationEnabled } = subscription;

        // Check if match just started
        const wasNotStarted = !previous.team1.set1 && !previous.team2.set1;
        const hasStarted = current.team1.set1 !== undefined || current.team2.set1 !== undefined;

        if (wasNotStarted && hasStarted) {
            const announcement = await generateAnnouncement(current, 'MATCH_START');
            if (voiceEnabled) {
                speakAnnouncement(announcement, current);
            }
            if (notificationEnabled) {
                showNotification(matchId, current, announcement, 'MATCH_START');
            }
            return;
        }

        // Check if match just ended
        const wasOngoing = !previous.team1.isWinner && !previous.team2.isWinner;
        const hasEnded = current.team1.isWinner || current.team2.isWinner;

        if (wasOngoing && hasEnded) {
            const announcement = await generateAnnouncement(current, 'MATCH_END');
            if (voiceEnabled) {
                speakAnnouncement(announcement, current);
            }
            if (notificationEnabled) {
                showNotification(matchId, current, announcement, 'MATCH_END');
            }
            
            // Auto-disable voice announcements for finished matches
            if (voiceEnabled) {
                setSubscriptions(prev => ({
                    ...prev,
                    [matchId]: {
                        ...prev[matchId],
                        voiceEnabled: false
                    }
                }));
            }
            return;
        }

        // Check for set changes (1, 2, or 3)
        for (let setNum = 1; setNum <= 3; setNum++) {
            const setKey = `set${setNum}`;
            const prevSet1 = previous.team1[setKey];
            const prevSet2 = previous.team2[setKey];
            const currSet1 = current.team1[setKey];
            const currSet2 = current.team2[setKey];

            // Check if set just completed
            const wasInProgress = (prevSet1 !== undefined && prevSet1 !== '') && 
                                  (prevSet2 !== undefined && prevSet2 !== '') &&
                                  prevSet1 < 6 && prevSet2 < 6;
            const isComplete = (currSet1 >= 6 || currSet2 >= 6) && 
                              Math.abs(currSet1 - currSet2) >= 2;

            if (prevSet1 !== currSet1 || prevSet2 !== currSet2) {
                // Check if we're in a tiebreak (6-6)
                if (currSet1 === 6 && currSet2 === 6) {
                    // Tiebreak - announce every point change
                    const prevPoints1 = previous.team1.points;
                    const prevPoints2 = previous.team2.points;
                    const currPoints1 = current.team1.points;
                    const currPoints2 = current.team2.points;

                    if (prevPoints1 !== currPoints1 || prevPoints2 !== currPoints2) {
                        const announcement = await generateAnnouncement(current, 'TIEBREAK_POINT');
                        if (voiceEnabled) {
                            speakAnnouncement(announcement, current);
                        }
                        if (notificationEnabled) {
                            showNotification(matchId, current, announcement, 'TIEBREAK_POINT');
                        }
                        return;
                    }
                } else if (prevSet1 !== currSet1 || prevSet2 !== currSet2) {
                    // Game won within set
                    const announcement = await generateAnnouncement(current, 'GAME_WON', previous);
                    if (voiceEnabled) {
                        speakAnnouncement(announcement, current);
                    }
                    if (notificationEnabled) {
                        showNotification(matchId, current, announcement, 'GAME_WON');
                    }
                    
                    // Check if this game win completed the set
                    if (!wasInProgress && isComplete) {
                        // Announce set win after a short delay
                        setTimeout(async () => {
                            const setAnnouncement = await generateAnnouncement(current, 'SET_WON', previous);
                            if (voiceEnabled) {
                                speakAnnouncement(setAnnouncement, current);
                            }
                            if (notificationEnabled) {
                                showNotification(matchId, current, setAnnouncement, 'SET_WON');
                            }
                        }, 3000);
                    }
                    return;
                }
            }
        }
    };

    /**
     * Check if voice announcements are enabled for a match
     */
    const isVoiceEnabled = useCallback((matchId) => {
        return subscriptions[matchId]?.voiceEnabled || false;
    }, [subscriptions]);

    /**
     * Check if notifications are enabled for a match
     */
    const isNotificationEnabled = useCallback((matchId) => {
        return subscriptions[matchId]?.notificationEnabled || false;
    }, [subscriptions]);

    const value = useMemo(() => ({
        toggleVoiceAnnouncements,
        toggleNotifications,
        updateMatchState,
        isVoiceEnabled,
        isNotificationEnabled,
        notificationPermission,
        currentNotification,
        closeNotification
    }), [toggleVoiceAnnouncements, toggleNotifications, updateMatchState, isVoiceEnabled, isNotificationEnabled, notificationPermission, currentNotification, closeNotification]);

    return (
        <AnnouncementContext.Provider value={value}>
            {children}
        </AnnouncementContext.Provider>
    );
}
