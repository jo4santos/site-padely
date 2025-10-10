import { useState } from 'react';
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
    Alert
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, SportsTennis as TennisIcon } from '@mui/icons-material';
import { getMatchStats } from '../api/api.service';
import MatchStats from './MatchStats';

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

function getTeamName(team) {
    if (!team || !team.player1) return '';
    const player1Name = team.player1.name;
    const player2Name = team.player2 ? team.player2.name : '';
    return player2Name ? `${player1Name} & ${player2Name}` : player1Name;
}

function Player({ player }) {
    if (!player) return null;
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
                src={player.flag}
                alt="Flag"
                sx={{ width: 20, height: 20 }}
                onError={(e) => e.target.style.display = 'none'}
            />
            <Typography variant="body2">{player.name}</Typography>
        </Stack>
    );
}

function Team({ team }) {
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
                <Player player={team.player1} />
                <Player player={team.player2} />
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

export default function MatchCard({ match, eventId, isFirstOngoing = false, isToday = false, showFollowedBy = false }) {
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const ongoing = isMatchOngoing(match);

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

    const team1Name = getTeamName(match.team1);
    const team2Name = getTeamName(match.team2);

    return (
        <Card
            sx={{
                mb: 2,
                border: ongoing ? 2 : 1,
                borderColor: ongoing ? 'error.main' : 'divider',
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
                                {match.courtName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • {match.roundName}
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
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                {formatLocalTime(match.startDate)}
                            </Typography>
                            {showFollowedBy ? (
                                <Typography variant="caption" color="warning.main" fontWeight="bold">
                                    Followed by
                                </Typography>
                            ) : isToday && !ongoing && getTimeRemaining(match.startDate) && (
                                <Typography variant="caption" color="primary.main" fontWeight="bold">
                                    {getTimeRemaining(match.startDate)}
                                </Typography>
                            )}
                        </Box>
                        <IconButton
                            onClick={toggleStats}
                            size="small"
                            sx={{
                                transform: showStats ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s'
                            }}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </Stack>
                </Stack>

                <Box>
                    <Team team={match.team1} />
                    <Team team={match.team2} />
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

export function MatchList({ matches, eventId, isToday = false }) {
    if (!matches || matches.length === 0) {
        return <Typography>No matches scheduled for this day.</Typography>;
    }

    const firstOngoingIndex = matches.findIndex(m => isMatchOngoing(m));

    // Group matches by court to detect "followed by" situations
    const courtMap = new Map();
    matches.forEach(match => {
        if (!courtMap.has(match.courtName)) {
            courtMap.set(match.courtName, []);
        }
        courtMap.get(match.courtName).push(match);
    });

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

    return (
        <Box>
            {matches.map((match, index) => (
                <MatchCard
                    key={match.matchId}
                    match={match}
                    eventId={eventId}
                    isFirstOngoing={index === firstOngoingIndex}
                    isToday={isToday}
                    showFollowedBy={shouldShowFollowedBy(match)}
                />
            ))}
        </Box>
    );
}
