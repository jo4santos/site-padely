/**
 * Match Detail Page
 */

const MatchDetailPage = {
    /**
     * Initialize and render the page
     * @param {string} tournamentId - Tournament ID
     * @param {string} eventId - Event ID
     * @param {string} matchId - Match ID
     */
    async render(tournamentId, eventId, matchId) {
        const content = document.getElementById('main-content');
        content.innerHTML = '<div class="loading">Loading match details...</div>';

        try {
            // Get match stats
            const stats = await ApiService.getMatchStats(eventId, matchId);

            // We need to get match data to show teams - try to get from the current day
            // Since we don't have the day here, we'll need to fetch it or store it
            // For now, we'll show a simplified version in the stats component

            content.innerHTML = `
                <a href="/tournament/${tournamentId}" class="back-btn" data-route>← Back to Tournament</a>
                <h2 class="page-title">Match Details</h2>

                <div class="match-detail-info">
                    <div class="match-id">Match ID: ${matchId}</div>
                    ${stats.duration ? `<div class="match-duration">Duration: ${stats.duration}</div>` : ''}
                </div>

                ${MatchStats.render(stats)}
            `;

            // Setup stats tab handlers
            this.setupStatsTabHandlers(stats);

        } catch (error) {
            content.innerHTML = '<p>Error loading match details. Please try again later.</p>';
            console.error(error);
        }
    },

    /**
     * Setup handlers for stats tabs
     */
    setupStatsTabHandlers(stats) {
        const buttons = document.querySelectorAll('[data-stat-tab]');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs
                buttons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked tab
                button.classList.add('active');

                // Get the selected period
                const period = button.getAttribute('data-stat-tab');

                // Update stats content
                const container = document.getElementById('stats-content');
                const periodStats = stats[period];

                if (periodStats && periodStats.team1Stats && periodStats.team2Stats) {
                    container.innerHTML = MatchStats.renderStatsForPeriod(
                        periodStats.team1Stats,
                        periodStats.team2Stats
                    );
                }
            });
        });
    }
};
