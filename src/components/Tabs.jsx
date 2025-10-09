import { Tabs as MuiTabs, Tab, Box } from '@mui/material';

/**
 * Tabs Component using MUI
 */

export default function Tabs({ tabs, activeTab, onChange }) {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <MuiTabs
                value={activeTab}
                onChange={(e, newValue) => onChange(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {tabs.map(tab => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                        sx={{
                            fontWeight: tab.isToday ? 'bold' : 'normal',
                            color: tab.isToday ? 'primary.main' : 'text.primary'
                        }}
                    />
                ))}
            </MuiTabs>
        </Box>
    );
}
