import { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Stack,
    CircularProgress,
    Button,
    IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getTournaments, getEventMatches } from '../api/api.service';
import { MatchList } from '../components/MatchCard';
import Filter from '../components/Filter';
import Tabs from '../components/Tabs';

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
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef(null);

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
        if (!autoRefresh || !tournament) return;

        intervalRef.current = setInterval(() => {
            console.log('Auto-refreshing matches...');
            getEventMatches(tournament.id, currentDay)
                .then(matches => {
                    console.log(`Auto-refresh: Loaded ${matches.length} matches`);
                    setAllMatches(matches);
                })
                .catch(err => console.error('Auto-refresh error:', err));
        }, 5000);

        return () => {
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

    // Filter matches by gender
    let filteredMatches = allMatches;
    if (currentGender !== 'all') {
        filteredMatches = allMatches.filter(match => {
            const roundName = match.roundName.toLowerCase();
            if (currentGender === 'men') {
                return roundName.includes('men') && !roundName.includes('women');
            } else if (currentGender === 'women') {
                return roundName.includes('women');
            }
            return true;
        });
    }

    const genderFilters = [
        { label: 'All', value: 'all' },
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                component={RouterLink}
                to="/"
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Tournaments
            </Button>

            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                {tournament.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                {tournament.startDate} - {tournament.endDate}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
                <Filter
                    filters={genderFilters}
                    activeFilter={currentGender}
                    onChange={setCurrentGender}
                />
                <IconButton
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    color={autoRefresh ? 'success' : 'default'}
                    sx={{ ml: 'auto' }}
                >
                    <RefreshIcon
                        sx={{
                            animation: autoRefresh ? 'spin 2s linear infinite' : 'none',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }}
                    />
                </IconButton>
                <Typography variant="body2" color={autoRefresh ? 'success.main' : 'text.secondary'}>
                    Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
                </Typography>
            </Stack>

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
                    <MatchList matches={filteredMatches} eventId={tournament.eventId} />
                )}
            </Box>
        </Container>
    );
}
