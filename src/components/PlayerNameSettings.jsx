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
import { Delete, Add, Edit, Save, Cancel } from '@mui/icons-material';
import { usePlayerNames } from '../contexts/PlayerNamesContext';

export default function PlayerNameSettings({ open, onClose }) {
    const { mappings, setMapping, removeMapping, resetToDefaults, clearAll } = usePlayerNames();
    const [originalName, setOriginalName] = useState('');
    const [preferredName, setPreferredName] = useState('');
    const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
    const [editingValues, setEditingValues] = useState({ original: '', preferred: '' });

    const handleAdd = () => {
        if (originalName.trim() && preferredName.trim()) {
            setMapping(originalName.trim(), preferredName.trim());
            setOriginalName('');
            setPreferredName('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAdd();
        }
    };

    const handleEditKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSaveEdit();
        } else if (event.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleRemove = (name) => {
        removeMapping(name);
        // Cancel editing if we're editing the item being removed
        if (editingItem === name) {
            setEditingItem(null);
        }
    };

    const handleEdit = (original, preferred) => {
        setEditingItem(original);
        setEditingValues({ original, preferred });
    };

    const handleSaveEdit = () => {
        if (editingValues.original.trim() && editingValues.preferred.trim()) {
            // Remove the old mapping
            removeMapping(editingItem);
            // Add the new mapping
            setMapping(editingValues.original.trim(), editingValues.preferred.trim());
            // Reset editing state
            setEditingItem(null);
            setEditingValues({ original: '', preferred: '' });
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditingValues({ original: '', preferred: '' });
    };

    const mappingEntries = Object.entries(mappings);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Player Name Customization
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Customize how player names appear throughout the app (voice, notifications, UI). Click edit to modify existing mappings.
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
                                onKeyPress={handleKeyPress}
                                size="small"
                                fullWidth
                            />
                            <Typography sx={{ alignSelf: 'center', mx: 1 }}>→</Typography>
                            <TextField
                                label="Preferred Name"
                                placeholder="e.g., Paulita"
                                value={preferredName}
                                onChange={(e) => setPreferredName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                size="small"
                                fullWidth
                            />
                            <IconButton
                                color="primary"
                                onClick={handleAdd}
                                disabled={!originalName.trim() || !preferredName.trim()}
                                title="Add mapping (Enter)"
                            >
                                <Add />
                            </IconButton>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Rankings like (2) are automatically preserved. Press Enter to add.
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
                                        {editingItem === original ? (
                                            // Editing mode
                                            <Box sx={{ width: '100%' }}>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    <TextField
                                                        label="Original Name"
                                                        value={editingValues.original}
                                                        onChange={(e) => setEditingValues(prev => ({ ...prev, original: e.target.value }))}
                                                        onKeyPress={handleEditKeyPress}
                                                        size="small"
                                                        fullWidth
                                                        autoFocus
                                                    />
                                                    <Typography variant="body2">→</Typography>
                                                    <TextField
                                                        label="Preferred Name"
                                                        value={editingValues.preferred}
                                                        onChange={(e) => setEditingValues(prev => ({ ...prev, preferred: e.target.value }))}
                                                        onKeyPress={handleEditKeyPress}
                                                        size="small"
                                                        fullWidth
                                                    />
                                                </Stack>
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 'auto' }}>
                                                        Press Enter to save, Esc to cancel
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={handleSaveEdit}
                                                        disabled={!editingValues.original.trim() || !editingValues.preferred.trim()}
                                                        title="Save changes (Enter)"
                                                    >
                                                        <Save fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={handleCancelEdit}
                                                        title="Cancel changes (Esc)"
                                                    >
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                        ) : (
                                            // Display mode
                                            <>
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
                                                    <Stack direction="row" spacing={0.5}>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={() => handleEdit(original, preferred)}
                                                            title="Edit mapping"
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={() => handleRemove(original)}
                                                            title="Delete mapping"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </ListItemSecondaryAction>
                                            </>
                                        )}
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
