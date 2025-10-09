import { ToggleButtonGroup, ToggleButton } from '@mui/material';

/**
 * Filter Component using MUI
 */

export default function Filter({ filters, activeFilter, onChange }) {
    return (
        <ToggleButtonGroup
            value={activeFilter}
            exclusive
            onChange={(e, newValue) => newValue && onChange(newValue)}
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
