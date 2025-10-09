/**
 * Match Card Component
 */

const MatchCard = {
    /**
     * Render a match card
     * @param {Object} match - Match data
     * @param {string} tournamentId - Tournament ID for linking
     * @param {string} eventId - Event ID for linking
     * @returns {string} HTML string
     */
    render(match, tournamentId, eventId) {
        const isOngoing = this.isMatchOngoing(match);
        const matchKey = `match-${eventId}-${match.matchId}`;

        // Store match data for later use
        if (!this.matchDataCache) this.matchDataCache = {};
        this.matchDataCache[matchKey] = match;

        return `
            <div class="match-card-wrapper">
                <div class="match-card ${isOngoing ? 'ongoing' : ''}" onclick="MatchCard.toggleStats('${matchKey}', '${eventId}', '${match.matchId}', event)">
                    <div class="match-header">
                        <div class="match-info">
                            <span class="court-name">${match.courtName}</span>
                            <span class="round-name">${match.roundName}</span>
                            ${isOngoing ? '<span class="live-badge">LIVE</span>' : ''}
                        </div>
                        <div class="match-header-right">
                            <span class="match-time">${match.startDate}</span>
                            <button class="stats-toggle" onclick="event.stopPropagation(); MatchCard.toggleStats('${matchKey}', '${eventId}', '${match.matchId}', event)">
                                <span class="toggle-icon">▼</span> Stats
                            </button>
                        </div>
                    </div>
                    <div class="match-teams">
                        ${this.renderTeam(match.team1)}
                        ${this.renderTeam(match.team2)}
                    </div>
                </div>
                <div id="${matchKey}" class="match-stats-accordion" style="display: none;">
                    <div class="stats-loading">Click to load statistics...</div>
                </div>
            </div>
        `;
    },

    /**
     * Check if a match is currently ongoing
     */
    isMatchOngoing(match) {
        // A match is ongoing if there are current points being played
        // or if someone is serving (indicated by isServing flag)
        return (match.team1.isServing || match.team2.isServing) ||
               (match.team1.points && match.team1.points !== '' && !match.team1.isWinner && !match.team2.isWinner);
    },

    /**
     * Render a team with players and scores
     */
    renderTeam(team) {
        const winnerClass = team.isWinner ? 'winner' : '';
        const servingIndicator = team.isServing ? '🎾 ' : '';
        const hasCurrentPoints = team.points && team.points.trim() !== '';

        return `
            <div class="team ${winnerClass}">
                <div class="team-players">
                    ${this.renderPlayer(team.player1)}
                    ${this.renderPlayer(team.player2)}
                </div>
                ${hasCurrentPoints ? `<span class="current-points">${servingIndicator}${team.points}</span>` : ''}
                ${team.set1 ? `<span class="set-score">${team.set1}</span>` : '<span class="set-score">-</span>'}
                ${team.set2 ? `<span class="set-score">${team.set2}</span>` : '<span class="set-score">-</span>'}
                ${team.set3 ? `<span class="set-score">${team.set3}</span>` : '<span class="set-score">-</span>'}
            </div>
        `;
    },

    /**
     * Render a player with flag
     */
    renderPlayer(player) {
        if (!player) return '';
        return `
            <div class="player">
                <img src="${player.flag}" alt="Flag" onerror="this.style.display='none'">
                <span class="player-name">${player.name}</span>
            </div>
        `;
    },

    /**
     * Render a list of matches
     * @param {Array} matches - Array of matches
     * @param {string} tournamentId - Tournament ID
     * @param {string} eventId - Event ID
     * @returns {string} HTML string
     */
    renderList(matches, tournamentId, eventId) {
        if (!matches || matches.length === 0) {
            return '<p>No matches scheduled for this day.</p>';
        }

        const cards = matches.map((m, index) => {
            const isOngoing = this.isMatchOngoing(m);
            // Add data attribute to identify first ongoing match
            const dataAttr = isOngoing && matches.findIndex(match => this.isMatchOngoing(match)) === index
                ? 'data-first-ongoing="true"'
                : '';
            const card = this.render(m, tournamentId, eventId);
            return card.replace('<div class="match-card-wrapper', `<div ${dataAttr} class="match-card-wrapper`);
        }).join('');
        return `<div class="matches-list">${cards}</div>`;
    },

    /**
     * Toggle statistics accordion for a match
     */
    async toggleStats(matchKey, eventId, matchId, event) {
        if (event) event.stopPropagation();

        const accordion = document.getElementById(matchKey);
        const toggleBtn = event?.target.closest('.match-card-wrapper')?.querySelector('.toggle-icon');

        if (!accordion) return;

        // If already open, close it
        if (accordion.style.display !== 'none') {
            accordion.style.display = 'none';
            if (toggleBtn) toggleBtn.textContent = '▼';
            return;
        }

        // Open accordion
        accordion.style.display = 'block';
        if (toggleBtn) toggleBtn.textContent = '▲';

        // If stats not loaded yet, load them
        if (accordion.classList.contains('stats-loaded')) {
            return; // Already loaded
        }

        // Show loading state
        accordion.innerHTML = '<div class="stats-loading">Loading statistics...</div>';

        try {
            const stats = await ApiService.getMatchStats(eventId, matchId);

            // Get match data for player names
            const matchData = this.matchDataCache ? this.matchDataCache[matchKey] : null;
            const team1Name = matchData ? this.getTeamName(matchData.team1) : 'Team 1';
            const team2Name = matchData ? this.getTeamName(matchData.team2) : 'Team 2';

            accordion.innerHTML = MatchStats.render(stats, team1Name, team2Name);
            accordion.classList.add('stats-loaded');

            // Setup stats tab handlers
            const buttons = accordion.querySelectorAll('[data-stat-tab]');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all tabs
                    buttons.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked tab
                    button.classList.add('active');

                    // Get the selected period
                    const period = button.getAttribute('data-stat-tab');

                    // Update stats content
                    const container = accordion.querySelector('#stats-content');
                    const periodStats = stats[period];

                    if (periodStats && periodStats.team1Stats && periodStats.team2Stats) {
                        container.innerHTML = MatchStats.renderStatsForPeriod(
                            periodStats.team1Stats,
                            periodStats.team2Stats
                        );
                    }
                });
            });
        } catch (error) {
            accordion.innerHTML = '<div class="stats-error">Error loading statistics. Please try again.</div>';
            console.error('Error loading match stats:', error);
        }
    },

    /**
     * Get team name from player names
     */
    getTeamName(team) {
        if (!team || !team.player1) return '';

        const player1Name = team.player1.name;
        const player2Name = team.player2 ? team.player2.name : '';

        return player2Name ? `${player1Name} & ${player2Name}` : player1Name;
    }
};
