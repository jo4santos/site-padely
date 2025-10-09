/**
 * Simple Client-Side Router
 */

const Router = (() => {
    const routes = [
        {
            path: '/',
            handler: () => TournamentsPage.render()
        },
        {
            path: '/tournament/:id',
            handler: (params) => TournamentDetailPage.render(params.id)
        },
        {
            path: '/match/:tournamentId/:eventId/:matchId',
            handler: (params) => MatchDetailPage.render(params.tournamentId, params.eventId, params.matchId)
        }
    ];

    /**
     * Match a path against route patterns
     */
    function matchRoute(path) {
        for (const route of routes) {
            const params = {};
            const routeParts = route.path.split('/');
            const pathParts = path.split('/');

            if (routeParts.length !== pathParts.length) {
                continue;
            }

            let match = true;
            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    // Extract parameter
                    const paramName = routeParts[i].slice(1);
                    params[paramName] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { handler: route.handler, params };
            }
        }

        return null;
    }

    /**
     * Navigate to a path
     */
    function navigate(path) {
        window.history.pushState({}, '', path);
        handleRoute(path);
    }

    /**
     * Handle route change
     */
    function handleRoute(path) {
        const match = matchRoute(path);

        if (match) {
            match.handler(match.params);
        } else {
            document.getElementById('main-content').innerHTML = '<h2>404 - Page Not Found</h2>';
        }
    }

    /**
     * Initialize router
     */
    function init() {
        // Handle initial route
        handleRoute(window.location.pathname);

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            handleRoute(window.location.pathname);
        });

        // Handle link clicks with data-route attribute
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    navigate(href);
                }
            }
        });
    }

    return {
        init,
        navigate
    };
})();
