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
    CircularProgress
} from '@mui/material';
import { getRankings } from '../api/api.service';
import Filter from '../components/Filter';

/**
 * Rankings Page using MUI
 */

function RankingCard({ player }) {
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
                            {player.name}
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Player Rankings
            </Typography>

            <Box sx={{ mb: 3 }}>
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

            {!loading && !error && rankings.length > 0 && (
                <Box>
                    {rankings.map(player => (
                        <RankingCard key={player.position} player={player} />
                    ))}
                </Box>
            )}

            {!loading && !error && rankings.length === 0 && (
                <Typography>No rankings available.</Typography>
            )}
        </Container>
    );
}
