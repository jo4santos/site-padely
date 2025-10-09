/**
 * Tournament Detail Page
 */

const TournamentDetailPage = {
    currentTournament: null,
    currentDay: 1,
    currentGender: 'all',
    allMatches: [],
    autoRefreshInterval: null,
    autoRefreshEnabled: false,

    /**
     * Initialize and render the page
     * @param {string} tournamentId - Tournament ID
     */
    async render(tournamentId) {
        const content = document.getElementById('main-content');
        content.innerHTML = '<div class="loading">Loading tournament details...</div>';

        try {
            // Get tournament info
            const tournaments = await ApiService.getTournaments();
            this.currentTournament = tournaments.find(t => t.id === tournamentId);

            if (!this.currentTournament) {
                content.innerHTML = '<p>Tournament not found.</p>';
                return;
            }

            // Calculate number of days with date info
            const daysInfo = this.calculateDaysWithDates(this.currentTournament.startDate, this.currentTournament.endDate);

            // Find today's index (if tournament is happening today)
            const todayIndex = daysInfo.findIndex(day => day.label.startsWith('Today'));
            const defaultDayIndex = todayIndex >= 0 ? todayIndex : 0;
            this.currentDay = daysInfo[defaultDayIndex].dayNumber;

            // Render initial layout
            content.innerHTML = `
                <a href="?view=tournaments" class="back-btn" data-link>← Back to Tournaments</a>
                <h2 class="page-title">${this.currentTournament.name}</h2>
                <p>${this.currentTournament.startDate} - ${this.currentTournament.endDate}</p>

                <div class="filters">
                    ${Filter.render([
                        { label: 'All', value: 'all', active: true },
                        { label: 'Men', value: 'men', active: false },
                        { label: 'Women', value: 'women', active: false }
                    ], 'gender')}
                    <button class="auto-refresh-toggle" onclick="TournamentDetailPage.toggleAutoRefresh()">
                        <span class="refresh-icon">🔄</span> Auto-Refresh: <span id="refresh-status">OFF</span>
                    </button>
                </div>

                ${Tabs.render(daysInfo.map((dayInfo, index) => ({
                    label: dayInfo.label,
                    value: dayInfo.dayNumber,
                    active: index === defaultDayIndex,
                    isToday: dayInfo.label.startsWith('Today')
                })), 'day')}

                <div id="matches-container">
                    <div class="loading">Loading matches...</div>
                </div>
            `;

            // Setup handlers
            Filter.setupHandlers('gender', (gender) => {
                this.currentGender = gender;
                this.filterAndDisplayMatches();
            });

            Tabs.setupHandlers('day', (day) => {
                console.log('Day tab clicked:', day);
                this.currentDay = parseInt(day);
                console.log('Loading matches for day:', this.currentDay);
                this.loadMatches();
            });

            // Load initial matches
            this.loadMatches();

            // Auto-start refresh by default
            setTimeout(() => {
                if (!this.autoRefreshEnabled) {
                    this.toggleAutoRefresh();
                }
            }, 1000);

        } catch (error) {
            content.innerHTML = '<p>Error loading tournament details. Please try again later.</p>';
            console.error(error);
        }
    },

    /**
     * Toggle auto-refresh
     */
    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        const statusEl = document.getElementById('refresh-status');

        if (this.autoRefreshEnabled) {
            statusEl.textContent = 'ON';
            statusEl.style.color = '#00a86b';
            this.startAutoRefresh();
        } else {
            statusEl.textContent = 'OFF';
            statusEl.style.color = '#666';
            this.stopAutoRefresh();
        }
    },

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        this.autoRefreshInterval = setInterval(() => {
            console.log('Auto-refreshing matches...');
            this.loadMatches(true); // Pass true to indicate silent refresh
        }, 5000); // 5 seconds

        console.log('Auto-refresh started (every 5 seconds)');
    },

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        console.log('Auto-refresh stopped');
    },

    /**
     * Calculate days between start and end date with human-readable labels
     */
    calculateDaysWithDates(startDate, endDate) {
        // Parse dates in format DD/MM/YYYY
        const [startDay, startMonth, startYear] = startDate.split('/');
        const [endDay, endMonth, endYear] = endDate.split('/');

        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

        const days = [];
        for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);

            // Format the date
            const dayNum = i + 1;
            const dateStr = currentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            // Determine label
            let label;
            const daysDiff = Math.floor((currentDate - today) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                label = `Today (${dateStr})`;
            } else if (daysDiff === 1) {
                label = `Tomorrow (${dateStr})`;
            } else if (daysDiff === -1) {
                label = `Yesterday (${dateStr})`;
            } else if (daysDiff > 1 && daysDiff <= 6) {
                label = dateStr; // Just show the date for upcoming days
            } else if (daysDiff < -1 && daysDiff >= -6) {
                label = dateStr; // Just show the date for recent past days
            } else {
                label = `Day ${dayNum} (${dateStr})`;
            }

            days.push({
                dayNumber: dayNum,
                label: label,
                date: currentDate
            });
        }

        return days;
    },

    /**
     * Load matches for current day
     * @param {boolean} silent - If true, don't show loading indicator and preserve scroll position
     */
    async loadMatches(silent = false) {
        const container = document.getElementById('matches-container');

        if (!silent) {
            container.innerHTML = '<div class="loading">Loading matches...</div>';
        }

        try {
            console.log(`Fetching matches for tournament ${this.currentTournament.id}, day ${this.currentDay}`);
            this.allMatches = await ApiService.getEventMatches(
                this.currentTournament.id,
                this.currentDay
            );
            console.log(`Loaded ${this.allMatches.length} matches`);
            // Pass silent flag to preserve scroll position during auto-refresh
            this.filterAndDisplayMatches(silent);
        } catch (error) {
            if (!silent) {
                container.innerHTML = '<p>Error loading matches for this day.</p>';
            }
            console.error('Error loading matches:', error);
        }
    },

    /**
     * Filter matches by gender and display
     * @param {boolean} preserveScroll - If true, don't scroll to ongoing match
     */
    filterAndDisplayMatches(preserveScroll = false) {
        const container = document.getElementById('matches-container');
        let matches = this.allMatches;

        // Filter by gender
        if (this.currentGender !== 'all') {
            matches = matches.filter(match => {
                const roundName = match.roundName.toLowerCase();
                if (this.currentGender === 'men') {
                    return roundName.includes('men') && !roundName.includes('women');
                } else if (this.currentGender === 'women') {
                    return roundName.includes('women');
                }
                return true;
            });
        }

        // If this is a refresh (preserveScroll is true), try to update intelligently
        if (preserveScroll && container.querySelector('.match-card-wrapper')) {
            this.updateMatchesInPlace(matches);
        } else {
            // Initial render or full refresh
            container.innerHTML = MatchCard.renderList(
                matches,
                this.currentTournament.id,
                this.currentTournament.eventId
            );

            // Only auto-scroll on initial load, not on refresh
            if (!preserveScroll) {
                setTimeout(() => {
                    const firstOngoing = document.querySelector('[data-first-ongoing="true"]');
                    if (firstOngoing) {
                        firstOngoing.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    },

    /**
     * Update matches in place without re-rendering the entire list
     */
    updateMatchesInPlace(matches) {
        const container = document.getElementById('matches-container');
        const existingWrappers = container.querySelectorAll('.match-card-wrapper');

        matches.forEach((match, index) => {
            const wrapper = existingWrappers[index];
            if (!wrapper) return;

            const matchCard = wrapper.querySelector('.match-card');
            if (!matchCard) return;

            // Update scores and points for each team
            const teams = matchCard.querySelectorAll('.team');
            if (teams.length >= 2) {
                this.updateTeamScores(teams[0], match.team1);
                this.updateTeamScores(teams[1], match.team2);
            }

            // Update ongoing status
            const isOngoing = MatchCard.isMatchOngoing(match);
            if (isOngoing) {
                matchCard.classList.add('ongoing');
                // Check if LIVE badge exists, add if not
                if (!matchCard.querySelector('.live-badge')) {
                    const matchInfo = matchCard.querySelector('.match-info');
                    if (matchInfo) {
                        const liveBadge = document.createElement('span');
                        liveBadge.className = 'live-badge';
                        liveBadge.textContent = 'LIVE';
                        matchInfo.appendChild(liveBadge);
                    }
                }
            } else {
                matchCard.classList.remove('ongoing');
                const liveBadge = matchCard.querySelector('.live-badge');
                if (liveBadge) liveBadge.remove();
            }
        });
    },

    /**
     * Update team scores in place
     */
    updateTeamScores(teamElement, teamData) {
        // Update set scores
        const setScores = teamElement.querySelectorAll('.set-score');
        if (setScores[0]) setScores[0].textContent = teamData.set1 || '-';
        if (setScores[1]) setScores[1].textContent = teamData.set2 || '-';
        if (setScores[2]) setScores[2].textContent = teamData.set3 || '-';

        // Update current points
        const currentPointsEl = teamElement.querySelector('.current-points');
        const hasCurrentPoints = teamData.points && teamData.points.trim() !== '';
        const servingIndicator = teamData.isServing ? '🎾 ' : '';

        if (hasCurrentPoints) {
            if (currentPointsEl) {
                // Update existing
                currentPointsEl.textContent = servingIndicator + teamData.points;
            } else {
                // Create new current points element
                const pointsSpan = document.createElement('span');
                pointsSpan.className = 'current-points';
                pointsSpan.textContent = servingIndicator + teamData.points;
                // Insert after team-players
                const teamPlayers = teamElement.querySelector('.team-players');
                if (teamPlayers && teamPlayers.nextSibling) {
                    teamElement.insertBefore(pointsSpan, teamPlayers.nextSibling);
                }
            }
        } else {
            // Remove current points if they exist but shouldn't
            if (currentPointsEl) {
                currentPointsEl.remove();
            }
        }

        // Update winner status
        if (teamData.isWinner) {
            teamElement.classList.add('winner');
        } else {
            teamElement.classList.remove('winner');
        }
    }
};
