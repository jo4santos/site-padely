/**
 * Tournaments List Page
 */

const TournamentsPage = {
    tournaments: [],
    filteredTournaments: [],
    currentTypeFilter: 'all',
    currentSearchQuery: '',

    /**
     * Initialize and render the page
     */
    async render() {
        const content = document.getElementById('main-content');
        content.innerHTML = '<div class="loading">Loading tournaments...</div>';

        try {
            const allTournaments = await ApiService.getTournaments();

            // Filter out specific tournament types
            const excludedTypes = ['world-championships', 'fip-championship'];
            this.tournaments = allTournaments.filter(t => !excludedTypes.includes(t.type));
            this.filteredTournaments = this.tournaments;

            // Separate tournaments happening today
            const { today, upcoming, past } = this.categorizeTournaments(this.tournaments);

            // Get unique tournament types
            const types = this.getUniqueTournamentTypes(this.tournaments);

            content.innerHTML = `
                <h2 class="page-title">Padel Tournaments</h2>

                <!-- Search and Filters -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-input" placeholder="Search tournaments..." />
                    </div>
                    <div class="filters">
                        <label style="font-weight: 600; margin-right: 0.5rem;">Filter by type:</label>
                        ${Filter.render([
                            { label: 'All', value: 'all', active: true },
                            ...types.map(type => ({
                                label: this.formatTypeName(type),
                                value: type,
                                active: false
                            }))
                        ], 'type')}
                    </div>
                </div>

                <!-- Live Today Section -->
                ${today.length > 0 ? `
                    <div class="live-today-section">
                        <h3 class="section-title">
                            <span class="live-indicator">🔴 LIVE</span> Happening Today
                        </h3>
                        ${TournamentCard.renderGrid(today)}
                    </div>
                ` : ''}

                <!-- Upcoming Tournaments Section -->
                ${upcoming.length > 0 ? `
                    <div class="upcoming-tournaments-section">
                        <h3 class="section-title">Upcoming Tournaments</h3>
                        <div id="upcoming-tournaments-list">
                            ${TournamentCard.renderGrid(upcoming)}
                        </div>
                    </div>
                ` : ''}

                <!-- Past Tournaments Section -->
                ${past.length > 0 ? `
                    <div class="past-tournaments-section">
                        <h3 class="section-title">Past Tournaments</h3>
                        <div id="past-tournaments-list">
                            ${TournamentCard.renderGrid(past)}
                        </div>
                    </div>
                ` : ''}
            `;

            // Setup search handler
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', (e) => {
                this.currentSearchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });

            // Setup type filter handlers
            Filter.setupHandlers('type', (type) => {
                this.currentTypeFilter = type;
                this.applyFilters();
            });

        } catch (error) {
            content.innerHTML = '<p>Error loading tournaments. Please try again later.</p>';
            console.error(error);
        }
    },

    /**
     * Categorize tournaments by date
     */
    categorizeTournaments(tournaments) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTournaments = [];
        const upcomingTournaments = [];
        const pastTournaments = [];

        tournaments.forEach(tournament => {
            const { startDate, endDate } = this.parseTournamentDates(tournament);

            if (startDate <= today && endDate >= today) {
                todayTournaments.push(tournament);
            } else if (startDate > today) {
                upcomingTournaments.push(tournament);
            } else {
                pastTournaments.push(tournament);
            }
        });

        return {
            today: todayTournaments,
            upcoming: upcomingTournaments,
            past: pastTournaments
        };
    },

    /**
     * Parse tournament dates
     */
    parseTournamentDates(tournament) {
        // Parse dates in format DD/MM/YYYY
        const [startDay, startMonth, startYear] = tournament.startDate.split('/');
        const [endDay, endMonth, endYear] = tournament.endDate.split('/');

        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
    },

    /**
     * Get unique tournament types
     */
    getUniqueTournamentTypes(tournaments) {
        const types = new Set();
        tournaments.forEach(t => types.add(t.type));
        return Array.from(types).sort();
    },

    /**
     * Format type name for display
     */
    formatTypeName(type) {
        return type.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    /**
     * Apply search and type filters
     */
    applyFilters() {
        let filtered = this.tournaments;

        // Apply type filter
        if (this.currentTypeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === this.currentTypeFilter);
        }

        // Apply search filter
        if (this.currentSearchQuery) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(this.currentSearchQuery)
            );
        }

        // Re-categorize and render
        const { today, upcoming, past } = this.categorizeTournaments(filtered);

        // Update upcoming tournaments list
        const upcomingContainer = document.getElementById('upcoming-tournaments-list');
        if (upcomingContainer) {
            upcomingContainer.innerHTML = upcoming.length > 0
                ? TournamentCard.renderGrid(upcoming)
                : '<p>No upcoming tournaments found matching your filters.</p>';
        }

        // Update past tournaments list
        const pastContainer = document.getElementById('past-tournaments-list');
        if (pastContainer) {
            pastContainer.innerHTML = past.length > 0
                ? TournamentCard.renderGrid(past)
                : '<p>No past tournaments found matching your filters.</p>';
        }

        // Update or hide live section
        const liveSection = document.querySelector('.live-today-section');
        if (today.length > 0) {
            if (!liveSection) {
                // Recreate the section if it doesn't exist
                const allSection = document.querySelector('.all-tournaments-section');
                const newLiveSection = document.createElement('div');
                newLiveSection.className = 'live-today-section';
                newLiveSection.innerHTML = `
                    <h3 class="section-title">
                        <span class="live-indicator">🔴 LIVE</span> Happening Today
                    </h3>
                    ${TournamentCard.renderGrid(today)}
                `;
                allSection.parentNode.insertBefore(newLiveSection, allSection);
            } else {
                // Update existing section
                const liveGrid = liveSection.querySelector('.tournaments-grid');
                if (liveGrid) {
                    liveSection.innerHTML = `
                        <h3 class="section-title">
                            <span class="live-indicator">🔴 LIVE</span> Happening Today
                        </h3>
                        ${TournamentCard.renderGrid(today)}
                    `;
                }
            }
        } else if (liveSection) {
            liveSection.remove();
        }
    }
};
