/**
 * Match Notification Component
 * Displays match score updates as toast notifications
 */

import { useEffect } from 'react';
import { Snackbar, Alert, Typography, Box } from '@mui/material';
import { SportsTennis as TennisIcon } from '@mui/icons-material';

export default function MatchNotification({ notification, onClose }) {
    useEffect(() => {
        if (notification) {
            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <Snackbar
            open={!!notification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: 8 }}
        >
            <Alert
                onClose={onClose}
                severity={notification.type === 'MATCH_END' ? 'success' : 'info'}
                icon={<TennisIcon />}
                sx={{
                    minWidth: 320,
                    maxWidth: 500,
                    boxShadow: 3,
                    '& .MuiAlert-message': {
                        width: '100%'
                    }
                }}
            >
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {notification.matchName}
                    </Typography>
                    <Typography variant="body2">
                        {notification.message}
                    </Typography>
                </Box>
            </Alert>
        </Snackbar>
    );
}
