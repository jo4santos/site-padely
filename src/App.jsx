import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button, Box, IconButton, Switch, Stack, FormControlLabel } from '@mui/material';
import { SportsTennis as TennisIcon, ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import TournamentsPage from './pages/Tournaments';
import TournamentDetailPage from './pages/TournamentDetail';
import RankingsPage from './pages/Rankings';
import { AutoRefreshProvider, useAutoRefresh } from './contexts/AutoRefreshContext';

// Create custom theme with vibrant padel colors and strong contrast
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0066CC', // Vibrant blue
            dark: '#004C99',
            light: '#3385D6',
        },
        secondary: {
            main: '#FF6B35', // Energetic orange
            dark: '#E55A2B',
            light: '#FF8A5C',
        },
        success: {
            main: '#00B87C', // Fresh green
            dark: '#009463',
            light: '#26C792',
        },
        error: {
            main: '#E63946', // Bold red for LIVE
            dark: '#CC2F3A',
            light: '#EB5A64',
        },
        warning: {
            main: '#FFA500', // Gold for favorites
        },
        background: {
            default: '#F5F7FA', // Light gray-blue background
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1A1A2E',
            secondary: '#64748B',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
        ].join(','),
        h3: {
            fontWeight: 800,
            letterSpacing: '-0.02em',
        },
        h5: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.1)',
        '0px 12px 24px rgba(0,0,0,0.12)',
        '0px 16px 32px rgba(0,0,0,0.14)',
        '0px 20px 40px rgba(0,0,0,0.16)',
        '0px 24px 48px rgba(0,0,0,0.18)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 2px 4px rgba(0,0,0,0.05)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F5F7FA',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 20px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 8,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { autoRefresh, setAutoRefresh } = useAutoRefresh();

    // Check if we're on a tournament detail page
    const isTournamentDetail = location.pathname.startsWith('/tournament/');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        sx={{
                            py: 1.5,
                            px: { xs: 2, sm: 0 },
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: 1.5
                        }}
                    >
                        {/* Main navigation row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {/* Back button for tournament detail pages - hide on mobile */}
                            {isTournamentDetail && (
                                <IconButton
                                    onClick={() => navigate('/')}
                                    sx={{
                                        mr: 2,
                                        color: '#64748B',
                                        display: { xs: 'none', md: 'flex' },
                                        '&:hover': {
                                            backgroundColor: '#F5F7FA',
                                            color: '#0066CC',
                                        },
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            )}

                            <Box
                                component={RouterLink}
                                to="/"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    flexGrow: 1,
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    component="img"
                                    src={`${import.meta.env.BASE_URL}favicon-32x32.png`}
                                    alt="Padely Logo"
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        color: '#1A1A2E',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    Padely
                                </Typography>
                            </Box>

                            {/* Auto-refresh toggle for tournament detail pages - desktop only */}
                            {isTournamentDetail && (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#64748B',
                                            }}
                                        >
                                            Auto-refresh
                                        </Typography>
                                    }
                                    sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                                />
                            )}

                            {/* Navigation buttons */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    component={RouterLink}
                                    to="/"
                                    sx={{
                                        color: '#64748B',
                                        fontWeight: 600,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: '#F5F7FA',
                                            color: '#0066CC',
                                        },
                                    }}
                                >
                                    Tournaments
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/rankings?gender=men"
                                    sx={{
                                        color: '#64748B',
                                        fontWeight: 600,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: '#F5F7FA',
                                            color: '#0066CC',
                                        },
                                    }}
                                >
                                    Rankings
                                </Button>
                            </Box>
                        </Box>

                        {/* Second row on mobile - Back button and Auto-refresh */}
                        {isTournamentDetail && (
                            <Box
                                sx={{
                                    display: { xs: 'flex', md: 'none' },
                                    alignItems: 'center',
                                    gap: 2,
                                    width: '100%',
                                }}
                            >
                                <IconButton
                                    onClick={() => navigate('/')}
                                    sx={{
                                        color: '#64748B',
                                        '&:hover': {
                                            backgroundColor: '#F5F7FA',
                                            color: '#0066CC',
                                        },
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#64748B',
                                            }}
                                        >
                                            Auto-refresh
                                        </Typography>
                                    }
                                />
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<TournamentsPage />} />
                    <Route path="/tournament/:id" element={<TournamentDetailPage />} />
                    <Route path="/rankings" element={<RankingsPage />} />
                </Routes>
            </Box>
        </Box>
    );
}

function App() {
    // Get base URL from Vite config (works for both dev and production)
    const basename = import.meta.env.BASE_URL;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter basename={basename}>
                <AutoRefreshProvider>
                    <AppContent />
                </AutoRefreshProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
