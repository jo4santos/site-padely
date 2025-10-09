/**
 * Match Statistics Component
 */

const MatchStats = {
    /**
     * Render match statistics
     * @param {Object} stats - Statistics data
     * @param {string} team1Name - Team 1 name
     * @param {string} team2Name - Team 2 name
     * @returns {string} HTML string
     */
    render(stats, team1Name = 'Team 1', team2Name = 'Team 2') {
        if (!stats || !stats.match) {
            return '<p>No statistics available for this match.</p>';
        }

        // Store team names for use in renderStatsForPeriod
        this.team1Name = team1Name;
        this.team2Name = team2Name;

        return `
            <div class="stats-container">
                <div class="stats-tabs">
                    <div class="tabs">
                        <button class="tab-btn active" data-stat-tab="match">Overall Match</button>
                        ${stats.set1 ? '<button class="tab-btn" data-stat-tab="set1">Set 1</button>' : ''}
                        ${stats.set2 ? '<button class="tab-btn" data-stat-tab="set2">Set 2</button>' : ''}
                        ${stats.set3 ? '<button class="tab-btn" data-stat-tab="set3">Set 3</button>' : ''}
                    </div>
                </div>

                <div id="stats-content">
                    ${this.renderStatsForPeriod(stats.match.team1Stats, stats.match.team2Stats)}
                </div>
            </div>
        `;
    },

    /**
     * Render statistics for a specific period (match/set)
     */
    renderStatsForPeriod(team1Stats, team2Stats) {
        return `
            <div class="stats-teams-header">
                <span class="team-label team1-label">${this.team1Name || 'Team 1'}</span>
                <span class="team-label team2-label">${this.team2Name || 'Team 2'}</span>
            </div>

            ${this.renderStatsSection('Match Stats', [
                { label: 'Total Points Won', team1: team1Stats.match.totalPointsWon, team2: team2Stats.match.totalPointsWon },
                { label: 'Breaking Points Converted', team1: team1Stats.match.breakingPointsConverted, team2: team2Stats.match.breakingPointsConverted },
                { label: 'Longest Streak', team1: team1Stats.match.longestStreak, team2: team2Stats.match.longestStreak }
            ])}

            ${this.renderStatsSection('Serve Stats', [
                { label: 'Aces', team1: team1Stats.serve.aces, team2: team2Stats.serve.aces },
                { label: 'Double Faults', team1: team1Stats.serve.doubleFaults, team2: team2Stats.serve.doubleFaults },
                { label: 'Won on First Serve', team1: team1Stats.serve.wonOnFirstServe, team2: team2Stats.serve.wonOnFirstServe },
                { label: 'Won on Second Serve', team1: team1Stats.serve.wonOnSecondServe, team2: team2Stats.serve.wonOnSecondServe }
            ])}

            ${this.renderStatsSection('Return Stats', [
                { label: 'Won on First Return', team1: team1Stats.returnStats.wonOnFirstReturn, team2: team2Stats.returnStats.wonOnFirstReturn },
                { label: 'Won on Second Return', team1: team1Stats.returnStats.wonOnSecondReturn, team2: team2Stats.returnStats.wonOnSecondReturn }
            ])}

            ${this.renderStatsSection('Total Points', [
                { label: 'Total Won on Serve', team1: team1Stats.totalPoints.totalWonOnServe, team2: team2Stats.totalPoints.totalWonOnServe },
                { label: 'Total Won on Return', team1: team1Stats.totalPoints.totalWonOnReturn, team2: team2Stats.totalPoints.totalWonOnReturn }
            ])}
        `;
    },

    /**
     * Render a statistics section
     */
    renderStatsSection(title, stats) {
        const rows = stats.map(stat => this.renderStatRow(stat)).join('');
        return `
            <div class="stat-section">
                <h3>${title}</h3>
                ${rows}
            </div>
        `;
    },

    /**
     * Render a single stat row with comparison bars
     */
    renderStatRow(stat) {
        const value1 = this.parseStatValue(stat.team1);
        const value2 = this.parseStatValue(stat.team2);

        return `
            <div class="stat-row">
                <span class="stat-value">${stat.team1}</span>
                <div class="stat-bar">
                    <div style="flex: 1; display: flex; justify-content: flex-end;">
                        <div style="width: ${value1}%; height: 8px; background: #0066cc; border-radius: 4px;"></div>
                    </div>
                    <span class="stat-label">${stat.label}</span>
                    <div style="flex: 1;">
                        <div style="width: ${value2}%; height: 8px; background: #00a86b; border-radius: 4px;"></div>
                    </div>
                </div>
                <span class="stat-value">${stat.team2}</span>
            </div>
        `;
    },

    /**
     * Parse stat value to percentage for display
     */
    parseStatValue(value) {
        if (typeof value === 'string' && value.includes('%')) {
            return parseInt(value);
        }
        return parseInt(value) || 0;
    }
};
