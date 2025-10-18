// Life Visualization Manager
class LifeManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentScale = 'year';
        this.birthDate = null;
        this.lifeExpectancy = 80;
        this.init();
    }

    init() {
        this.loadLifeSettings();
        this.setupEventListeners();
        this.renderLifeVisualization();
        this.startCountdownTimer();
    }

    setupEventListeners() {
        // Life settings form
        document.getElementById('updateLifeData').addEventListener('click', () => {
            this.updateLifeSettings();
        });

        // Scale buttons
        document.querySelectorAll('.scale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeScale(e.target.dataset.scale);
            });
        });

        // Birth date and life expectancy inputs
        document.getElementById('birthDate').addEventListener('change', () => {
            this.updateLifeSettings();
        });

        document.getElementById('lifeExpectancy').addEventListener('change', () => {
            this.updateLifeSettings();
        });
    }

    // Load life settings from localStorage
    loadLifeSettings() {
        const settings = this.dataManager.getSettings();
        if (settings.lifeSettings) {
            this.birthDate = settings.lifeSettings.birthDate ? new Date(settings.lifeSettings.birthDate) : null;
            this.lifeExpectancy = settings.lifeSettings.lifeExpectancy || 80;
            
            // Update form inputs
            if (this.birthDate) {
                document.getElementById('birthDate').value = this.formatDate(this.birthDate);
            }
            document.getElementById('lifeExpectancy').value = this.lifeExpectancy;
        }
    }

    // Save life settings to localStorage
    saveLifeSettings() {
        const lifeSettings = {
            birthDate: this.birthDate ? this.formatDate(this.birthDate) : null,
            lifeExpectancy: this.lifeExpectancy
        };
        
        this.dataManager.updateSettings({ lifeSettings });
    }

    // Update life settings from form
    updateLifeSettings() {
        const birthDateInput = document.getElementById('birthDate').value;
        const lifeExpectancyInput = parseInt(document.getElementById('lifeExpectancy').value);

        if (!birthDateInput) {
            window.notificationManager.error('Пожалуйста, введите дату рождения');
            return;
        }

        if (!lifeExpectancyInput || lifeExpectancyInput < 1 || lifeExpectancyInput > 120) {
            window.notificationManager.error('Ожидаемая продолжительность жизни должна быть от 1 до 120 лет');
            return;
        }

        this.birthDate = new Date(birthDateInput);
        this.lifeExpectancy = lifeExpectancyInput;

        // Validate birth date
        const today = new Date();
        if (this.birthDate > today) {
            window.notificationManager.error('Дата рождения не может быть в будущем');
            return;
        }

        const maxAge = today.getFullYear() - this.birthDate.getFullYear();
        if (maxAge > 150) {
            window.notificationManager.error('Дата рождения слишком далеко в прошлом');
            return;
        }

        this.saveLifeSettings();
        this.renderLifeVisualization();
        this.updateLifeStats();
        this.updateCountdown();
        
        window.notificationManager.success('Настройки жизни обновлены');
    }

    // Change visualization scale
    changeScale(scale) {
        this.currentScale = scale;
        
        // Update active button
        document.querySelectorAll('.scale-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === scale);
        });

        this.renderLifeVisualization();
    }

    // Calculate life statistics
    calculateLifeStats() {
        if (!this.birthDate) {
            return {
                daysLived: 0,
                daysRemaining: 0,
                totalDays: 0,
                livedPercentage: 0,
                remainingPercentage: 0,
                productiveDays: 0,
                productivePercentage: 0,
                coinsRemaining: 0
            };
        }

        const today = new Date();
        const deathDate = new Date(this.birthDate);
        deathDate.setFullYear(this.birthDate.getFullYear() + this.lifeExpectancy);

        // Calculate days
        const daysLived = Math.floor((today - this.birthDate) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((deathDate - this.birthDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysLived);

        // Calculate percentages
        const livedPercentage = totalDays > 0 ? (daysLived / totalDays) * 100 : 0;
        const remainingPercentage = totalDays > 0 ? (daysRemaining / totalDays) * 100 : 0;

        // Calculate productive days (days with actions)
        const productiveDays = this.calculateProductiveDays();
        const productivePercentage = daysLived > 0 ? (productiveDays / daysLived) * 100 : 0;

        // Calculate remaining coins (awake hours)
        const dailyCoins = this.dataManager.getAvailableCoins();
        const coinsRemaining = daysRemaining * dailyCoins;

        return {
            daysLived,
            daysRemaining,
            totalDays,
            livedPercentage,
            remainingPercentage,
            productiveDays,
            productivePercentage,
            coinsRemaining
        };
    }

    // Calculate productive days based on actions data
    calculateProductiveDays() {
        if (!this.birthDate) return 0;

        let productiveDays = 0;
        const days = this.dataManager.data.days;

        Object.keys(days).forEach(dateString => {
            const day = days[dateString];
            if (day.actions && day.actions.length > 0) {
                // Consider a day productive if it has any actions
                const totalHours = day.actions.reduce((sum, action) => {
                    const duration = this.dataManager.timeToMinutes(action.endTime) - 
                                   this.dataManager.timeToMinutes(action.startTime);
                    return sum + (duration / 60);
                }, 0);

                // Consider productive if at least 2 hours of planned activities
                if (totalHours >= 2) {
                    productiveDays++;
                }
            }
        });

        return productiveDays;
    }

    // Update life statistics display
    updateLifeStats() {
        const stats = this.calculateLifeStats();

        document.getElementById('daysLived').textContent = stats.daysLived.toLocaleString();
        document.getElementById('livedPercentage').textContent = `${stats.livedPercentage.toFixed(1)}% жизни`;

        document.getElementById('daysRemaining').textContent = stats.daysRemaining.toLocaleString();
        document.getElementById('remainingPercentage').textContent = `${stats.remainingPercentage.toFixed(1)}% жизни`;

        document.getElementById('coinsRemaining').textContent = stats.coinsRemaining.toLocaleString();

        document.getElementById('productiveDays').textContent = stats.productiveDays.toLocaleString();
        document.getElementById('productivePercentage').textContent = `${stats.productivePercentage.toFixed(1)}% от прожитых`;
    }

    // Render life visualization
    renderLifeVisualization() {
        if (!this.birthDate) {
            this.renderEmptyState();
            return;
        }

        this.updateLifeStats();

        const grid = document.getElementById('lifeGrid');
        const title = document.getElementById('visualizationTitle');
        const period = document.getElementById('visualizationPeriod');

        // Clear grid
        grid.innerHTML = '';
        
        // Remove existing scale classes
        grid.classList.remove('year-view', 'month-view', 'week-view');
        
        // Add current scale class
        grid.classList.add(`${this.currentScale}-view`);

        switch (this.currentScale) {
            case 'year':
                this.renderYearView(grid, title, period);
                break;
            case 'month':
                this.renderMonthView(grid, title, period);
                break;
            case 'week':
                this.renderWeekView(grid, title, period);
                break;
        }
    }

    // Render year view (each square = 1 year)
    renderYearView(grid, title, period) {
        title.textContent = 'Визуализация по годам';
        
        const birthYear = this.birthDate.getFullYear();
        const deathYear = birthYear + this.lifeExpectancy;
        const currentYear = new Date().getFullYear();
        
        period.textContent = `${birthYear} - ${deathYear}`;

        for (let year = birthYear; year <= deathYear; year++) {
            const square = document.createElement('div');
            square.className = 'life-square';
            square.title = `${year} год`;

            if (year < currentYear) {
                // Past year - check if productive
                const isProductiveYear = this.isProductiveYear(year);
                square.classList.add(isProductiveYear ? 'lived-productive' : 'lived-unproductive');
            } else if (year === currentYear) {
                square.classList.add('current');
            } else {
                square.classList.add('future');
            }

            grid.appendChild(square);
        }
    }

    // Render month view (each square = 1 month)
    renderMonthView(grid, title, period) {
        const birthYear = this.birthDate.getFullYear();
        const birthMonth = this.birthDate.getMonth();
        const deathYear = birthYear + this.lifeExpectancy;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        title.textContent = 'Визуализация по месяцам';
        
        const totalMonths = this.lifeExpectancy * 12;
        period.textContent = `${totalMonths} месяцев жизни (${birthYear} - ${deathYear})`;

        const monthNames = [
            'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
        ];

        for (let year = birthYear; year <= deathYear; year++) {
            for (let month = 0; month < 12; month++) {
                // Skip months before birth in birth year
                if (year === birthYear && month < birthMonth) continue;
                
                // Skip months after death in death year
                if (year === deathYear && month >= birthMonth) break;

                const square = document.createElement('div');
                square.className = 'life-square';
                square.title = `${monthNames[month]} ${year}`;

                // Determine square state
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    // Past month
                    const isProductiveMonth = this.isProductiveMonth(year, month);
                    square.classList.add(isProductiveMonth ? 'lived-productive' : 'lived-unproductive');
                } else if (year === currentYear && month === currentMonth) {
                    // Current month
                    square.classList.add('current');
                } else {
                    // Future month
                    square.classList.add('future');
                }

                grid.appendChild(square);
            }
        }
    }

    // Render week view (each square = 1 week)
    renderWeekView(grid, title, period) {
        const birthDate = new Date(this.birthDate);
        const deathDate = new Date(this.birthDate);
        deathDate.setFullYear(this.birthDate.getFullYear() + this.lifeExpectancy);
        const currentDate = new Date();
        
        title.textContent = 'Визуализация по неделям';
        
        const totalDays = Math.floor((deathDate - birthDate) / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const livedWeeks = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24 * 7));
        
        period.textContent = `${totalWeeks.toLocaleString()} недель жизни`;

        // Generate squares for each week
        for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
            const weekStart = new Date(birthDate.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            
            const square = document.createElement('div');
            square.className = 'life-square';
            
            square.title = `Неделя ${weekIndex + 1}: ${weekStart.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short' 
            })} - ${weekEnd.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            })}`;

            // Determine square state
            if (weekIndex < livedWeeks) {
                // Past week
                const isProductiveWeek = this.isProductiveWeekByIndex(weekIndex, birthDate);
                square.classList.add(isProductiveWeek ? 'lived-productive' : 'lived-unproductive');
            } else if (weekIndex === livedWeeks) {
                // Current week
                square.classList.add('current');
            } else {
                // Future week
                square.classList.add('future');
            }

            grid.appendChild(square);
        }
    }

    // Check if year was productive
    isProductiveYear(year) {
        const days = this.dataManager.data.days;
        let productiveMonths = 0;

        for (let month = 0; month < 12; month++) {
            if (this.isProductiveMonth(year, month)) {
                productiveMonths++;
            }
        }

        return productiveMonths >= 6; // At least half the year was productive
    }

    // Check if month was productive
    isProductiveMonth(year, month) {
        const days = this.dataManager.data.days;
        let productiveDays = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            if (days[dateString] && this.isDayProductive(dateString)) {
                productiveDays++;
            }
        }

        return productiveDays >= Math.floor(daysInMonth / 3); // At least 1/3 of days were productive
    }

    // Check if week was productive (by week index from birth)
    isProductiveWeekByIndex(weekIndex, birthDate) {
        const weekStart = new Date(birthDate.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);
        let productiveDays = 0;

        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
            const dateString = this.formatDate(day);
            
            if (this.isDayProductive(dateString)) {
                productiveDays++;
            }
        }

        return productiveDays >= 3; // At least 3 days in the week were productive
    }

    // Check if week was productive (legacy method for year-based weeks)
    isProductiveWeek(year, week) {
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = (week - 1) * 7;
        const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        
        let productiveDays = 0;

        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
            const dateString = this.formatDate(day);
            
            if (this.isDayProductive(dateString)) {
                productiveDays++;
            }
        }

        return productiveDays >= 3; // At least 3 days in the week were productive
    }

    // Check if specific day was productive
    isDayProductive(dateString) {
        const day = this.dataManager.data.days[dateString];
        if (!day || !day.actions || day.actions.length === 0) {
            return false;
        }

        const totalHours = day.actions.reduce((sum, action) => {
            const duration = this.dataManager.timeToMinutes(action.endTime) - 
                           this.dataManager.timeToMinutes(action.startTime);
            return sum + (duration / 60);
        }, 0);

        return totalHours >= 2; // At least 2 hours of planned activities
    }

    // Get current week of year
    getCurrentWeekOfYear() {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // Update countdown timer
    updateCountdown() {
        if (!this.birthDate) {
            document.getElementById('yearsLeft').textContent = '0';
            document.getElementById('monthsLeft').textContent = '0';
            document.getElementById('daysLeft').textContent = '0';
            document.getElementById('hoursLeft').textContent = '0';
            return;
        }

        const today = new Date();
        const deathDate = new Date(this.birthDate);
        deathDate.setFullYear(this.birthDate.getFullYear() + this.lifeExpectancy);

        if (today >= deathDate) {
            // Life expectancy exceeded
            document.getElementById('yearsLeft').textContent = '0';
            document.getElementById('monthsLeft').textContent = '0';
            document.getElementById('daysLeft').textContent = '0';
            document.getElementById('hoursLeft').textContent = '0';
            return;
        }

        const timeDiff = deathDate - today;
        
        const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        document.getElementById('yearsLeft').textContent = years.toLocaleString();
        document.getElementById('monthsLeft').textContent = months.toLocaleString();
        document.getElementById('daysLeft').textContent = days.toLocaleString();
        document.getElementById('hoursLeft').textContent = hours.toLocaleString();
    }

    // Start countdown timer (updates every hour)
    startCountdownTimer() {
        this.updateCountdown();
        setInterval(() => {
            this.updateCountdown();
        }, 3600000); // Update every hour
    }

    // Render empty state when no birth date is set
    renderEmptyState() {
        const grid = document.getElementById('lifeGrid');
        grid.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: var(--space-xl);">
                <p>Введите дату рождения для отображения визуализации жизни</p>
            </div>
        `;

        // Reset stats
        document.getElementById('daysLived').textContent = '0';
        document.getElementById('livedPercentage').textContent = '0% жизни';
        document.getElementById('daysRemaining').textContent = '0';
        document.getElementById('remainingPercentage').textContent = '0% жизни';
        document.getElementById('coinsRemaining').textContent = '0';
        document.getElementById('productiveDays').textContent = '0';
        document.getElementById('productivePercentage').textContent = '0% от прожитых';
    }

    // Utility function to format date
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}

// Initialize life manager
window.lifeManager = new LifeManager(window.dataManager);
