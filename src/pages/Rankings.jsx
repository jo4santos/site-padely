import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Stack,
    Card,
    CardContent,
    Avatar,
    CircularProgress,
    TextField
} from '@mui/material';
import { getRankings } from '../api/api.service';
import Filter from '../components/Filter';
import { usePlayerNames } from '../contexts/PlayerNamesContext';

/**
 * Rankings Page using MUI
 */

function RankingCard({ player }) {
    const { transformPlayerName } = usePlayerNames();
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ minWidth: 60 }}>
                        #{player.position}
                    </Typography>

                    <Avatar
                        src={player.image}
                        alt={player.name}
                        sx={{ width: 60, height: 60 }}
                        onError={(e) => e.target.style.display = 'none'}
                    />

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {transformPlayerName(player.name)}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                src={player.flag}
                                alt={player.country}
                                sx={{ width: 20, height: 20 }}
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {player.country}
                            </Typography>
                        </Stack>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" color="success.main">
                        {player.points} pts
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function RankingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const gender = searchParams.get('gender') || 'men';

    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadRankings() {
            setLoading(true);
            setError(null);
            try {
                const data = await getRankings(gender);
                setRankings(data);
            } catch (err) {
                setError('Error loading rankings. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadRankings();
    }, [gender]);

    const handleGenderChange = (newGender) => {
        setSearchParams({ gender: newGender });
    };

    const genderFilters = [
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' }
    ];

    // Filter rankings by search query
    const filteredRankings = rankings.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Player Rankings
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by player name or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Filter
                    filters={genderFilters}
                    activeFilter={gender}
                    onChange={handleGenderChange}
                />
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Typography color="error">{error}</Typography>}

            {!loading && !error && filteredRankings.length > 0 && (
                <Box>
                    {filteredRankings.map(player => (
                        <RankingCard key={player.position} player={player} />
                    ))}
                </Box>
            )}

            {!loading && !error && filteredRankings.length === 0 && (
                <Typography>
                    {searchQuery ? 'No players found matching your search.' : 'No rankings available.'}
                </Typography>
            )}
        </Container>
    );
}
