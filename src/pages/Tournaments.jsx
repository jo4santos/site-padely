import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Box,
    Stack,
    CircularProgress,
    Chip,
    Divider,
    Button,
    Collapse
} from '@mui/material';
import { FiberManualRecord as LiveIcon, Star, FilterList, ExpandMore, ExpandLess } from '@mui/icons-material';
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

function getUniqueMonths(tournaments) {
    const months = new Set();
    tournaments.forEach(t => {
        const { startDate } = parseTournamentDates(t);
        const monthYear = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
    });
    return Array.from(months).sort();
}

function formatMonthYear(monthYear) {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupTournamentsByMonth(tournaments) {
    const grouped = {};
    tournaments.forEach(tournament => {
        const { startDate } = parseTournamentDates(tournament);
        const monthYear = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        grouped[monthYear].push(tournament);
    });
    return grouped;
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState(() => {
        const saved = localStorage.getItem('tournament-type-filter');
        return saved ? JSON.parse(saved) : ['all'];
    });
    const [monthFilter, setMonthFilter] = useState(() => {
        const saved = localStorage.getItem('tournament-month-filter');
        return saved ? saved : 'all';
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(() => {
        const saved = localStorage.getItem('tournament-show-filters');
        return saved ? JSON.parse(saved) : false;
    });
    const { favorites } = useFavorites();

    useEffect(() => {
        async function loadTournaments() {
            try {
                const allTournaments = await getTournaments();

                setTournaments(allTournaments);
            } catch (err) {
                setError('Error loading tournaments. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadTournaments();
    }, []);

    // Save filters to localStorage
    useEffect(() => {
        localStorage.setItem('tournament-type-filter', JSON.stringify(typeFilter));
    }, [typeFilter]);

    useEffect(() => {
        localStorage.setItem('tournament-month-filter', monthFilter);
    }, [monthFilter]);

    useEffect(() => {
        localStorage.setItem('tournament-show-filters', JSON.stringify(showFilters));
    }, [showFilters]);

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

    if (monthFilter !== 'all') {
        filtered = filtered.filter(t => {
            const { startDate } = parseTournamentDates(t);
            const monthYear = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
            return monthYear === monthFilter;
        });
    }

    if (searchQuery) {
        filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const { today, upcoming, past } = categorizeTournaments(filtered);
    const types = getUniqueTournamentTypes(tournaments);
    const months = getUniqueMonths(tournaments);

    const typeFilters = [
        { label: 'All', value: 'all' },
        ...types.map(type => ({
            label: formatTypeName(type),
            value: type
        }))
    ];

    const monthFilters = [
        { label: 'All', value: 'all' },
        ...months.map(month => ({
            label: formatMonthYear(month),
            value: month
        }))
    ];

    // Count active filters
    const activeFiltersCount = 
        (typeFilter.length > 0 && !typeFilter.includes('all') ? typeFilter.length : 0) +
        (monthFilter !== 'all' ? 1 : 0);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Search and Filters */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search tournaments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            minWidth: 140,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Filters{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
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
                                    Type
                                </Typography>
                                <Filter
                                    filters={typeFilters}
                                    activeFilter={typeFilter}
                                    onChange={setTypeFilter}
                                    multiSelect={true}
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
                                    Month
                                </Typography>
                                <Filter
                                    filters={monthFilters}
                                    activeFilter={monthFilter}
                                    onChange={setMonthFilter}
                                    multiSelect={false}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </Collapse>
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

            {/* Upcoming Tournaments Section - Grouped by Month */}
            {upcoming.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                        Upcoming Tournaments
                    </Typography>
                    {Object.entries(groupTournamentsByMonth(upcoming)).sort().map(([monthYear, monthTournaments]) => (
                        <Box key={monthYear} sx={{ mb: 4 }}>
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
                                    {formatMonthYear(monthYear)}
                                </Typography>
                            </Divider>
                            <TournamentGrid tournaments={monthTournaments} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* Past Tournaments Section - Grouped by Month */}
            {past.length > 0 && (
                <Box sx={{ mb: 4, opacity: 0.6 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                        Past Tournaments
                    </Typography>
                    {Object.entries(groupTournamentsByMonth(past)).sort().reverse().map(([monthYear, monthTournaments]) => (
                        <Box key={monthYear} sx={{ mb: 4 }}>
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
                                    {formatMonthYear(monthYear)}
                                </Typography>
                            </Divider>
                            <TournamentGrid tournaments={monthTournaments} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* No results */}
            {today.length === 0 && upcoming.length === 0 && past.length === 0 && (
                <Typography>No tournaments found matching your filters.</Typography>
            )}
        </Container>
    );
}
