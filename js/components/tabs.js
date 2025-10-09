/**
 * Tabs Component
 */

const Tabs = {
    /**
     * Render tabs
     * @param {Array} tabs - Array of {label, value, active, isToday}
     * @param {string} dataAttr - Data attribute name for tab buttons
     * @returns {string} HTML string
     */
    render(tabs, dataAttr = 'tab') {
        const tabButtons = tabs.map(tab => `
            <button class="tab-btn ${tab.active ? 'active' : ''} ${tab.isToday ? 'today' : ''}" data-${dataAttr}="${tab.value}">
                ${tab.label}
            </button>
        `).join('');

        return `<div class="tabs">${tabButtons}</div>`;
    },

    /**
     * Setup tab click handlers
     * @param {string} dataAttr - Data attribute name
     * @param {Function} onTabChange - Callback when tab changes
     */
    setupHandlers(dataAttr, onTabChange) {
        const buttons = document.querySelectorAll(`[data-${dataAttr}]`);
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs
                buttons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked tab
                button.classList.add('active');
                // Call callback with tab value
                const value = button.getAttribute(`data-${dataAttr}`);
                onTabChange(value);
            });
        });
    }
};
