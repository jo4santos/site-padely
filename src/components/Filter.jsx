import { ToggleButtonGroup, ToggleButton } from '@mui/material';

/**
 * Filter Component using MUI
 * Supports both single-select (exclusive) and multi-select modes
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
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
            {filters.map(filter => (
                <ToggleButton key={filter.value} value={filter.value}>
                    {filter.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
