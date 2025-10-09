/**
 * Tournament Card Component
 */

const TournamentCard = {
    /**
     * Render a tournament card
     * @param {Object} tournament - Tournament data
     * @returns {string} HTML string
     */
    render(tournament) {
        return `
            <a href="?view=tournament&id=${tournament.id}" class="tournament-card" data-link>
                <img src="${tournament.cover}" alt="${tournament.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Tournament'">
                <div class="tournament-card-content">
                    <span class="type">${this.formatType(tournament.type)}</span>
                    <h3>${tournament.name}</h3>
                    <p class="dates">${tournament.startDate} - ${tournament.endDate}</p>
                </div>
            </a>
        `;
    },

    /**
     * Format tournament type for display
     */
    formatType(type) {
        return type.replace(/-/g, ' ').toUpperCase();
    },

    /**
     * Render a grid of tournament cards
     * @param {Array} tournaments - Array of tournaments
     * @returns {string} HTML string
     */
    renderGrid(tournaments) {
        if (!tournaments || tournaments.length === 0) {
            return '<p>No tournaments found.</p>';
        }

        const cards = tournaments.map(t => this.render(t)).join('');
        return `<div class="tournaments-grid">${cards}</div>`;
    }
};
