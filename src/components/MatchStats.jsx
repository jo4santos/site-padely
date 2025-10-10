import { useState } from 'react';
import { Box, Typography, Stack, Tabs, Tab, Chip } from '@mui/material';
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
    const total = value1 + value2;
    const percentage1 = total > 0 ? (value1 / total) * 100 : 50;
    const percentage2 = total > 0 ? (value2 / total) * 100 : 50;

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary', fontSize: '0.7rem' }}>
                {label}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ minWidth: 70, textAlign: 'right' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.875rem' }}>
                            {team1}
                        </Typography>
                        {team1Trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: `${team1Trend.color}.main` }}>
                                <team1Trend.icon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}>
                                    {team1Trend.diff > 0 ? `+${team1Trend.diff}` : team1Trend.diff}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
                <Box sx={{ flex: 1, position: 'relative' }}>
                    <Box sx={{
                        display: 'flex',
                        height: 24,
                        borderRadius: 1,
                        overflow: 'hidden',
                        backgroundColor: 'action.hover'
                    }}>
                        <Box sx={{
                            width: `${percentage1}%`,
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: 0.75
                        }}>
                            {percentage1 > 20 && (
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }}>
                                    {percentage1.toFixed(0)}%
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{
                            width: `${percentage2}%`,
                            backgroundColor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            px: 0.75
                        }}>
                            {percentage2 > 20 && (
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }}>
                                    {percentage2.toFixed(0)}%
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ minWidth: 70 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '0.875rem' }}>
                            {team2}
                        </Typography>
                        {team2Trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: `${team2Trend.color}.main` }}>
                                <team2Trend.icon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}>
                                    {team2Trend.diff > 0 ? `+${team2Trend.diff}` : team2Trend.diff}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
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
            <Stack direction="row" justifyContent="space-around" sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {team1Name || 'Team 1'}
                </Typography>
                <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '0.9rem' }}>
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
