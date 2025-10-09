import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { SportsTennis as TennisIcon } from '@mui/icons-material';
import TournamentsPage from './pages/Tournaments';
import TournamentDetailPage from './pages/TournamentDetail';
import RankingsPage from './pages/Rankings';

// Create custom theme for padel colors
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // Blue
        },
        secondary: {
            main: '#dc004e', // Pink/Red
        },
        success: {
            main: '#00a86b', // Green
        },
        error: {
            main: '#f44336', // Red for LIVE badges
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h3: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
});

function App() {
    // Get base URL from Vite config (works for both dev and production)
    const basename = import.meta.env.BASE_URL;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter basename={basename}>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar position="static">
                        <Toolbar>
                            <TennisIcon sx={{ mr: 2 }} />
                            <Typography
                                variant="h6"
                                component={RouterLink}
                                to="/"
                                sx={{
                                    flexGrow: 1,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    fontWeight: 'bold'
                                }}
                            >
                                Padely
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/"
                                color="inherit"
                            >
                                Tournaments
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/rankings?gender=men"
                                color="inherit"
                            >
                                Rankings
                            </Button>
                        </Toolbar>
                    </AppBar>

                    <Box component="main" sx={{ flexGrow: 1 }}>
                        <Routes>
                            <Route path="/" element={<TournamentsPage />} />
                            <Route path="/tournament/:id" element={<TournamentDetailPage />} />
                            <Route path="/rankings" element={<RankingsPage />} />
                        </Routes>
                    </Box>
                </Box>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
