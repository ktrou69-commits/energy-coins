// Main Application Logic
class EnergyCoinApp {
    constructor() {
        this.currentDate = new Date();
        this.currentSection = 'dashboard';
        this.editingAction = null;
        this.draggedCoin = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.updateCurrentDate();
        this.handleMobileLayout();
        this.render();
        // Window resize handler with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.analyticsManager) {
                    window.analyticsManager.handleResize();
                }
                this.handleMobileLayout();
                this.render();
            }, 150);
        });
        this.startTimers();
        
        // Initialize analytics
        if (window.analyticsManager) {
            window.analyticsManager.init();
        }
    }

    setupEventListeners() {
        // Date navigation
        document.getElementById('prevDay').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.changeDate(1));
        document.getElementById('currentDate').addEventListener('change', (e) => {
            this.currentDate = new Date(e.target.value);
            this.render();
        });

        // Touch gestures for date navigation
        this.setupTouchGestures();

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('settingsForm').addEventListener('submit', (e) => this.saveSettings(e));
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeSettings());

        // Import/Export
        document.getElementById('exportJSON').addEventListener('click', () => this.exportJSON());
        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV());
        document.getElementById('importJSON').addEventListener('click', () => this.importJSON());
        document.getElementById('importCSV').addEventListener('click', () => this.importCSV());
        document.getElementById('importJSONFile').addEventListener('change', (e) => this.handleJSONImport(e));
        document.getElementById('importCSVFile').addEventListener('change', (e) => this.handleCSVImport(e));

        // Action modal
        document.getElementById('addActionBtn').addEventListener('click', () => this.openActionModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeActionModal());
        document.getElementById('actionForm').addEventListener('submit', (e) => this.saveAction(e));
        document.getElementById('cancelAction').addEventListener('click', () => this.closeActionModal());
        document.getElementById('deleteAction').addEventListener('click', () => this.deleteCurrentAction());

        // Action title suggestions
        document.getElementById('actionTitle').addEventListener('input', (e) => this.showSuggestions(e));
        document.getElementById('actionTitle').addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Modal backdrop clicks
        document.getElementById('actionModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeActionModal();
        });
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeSettings();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Viewport meta tag for mobile
        this.setupViewport();
    }

    // Setup touch gestures for mobile navigation (only long press, no swipe)
    setupTouchGestures() {
        const timeline = document.getElementById('timeline');

        // Long press for coin context menu (mobile)
        let longPressTimer;
        timeline.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('coin')) {
                longPressTimer = setTimeout(() => {
                    this.showCoinContextMenu(e.target, e.touches[0]);
                }, 500);
            }
        }, { passive: true });

        timeline.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        timeline.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    // Setup viewport for mobile devices
    setupViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // Show context menu for coins on mobile
    showCoinContextMenu(coinElement, touch) {
        const hour = parseInt(coinElement.dataset.hour);
        const dateString = this.formatDate(this.currentDate);
        const coinStatus = window.dataManager.getCoinStatus(dateString, hour);

        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'coin-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${touch.clientY}px;
            left: ${touch.clientX}px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            min-width: 150px;
            transform: translate(-50%, -100%);
        `;

        if (coinStatus.occupied) {
            menu.innerHTML = `
                <button class="context-menu-item" data-action="edit">✏️ Редактировать</button>
                <button class="context-menu-item" data-action="delete">🗑️ Удалить</button>
            `;
        } else {
            menu.innerHTML = `
                <button class="context-menu-item" data-action="add">➕ Добавить действие</button>
            `;
        }

        // Add styles for context menu items
        const style = document.createElement('style');
        style.textContent = `
            .context-menu-item {
                display: block;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: transparent;
                color: var(--text-primary);
                text-align: left;
                cursor: pointer;
                font-size: 14px;
            }
            .context-menu-item:hover {
                background: var(--bg-primary);
            }
            .context-menu-item:first-child {
                border-radius: var(--radius) var(--radius) 0 0;
            }
            .context-menu-item:last-child {
                border-radius: 0 0 var(--radius) var(--radius);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(menu);

        // Handle menu actions
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'edit' && coinStatus.occupied) {
                this.editAction(coinStatus.action);
            } else if (action === 'delete' && coinStatus.occupied) {
                this.deleteAction(coinStatus.action);
            } else if (action === 'add') {
                const startTime = `${hour.toString().padStart(2, '0')}:00`;
                const endTime = `${((hour + 1) % 24).toString().padStart(2, '0')}:00`;
                this.openActionModal({ startTime, endTime });
            }
            document.body.removeChild(menu);
            document.head.removeChild(style);
        });

        // Remove menu on outside click
        setTimeout(() => {
            const removeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    if (document.body.contains(menu)) {
                        document.body.removeChild(menu);
                        document.head.removeChild(style);
                    }
                    document.removeEventListener('click', removeMenu);
                }
            };
            document.addEventListener('click', removeMenu);
        }, 100);
    }

    // Date management
    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateCurrentDate();
        this.render();
    }

    updateCurrentDate() {
        const dateString = this.formatDate(this.currentDate);
        document.getElementById('currentDate').value = dateString;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Theme management
    loadTheme() {
        const settings = window.dataManager.getSettings();
        document.documentElement.setAttribute('data-theme', settings.theme);
        this.updateThemeButton();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        window.dataManager.updateSettings({ theme: newTheme });
        this.updateThemeButton();
    }

    updateThemeButton() {
        const theme = document.documentElement.getAttribute('data-theme');
        const button = document.getElementById('themeToggle');
        button.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    // Section navigation
    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        // Show/hide sections
        document.querySelectorAll('.dashboard, .analytics').forEach(el => {
            el.classList.toggle('hidden', !el.classList.contains(section));
        });

        this.currentSection = section;

        // Render analytics if switching to analytics
        if (section === 'analytics' && window.analyticsManager) {
            setTimeout(() => window.analyticsManager.renderAllCharts(), 100);
        }
    }

    // Main render function
    render() {
        this.renderStats();
        this.renderTimeline();
        this.renderActionsList();
    }

    // Render statistics
    renderStats() {
        const dateString = this.formatDate(this.currentDate);
        const availableCoins = window.dataManager.getAvailableCoins();
        const usedCoins = window.dataManager.getUsedCoins(dateString);
        const remainingCoins = availableCoins - usedCoins;

        // Update coins counter
        document.getElementById('coinsLeft').textContent = remainingCoins;
        document.querySelector('#coinsLeft').nextElementSibling.textContent = 'Осталось коинов';
        document.querySelector('#coinsLeft').nextElementSibling.nextElementSibling.textContent = `из ${availableCoins} доступных`;

        // Update energy bar
        const energyPercentage = availableCoins > 0 ? (remainingCoins / availableCoins) * 100 : 100;
        const energyFill = document.getElementById('energyFill');
        energyFill.style.width = `${energyPercentage}%`;
        
        // Update energy color based on remaining energy
        if (energyPercentage > 60) {
            energyFill.style.background = 'var(--success)';
        } else if (energyPercentage > 30) {
            energyFill.style.background = 'var(--warning)';
        } else {
            energyFill.style.background = 'var(--danger)';
        }

        // Update sleep countdown
        this.updateSleepCountdown();
    }

    updateSleepCountdown() {
        const now = new Date();
        const today = this.formatDate(now);
        const currentDateStr = this.formatDate(this.currentDate);
        
        if (today === currentDateStr) {
            const settings = window.dataManager.getSettings();
            const sleepTime = new Date();
            const [sleepHours, sleepMinutes] = settings.sleepStart.split(':').map(Number);
            sleepTime.setHours(sleepHours, sleepMinutes, 0, 0);
            
            // If sleep time has passed, add a day
            if (sleepTime <= now) {
                sleepTime.setDate(sleepTime.getDate() + 1);
            }
            
            const timeDiff = sleepTime - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('sleepCountdown').textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
        } else {
            document.getElementById('sleepCountdown').textContent = '--:--';
        }
    }

    // Render timeline
    renderTimeline() {
        const timeline = document.getElementById('timeline');
        const dateString = this.formatDate(this.currentDate);
        const today = new Date();
        const isToday = this.formatDate(today) === dateString;
        const currentHour = isToday ? today.getHours() : -1;

        // Get wake/sleep times from settings
        const settings = window.dataManager.getSettings();
        const wakeHour = parseInt(settings.sleepEnd.split(':')[0]); // sleepEnd is wake time
        const sleepHour = parseInt(settings.sleepStart.split(':')[0]); // sleepStart is sleep time

        timeline.innerHTML = '';

        // Generate hours from wake to sleep
        const activeHours = [];
        if (sleepHour > wakeHour) {
            // Same day (e.g., wake at 8, sleep at 22)
            for (let hour = wakeHour; hour <= sleepHour; hour++) {
                activeHours.push(hour);
            }
        } else {
            // Next day (e.g., wake at 8, sleep at 2 next day)
            for (let hour = wakeHour; hour <= 23; hour++) {
                activeHours.push(hour);
            }
            for (let hour = 0; hour <= sleepHour; hour++) {
                activeHours.push(hour);
            }
        }

        activeHours.forEach((hour, index) => {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.dataset.hour = hour;

            const coinStatus = window.dataManager.getCoinStatus(dateString, hour);
            
            if (coinStatus.occupied) {
                coin.classList.add('occupied', `cat-${coinStatus.category}`);
                coin.title = coinStatus.action.title;
            }

            if (hour === currentHour) {
                coin.classList.add('current');
            }

            // Add sleep/wake indicators
            if (hour === wakeHour) {
                coin.classList.add('wake-time');
            }
            if (hour === sleepHour) {
                coin.classList.add('sleep-time');
            }

            coin.innerHTML = `
                <div class="coin-hour">${hour}</div>
                <div class="coin-label">${hour.toString().padStart(2, '0')}:00</div>
            `;

            // Add click handler
            coin.addEventListener('click', () => this.handleCoinClick(hour, coinStatus));
            
            // Add drag and drop
            coin.draggable = coinStatus.occupied;
            if (coinStatus.occupied) {
                coin.addEventListener('dragstart', (e) => this.handleDragStart(e, coinStatus.action));
            }
            coin.addEventListener('dragover', (e) => this.handleDragOver(e));
            coin.addEventListener('drop', (e) => this.handleDrop(e, hour));

            timeline.appendChild(coin);
        });

        // Set grid columns based on screen size
        this.setTimelineColumns(timeline, activeHours.length);

        // Render legend
        this.renderLegend();
    }

    // Helper method to convert time string to hour
    timeToHour(timeString) {
        return parseInt(timeString.split(':')[0]);
    }

    // Set timeline columns based on screen size
    setTimelineColumns(timeline, hoursCount) {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 768) {
            // Mobile: grid layout
            const cols = screenWidth <= 479 ? 4 : 5;
            timeline.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            timeline.style.width = '100%';
            timeline.classList.add('mobile-grid');
        } else {
            // Desktop: horizontal layout
            timeline.style.gridTemplateColumns = `repeat(${hoursCount}, 1fr)`;
            timeline.style.width = '100%';
            timeline.classList.remove('mobile-grid');
        }
    }


    renderLegend() {
        const legend = document.getElementById('legend');
        legend.innerHTML = '';

        Object.entries(window.dataManager.categories).forEach(([key, category]) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <div class="legend-color cat-${key}"></div>
                <span>${category.name}</span>
            `;
            legend.appendChild(item);
        });
    }

    // Handle coin interactions
    handleCoinClick(hour, coinStatus) {
        if (coinStatus.occupied) {
            // Edit existing action
            this.editAction(coinStatus.action);
        } else {
            // Create new action for this hour
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${((hour + 1) % 24).toString().padStart(2, '0')}:00`;
            this.openActionModal({ startTime, endTime });
        }
    }

    // Drag and drop handlers
    handleDragStart(e, action) {
        this.draggedAction = action;
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e, targetHour) {
        e.preventDefault();
        if (!this.draggedAction) return;

        const dateString = this.formatDate(this.currentDate);
        const duration = window.dataManager.timeToMinutes(this.draggedAction.endTime) - 
                        window.dataManager.timeToMinutes(this.draggedAction.startTime);
        
        const newStartTime = `${targetHour.toString().padStart(2, '0')}:00`;
        const newEndMinutes = (targetHour * 60) + duration;
        const newEndTime = window.dataManager.minutesToTime(newEndMinutes);

        // Update action
        const updatedAction = {
            ...this.draggedAction,
            startTime: newStartTime,
            endTime: newEndTime
        };

        window.dataManager.saveAction(dateString, updatedAction);
        this.render();
        
        window.notificationManager.success('Действие перемещено');
        this.draggedAction = null;
    }

    // Render actions list
    renderActionsList() {
        const actionsList = document.getElementById('actionsList');
        const dateString = this.formatDate(this.currentDate);
        const day = window.dataManager.getDay(dateString);

        actionsList.innerHTML = '';

        if (day.actions.length === 0) {
            actionsList.innerHTML = '<div class="text-muted text-center">Нет действий на этот день</div>';
            return;
        }

        // Sort actions by start time
        const sortedActions = [...day.actions].sort((a, b) => 
            window.dataManager.timeToMinutes(a.startTime) - window.dataManager.timeToMinutes(b.startTime)
        );

        sortedActions.forEach(action => {
            const item = document.createElement('div');
            item.className = 'action-item';
            
            const category = window.dataManager.categories[action.category];
            const priority = window.dataManager.priorities[action.priority];
            
            item.innerHTML = `
                <div class="action-color cat-${action.category}"></div>
                <div class="action-content">
                    <div class="action-title">${action.title}</div>
                    <div class="action-details">
                        ${action.startTime} - ${action.endTime} • ${category.name}
                        ${action.priority ? ` • ${priority.name}` : ''}
                        ${action.note ? `<br><small>${action.note}</small>` : ''}
                    </div>
                </div>
                <div class="action-actions">
                    <button class="action-btn" title="Редактировать">✏️</button>
                    <button class="action-btn" title="Удалить">🗑️</button>
                </div>
            `;

            // Add event listeners
            const [editBtn, deleteBtn] = item.querySelectorAll('.action-btn');
            editBtn.addEventListener('click', () => this.editAction(action));
            deleteBtn.addEventListener('click', () => this.deleteAction(action));

            actionsList.appendChild(item);
        });
    }

    // Action modal management
    openActionModal(defaults = {}) {
        const modal = document.getElementById('actionModal');
        const form = document.getElementById('actionForm');
        
        // Reset form
        form.reset();
        document.getElementById('deleteAction').style.display = 'none';
        document.getElementById('modalTitle').textContent = 'Добавить действие';
        
        // Set defaults
        if (defaults.startTime) document.getElementById('startTime').value = defaults.startTime;
        if (defaults.endTime) document.getElementById('endTime').value = defaults.endTime;
        
        // If no defaults provided, use next available slot
        if (!defaults.startTime && !defaults.endTime) {
            const dateString = this.formatDate(this.currentDate);
            const nextSlot = window.dataManager.getNextAvailableSlot(dateString);
            document.getElementById('startTime').value = nextSlot.startTime;
            document.getElementById('endTime').value = nextSlot.endTime;
        }

        this.editingAction = null;
        modal.classList.add('active');
        document.getElementById('actionTitle').focus();
    }

    editAction(action) {
        const modal = document.getElementById('actionModal');
        const form = document.getElementById('actionForm');
        
        // Fill form with action data
        document.getElementById('actionTitle').value = action.title;
        document.getElementById('actionCategory').value = action.category;
        document.getElementById('actionPriority').value = action.priority || 'medium';
        document.getElementById('startTime').value = action.startTime;
        document.getElementById('endTime').value = action.endTime;
        document.getElementById('actionNote').value = action.note || '';
        
        // Show delete button and update title
        document.getElementById('deleteAction').style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Редактировать действие';
        
        this.editingAction = action;
        modal.classList.add('active');
        document.getElementById('actionTitle').focus();
    }

    closeActionModal() {
        document.getElementById('actionModal').classList.remove('active');
        this.editingAction = null;
        this.hideSuggestions();
    }

    saveAction(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const actionData = {
            title: document.getElementById('actionTitle').value.trim(),
            category: document.getElementById('actionCategory').value,
            priority: document.getElementById('actionPriority').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            note: document.getElementById('actionNote').value.trim()
        };

        // Validation
        if (!actionData.title) {
            window.notificationManager.error('Введите название действия');
            return;
        }

        if (!actionData.startTime || !actionData.endTime) {
            window.notificationManager.error('Укажите время начала и окончания');
            return;
        }

        if (actionData.startTime >= actionData.endTime) {
            window.notificationManager.error('Время окончания должно быть позже времени начала');
            return;
        }

        // Add ID if editing
        if (this.editingAction) {
            actionData.id = this.editingAction.id;
        }

        // Save action
        const dateString = this.formatDate(this.currentDate);
        window.dataManager.saveAction(dateString, actionData);
        
        this.closeActionModal();
        this.render();
        
        const message = this.editingAction ? 'Действие обновлено' : 'Действие добавлено';
        window.notificationManager.success(message);
    }

    deleteAction(action) {
        if (confirm('Удалить это действие? Коины будут освобождены.')) {
            const dateString = this.formatDate(this.currentDate);
            window.dataManager.deleteAction(dateString, action.id);
            this.render();
            window.notificationManager.success('Действие удалено');
        }
    }

    deleteCurrentAction() {
        if (this.editingAction) {
            this.deleteAction(this.editingAction);
            this.closeActionModal();
        }
    }

    // Suggestions
    showSuggestions(e) {
        const query = e.target.value.trim();
        const suggestions = window.dataManager.getSuggestions(query);
        const container = document.getElementById('titleSuggestions');
        
        if (suggestions.length === 0 || query.length < 2) {
            this.hideSuggestions();
            return;
        }

        container.innerHTML = '';
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion.title;
            item.addEventListener('click', () => {
                document.getElementById('actionTitle').value = suggestion.title;
                document.getElementById('actionCategory').value = suggestion.category;
                this.hideSuggestions();
            });
            container.appendChild(item);
        });

        container.style.display = 'block';
    }

    hideSuggestions() {
        document.getElementById('titleSuggestions').style.display = 'none';
    }

    // Settings management
    openSettings() {
        const modal = document.getElementById('settingsModal');
        const settings = window.dataManager.getSettings();
        
        // Fill form with current settings
        document.getElementById('sleepStart').value = settings.sleepStart;
        document.getElementById('sleepEnd').value = settings.sleepEnd;
        
        modal.classList.add('active');
    }

    saveSettings(e) {
        e.preventDefault();
        
        const newSettings = {
            sleepStart: document.getElementById('sleepStart').value,
            sleepEnd: document.getElementById('sleepEnd').value,
            notifications: {
                morning: true,
                sleep: true
            }
        };

        window.dataManager.updateSettings(newSettings);
        this.closeSettings();
        this.render(); // Re-render to update coin calculations
        
        window.notificationManager.success('Настройки сохранены');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
        this.hideImportStatus();
    }

    // Export methods
    exportJSON() {
        try {
            const success = window.dataManager.exportToJSON();
            if (success) {
                this.showImportStatus('JSON файл успешно экспортирован', 'success');
            }
        } catch (error) {
            this.showImportStatus('Ошибка экспорта: ' + error.message, 'error');
        }
    }

    exportCSV() {
        try {
            const count = window.dataManager.exportToCSV();
            this.showImportStatus(`CSV файл экспортирован (${count} действий)`, 'success');
        } catch (error) {
            this.showImportStatus('Ошибка экспорта: ' + error.message, 'error');
        }
    }

    // Import methods
    importJSON() {
        document.getElementById('importJSONFile').click();
    }

    importCSV() {
        document.getElementById('importCSVFile').click();
    }

    async handleJSONImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            this.showImportStatus('Импорт JSON файла...', 'info');
            const result = await window.dataManager.importFromJSON(file);
            
            if (result.success) {
                this.showImportStatus(
                    `${result.message} (${result.importedDays} дней, версия ${result.version})`, 
                    'success'
                );
                // Refresh the current view
                this.render();
            }
        } catch (error) {
            this.showImportStatus('Ошибка импорта: ' + error.message, 'error');
        }

        // Clear file input
        event.target.value = '';
    }

    async handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            this.showImportStatus('Импорт CSV файла...', 'info');
            const result = await window.dataManager.importFromCSV(file);
            
            if (result.success) {
                let message = `${result.message}`;
                if (result.errors > 0) {
                    message += `, пропущено ${result.errors} записей`;
                }
                this.showImportStatus(message, 'success');
                // Refresh the current view
                this.render();
            }
        } catch (error) {
            this.showImportStatus('Ошибка импорта: ' + error.message, 'error');
        }

        // Clear file input
        event.target.value = '';
    }

    // Show import/export status message
    showImportStatus(message, type = 'info') {
        let statusDiv = document.getElementById('importStatus');
        
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'importStatus';
            statusDiv.className = 'import-status';
            
            // Insert after backup controls
            const backupControls = document.querySelector('.backup-controls');
            if (backupControls) {
                backupControls.parentNode.insertBefore(statusDiv, backupControls.nextSibling);
            }
        }

        statusDiv.textContent = message;
        statusDiv.className = `import-status ${type}`;
        statusDiv.style.display = 'block';

        // Auto-hide success/info messages after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                this.hideImportStatus();
            }, 5000);
        }
    }

    hideImportStatus() {
        const statusDiv = document.getElementById('importStatus');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }

    // Handle mobile layout adjustments
    handleMobileLayout() {
        // Re-render timeline to apply correct layout
        this.renderTimeline();
    }

    // Keyboard shortcuts
    handleKeyboard(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            if (document.getElementById('actionModal').classList.contains('active')) {
                this.closeActionModal();
            } else if (document.getElementById('settingsModal').classList.contains('active')) {
                this.closeSettings();
            }
        }
        
        // Ctrl/Cmd + N opens new action modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openActionModal();
        }
        
        // Arrow keys for date navigation
        if (e.target === document.body) {
            if (e.key === 'ArrowLeft') {
                this.changeDate(-1);
            } else if (e.key === 'ArrowRight') {
                this.changeDate(1);
            }
        }
    }

    // Timers
    startTimers() {
        // Update sleep countdown every minute
        setInterval(() => {
            this.updateSleepCountdown();
        }, 60000);

        // Update current hour highlighting every minute
        setInterval(() => {
            const timeline = document.getElementById('timeline');
            const coins = timeline.querySelectorAll('.coin');
            const now = new Date();
            const today = this.formatDate(now);
            const currentDateStr = this.formatDate(this.currentDate);
            
            if (today === currentDateStr) {
                const currentHour = now.getHours();
                coins.forEach((coin, index) => {
                    coin.classList.toggle('current', index === currentHour);
                });
            }
        }, 60000);

        // Check for notifications
        this.checkNotifications();
        setInterval(() => {
            this.checkNotifications();
        }, 300000); // Check every 5 minutes
    }

    // Notifications
    checkNotifications() {
        const settings = window.dataManager.getSettings();
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Morning reminder
        if (settings.notifications.morning && currentTime === settings.sleepEnd) {
            window.notificationManager.show('Доброе утро! Не забудьте отметить утренние действия.', 'info', 5000);
        }
        
        // Sleep reminder (30 minutes before sleep time)
        const sleepTime = window.dataManager.timeToMinutes(settings.sleepStart);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        if (settings.notifications.sleep && currentMinutes === sleepTime - 30) {
            const remainingCoins = window.dataManager.getAvailableCoins() - 
                                 window.dataManager.getUsedCoins(this.formatDate(now));
            window.notificationManager.show(
                `Через 30 минут время сна. Осталось ${remainingCoins} коинов.`, 
                'warning', 
                5000
            );
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnergyCoinApp();
});
