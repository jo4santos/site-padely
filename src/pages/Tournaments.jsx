import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Box,
    Stack,
    CircularProgress,
    Chip
} from '@mui/material';
import { FiberManualRecord as LiveIcon, Star } from '@mui/icons-material';
import { getTournaments } from '../api/api.service';
import { TournamentGrid } from '../components/TournamentCard';
import { useFavorites } from '../hooks/useFavorites';
import Filter from '../components/Filter';

/**
 * Tournaments List Page using MUI
 */

function parseTournamentDates(tournament) {
    const [startDay, startMonth, startYear] = tournament.startDate.split('/');
    const [endDay, endMonth, endYear] = tournament.endDate.split('/');

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
}

function categorizeTournaments(tournaments) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTournaments = [];
    const upcomingTournaments = [];
    const pastTournaments = [];

    tournaments.forEach(tournament => {
        const { startDate, endDate } = parseTournamentDates(tournament);

        if (startDate <= today && endDate >= today) {
            todayTournaments.push(tournament);
        } else if (startDate > today) {
            upcomingTournaments.push(tournament);
        } else {
            pastTournaments.push(tournament);
        }
    });

    return {
        today: todayTournaments,
        upcoming: upcomingTournaments,
        past: pastTournaments
    };
}

function getUniqueTournamentTypes(tournaments) {
    const types = new Set();
    tournaments.forEach(t => types.add(t.type));
    return Array.from(types).sort();
}

function formatTypeName(type) {
    return type.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState(['all']);
    const [searchQuery, setSearchQuery] = useState('');
    const { favorites } = useFavorites();

    useEffect(() => {
        async function loadTournaments() {
            try {
                const allTournaments = await getTournaments();

                // Filter out specific tournament types
                const excludedTypes = ['world-championships', 'fip-championship'];
                const filtered = allTournaments.filter(t => !excludedTypes.includes(t.type));

                setTournaments(filtered);
            } catch (err) {
                setError('Error loading tournaments. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadTournaments();
    }, []);

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

    // Apply filters
    let filtered = tournaments;

    if (!typeFilter.includes('all')) {
        filtered = filtered.filter(t => typeFilter.includes(t.type));
    }

    if (searchQuery) {
        filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const { today, upcoming, past } = categorizeTournaments(filtered);
    const types = getUniqueTournamentTypes(tournaments);

    const typeFilters = [
        { label: 'All', value: 'all' },
        ...types.map(type => ({
            label: formatTypeName(type),
            value: type
        }))
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Box sx={{ mb: 5 }}>
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 800,
                        color: '#1A1A2E',
                        mb: 1,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Padel Tournaments
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#64748B',
                        fontSize: '1.1rem',
                    }}
                >
                    Discover and follow professional padel tournaments worldwide
                </Typography>
            </Box>

            {/* Search and Filters */}
            <Box
                sx={{
                    mb: 5,
                    p: 3,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 3,
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Search tournaments by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#F8FAFC',
                            '& fieldset': {
                                borderColor: '#E2E8F0',
                                borderWidth: 2,
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
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: '#64748B',
                            mb: 1.5,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Filter by Type
                    </Typography>
                    <Filter
                        filters={typeFilters}
                        activeFilter={typeFilter}
                        onChange={setTypeFilter}
                        multiSelect={true}
                    />
                </Box>
            </Box>

            {/* Favorites Section */}
            {favorites.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Star sx={{ color: 'warning.main' }} />
                        <Typography variant="h5" component="h3" fontWeight="bold">
                            Your Favorites
                        </Typography>
                    </Stack>
                    <TournamentGrid tournaments={favorites} />
                </Box>
            )}

            {/* Live Today Section */}
            {today.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Chip
                            icon={<LiveIcon />}
                            label="LIVE"
                            color="error"
                            sx={{ fontWeight: 'bold' }}
                        />
                        <Typography variant="h5" component="h3" fontWeight="bold">
                            Happening Today
                        </Typography>
                    </Stack>
                    <TournamentGrid tournaments={today} />
                </Box>
            )}

            {/* Upcoming Tournaments Section */}
            {upcoming.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                        Upcoming Tournaments
                    </Typography>
                    <TournamentGrid tournaments={upcoming} />
                </Box>
            )}

            {/* Past Tournaments Section */}
            {past.length > 0 && (
                <Box sx={{ mb: 4, opacity: 0.6 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                        Past Tournaments
                    </Typography>
                    <TournamentGrid tournaments={past} />
                </Box>
            )}

            {/* No results */}
            {today.length === 0 && upcoming.length === 0 && past.length === 0 && (
                <Typography>No tournaments found matching your filters.</Typography>
            )}
        </Container>
    );
}
