import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Chip, Grid } from '@mui/material';

/**
 * Tournament Card Component using MUI
 */

function formatType(type) {
    return type.replace(/-/g, ' ').toUpperCase();
}

export default function TournamentCard({ tournament }) {
    return (
        <Card
            component={Link}
            to={`/tournament/${tournament.id}`}
            sx={{
                textDecoration: 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}
        >
            <CardMedia
                component="img"
                height="200"
                image={tournament.cover}
                alt={tournament.name}
                onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Tournament'}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Chip
                    label={formatType(tournament.type)}
                    size="small"
                    color="primary"
                    sx={{ mb: 1 }}
                />
                <Typography variant="h6" component="h3" gutterBottom>
                    {tournament.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {tournament.startDate} - {tournament.endDate}
                </Typography>
            </CardContent>
        </Card>
    );
}

export function TournamentGrid({ tournaments }) {
    if (!tournaments || tournaments.length === 0) {
        return <Typography>No tournaments found.</Typography>;
    }

    return (
        <Grid container spacing={3}>
            {tournaments.map(t => (
                <Grid item key={t.id} xs={12} sm={6} md={4}>
                    <TournamentCard tournament={t} />
                </Grid>
            ))}
        </Grid>
    );
}
