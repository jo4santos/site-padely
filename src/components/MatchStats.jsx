import { useState } from 'react';
import { Box, Typography, LinearProgress, Stack, Tabs, Tab } from '@mui/material';

/**
 * Match Statistics Component using MUI
 */

function parseStatValue(value) {
    if (typeof value === 'string' && value.includes('%')) {
        return parseInt(value);
    }
    return parseInt(value) || 0;
}

function StatRow({ label, team1, team2 }) {
    const value1 = parseStatValue(team1);
    const value2 = parseStatValue(team2);

    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right', fontWeight: 'bold', color: 'primary.main' }}>
                    {team1}
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <LinearProgress
                            variant="determinate"
                            value={value1}
                            sx={{
                                width: `${value1}%`,
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: 'transparent',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'primary.main'
                                }
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 150, textAlign: 'center', fontWeight: 500 }}>
                        {label}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={value2}
                            sx={{
                                width: `${value2}%`,
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: 'transparent',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'success.main'
                                }
                            }}
                        />
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 'bold', color: 'success.main' }}>
                    {team2}
                </Typography>
            </Stack>
        </Box>
    );
}

function StatsSection({ title, stats }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600 }}>
                {title}
            </Typography>
            {stats.map((stat, i) => (
                <StatRow key={i} label={stat.label} team1={stat.team1} team2={stat.team2} />
            ))}
        </Box>
    );
}

function StatsForPeriod({ team1Stats, team2Stats, team1Name, team2Name }) {
    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-around" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {team1Name || 'Team 1'}
                </Typography>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {team2Name || 'Team 2'}
                </Typography>
            </Stack>

            <StatsSection
                title="Match Stats"
                stats={[
                    { label: 'Total Points Won', team1: team1Stats.match.totalPointsWon, team2: team2Stats.match.totalPointsWon },
                    { label: 'Breaking Points Converted', team1: team1Stats.match.breakingPointsConverted, team2: team2Stats.match.breakingPointsConverted },
                    { label: 'Longest Streak', team1: team1Stats.match.longestStreak, team2: team2Stats.match.longestStreak }
                ]}
            />

            <StatsSection
                title="Serve Stats"
                stats={[
                    { label: 'Aces', team1: team1Stats.serve.aces, team2: team2Stats.serve.aces },
                    { label: 'Double Faults', team1: team1Stats.serve.doubleFaults, team2: team2Stats.serve.doubleFaults },
                    { label: 'Won on First Serve', team1: team1Stats.serve.wonOnFirstServe, team2: team2Stats.serve.wonOnFirstServe },
                    { label: 'Won on Second Serve', team1: team1Stats.serve.wonOnSecondServe, team2: team2Stats.serve.wonOnSecondServe }
                ]}
            />

            <StatsSection
                title="Return Stats"
                stats={[
                    { label: 'Won on First Return', team1: team1Stats.returnStats.wonOnFirstReturn, team2: team2Stats.returnStats.wonOnFirstReturn },
                    { label: 'Won on Second Return', team1: team1Stats.returnStats.wonOnSecondReturn, team2: team2Stats.returnStats.wonOnSecondReturn }
                ]}
            />

            <StatsSection
                title="Total Points"
                stats={[
                    { label: 'Total Won on Serve', team1: team1Stats.totalPoints.totalWonOnServe, team2: team2Stats.totalPoints.totalWonOnServe },
                    { label: 'Total Won on Return', team1: team1Stats.totalPoints.totalWonOnReturn, team2: team2Stats.totalPoints.totalWonOnReturn }
                ]}
            />
        </Box>
    );
}

export default function MatchStats({ stats, team1Name = 'Team 1', team2Name = 'Team 2' }) {
    const [activeTab, setActiveTab] = useState(0);

    if (!stats || !stats.match) {
        return <Typography>No statistics available for this match.</Typography>;
    }

    const tabs = [
        { label: 'Overall Match', data: stats.match },
        stats.set1 && { label: 'Set 1', data: stats.set1 },
        stats.set2 && { label: 'Set 2', data: stats.set2 },
        stats.set3 && { label: 'Set 3', data: stats.set3 }
    ].filter(Boolean);

    const currentStats = tabs[activeTab].data;

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth">
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            <StatsForPeriod
                team1Stats={currentStats.team1Stats}
                team2Stats={currentStats.team2Stats}
                team1Name={team1Name}
                team2Name={team2Name}
            />
        </Box>
    );
}
