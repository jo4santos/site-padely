/**
 * Filter Component
 */

const Filter = {
    /**
     * Render filter buttons
     * @param {Array} options - Array of {label, value, active}
     * @param {string} dataAttr - Data attribute name for filter buttons
     * @returns {string} HTML string
     */
    render(options, dataAttr = 'filter') {
        const buttons = options.map(option => `
            <button class="filter-btn ${option.active ? 'active' : ''}" data-${dataAttr}="${option.value}">
                ${option.label}
            </button>
        `).join('');

        return `<div class="filter-group">${buttons}</div>`;
    },

    /**
     * Setup filter click handlers
     * @param {string} dataAttr - Data attribute name
     * @param {Function} onFilterChange - Callback when filter changes
     */
    setupHandlers(dataAttr, onFilterChange) {
        const buttons = document.querySelectorAll(`[data-${dataAttr}]`);
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all filters
                buttons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked filter
                button.classList.add('active');
                // Call callback with filter value
                const value = button.getAttribute(`data-${dataAttr}`);
                onFilterChange(value);
            });
        });
    }
};
