document.addEventListener('DOMContentLoaded', () => {
  const extensionsList = document.querySelector('.extensions-list');
  const cardTemplate = document.getElementById('extension-card-template');
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const themeToggle = document.getElementById('theme-toggle');

  let extensionsData = [];
  let currentFilter = 'all';

  // --- THEME HANDLING ---
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
    window.currentTheme = newTheme; // just keeps in memory
    applyTheme(newTheme);
  });

  // Load any existing theme (default: light)
  const savedTheme = window.currentTheme || 'light';
  applyTheme(savedTheme);

  // --- RENDER FUNCTION ---
  const renderExtensions = () => {
    extensionsList.innerHTML = '';

    const filteredData = extensionsData.filter(ext => {
      if (currentFilter === 'active') return ext.isActive;
      if (currentFilter === 'inactive') return !ext.isActive;
      return true;
    });

    if (filteredData.length === 0) {
      extensionsList.innerHTML = '<p>No extensions match the current filter.</p>';
      return;
    }

    filteredData.forEach(ext => {
      const card = cardTemplate.content.cloneNode(true);
      const cardElement = card.querySelector('.card');
      
      cardElement.dataset.name = ext.name;

      card.querySelector('.card__logo').src = ext.logo;
      card.querySelector('.card__logo').alt = `${ext.name} logo`;
      card.querySelector('.card__name').textContent = ext.name;
      card.querySelector('.card__description').textContent = ext.description;

      const statusToggle = card.querySelector('.status-toggle__checkbox');
      const toggleId = `status-toggle-${ext.name.replace(/\s+/g, '-')}`;
      statusToggle.checked = ext.isActive;
      statusToggle.id = toggleId;
      card.querySelector('.sr-only').htmlFor = toggleId;

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
      extension.isActive = newStatus;
    }
    if (currentFilter !== 'all') {
      renderExtensions();
    }
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filters__btn--active'));
      btn.classList.add('filters__btn--active');

      currentFilter = btn.dataset.filter;
      renderExtensions();
    });
  });

  // --- INITIALIZATION ---
  const init = async () => {
    try {
      const response = await fetch('./data.json');
      if (!response.ok) throw new Error('Failed to fetch data.json');
      extensionsData = await response.json();
      renderExtensions();
    } catch (error) {
      console.error("Could not load extensions data:", error);
      extensionsList.innerHTML = '<p>Sorry, we could not load the extensions.</p>';
    }
  };

  init();
});
