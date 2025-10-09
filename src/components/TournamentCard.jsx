import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Chip, Box, IconButton, Popover } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useFavorites } from '../hooks/useFavorites';

/**
 * Tournament Card Component using MUI - Horizontal Layout with Image Popover
 */

function formatType(type) {
    return type.replace(/-/g, ' ').toUpperCase();
}

export default function TournamentCard({ tournament }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(tournament.id);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(tournament);
    };

    const handleImageMouseEnter = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleImageMouseLeave = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Card
                component={Link}
                to={`/tournament/${tournament.id}`}
                sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    height: { xs: 'auto', sm: 160 },
                    width: '100%',
                    transition: 'box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        boxShadow: 6
                    }
                }}
            >
                <Box
                    onMouseEnter={handleImageMouseEnter}
                    onMouseLeave={handleImageMouseLeave}
                    sx={{
                        width: { xs: '100%', sm: 200 },
                        height: { xs: 180, sm: 160 },
                        flexShrink: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                >
                    <CardMedia
                        component="img"
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease-in-out',
                            transform: open ? 'scale(1.05)' : 'scale(1)'
                        }}
                        image={tournament.cover}
                        alt={tournament.name}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Tournament'}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, position: 'relative' }}>
                    <IconButton
                        onClick={handleFavoriteClick}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 2,
                            color: favorite ? 'warning.main' : 'action.active',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        size="small"
                    >
                        {favorite ? <Star /> : <StarBorder />}
                    </IconButton>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Chip
                            label={formatType(tournament.type)}
                            size="small"
                            color="primary"
                            sx={{ mb: 1, alignSelf: 'flex-start' }}
                        />
                        <Typography variant="h6" component="h3" gutterBottom noWrap>
                            {tournament.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {tournament.startDate} - {tournament.endDate}
                        </Typography>
                    </CardContent>
                </Box>
            </Card>

            <Popover
                open={open}
                anchorEl={anchorEl}
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
                        maxWidth: 500,
                        maxHeight: 400,
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/500x400?text=Tournament'}
                />
            </Popover>
        </>
    );
}

export function TournamentGrid({ tournaments }) {
    if (!tournaments || tournaments.length === 0) {
        return <Typography>No tournaments found.</Typography>;
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(2, 1fr)'
                },
                gap: 2
            }}
        >
            {tournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} />
            ))}
        </Box>
    );
}
