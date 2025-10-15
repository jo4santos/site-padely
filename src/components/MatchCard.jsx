import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    Avatar,
    Collapse,
    IconButton,
    CircularProgress,
    Alert,
    Divider,
    Tooltip
} from '@mui/material';
import { 
    ExpandMore as ExpandMoreIcon, 
    SportsTennis as TennisIcon,
    Notifications as NotificationsIcon,
    NotificationsOff as NotificationsOffIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { getMatchStats } from '../api/api.service';
import MatchStats from './MatchStats';
import { useAnnouncements } from '../contexts/AnnouncementContext';
import { usePlayerNames } from '../contexts/PlayerNamesContext';

/**
 * Match Card Component using MUI
 */

function isMatchOngoing(match) {
    return (match.team1.isServing || match.team2.isServing) ||
           (match.team1.points && match.team1.points !== '' && !match.team1.isWinner && !match.team2.isWinner);
}

function parseMatchTime(timeString) {
    // Parse time like "7:00 AM" or "5:30 PM"
    if (!timeString) return null;

    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Create date with today's date and the parsed time
    // Assume the time is in UTC
    const now = new Date();
    const matchDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes
    ));

    return matchDate;
}

function formatLocalTime(timeString) {
    const matchDate = parseMatchTime(timeString);
    if (!matchDate || isNaN(matchDate.getTime())) return timeString;

    // Format to local time (just time, no date)
    return matchDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function getTimeRemaining(timeString) {
    const matchDate = parseMatchTime(timeString);
    if (!matchDate || isNaN(matchDate.getTime())) return null;

    const now = new Date();
    const diff = matchDate - now;

    // If match has already started or passed (with 5 minute buffer)
    if (diff < -5 * 60 * 1000) return null;

    // If starting very soon (within 5 minutes)
    if (diff < 5 * 60 * 1000 && diff >= 0) {
        return 'starting soon';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `in ${minutes}m`;
    } else {
        return null;
    }
}

function getTeamName(team, transformPlayerName) {
    if (!team || !team.player1) return '';
    const player1Name = transformPlayerName(team.player1.name);
    const player2Name = team.player2 ? transformPlayerName(team.player2.name) : '';
    return player2Name ? `${player1Name} & ${player2Name}` : player1Name;
}

function Player({ player, searchQuery = '' }) {
    const { transformPlayerName } = usePlayerNames();
    if (!player) return null;
    
    const displayName = transformPlayerName(player.name);
    
    // Function to highlight matching text
    const highlightText = (text, highlight) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) => 
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={index} style={{ backgroundColor: '#CCFF00', fontWeight: 'bold' }}>
                            {part}
                        </span>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </span>
        );
    };
    
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box
                component="img"
                src={player.flag}
                alt="Flag"
                sx={{ 
                    width: '20px', 
                    height: '16px',
                    borderRadius: '2px',
                    objectFit: 'cover'
                }}
                onError={(e) => e.target.style.display = 'none'}
            />
            <Typography variant="body2">{highlightText(displayName, searchQuery)}</Typography>
        </Stack>
    );
}

function Team({ team, searchQuery = '' }) {
    const hasCurrentPoints = team.points && team.points.trim() !== '';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                borderRadius: 1,
                backgroundColor: team.isWinner ? 'action.selected' : 'transparent',
                fontWeight: team.isWinner ? 'bold' : 'normal'
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Player player={team.player1} searchQuery={searchQuery} />
                <Player player={team.player2} searchQuery={searchQuery} />
            </Box>
            {hasCurrentPoints && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {team.isServing && <TennisIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                    <Typography variant="body1" fontWeight="bold">
                        {team.points}
                    </Typography>
                </Box>
            )}
            <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                {team.set1 || '-'}
            </Typography>
            <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                {team.set2 || '-'}
            </Typography>
            <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                {team.set3 || '-'}
            </Typography>
        </Box>
    );
}

export default function MatchCard({ match, eventId, isFirstOngoing = false, isToday = false, showFollowedBy = false, searchQuery = '' }) {
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toggleVoiceAnnouncements, toggleNotifications, isVoiceEnabled, isNotificationEnabled, updateMatchState } = useAnnouncements();
    const { transformPlayerName } = usePlayerNames();

    const ongoing = isMatchOngoing(match);
    const voiceEnabled = isVoiceEnabled(match.matchId);
    const notificationEnabled = isNotificationEnabled(match.matchId);

    // Update match state in context when match data changes
    useEffect(() => {
        if (voiceEnabled || notificationEnabled) {
            updateMatchState(match.matchId, match);
        }
    }, [match, match.matchId, voiceEnabled, notificationEnabled, updateMatchState]);

    const handleToggleVoice = () => {
        toggleVoiceAnnouncements(match.matchId, match);
    };

    const handleToggleNotification = () => {
        toggleNotifications(match.matchId, match);
    };

    const toggleStats = async () => {
        if (showStats) {
            setShowStats(false);
            return;
        }

        setShowStats(true);

        if (!stats) {
            setLoading(true);
            setError(null);
            try {
                const data = await getMatchStats(eventId, match.matchId);
                setStats(data);
            } catch (err) {
                setError('Error loading statistics. Please try again.');
                console.error('Error loading match stats:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const team1Name = getTeamName(match.team1, transformPlayerName);
    const team2Name = getTeamName(match.team2, transformPlayerName);

    return (
        <Card
            sx={{
                border: ongoing ? 2 : 1,
                borderColor: ongoing ? 'error.main' : 'divider',
                alignSelf: 'start',
                ...(isFirstOngoing && {
                    scrollMarginTop: '20px'
                })
            }}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                {match.roundName}
                            </Typography>
                            {ongoing && (
                                <Chip
                                    label="LIVE"
                                    color="error"
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            )}
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            {match.startDate && (
                                <Typography variant="body2" color="text.secondary">
                                    {formatLocalTime(match.startDate)}
                                </Typography>
                            )}
                            {showFollowedBy || !match.startDate ? (
                                <Typography variant="caption" color="warning.main" fontWeight="bold">
                                    {match.startDate ? '• ' : ''}Followed by
                                </Typography>
                            ) : isToday && !ongoing && getTimeRemaining(match.startDate) && (
                                <Typography variant="caption" color="primary.main" fontWeight="bold">
                                    • {getTimeRemaining(match.startDate)}
                                </Typography>
                            )}
                        </Stack>
                        <Tooltip title={voiceEnabled ? "Disable voice" : "Enable voice"}>
                            <IconButton
                                size="small"
                                onClick={handleToggleVoice}
                                sx={{
                                    color: voiceEnabled ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                {voiceEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={notificationEnabled ? "Disable notifications" : "Enable notifications"}>
                            <IconButton
                                size="small"
                                onClick={handleToggleNotification}
                                sx={{
                                    color: notificationEnabled ? 'success.main' : 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                {notificationEnabled ? <NotificationsActiveIcon fontSize="small" /> : <NotificationsOffIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Box
                            onClick={toggleStats}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                backgroundColor: 'action.hover',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                '&:hover': {
                                    backgroundColor: 'action.selected'
                                }
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                Stats
                            </Typography>
                            <IconButton
                                size="small"
                                sx={{
                                    transform: showStats ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s',
                                    p: 0.5
                                }}
                            >
                                <ExpandMoreIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Stack>
                </Stack>

                <Box>
                    <Team team={match.team1} searchQuery={searchQuery} />
                    <Team team={match.team2} searchQuery={searchQuery} />
                </Box>

                <Collapse in={showStats}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        )}
                        {error && <Alert severity="error">{error}</Alert>}
                        {stats && !loading && !error && (
                            <MatchStats stats={stats} team1Name={team1Name} team2Name={team2Name} />
                        )}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

// Group matches by court name
function groupMatchesByCourt(matches) {
    const grouped = {};
    matches.forEach(match => {
        const court = match.courtName || 'Unknown Court';
        if (!grouped[court]) {
            grouped[court] = [];
        }
        grouped[court].push(match);
    });
    return grouped;
}

export function MatchList({ matches, eventId, isToday = false, searchQuery = '' }) {
    if (!matches || matches.length === 0) {
        return <Typography>No matches scheduled for this day.</Typography>;
    }

    // Separate ongoing and other matches
    const ongoingMatches = matches.filter(m => isMatchOngoing(m));
    const otherMatches = matches.filter(m => !isMatchOngoing(m));

    // Check if match should show "Followed by"
    const shouldShowFollowedBy = (match) => {
        if (!isToday || isMatchOngoing(match)) return false;

        // Don't show "Followed by" if match is already completed
        if (match.team1.isWinner || match.team2.isWinner) return false;

        // Check if this match's time has passed
        const matchDate = parseMatchTime(match.startDate);
        if (!matchDate || isNaN(matchDate.getTime())) return false;

        const now = new Date();
        const diff = matchDate - now;

        // Show "Followed by" if scheduled time has passed by more than 5 minutes
        // This aligns with when getTimeRemaining returns null
        return diff < -5 * 60 * 1000;
    };

    const renderMatchGrid = (matchesToRender) => (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(2, 1fr)'
                },
                gap: 2,
                width: '100%',
                '& > *': {
                    minWidth: 0,
                    maxWidth: '100%'
                }
            }}
        >
            {matchesToRender.map((match) => (
                <MatchCard
                    key={match.matchId}
                    match={match}
                    eventId={eventId}
                    isFirstOngoing={false}
                    isToday={isToday}
                    showFollowedBy={shouldShowFollowedBy(match)}
                    searchQuery={searchQuery}
                />
            ))}
        </Box>
    );

    return (
        <Box>
            {ongoingMatches.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Live Matches
                    </Typography>
                    {Object.entries(groupMatchesByCourt(ongoingMatches)).map(([courtName, courtMatches]) => (
                        <Box key={courtName} sx={{ mb: 4 }}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#64748B',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    {courtName}
                                </Typography>
                            </Divider>
                            {renderMatchGrid(courtMatches)}
                        </Box>
                    ))}
                </Box>
            )}

            {otherMatches.length > 0 && (
                <Box>
                    {ongoingMatches.length > 0 && (
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                            Scheduled Matches
                        </Typography>
                    )}
                    {Object.entries(groupMatchesByCourt(otherMatches)).map(([courtName, courtMatches]) => (
                        <Box key={courtName} sx={{ mb: 4 }}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#64748B',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    {courtName}
                                </Typography>
                            </Divider>
                            {renderMatchGrid(courtMatches)}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
