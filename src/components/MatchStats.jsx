import { useState } from 'react';
import { Box, Typography, LinearProgress, Stack, Tabs, Tab, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

/**
 * Match Statistics Component using MUI
 * Shows trends between consecutive sets
 */

function parseStatValue(value) {
    if (typeof value === 'string' && value.includes('%')) {
        return parseInt(value);
    }
    return parseInt(value) || 0;
}

function calculateTrend(currentValue, previousValue) {
    const current = parseStatValue(currentValue);
    const previous = parseStatValue(previousValue);
    const diff = current - previous;

    if (diff > 0) return { direction: 'up', diff, icon: TrendingUp, color: 'success' };
    if (diff < 0) return { direction: 'down', diff, icon: TrendingDown, color: 'error' };
    return { direction: 'flat', diff: 0, icon: TrendingFlat, color: 'default' };
}

function StatRow({ label, team1, team2, team1Trend, team2Trend }) {
    const value1 = parseStatValue(team1);
    const value2 = parseStatValue(team2);

    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                <Box sx={{ minWidth: 80, textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {team1}
                    </Typography>
                    {team1Trend && (
                        <Chip
                            icon={<team1Trend.icon />}
                            label={team1Trend.diff > 0 ? `+${team1Trend.diff}` : team1Trend.diff}
                            size="small"
                            color={team1Trend.color}
                            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                        />
                    )}
                </Box>
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
                <Box sx={{ minWidth: 80 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {team2}
                    </Typography>
                    {team2Trend && (
                        <Chip
                            icon={<team2Trend.icon />}
                            label={team2Trend.diff > 0 ? `+${team2Trend.diff}` : team2Trend.diff}
                            size="small"
                            color={team2Trend.color}
                            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                        />
                    )}
                </Box>
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
                <StatRow
                    key={i}
                    label={stat.label}
                    team1={stat.team1}
                    team2={stat.team2}
                    team1Trend={stat.team1Trend}
                    team2Trend={stat.team2Trend}
                />
            ))}
        </Box>
    );
}

function StatsForPeriod({ team1Stats, team2Stats, team1Name, team2Name, previousTeam1Stats, previousTeam2Stats }) {
    // Helper to build stat object with trend
    const buildStat = (label, team1Path, team2Path) => {
        const team1Value = team1Path(team1Stats);
        const team2Value = team2Path(team2Stats);

        const stat = { label, team1: team1Value, team2: team2Value };

        // Add trends if previous stats exist
        if (previousTeam1Stats && previousTeam2Stats) {
            stat.team1Trend = calculateTrend(team1Value, team1Path(previousTeam1Stats));
            stat.team2Trend = calculateTrend(team2Value, team2Path(previousTeam2Stats));
        }

        return stat;
    };

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

            {previousTeam1Stats && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Chip
                        icon={<TrendingUp />}
                        label="Showing trends vs previous set"
                        size="small"
                        color="info"
                        variant="outlined"
                    />
                </Box>
            )}

            <StatsSection
                title="Match Stats"
                stats={[
                    buildStat('Total Points Won', s => s.match.totalPointsWon, s => s.match.totalPointsWon),
                    buildStat('Breaking Points Converted', s => s.match.breakingPointsConverted, s => s.match.breakingPointsConverted),
                    buildStat('Longest Streak', s => s.match.longestStreak, s => s.match.longestStreak)
                ]}
            />

            <StatsSection
                title="Serve Stats"
                stats={[
                    buildStat('Aces', s => s.serve.aces, s => s.serve.aces),
                    buildStat('Double Faults', s => s.serve.doubleFaults, s => s.serve.doubleFaults),
                    buildStat('Won on First Serve', s => s.serve.wonOnFirstServe, s => s.serve.wonOnFirstServe),
                    buildStat('Won on Second Serve', s => s.serve.wonOnSecondServe, s => s.serve.wonOnSecondServe)
                ]}
            />

            <StatsSection
                title="Return Stats"
                stats={[
                    buildStat('Won on First Return', s => s.returnStats.wonOnFirstReturn, s => s.returnStats.wonOnFirstReturn),
                    buildStat('Won on Second Return', s => s.returnStats.wonOnSecondReturn, s => s.returnStats.wonOnSecondReturn)
                ]}
            />

            <StatsSection
                title="Total Points"
                stats={[
                    buildStat('Total Won on Serve', s => s.totalPoints.totalWonOnServe, s => s.totalPoints.totalWonOnServe),
                    buildStat('Total Won on Return', s => s.totalPoints.totalWonOnReturn, s => s.totalPoints.totalWonOnReturn)
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
        { label: 'Overall Match', data: stats.match, previousData: null },
        stats.set1 && { label: 'Set 1', data: stats.set1, previousData: null },
        stats.set2 && { label: 'Set 2', data: stats.set2, previousData: stats.set1 },
        stats.set3 && { label: 'Set 3', data: stats.set3, previousData: stats.set2 }
    ].filter(Boolean);

    const currentTab = tabs[activeTab];
    const currentStats = currentTab.data;
    const previousStats = currentTab.previousData;

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
                previousTeam1Stats={previousStats?.team1Stats}
                previousTeam2Stats={previousStats?.team2Stats}
            />
        </Box>
    );
}
