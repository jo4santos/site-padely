/**
 * Player Name Settings Component
 * Hidden settings UI for managing custom player name mappings
 */

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Box,
    Typography,
    Divider,
    Stack,
    Chip,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { usePlayerNames } from '../contexts/PlayerNamesContext';

export default function PlayerNameSettings({ open, onClose }) {
    const { mappings, setMapping, removeMapping, resetToDefaults, clearAll } = usePlayerNames();
    const [originalName, setOriginalName] = useState('');
    const [preferredName, setPreferredName] = useState('');

    const handleAdd = () => {
        if (originalName.trim() && preferredName.trim()) {
            setMapping(originalName.trim(), preferredName.trim());
            setOriginalName('');
            setPreferredName('');
        }
    };

    const handleRemove = (name) => {
        removeMapping(name);
    };

    const mappingEntries = Object.entries(mappings);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Player Name Customization
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Customize how player names appear throughout the app (voice, notifications, UI)
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    {/* Add new mapping */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            Add New Mapping
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <TextField
                                label="Original Name (from API)"
                                placeholder="e.g., P. Josemaria Martin"
                                value={originalName}
                                onChange={(e) => setOriginalName(e.target.value)}
                                size="small"
                                fullWidth
                            />
                            <Typography sx={{ alignSelf: 'center', mx: 1 }}>→</Typography>
                            <TextField
                                label="Preferred Name"
                                placeholder="e.g., Paulita"
                                value={preferredName}
                                onChange={(e) => setPreferredName(e.target.value)}
                                size="small"
                                fullWidth
                            />
                            <IconButton
                                color="primary"
                                onClick={handleAdd}
                                disabled={!originalName.trim() || !preferredName.trim()}
                            >
                                <Add />
                            </IconButton>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Rankings like (2) are automatically preserved
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Current mappings */}
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Current Mappings ({mappingEntries.length})
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Button size="small" onClick={resetToDefaults}>
                                    Reset to Defaults
                                </Button>
                                <Button size="small" color="error" onClick={clearAll}>
                                    Clear All
                                </Button>
                            </Stack>
                        </Stack>
                        <List sx={{ maxHeight: 400, overflow: 'auto', bgcolor: '#F8F9FA', borderRadius: 1 }}>
                            {mappingEntries.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No mappings configured. Add one above to get started.
                                    </Typography>
                                </Box>
                            ) : (
                                mappingEntries.map(([original, preferred]) => (
                                    <ListItem key={original} divider>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip label={original} size="small" />
                                                    <Typography variant="body2">→</Typography>
                                                    <Chip label={preferred} size="small" color="primary" />
                                                </Stack>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={() => handleRemove(original)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
