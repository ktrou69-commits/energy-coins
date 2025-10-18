// Analytics and Charts Module
class AnalyticsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.charts = {};
    }

    // Initialize analytics
    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Analytics will be rendered when the analytics section becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.id === 'analyticsSection') {
                    this.renderAllCharts();
                }
            });
        });

        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) {
            observer.observe(analyticsSection);
        }

        // Re-render charts on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!analyticsSection.classList.contains('hidden')) {
                    this.renderAllCharts();
                }
            }, 250);
        });

        // Re-render charts on orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (!analyticsSection.classList.contains('hidden')) {
                    this.renderAllCharts();
                }
            }, 500);
        });
    }

    // Render all charts
    renderAllCharts() {
        const currentDate = document.getElementById('currentDate').value;
        this.renderCategoryChart(currentDate);
        this.renderWeekCategoryChart(currentDate);
        this.renderMonthCategoryChart(currentDate);
        this.renderWeekChart(currentDate);
        this.renderHoursChart(currentDate);
    }

    // Create simple canvas-based pie chart
    renderCategoryChart(dateString) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const stats = this.dataManager.getCategoryStats(dateString);
        
        // Set responsive canvas size
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const size = Math.min(containerWidth - 40, 300);
        
        canvas.width = size;
        canvas.height = size;
        
        // Set CSS size for proper scaling
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate total and percentages
        const total = Object.values(stats).reduce((sum, hours) => sum + hours, 0);
        if (total === 0) {
            this.drawEmptyState(ctx, canvas, 'Нет данных за этот день');
            return;
        }

        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        Object.entries(stats).forEach(([category, hours]) => {
            if (hours > 0) {
                const percentage = hours / total;
                const sliceAngle = percentage * 2 * Math.PI;
                
                // Draw slice
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                
                const categoryInfo = this.dataManager.categories[category];
                ctx.fillStyle = categoryInfo.color;
                ctx.fill();
                
                // Draw label
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            }
        });

        // Draw legend
        this.drawLegend(ctx, canvas, stats);
    }

    // Create weekly category pie chart
    renderWeekCategoryChart(dateString) {
        const canvas = document.getElementById('weekCategoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Get week start date (Monday)
        const currentDate = new Date(dateString);
        const dayOfWeek = currentDate.getDay();
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        
        const stats = this.dataManager.getWeekCategoryStats(startDate);
        
        // Set responsive canvas size
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const size = Math.min(containerWidth - 40, 300);
        
        canvas.width = size;
        canvas.height = size;
        
        // Set CSS size for proper scaling
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate total and percentages
        const total = Object.values(stats).reduce((sum, hours) => sum + hours, 0);
        if (total === 0) {
            this.drawEmptyState(ctx, canvas, 'Нет данных за эту неделю');
            return;
        }

        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        Object.entries(stats).forEach(([category, hours]) => {
            if (hours > 0) {
                const percentage = hours / total;
                const sliceAngle = percentage * 2 * Math.PI;
                
                // Draw slice
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                
                const categoryInfo = this.dataManager.categories[category];
                ctx.fillStyle = categoryInfo.color;
                ctx.fill();
                
                // Draw label
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            }
        });

        // Draw legend
        this.drawLegend(ctx, canvas, stats);
    }

    // Create monthly category pie chart
    renderMonthCategoryChart(dateString) {
        const canvas = document.getElementById('monthCategoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const currentDate = new Date(dateString);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const stats = this.dataManager.getMonthCategoryStats(year, month);
        
        // Set responsive canvas size
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const size = Math.min(containerWidth - 40, 300);
        
        canvas.width = size;
        canvas.height = size;
        
        // Set CSS size for proper scaling
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate total and percentages
        const total = Object.values(stats).reduce((sum, hours) => sum + hours, 0);
        if (total === 0) {
            this.drawEmptyState(ctx, canvas, 'Нет данных за этот месяц');
            return;
        }

        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        Object.entries(stats).forEach(([category, hours]) => {
            if (hours > 0) {
                const percentage = hours / total;
                const sliceAngle = percentage * 2 * Math.PI;
                
                // Draw slice
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                
                const categoryInfo = this.dataManager.categories[category];
                ctx.fillStyle = categoryInfo.color;
                ctx.fill();
                
                // Draw label
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            }
        });

        // Draw legend
        this.drawLegend(ctx, canvas, stats);
    }

    // Create simple bar chart for week data
    renderWeekChart(dateString) {
        const canvas = document.getElementById('weekChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Get week data
        const startDate = new Date(dateString);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
        const weekStats = this.dataManager.getWeekStats(startDate);
        
        // Set responsive canvas size
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const width = Math.min(containerWidth - 40, 400);
        const height = Math.min(width * 0.75, 300);
        
        canvas.width = width;
        canvas.height = height;
        
        // Set CSS size for proper scaling
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxHours = Math.max(...weekStats.map(day => day.totalHours), 1);
        const barWidth = (canvas.width - 80) / 7;
        const maxBarHeight = canvas.height - 60;
        
        weekStats.forEach((day, index) => {
            const barHeight = (day.totalHours / maxHours) * maxBarHeight;
            const x = 40 + index * barWidth;
            const y = canvas.height - 40 - barHeight;
            
            // Draw bar
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y, barWidth - 10, barHeight);
            
            // Draw day label
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(day.day, x + (barWidth - 10) / 2, canvas.height - 20);
            
            // Draw hours label
            if (day.totalHours > 0) {
                ctx.fillText(`${day.totalHours.toFixed(1)}ч`, x + (barWidth - 10) / 2, y - 5);
            }
        });
        
        // Draw title
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Активность по дням недели', canvas.width / 2, 20);
    }

    // Create hourly activity chart
    renderHoursChart(dateString) {
        const canvas = document.getElementById('hoursChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const hourlyStats = this.dataManager.getHourlyStats(dateString);
        
        // Set responsive canvas size
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const width = Math.min(containerWidth - 40, 400);
        const height = Math.min(width * 0.75, 300);
        
        canvas.width = width;
        canvas.height = height;
        
        // Set CSS size for proper scaling
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxActivity = Math.max(...hourlyStats, 1);
        const barWidth = (canvas.width - 80) / 24;
        const maxBarHeight = canvas.height - 60;
        
        hourlyStats.forEach((activity, hour) => {
            const barHeight = (activity / maxActivity) * maxBarHeight;
            const x = 40 + hour * barWidth;
            const y = canvas.height - 40 - barHeight;
            
            // Draw bar
            ctx.fillStyle = activity > 0 ? '#10b981' : '#374151';
            ctx.fillRect(x, y, barWidth - 2, barHeight || 2);
            
            // Draw hour label (every 4 hours)
            if (hour % 4 === 0) {
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted');
                ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${hour}:00`, x + (barWidth - 2) / 2, canvas.height - 5);
            }
        });
        
        // Draw title
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Активность по часам', canvas.width / 2, 20);
    }

    // Draw legend for pie chart
    drawLegend(ctx, canvas, stats) {
        const legendY = canvas.height - 80;
        let legendX = 20;
        
        Object.entries(stats).forEach(([category, hours]) => {
            if (hours > 0) {
                const categoryInfo = this.dataManager.categories[category];
                
                // Draw color box
                ctx.fillStyle = categoryInfo.color;
                ctx.fillRect(legendX, legendY, 12, 12);
                
                // Draw text
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
                ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`${categoryInfo.name} (${hours.toFixed(1)}ч)`, legendX + 16, legendY + 9);
                
                legendX += ctx.measureText(`${categoryInfo.name} (${hours.toFixed(1)}ч)`).width + 30;
                
                // Wrap to next line if needed
                if (legendX > canvas.width - 100) {
                    legendX = 20;
                    legendY += 20;
                }
            }
        });
    }

    // Draw empty state
    drawEmptyState(ctx, canvas, message) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted');
        ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }

    // Get productivity insights
    getProductivityInsights(dateString) {
        const stats = this.dataManager.getCategoryStats(dateString);
        const hourlyStats = this.dataManager.getHourlyStats(dateString);
        const totalHours = Object.values(stats).reduce((sum, hours) => sum + hours, 0);
        const availableCoins = this.dataManager.getAvailableCoins();
        
        const insights = [];
        
        // Utilization insight
        const utilization = (totalHours / availableCoins) * 100;
        if (utilization > 80) {
            insights.push({
                type: 'success',
                title: 'Высокая продуктивность',
                message: `Вы использовали ${utilization.toFixed(1)}% доступного времени`
            });
        } else if (utilization < 50) {
            insights.push({
                type: 'warning',
                title: 'Есть резерв времени',
                message: `Использовано только ${utilization.toFixed(1)}% времени`
            });
        }
        
        // Category balance insight
        const workHours = stats.work || 0;
        const restHours = stats.rest || 0;
        const workRestRatio = workHours / (restHours || 1);
        
        if (workRestRatio > 3) {
            insights.push({
                type: 'warning',
                title: 'Дисбаланс работы и отдыха',
                message: 'Рекомендуется больше времени на отдых'
            });
        }
        
        // Peak hours insight
        const peakHour = hourlyStats.indexOf(Math.max(...hourlyStats));
        if (peakHour !== -1 && Math.max(...hourlyStats) > 0) {
            insights.push({
                type: 'info',
                title: 'Пик активности',
                message: `Наиболее активное время: ${peakHour}:00`
            });
        }
        
        return insights;
    }

    // Generate summary report
    generateSummaryReport(dateString) {
        const stats = this.dataManager.getCategoryStats(dateString);
        const insights = this.getProductivityInsights(dateString);
        const totalHours = Object.values(stats).reduce((sum, hours) => sum + hours, 0);
        const availableCoins = this.dataManager.getAvailableCoins();
        
        return {
            date: dateString,
            totalHours,
            availableCoins,
            utilization: (totalHours / availableCoins) * 100,
            categoryBreakdown: stats,
            insights,
            topCategory: Object.entries(stats).reduce((a, b) => stats[a[0]] > stats[b[0]] ? a : b, ['', 0])
        };
    }
}

// Simple notification system
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: var(--space-md);
            margin-bottom: var(--space-sm);
            box-shadow: var(--shadow-lg);
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Add type-specific styling
        if (type === 'success') {
            notification.style.borderLeftColor = 'var(--success)';
            notification.style.borderLeftWidth = '4px';
        } else if (type === 'warning') {
            notification.style.borderLeftColor = 'var(--warning)';
            notification.style.borderLeftWidth = '4px';
        } else if (type === 'error') {
            notification.style.borderLeftColor = 'var(--danger)';
            notification.style.borderLeftWidth = '4px';
        }
        
        notification.textContent = message;
        this.container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);
        
        // Click to remove
        notification.addEventListener('click', () => {
            this.remove(notification);
        });
    }

    remove(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }
}

// Initialize analytics and notifications
window.analyticsManager = new AnalyticsManager(window.dataManager);
window.notificationManager = new NotificationManager();
