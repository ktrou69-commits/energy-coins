// Data Management and Persistence Layer
class DataManager {
    constructor() {
        this.storageKey = 'energyCoinApp';
        this.data = this.loadData();
        this.categories = {
            work: { name: 'Работа', color: '#3b82f6', icon: '💼' },
            rest: { name: 'Отдых', color: '#fbbf24', icon: '🛋️' },
            sport: { name: 'Спорт', color: '#10b981', icon: '🏃' },
            communication: { name: 'Общение', color: '#ec4899', icon: '💬' },
            learn: { name: 'Обучение', color: '#8b5cf6', icon: '📚' },
            entertainment: { name: 'Развлечения', color: '#f59e0b', icon: '🎮' },
            tasks: { name: 'Дела', color: '#ef4444', icon: '📋' },
            other: { name: 'Другое', color: '#6b7280', icon: '📦' }
        };
        this.priorities = {
            low: { name: 'Низкий', color: '#6b7280' },
            medium: { name: 'Средний', color: '#f59e0b' },
            high: { name: 'Высокий', color: '#ef4444' }
        };
    }

    // Default data structure
    getDefaultData() {
        return {
            settings: {
                sleepStart: '22:30',
                sleepEnd: '08:30',
                theme: 'dark',
                notifications: {
                    morning: true,
                    sleep: true
                }
            },
            days: {},
            actionHistory: [] // For suggestions
        };
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                // Merge with defaults to ensure all properties exist
                return { ...this.getDefaultData(), ...data };
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        return this.getDefaultData();
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Get day data
    getDay(dateString) {
        if (!this.data.days[dateString]) {
            this.data.days[dateString] = {
                actions: [],
                notes: ''
            };
        }
        return this.data.days[dateString];
    }

    // Add or update action
    saveAction(dateString, action) {
        const day = this.getDay(dateString);
        
        if (action.id) {
            // Update existing action
            const index = day.actions.findIndex(a => a.id === action.id);
            if (index !== -1) {
                day.actions[index] = { ...day.actions[index], ...action };
            }
        } else {
            // Add new action
            action.id = this.generateId();
            action.createdAt = new Date().toISOString();
            day.actions.push(action);
        }

        // Add to history for suggestions
        this.addToHistory(action.title, action.category);
        
        this.saveData();
        return action;
    }

    // Delete action
    deleteAction(dateString, actionId) {
        const day = this.getDay(dateString);
        day.actions = day.actions.filter(a => a.id !== actionId);
        this.saveData();
    }

    // Get action by ID
    getAction(dateString, actionId) {
        const day = this.getDay(dateString);
        return day.actions.find(a => a.id === actionId);
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add to action history for suggestions
    addToHistory(title, category) {
        const historyItem = { title, category, count: 1 };
        const existing = this.data.actionHistory.find(h => h.title.toLowerCase() === title.toLowerCase());
        
        if (existing) {
            existing.count++;
        } else {
            this.data.actionHistory.push(historyItem);
        }

        // Keep only top 50 most used
        this.data.actionHistory.sort((a, b) => b.count - a.count);
        this.data.actionHistory = this.data.actionHistory.slice(0, 50);
    }

    // Get suggestions for action titles
    getSuggestions(query = '') {
        if (!query) return [];
        
        const lowerQuery = query.toLowerCase();
        return this.data.actionHistory
            .filter(h => h.title.toLowerCase().includes(lowerQuery))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    // Calculate available coins for a day
    getAvailableCoins() {
        const { sleepStart, sleepEnd } = this.data.settings;
        const sleepStartMinutes = this.timeToMinutes(sleepStart);
        const sleepEndMinutes = this.timeToMinutes(sleepEnd);
        
        let sleepDuration;
        if (sleepEndMinutes > sleepStartMinutes) {
            sleepDuration = sleepEndMinutes - sleepStartMinutes;
        } else {
            // Sleep crosses midnight
            sleepDuration = (24 * 60) - sleepStartMinutes + sleepEndMinutes;
        }
        
        const awakeDuration = (24 * 60) - sleepDuration;
        return Math.floor(awakeDuration / 60); // Convert to hours
    }

    // Calculate used coins for a day
    getUsedCoins(dateString) {
        const day = this.getDay(dateString);
        const usedHours = new Set();
        
        day.actions.forEach(action => {
            const startMinutes = this.timeToMinutes(action.startTime);
            const endMinutes = this.timeToMinutes(action.endTime);
            
            let current = startMinutes;
            while (current < endMinutes) {
                const hour = Math.floor(current / 60);
                usedHours.add(hour);
                current += 60;
            }
        });
        
        return usedHours.size;
    }

    // Get coin status for timeline
    getCoinStatus(dateString, hour) {
        const day = this.getDay(dateString);
        const hourStart = hour * 60;
        const hourEnd = (hour + 1) * 60;
        
        for (const action of day.actions) {
            const actionStart = this.timeToMinutes(action.startTime);
            const actionEnd = this.timeToMinutes(action.endTime);
            
            // Check if action overlaps with this hour
            if (actionStart < hourEnd && actionEnd > hourStart) {
                return {
                    occupied: true,
                    action: action,
                    category: action.category
                };
            }
        }
        
        return { occupied: false };
    }

    // Check if current hour
    isCurrentHour(dateString, hour) {
        const today = new Date();
        const todayString = this.formatDate(today);
        
        if (dateString !== todayString) return false;
        
        return today.getHours() === hour;
    }

    // Time utilities
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Export data to JSON
    exportToJSON() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: this.data,
            categories: this.categories,
            settings: this.data.settings || {}
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `energy-coins-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }

    // Import data from JSON
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate import data structure
                    if (!this.validateImportData(importData)) {
                        reject(new Error('Неверный формат файла'));
                        return;
                    }
                    
                    // Backup current data
                    const backup = { ...this.data };
                    
                    try {
                        // Import data
                        if (importData.data) {
                            this.data = { ...this.data, ...importData.data };
                        }
                        
                        // Import settings if available
                        if (importData.settings) {
                            this.data.settings = { ...this.data.settings, ...importData.settings };
                        }
                        
                        // Save to localStorage
                        this.saveData();
                        
                        resolve({
                            success: true,
                            message: 'Данные успешно импортированы',
                            importedDays: Object.keys(importData.data.days || {}).length,
                            version: importData.version
                        });
                        
                    } catch (error) {
                        // Restore backup on error
                        this.data = backup;
                        this.saveData();
                        reject(new Error('Ошибка при импорте данных: ' + error.message));
                    }
                    
                } catch (error) {
                    reject(new Error('Ошибка чтения файла: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    // Export data to CSV
    exportToCSV() {
        const csvData = [];
        
        // CSV Headers
        csvData.push([
            'Дата',
            'Название',
            'Категория',
            'Время начала',
            'Время окончания',
            'Длительность (часы)',
            'Приоритет',
            'Комментарий'
        ]);
        
        // Export all actions from all days
        Object.entries(this.data.days).forEach(([date, day]) => {
            day.actions.forEach(action => {
                const startMinutes = this.timeToMinutes(action.startTime);
                const endMinutes = this.timeToMinutes(action.endTime);
                const duration = (endMinutes - startMinutes) / 60;
                
                csvData.push([
                    date,
                    action.title,
                    this.categories[action.category]?.name || action.category,
                    action.startTime,
                    action.endTime,
                    duration.toFixed(2),
                    this.priorities[action.priority]?.name || action.priority,
                    action.note || ''
                ]);
            });
        });
        
        // Convert to CSV string
        const csvString = csvData.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Download CSV
        const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `energy-coins-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return csvData.length - 1; // Return number of exported actions
    }

    // Import data from CSV
    async importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csvText = e.target.result;
                    const lines = csvText.split('\n');
                    
                    if (lines.length < 2) {
                        reject(new Error('CSV файл пустой или содержит только заголовки'));
                        return;
                    }
                    
                    // Skip header line
                    const dataLines = lines.slice(1).filter(line => line.trim());
                    let importedCount = 0;
                    let errorCount = 0;
                    
                    dataLines.forEach((line, index) => {
                        try {
                            // Parse CSV line (handle quoted values)
                            const values = this.parseCSVLine(line);
                            
                            if (values.length < 6) {
                                errorCount++;
                                return;
                            }
                            
                            const [date, title, category, startTime, endTime, duration, priority, note] = values;
                            
                            // Convert category name back to key
                            const categoryKey = this.findCategoryKey(category);
                            const priorityKey = this.findPriorityKey(priority);
                            
                            if (!categoryKey || !priorityKey) {
                                errorCount++;
                                return;
                            }
                            
                            // Validate date format
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                                errorCount++;
                                return;
                            }
                            
                            // Create action object
                            const action = {
                                id: this.generateId(),
                                title: title.trim(),
                                category: categoryKey,
                                startTime: startTime.trim(),
                                endTime: endTime.trim(),
                                priority: priorityKey,
                                note: note ? note.trim() : ''
                            };
                            
                            // Validate time format
                            if (!this.isValidTime(action.startTime) || !this.isValidTime(action.endTime)) {
                                errorCount++;
                                return;
                            }
                            
                            // Save action
                            this.saveAction(date, action);
                            importedCount++;
                            
                        } catch (error) {
                            errorCount++;
                        }
                    });
                    
                    resolve({
                        success: true,
                        message: `Импортировано ${importedCount} действий`,
                        imported: importedCount,
                        errors: errorCount
                    });
                    
                } catch (error) {
                    reject(new Error('Ошибка чтения CSV файла: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file, 'utf-8');
        });
    }

    // Helper methods for import/export
    validateImportData(data) {
        return data && 
               typeof data === 'object' && 
               data.version && 
               data.data && 
               typeof data.data === 'object';
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    findCategoryKey(categoryName) {
        return Object.keys(this.categories).find(key => 
            this.categories[key].name === categoryName
        ) || Object.keys(this.categories).find(key => key === categoryName);
    }

    findPriorityKey(priorityName) {
        return Object.keys(this.priorities).find(key => 
            this.priorities[key].name === priorityName
        ) || Object.keys(this.priorities).find(key => key === priorityName);
    }

    isValidTime(timeString) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get next available time slot within active hours
    getNextAvailableSlot(dateString, duration = 60) {
        const day = this.getDay(dateString);
        const settings = this.getSettings();
        
        // Get active hours range
        const wakeHour = parseInt(settings.sleepEnd.split(':')[0]);
        const sleepHour = parseInt(settings.sleepStart.split(':')[0]);
        
        // Create array of occupied minutes
        const occupiedMinutes = new Set();
        day.actions.forEach(action => {
            const start = this.timeToMinutes(action.startTime);
            const end = this.timeToMinutes(action.endTime);
            for (let i = start; i < end; i++) {
                occupiedMinutes.add(i);
            }
        });
        
        // Generate active hours array
        const activeHours = this.getActiveHours(wakeHour, sleepHour);
        
        // Find first available slot within active hours
        for (const hour of activeHours) {
            const hourStart = hour * 60; // Convert hour to minutes
            
            let available = true;
            for (let i = hourStart; i < hourStart + duration; i++) {
                if (occupiedMinutes.has(i)) {
                    available = false;
                    break;
                }
            }
            
            if (available) {
                return {
                    startTime: this.minutesToTime(hourStart),
                    endTime: this.minutesToTime(hourStart + duration)
                };
            }
        }
        
        // If no slot found in active hours, return first active hour
        if (activeHours.length > 0) {
            const firstHour = activeHours[0] * 60;
            return {
                startTime: this.minutesToTime(firstHour),
                endTime: this.minutesToTime(firstHour + duration)
            };
        }
        
        // Fallback to current time if no active hours
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return {
            startTime: this.minutesToTime(currentMinutes),
            endTime: this.minutesToTime(currentMinutes + duration)
        };
    }

    // Get array of active hours from wake to sleep
    getActiveHours(wakeHour, sleepHour) {
        const hours = [];
        
        if (sleepHour > wakeHour) {
            // Same day (e.g., wake at 8, sleep at 23)
            for (let hour = wakeHour; hour <= sleepHour; hour++) {
                hours.push(hour);
            }
        } else {
            // Next day (e.g., wake at 8, sleep at 2 next day)
            // From wake hour to 23
            for (let hour = wakeHour; hour <= 23; hour++) {
                hours.push(hour);
            }
            // From 0 to sleep hour
            for (let hour = 0; hour <= sleepHour; hour++) {
                hours.push(hour);
            }
        }
        
        return hours;
    }

    // Analytics methods
    getCategoryStats(dateString) {
        const day = this.getDay(dateString);
        const stats = {};
        
        Object.keys(this.categories).forEach(cat => {
            stats[cat] = 0;
        });
        
        day.actions.forEach(action => {
            const duration = this.timeToMinutes(action.endTime) - this.timeToMinutes(action.startTime);
            const hours = duration / 60;
            stats[action.category] = (stats[action.category] || 0) + hours;
        });
        
        return stats;
    }

    getWeekStats(startDate) {
        const stats = [];
        const date = new Date(startDate);
        
        for (let i = 0; i < 7; i++) {
            const dateString = this.formatDate(date);
            const dayStats = this.getCategoryStats(dateString);
            const totalHours = Object.values(dayStats).reduce((sum, hours) => sum + hours, 0);
            
            stats.push({
                date: dateString,
                day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
                totalHours,
                categories: dayStats
            });
            
            date.setDate(date.getDate() + 1);
        }
        
        return stats;
    }

    // Get aggregated category stats for a week
    getWeekCategoryStats(startDate) {
        const weekStats = this.getWeekStats(startDate);
        const aggregated = {};
        
        Object.keys(this.categories).forEach(cat => {
            aggregated[cat] = 0;
        });
        
        weekStats.forEach(day => {
            Object.entries(day.categories).forEach(([cat, hours]) => {
                aggregated[cat] += hours;
            });
        });
        
        return aggregated;
    }

    // Get aggregated category stats for a month
    getMonthCategoryStats(year, month) {
        const aggregated = {};
        Object.keys(this.categories).forEach(cat => {
            aggregated[cat] = 0;
        });
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = this.formatDate(date);
            const dayStats = this.getCategoryStats(dateString);
            
            Object.entries(dayStats).forEach(([cat, hours]) => {
                aggregated[cat] += hours;
            });
        }
        
        return aggregated;
    }

    getHourlyStats(dateString) {
        const day = this.getDay(dateString);
        const hourlyStats = Array(24).fill(0);
        
        day.actions.forEach(action => {
            const start = this.timeToMinutes(action.startTime);
            const end = this.timeToMinutes(action.endTime);
            
            for (let minutes = start; minutes < end; minutes += 60) {
                const hour = Math.floor(minutes / 60);
                if (hour >= 0 && hour < 24) {
                    hourlyStats[hour]++;
                }
            }
        });
        
        return hourlyStats;
    }

    // Settings methods
    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.saveData();
    }

    getSettings() {
        return this.data.settings;
    }

    // Export/Import methods
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            this.data = { ...this.getDefaultData(), ...importedData };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Sample data for demo
    createSampleData() {
        const today = new Date();
        const todayString = this.formatDate(today);
        
        const sampleActions = [
            {
                title: 'Завтрак',
                category: 'rest',
                startTime: '08:30',
                endTime: '09:00',
                priority: 'medium',
                note: 'Овсянка с фруктами'
            },
            {
                title: 'Работа над проектом',
                category: 'work',
                startTime: '09:00',
                endTime: '12:00',
                priority: 'high',
                note: 'Разработка нового функционала'
            },
            {
                title: 'Обед',
                category: 'rest',
                startTime: '12:00',
                endTime: '13:00',
                priority: 'medium',
                note: ''
            },
            {
                title: 'Звонок маме',
                category: 'communication',
                startTime: '13:30',
                endTime: '14:00',
                priority: 'medium',
                note: 'Узнать как дела'
            },
            {
                title: 'Изучение JavaScript',
                category: 'learn',
                startTime: '15:00',
                endTime: '16:30',
                priority: 'high',
                note: 'Async/await patterns'
            },
            {
                title: 'Покупки в магазине',
                category: 'tasks',
                startTime: '17:00',
                endTime: '17:30',
                priority: 'medium',
                note: 'Продукты на неделю'
            },
            {
                title: 'Тренировка',
                category: 'sport',
                startTime: '18:00',
                endTime: '19:30',
                priority: 'high',
                note: 'Силовая тренировка'
            },
            {
                title: 'Просмотр фильма',
                category: 'entertainment',
                startTime: '20:00',
                endTime: '22:00',
                priority: 'low',
                note: 'Новый фильм Marvel'
            }
        ];
        
        sampleActions.forEach(action => {
            this.saveAction(todayString, action);
        });
    }
}

// Initialize data manager
window.dataManager = new DataManager();

// Create sample data if no data exists
if (Object.keys(window.dataManager.data.days).length === 0) {
    window.dataManager.createSampleData();
}
