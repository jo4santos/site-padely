/**
 * Main Application - Single Page App with Query Parameters
 */

const App = {
    currentView: 'tournaments',
    currentParams: {},

    /**
     * Initialize the application
     */
    init() {
        // Parse URL parameters
        this.parseURL();

        // Listen for popstate (back/forward buttons)
        window.addEventListener('popstate', () => {
            this.parseURL();
            this.render();
        });

        // Handle all link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                const url = link.getAttribute('href');
                this.navigate(url);
            }
        });

        // Initial render
        this.render();
    },

    /**
     * Parse URL parameters
     */
    parseURL() {
        const params = new URLSearchParams(window.location.search);

        // Default view
        this.currentView = params.get('view') || 'tournaments';

        // Store all params
        this.currentParams = {
            view: this.currentView,
            id: params.get('id'),
            eventId: params.get('eventId'),
            matchId: params.get('matchId'),
            day: params.get('day'),
            gender: params.get('gender')
        };
    },

    /**
     * Navigate to a new URL
     */
    navigate(url) {
        // Update URL without page reload
        window.history.pushState({}, '', url);

        // Parse new URL and render
        this.parseURL();
        this.render();
    },

    /**
     * Render the current view
     */
    async render() {
        const content = document.getElementById('main-content');

        // Clear any auto-refresh timers from previous views
        if (window.TournamentDetailPage && window.TournamentDetailPage.stopAutoRefresh) {
            window.TournamentDetailPage.stopAutoRefresh();
        }

        switch (this.currentView) {
            case 'tournaments':
                await TournamentsPage.render();
                break;

            case 'tournament':
                if (this.currentParams.id) {
                    await TournamentDetailPage.render(this.currentParams.id);
                } else {
                    content.innerHTML = '<p>Tournament ID missing</p>';
                }
                break;

            case 'rankings':
                const gender = this.currentParams.gender || 'men';
                await RankingsPage.render(gender);
                break;

            default:
                content.innerHTML = '<h2>404 - Page Not Found</h2>';
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
