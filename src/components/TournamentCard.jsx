import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Chip, Box, IconButton, Popover } from '@mui/material';
import { Star, StarBorder, OpenInNew } from '@mui/icons-material';
import { useFavorites } from '../hooks/useFavorites';

/**
 * Tournament Card Component using MUI - Horizontal Layout with Image Popover
 */

function formatType(type) {
    return type.replace(/-/g, ' ').toUpperCase();
}

function getTypeColor(type) {
    const typeUpper = type.toUpperCase();
    const typeFormatted = formatType(type);

    // Gold for Master Finals and Major
    if (typeFormatted.includes('MASTER') || typeFormatted.includes('MAJOR')) {
        return '#D4AF37'; // More golden, less yellow
    }

    // Blue for P1 and P2
    if (typeUpper.includes('P1') || typeUpper.includes('P2')) {
        return '#4A90E2';
    }

    // Light grey for FIP TOUR
    if (typeUpper.includes('TOUR')) {
        return '#CBD5E1'; // Lighter grey
    }

    // Default grey
    return '#CBD5E1';
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

    const handleExternalLinkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(tournament.href, '_blank', 'noopener,noreferrer');
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
                    flexDirection: 'column',
                    width: '100%',
                    minWidth: 0,
                    position: 'relative',
                    overflow: 'visible',
                    backgroundColor: 'background.paper',
                    marginTop: '20px',
                }}
            >
                {/* Colored Type Badge */}
                <Box
                    sx={{
                        height: 20,
                        width: { xs: '70%', sm: '60%' },
                        maxWidth: 300,
                        backgroundColor: getTypeColor(tournament.type),
                        borderRadius: '8px 8px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 3,
                        margin: '-20px auto 0',
                        boxShadow: 'inset 0 -3px 6px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                    >
                        {formatType(tournament.type)}
                    </Typography>
                </Box>

                {/* Card Content */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, overflow: 'hidden' }}>
                    <Box
                        onMouseEnter={handleImageMouseEnter}
                        onMouseLeave={handleImageMouseLeave}
                        sx={{
                            width: { xs: '100%', sm: 200 },
                            height: { xs: 160, sm: 140 },
                            flexShrink: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: { xs: '0', sm: '8px 0 0 8px' }
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
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', gap: 0.5 }}>
                            <IconButton
                                onClick={handleExternalLinkClick}
                                sx={{
                                    color: 'action.active',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'primary.main'
                                    }
                                }}
                                size="small"
                                title="Open tournament website"
                            >
                                <OpenInNew fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={handleFavoriteClick}
                                sx={{
                                    color: favorite ? 'warning.main' : 'action.active',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                                size="small"
                                title={favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                {favorite ? <Star /> : <StarBorder />}
                            </IconButton>
                        </Box>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" component="h3" gutterBottom noWrap>
                                {tournament.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {tournament.startDate} - {tournament.endDate}
                            </Typography>
                        </CardContent>
                    </Box>
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
                gap: 2,
                width: '100%',
                '& > *': {
                    minWidth: 0,
                    maxWidth: '100%'
                }
            }}
        >
            {tournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} />
            ))}
        </Box>
    );
}
