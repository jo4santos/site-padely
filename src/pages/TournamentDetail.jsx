import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Stack,
    CircularProgress,
    TextField,
    Button,
    Collapse,
    Popover
} from '@mui/material';
import { FilterList, ExpandMore, ExpandLess } from '@mui/icons-material';
import { getTournaments, getEventMatches } from '../api/api.service';
import { MatchList } from '../components/MatchCard';
import Filter from '../components/Filter';
import Tabs from '../components/Tabs';
import { useAutoRefresh } from '../contexts/AutoRefreshContext';

/**
 * Tournament Detail Page using MUI
 */

function calculateDaysWithDates(startDate, endDate) {
    const [startDay, startMonth, startYear] = startDate.split('/');
    const [endDay, endMonth, endYear] = endDate.split('/');

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        const dayNum = i + 1;
        const dateStr = currentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        let label;
        const daysDiff = Math.floor((currentDate - today) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            label = `Today (${dateStr})`;
        } else if (daysDiff === 1) {
            label = `Tomorrow (${dateStr})`;
        } else if (daysDiff === -1) {
            label = `Yesterday (${dateStr})`;
        } else if (daysDiff > 1 && daysDiff <= 6) {
            label = dateStr;
        } else if (daysDiff < -1 && daysDiff >= -6) {
            label = dateStr;
        } else {
            label = `Day ${dayNum} (${dateStr})`;
        }

        days.push({
            value: dayNum,
            label: label,
            date: currentDate,
            isToday: daysDiff === 0
        });
    }

    return days;
}

export default function TournamentDetailPage() {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDay, setCurrentDay] = useState(1);
    const [currentGender, setCurrentGender] = useState('all');
    const [allMatches, setAllMatches] = useState([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const { autoRefresh, setSecondsUntilRefresh } = useAutoRefresh();
    const intervalRef = useRef(null);
    const [playerSearch, setPlayerSearch] = useState('');
    const [courtFilter, setCourtFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [imageAnchorEl, setImageAnchorEl] = useState(null);

    const handleImageMouseEnter = (e) => {
        setImageAnchorEl(e.currentTarget);
    };

    const handleImageMouseLeave = () => {
        setImageAnchorEl(null);
    };

    const imagePopoverOpen = Boolean(imageAnchorEl);

    // Load tournament info
    useEffect(() => {
        async function loadTournament() {
            try {
                const tournaments = await getTournaments();
                const found = tournaments.find(t => t.id === id);

                if (!found) {
                    setError('Tournament not found.');
                    return;
                }

                setTournament(found);

                // Calculate days and set default to today
                const daysInfo = calculateDaysWithDates(found.startDate, found.endDate);
                const todayIndex = daysInfo.findIndex(day => day.isToday);
                const defaultDayIndex = todayIndex >= 0 ? todayIndex : 0;
                setCurrentDay(daysInfo[defaultDayIndex].value);
            } catch (err) {
                setError('Error loading tournament details. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadTournament();
    }, [id]);

    // Load matches for current day
    useEffect(() => {
        if (!tournament) return;

        async function loadMatches() {
            setMatchesLoading(true);
            try {
                console.log(`Fetching matches for tournament ${tournament.id}, day ${currentDay}`);
                const matches = await getEventMatches(tournament.id, currentDay);
                console.log(`Loaded ${matches.length} matches`);
                setAllMatches(matches);
            } catch (err) {
                console.error('Error loading matches:', err);
                setAllMatches([]);
            } finally {
                setMatchesLoading(false);
            }
        }

        loadMatches();
    }, [tournament, currentDay]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh || !tournament) {
            setSecondsUntilRefresh(20);
            return;
        }

        // Reset countdown
        setSecondsUntilRefresh(20);

        // Countdown timer (updates every second)
        const countdownInterval = setInterval(() => {
            setSecondsUntilRefresh(prev => {
                if (prev <= 1) return 20; // Reset to 20 when reaching 0
                return prev - 1;
            });
        }, 1000);

        // Data refresh timer (runs every 20 seconds)
        intervalRef.current = setInterval(() => {
            console.log('Auto-refreshing matches...');
            setSecondsUntilRefresh(20); // Reset countdown
            getEventMatches(tournament.id, currentDay)
                .then(matches => {
                    console.log(`Auto-refresh: Loaded ${matches.length} matches`);
                    setAllMatches(matches);
                })
                .catch(err => console.error('Auto-refresh error:', err));
        }, 20000);

        return () => {
            clearInterval(countdownInterval);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, tournament, currentDay]);

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!tournament) {
        return (
            <Container>
                <Typography>Tournament not found.</Typography>
            </Container>
        );
    }

    const daysInfo = calculateDaysWithDates(tournament.startDate, tournament.endDate);

    // Get unique courts from all matches
    const uniqueCourts = [...new Set(allMatches.map(m => m.courtName))].sort();
    const courtFilters = [
        { label: 'All Courts', value: 'all' },
        ...uniqueCourts.map(court => ({ label: court, value: court }))
    ];

    // Filter matches by gender, player, and court
    let filteredMatches = allMatches;

    // Gender filter
    if (currentGender !== 'all') {
        filteredMatches = filteredMatches.filter(match => {
            const roundName = match.roundName.toLowerCase();
            if (currentGender === 'men') {
                return roundName.includes('men') && !roundName.includes('women');
            } else if (currentGender === 'women') {
                return roundName.includes('women');
            }
            return true;
        });
    }

    // Player search filter
    if (playerSearch) {
        filteredMatches = filteredMatches.filter(match => {
            const searchLower = playerSearch.toLowerCase();
            const team1Player1 = match.team1?.player1?.name?.toLowerCase() || '';
            const team1Player2 = match.team1?.player2?.name?.toLowerCase() || '';
            const team2Player1 = match.team2?.player1?.name?.toLowerCase() || '';
            const team2Player2 = match.team2?.player2?.name?.toLowerCase() || '';

            return team1Player1.includes(searchLower) ||
                   team1Player2.includes(searchLower) ||
                   team2Player1.includes(searchLower) ||
                   team2Player2.includes(searchLower);
        });
    }

    // Court filter
    if (courtFilter !== 'all') {
        filteredMatches = filteredMatches.filter(match => match.courtName === courtFilter);
    }

    const genderFilters = [
        { label: 'All', value: 'all' },
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Tournament Header with Image */}
            <Box
                sx={{
                    mb: 3,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 1.5,
                    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    height: { xs: 'auto', sm: 100 }
                }}
            >
                {/* Tournament Image */}
                {tournament.cover && (
                    <Box
                        onMouseEnter={handleImageMouseEnter}
                        onMouseLeave={handleImageMouseLeave}
                        sx={{
                            width: { xs: '100%', sm: 150 },
                            height: { xs: 120, sm: '100%' },
                            flexShrink: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: { xs: '0', sm: '6px 0 0 6px' }
                        }}
                    >
                        <Box
                            component="img"
                            src={tournament.cover}
                            alt={tournament.name}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease-in-out',
                                transform: imagePopoverOpen ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </Box>
                )}

                {/* Tournament Info */}
                <Box sx={{ flex: 1, minWidth: 0, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: '#1E293B',
                            mb: 0.5,
                            fontSize: '1.25rem',
                            lineHeight: 1.2
                        }}
                    >
                        {tournament.name}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#64748B',
                                fontWeight: 500,
                            }}
                        >
                            {tournament.startDate} - {tournament.endDate}
                        </Typography>
                        {tournament.href && (
                            <Box
                                component="a"
                                href={tournament.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                View Website →
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>

            {/* Image Popover */}
            <Popover
                open={imagePopoverOpen}
                anchorEl={imageAnchorEl}
                onClose={handleImageMouseLeave}
                disableRestoreFocus
                sx={{
                    pointerEvents: 'none'
                }}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left'
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right'
                }}
                slotProps={{
                    paper: {
                        sx: {
                            pointerEvents: 'none',
                            boxShadow: 8,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            overflow: 'hidden'
                        }
                    }
                }}
            >
                <Box
                    component="img"
                    src={tournament.cover}
                    alt={tournament.name}
                    sx={{
                        maxWidth: 800,
                        maxHeight: 700,
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/800x700?text=Tournament'}
                />
            </Popover>

            {/* Search and Filters */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by player name..."
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#FFFFFF',
                                '& fieldset': {
                                    borderColor: '#E2E8F0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#CBD5E1',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0066CC',
                                },
                            },
                        }}
                    />
                    <Button
                        variant={showFilters ? "contained" : "outlined"}
                        startIcon={<FilterList />}
                        endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                            minWidth: 120,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Filters
                    </Button>
                </Stack>

                <Collapse in={showFilters}>
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2,
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#64748B',
                                        mb: 1,
                                        display: 'block',
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    Gender
                                </Typography>
                                <Filter
                                    filters={genderFilters}
                                    activeFilter={currentGender}
                                    onChange={setCurrentGender}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#64748B',
                                        mb: 1,
                                        display: 'block',
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    Court
                                </Typography>
                                <Filter
                                    filters={courtFilters}
                                    activeFilter={courtFilter}
                                    onChange={setCourtFilter}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </Collapse>
            </Box>

            <Tabs
                tabs={daysInfo}
                activeTab={currentDay}
                onChange={setCurrentDay}
            />

            <Box>
                {matchesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MatchList
                        matches={filteredMatches}
                        eventId={tournament.eventId}
                        isToday={daysInfo.find(d => d.value === currentDay)?.isToday || false}
                    />
                )}
            </Box>
        </Container>
    );
}
