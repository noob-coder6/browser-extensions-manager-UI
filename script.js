document.addEventListener('DOMContentLoaded', () => {
    const extensionsList = document.querySelector('.extensions-list');
    const cardTemplate = document.getElementById('extension-card-template');
    const filterBtns = document.querySelectorAll('[data-filter-btn]');
    const themeToggle = document.getElementById('theme-toggle');

    let extensionsData = [];
    let currentFilter = 'all';

    // --- THEME ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.checked = false;
        }
    };

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // --- DATA & RENDERING ---
    const renderExtensions = () => {
        extensionsList.innerHTML = '';

        const filteredData = extensionsData.filter(ext => {
            if (currentFilter === 'active') return ext.isActive;
            if (currentFilter === 'inactive') return !ext.isActive;
            return true; // 'all'
        });

        if (filteredData.length === 0) {
            extensionsList.innerHTML = '<p>No extensions match the current filter.</p>';
            return;
        }

        filteredData.forEach(ext => {
            const card = cardTemplate.content.cloneNode(true);
            const cardElement = card.querySelector('.card');
            
            // Use the extension name as a unique identifier
            cardElement.dataset.name = ext.name;

            card.querySelector('.card__logo').src = ext.logo;
            card.querySelector('.card__logo').alt = `${ext.name} logo`;
            card.querySelector('.card__name').textContent = ext.name;
            card.querySelector('.card__description').textContent = ext.description;

            const statusToggle = card.querySelector('.status-toggle__checkbox');
            statusToggle.checked = ext.isActive;

            card.querySelector('.sr-only').textContent = `Toggle ${ext.name} status`;

            // Event Listeners for the card
            const removeBtn = card.querySelector('.card__remove-btn');
            removeBtn.addEventListener('click', () => handleRemove(ext.name));

            statusToggle.addEventListener('change', () => handleToggle(ext.name, statusToggle.checked));

            extensionsList.appendChild(card);
        });
    };

    // --- EVENT HANDLERS ---
    const handleRemove = (name) => {
        extensionsData = extensionsData.filter(ext => ext.name !== name);
        renderExtensions();
    };

    const handleToggle = (name, newStatus) => {
        const extension = extensionsData.find(ext => ext.name === name);
        if (extension) {
            extension.isActive = newStatus; // Update the data model
        }
        // If a filter is active ('active' or 'inactive'), re-render the list
        // to make the card disappear if it no longer matches the filter.
        if (currentFilter !== 'all') {
            renderExtensions();
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button style
            filterBtns.forEach(b => b.classList.remove('filters__btn--active'));
            btn.classList.add('filters__btn--active');

            // Set filter and re-render
            currentFilter = btn.dataset.filter;
            renderExtensions();
        });
    });

    // --- INITIALIZATION ---
    const init = async () => {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            extensionsData = await response.json();
            renderExtensions();
        } catch (error) {
            console.error("Could not fetch extensions data:", error);
            extensionsList.innerHTML = '<p>Sorry, we could not load the extensions.</p>';
        }
    };

    init();
});