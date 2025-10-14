import { ToggleButtonGroup, ToggleButton, Avatar, Stack } from '@mui/material';

/**
 * Filter Component using MUI
 * Supports both single-select (exclusive) and multi-select modes
 * Can display flag icons when flag URLs are provided in filter objects
 */

export default function Filter({ filters, activeFilter, onChange, multiSelect = false }) {
    const handleChange = (e, newValue) => {
        if (multiSelect) {
            // For multi-select, newValue is an array
            if (newValue.length === 0) {
                // If nothing is selected, default to 'all'
                onChange(['all']);
            } else if (newValue.includes('all') && newValue.length > 1) {
                // If 'all' is clicked while other filters are selected, show only 'all'
                // If other filter is clicked while 'all' is selected, show only the new filter
                const wasAllSelected = activeFilter.includes('all');
                if (wasAllSelected) {
                    // User clicked a specific filter, remove 'all'
                    onChange(newValue.filter(v => v !== 'all'));
                } else {
                    // User clicked 'all', remove all other filters
                    onChange(['all']);
                }
            } else {
                // Normal selection
                onChange(newValue);
            }
        } else {
            // For single-select, ensure a value is always selected
            if (newValue) {
                onChange(newValue);
            }
        }
    };

    return (
        <ToggleButtonGroup
            value={activeFilter}
            exclusive={!multiSelect}
            onChange={handleChange}
            size="small"
            sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                    border: '2px solid #E2E8F0',
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.8,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'lowercase',
                    fontVariant: 'small-caps',
                    color: '#64748B',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#F8FAFC',
                        borderColor: '#CBD5E1',
                        transform: 'translateY(-1px)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#0066CC',
                        color: '#FFFFFF',
                        borderColor: '#0066CC',
                        '&:hover': {
                            backgroundColor: '#005BB5',
                            borderColor: '#005BB5',
                        },
                    },
                },
            }}
        >
            {filters.map(filter => (
                <ToggleButton key={filter.value} value={filter.value}>
                    {filter.flag ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                src={filter.flag}
                                alt={filter.label}
                                sx={{ width: 20, height: 20 }}
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <span>{filter.label}</span>
                        </Stack>
                    ) : (
                        filter.label
                    )}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
