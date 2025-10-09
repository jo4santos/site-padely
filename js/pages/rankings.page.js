/**
 * Rankings Page
 */

const RankingsPage = {
    currentGender: 'men',
    rankings: [],

    /**
     * Initialize and render the page
     * @param {string} gender - 'men' or 'women'
     */
    async render(gender = 'men') {
        this.currentGender = gender;
        const content = document.getElementById('main-content');
        content.innerHTML = '<div class="loading">Loading rankings...</div>';

        try {
            this.rankings = await ApiService.getRankings(gender);

            content.innerHTML = `
                <h2 class="page-title">Player Rankings</h2>

                <div class="filters">
                    ${Filter.render([
                        { label: 'Men', value: 'men', active: gender === 'men' },
                        { label: 'Women', value: 'women', active: gender === 'women' }
                    ], 'ranking-gender')}
                </div>

                <div class="rankings-list">
                    ${this.renderRankings(this.rankings)}
                </div>
            `;

            // Setup gender filter handlers
            Filter.setupHandlers('ranking-gender', (newGender) => {
                App.navigate(`?view=rankings&gender=${newGender}`);
            });

        } catch (error) {
            content.innerHTML = '<p>Error loading rankings. Please try again later.</p>';
            console.error(error);
        }
    },

    /**
     * Render rankings list
     */
    renderRankings(rankings) {
        if (!rankings || rankings.length === 0) {
            return '<p>No rankings available.</p>';
        }

        return rankings.map(player => `
            <div class="ranking-card">
                <div class="ranking-position">#${player.position}</div>
                <div class="ranking-player-info">
                    <img src="${player.image}" alt="${player.name}" class="player-image" onerror="this.style.display='none'">
                    <div class="player-details">
                        <h3 class="player-name">${player.name}</h3>
                        <div class="player-country">
                            <img src="${player.flag}" alt="${player.country}" class="country-flag" onerror="this.style.display='none'">
                            <span>${player.country}</span>
                        </div>
                    </div>
                </div>
                <div class="ranking-points">${player.points} pts</div>
            </div>
        `).join('');
    }
};
