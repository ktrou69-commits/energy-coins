// Timer / Pomodoro Manager for Energy Coins App

class TimerManager {
    constructor() {
        this.currentTimer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.mode = 'pomodoro'; // pomodoro, custom, free
        this.phase = 'focus'; // focus, break, long-break
        this.currentCycle = 1;
        this.totalCycles = 4;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        
        // Settings
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            cyclesBeforeLongBreak: 4,
            autoStartBreaks: true,
            autoStartPomodoros: false,
            soundNotifications: true,
            browserNotifications: true
        };

        // Statistics
        this.stats = {
            todayPomodoros: 0,
            totalFocusTime: 0,
            completedCycles: 0,
            totalCycles: 0,
            coinsSpent: 0
        };

        this.loadSettings();
        this.loadStats();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateStats();
        this.requestNotificationPermission();
    }

    setupEventListeners() {
        // Mode tabs
        document.querySelectorAll('.timer-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        // Timer controls
        document.getElementById('timerStartBtn').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('timerResetBtn').addEventListener('click', () => {
            this.resetTimer();
        });

        document.getElementById('timerSettingsBtn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Timeline integration buttons
        document.querySelectorAll('.timeline-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const duration = parseInt(e.target.dataset.duration);
                this.startQuickTimer(category, duration);
            });
        });

        // Settings modal
        document.getElementById('closeTimerSettings').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('cancelTimerSettings').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('timerSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        document.getElementById('resetTimerSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Completion modal
        document.getElementById('skipToTimeline').addEventListener('click', () => {
            this.closeCompletionModal();
        });

        document.getElementById('saveToTimeline').addEventListener('click', () => {
            this.saveToTimeline();
        });
    }

    switchMode(mode) {
        if (this.isRunning) {
            this.pauseTimer();
        }

        this.mode = mode;
        
        // Update active tab
        document.querySelectorAll('.timer-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Reset to focus phase
        this.phase = 'focus';
        this.currentCycle = 1;

        switch (mode) {
            case 'pomodoro':
                this.timeLeft = this.settings.focusDuration * 60;
                this.totalTime = this.settings.focusDuration * 60;
                this.totalCycles = this.settings.cyclesBeforeLongBreak;
                break;
            case 'custom':
                // For now, use same as pomodoro, can be extended
                this.timeLeft = this.settings.focusDuration * 60;
                this.totalTime = this.settings.focusDuration * 60;
                this.totalCycles = this.settings.cyclesBeforeLongBreak;
                break;
            case 'free':
                this.timeLeft = 25 * 60; // Default 25 minutes
                this.totalTime = 25 * 60;
                this.totalCycles = 1;
                break;
        }

        this.updateDisplay();
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.isPaused = false;

        const startBtn = document.getElementById('timerStartBtn');
        startBtn.querySelector('.timer-btn-icon').textContent = '⏸️';
        startBtn.querySelector('.timer-btn-text').textContent = 'Пауза';

        this.currentTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.completePhase();
            }
        }, 1000);

        // Update status
        this.updateStatus();
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;

        if (this.currentTimer) {
            clearInterval(this.currentTimer);
            this.currentTimer = null;
        }

        const startBtn = document.getElementById('timerStartBtn');
        startBtn.querySelector('.timer-btn-icon').textContent = '▶️';
        startBtn.querySelector('.timer-btn-text').textContent = 'Старт';

        this.updateStatus();
    }

    resetTimer() {
        this.pauseTimer();
        
        switch (this.mode) {
            case 'pomodoro':
            case 'custom':
                if (this.phase === 'focus') {
                    this.timeLeft = this.settings.focusDuration * 60;
                    this.totalTime = this.settings.focusDuration * 60;
                } else if (this.phase === 'break') {
                    this.timeLeft = this.settings.shortBreakDuration * 60;
                    this.totalTime = this.settings.shortBreakDuration * 60;
                } else if (this.phase === 'long-break') {
                    this.timeLeft = this.settings.longBreakDuration * 60;
                    this.totalTime = this.settings.longBreakDuration * 60;
                }
                break;
            case 'free':
                this.timeLeft = 25 * 60;
                this.totalTime = 25 * 60;
                break;
        }

        this.updateDisplay();
        this.updateStatus();
    }

    completePhase() {
        this.pauseTimer();
        
        // Play notification sound
        if (this.settings.soundNotifications) {
            this.playNotificationSound();
        }

        // Show browser notification
        if (this.settings.browserNotifications) {
            this.showBrowserNotification();
        }

        if (this.mode === 'pomodoro' || this.mode === 'custom') {
            if (this.phase === 'focus') {
                // Focus completed
                this.stats.completedCycles++;
                this.stats.totalCycles++;
                this.stats.todayPomodoros++;
                this.stats.totalFocusTime += this.settings.focusDuration;
                this.stats.coinsSpent += 1;

                this.showCompletionModal();

                // Move to break
                if (this.currentCycle >= this.totalCycles) {
                    // Long break
                    this.phase = 'long-break';
                    this.timeLeft = this.settings.longBreakDuration * 60;
                    this.totalTime = this.settings.longBreakDuration * 60;
                    this.currentCycle = 1;
                } else {
                    // Short break
                    this.phase = 'break';
                    this.timeLeft = this.settings.shortBreakDuration * 60;
                    this.totalTime = this.settings.shortBreakDuration * 60;
                }

                if (this.settings.autoStartBreaks) {
                    setTimeout(() => this.startTimer(), 2000);
                }
            } else {
                // Break completed, back to focus
                this.phase = 'focus';
                this.timeLeft = this.settings.focusDuration * 60;
                this.totalTime = this.settings.focusDuration * 60;
                
                if (this.phase !== 'long-break') {
                    this.currentCycle++;
                }

                if (this.settings.autoStartPomodoros) {
                    setTimeout(() => this.startTimer(), 2000);
                }
            }
        } else {
            // Free timer completed
            this.stats.completedCycles++;
            this.stats.totalCycles++;
            this.showCompletionModal();
        }

        this.saveStats();
        this.updateDisplay();
        this.updateStats();
    }

    startQuickTimer(category, duration) {
        this.mode = 'free';
        this.phase = 'focus';
        this.timeLeft = duration * 60;
        this.totalTime = duration * 60;
        this.currentCategory = category;

        // Update mode tabs
        document.querySelectorAll('.timer-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === 'free');
        });

        this.updateDisplay();
        this.startTimer();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('timerTime').textContent = timeString;

        // Update progress circle
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 754; // 2 * π * 120
        const progressCircle = document.getElementById('timerProgress');
        progressCircle.style.strokeDashoffset = 754 - progress;

        // Update circle color based on phase
        progressCircle.className = `timer-fill ${this.phase}`;

        // Update cycle info
        if (this.mode === 'pomodoro' || this.mode === 'custom') {
            document.getElementById('timerCycle').textContent = `Цикл ${this.currentCycle} из ${this.totalCycles}`;
        } else {
            document.getElementById('timerCycle').textContent = 'Свободный таймер';
        }

        this.updateStatus();
    }

    updateStatus() {
        let statusText = '';
        let statusIcon = '';

        if (this.isRunning) {
            switch (this.phase) {
                case 'focus':
                    statusIcon = '🔵';
                    statusText = 'Фокус активен';
                    break;
                case 'break':
                    statusIcon = '🟢';
                    statusText = 'Короткий перерыв';
                    break;
                case 'long-break':
                    statusIcon = '🟡';
                    statusText = 'Длинный перерыв';
                    break;
            }
        } else if (this.isPaused) {
            statusIcon = '⏸️';
            statusText = 'На паузе';
        } else {
            switch (this.phase) {
                case 'focus':
                    statusIcon = '🔵';
                    statusText = 'Готов к фокусу';
                    break;
                case 'break':
                    statusIcon = '🟢';
                    statusText = 'Готов к перерыву';
                    break;
                case 'long-break':
                    statusIcon = '🟡';
                    statusText = 'Готов к отдыху';
                    break;
            }
        }

        document.getElementById('timerStatus').textContent = `${statusIcon} ${statusText}`;
    }

    updateStats() {
        document.getElementById('todayPomodoros').textContent = this.stats.todayPomodoros;
        
        const hours = Math.floor(this.stats.totalFocusTime / 60);
        const minutes = this.stats.totalFocusTime % 60;
        document.getElementById('totalFocusTime').textContent = `${hours}ч ${minutes}м`;
        
        const completionRate = this.stats.totalCycles > 0 
            ? Math.round((this.stats.completedCycles / this.stats.totalCycles) * 100)
            : 100;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
        
        document.getElementById('coinsSpent').textContent = this.stats.coinsSpent;
    }

    showCompletionModal() {
        const modal = document.getElementById('timerCompletionModal');
        const title = document.getElementById('completionTitle');
        const message = document.getElementById('completionMessage');
        const coins = document.getElementById('completionCoins');
        const cycles = document.getElementById('completionCycles');

        if (this.phase === 'focus') {
            title.textContent = '🎉 Фокус-блок завершен!';
            message.textContent = `Отлично! Вы завершили ${Math.floor(this.totalTime / 60)}-минутный фокус-блок.`;
            coins.textContent = '1';
        } else {
            title.textContent = '✅ Перерыв завершен!';
            message.textContent = 'Время вернуться к работе. Вы готовы к новому циклу фокуса?';
            coins.textContent = '0';
        }

        cycles.textContent = this.stats.todayPomodoros;

        // Set default category based on current category or time of day
        const categorySelect = document.getElementById('completionCategory');
        if (this.currentCategory) {
            categorySelect.value = this.currentCategory;
        }

        modal.classList.add('active');
    }

    closeCompletionModal() {
        document.getElementById('timerCompletionModal').classList.remove('active');
        this.currentCategory = null;
    }

    saveToTimeline() {
        const category = document.getElementById('completionCategory').value;
        const note = document.getElementById('completionNote').value;
        const duration = Math.floor(this.totalTime / 60);

        // Create action for timeline
        const now = new Date();
        const startTime = new Date(now.getTime() - (this.totalTime * 1000));
        
        const action = {
            id: Date.now().toString(),
            category: category,
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(now),
            duration: duration,
            note: note || `Pomodoro фокус-сессия (${duration} мин)`,
            coins: this.phase === 'focus' ? 1 : 0,
            createdAt: now.toISOString()
        };

        // Save to data manager
        const today = this.formatDate(now);
        window.dataManager.saveAction(today, action);

        // Update main dashboard if visible
        if (window.app && window.app.currentSection === 'dashboard') {
            window.app.renderTimeline();
            window.app.updateStats();
        }

        this.closeCompletionModal();
        
        // Clear note for next time
        document.getElementById('completionNote').value = '';
    }

    openSettingsModal() {
        // Load current settings into form
        document.getElementById('focusDuration').value = this.settings.focusDuration;
        document.getElementById('shortBreakDuration').value = this.settings.shortBreakDuration;
        document.getElementById('longBreakDuration').value = this.settings.longBreakDuration;
        document.getElementById('cyclesBeforeLongBreak').value = this.settings.cyclesBeforeLongBreak;
        document.getElementById('autoStartBreaks').checked = this.settings.autoStartBreaks;
        document.getElementById('autoStartPomodoros').checked = this.settings.autoStartPomodoros;
        document.getElementById('soundNotifications').checked = this.settings.soundNotifications;
        document.getElementById('browserNotifications').checked = this.settings.browserNotifications;

        document.getElementById('timerSettingsModal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('timerSettingsModal').classList.remove('active');
    }

    saveSettings() {
        this.settings = {
            focusDuration: parseInt(document.getElementById('focusDuration').value),
            shortBreakDuration: parseInt(document.getElementById('shortBreakDuration').value),
            longBreakDuration: parseInt(document.getElementById('longBreakDuration').value),
            cyclesBeforeLongBreak: parseInt(document.getElementById('cyclesBeforeLongBreak').value),
            autoStartBreaks: document.getElementById('autoStartBreaks').checked,
            autoStartPomodoros: document.getElementById('autoStartPomodoros').checked,
            soundNotifications: document.getElementById('soundNotifications').checked,
            browserNotifications: document.getElementById('browserNotifications').checked
        };

        localStorage.setItem('timerSettings', JSON.stringify(this.settings));
        this.closeSettingsModal();

        // Reset timer with new settings if not running
        if (!this.isRunning) {
            this.switchMode(this.mode);
        }
    }

    resetSettings() {
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            cyclesBeforeLongBreak: 4,
            autoStartBreaks: true,
            autoStartPomodoros: false,
            soundNotifications: true,
            browserNotifications: true
        };

        localStorage.setItem('timerSettings', JSON.stringify(this.settings));
        this.openSettingsModal(); // Refresh the form
    }

    loadSettings() {
        const saved = localStorage.getItem('timerSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    loadStats() {
        const today = this.formatDate(new Date());
        const saved = localStorage.getItem(`timerStats_${today}`);
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    }

    saveStats() {
        const today = this.formatDate(new Date());
        localStorage.setItem(`timerStats_${today}`, JSON.stringify(this.stats));
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    showBrowserNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            let title, body;
            
            if (this.phase === 'focus') {
                title = '🎉 Фокус-блок завершен!';
                body = 'Отличная работа! Время для перерыва.';
            } else {
                title = '⏰ Перерыв окончен';
                body = 'Время вернуться к работе!';
            }

            new Notification(title, {
                body: body,
                icon: '/assets/icons/icon-192.png',
                badge: '/assets/icons/badge-72.png',
                tag: 'pomodoro-timer'
            });
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    formatTime(date) {
        return date.toTimeString().slice(0, 5);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}

// Initialize timer manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for data manager to be available
    const initTimer = () => {
        if (window.dataManager) {
            window.timerManager = new TimerManager();
        } else {
            setTimeout(initTimer, 100);
        }
    };
    
    initTimer();
});

// Make sure timer manager is available globally
window.timerManager = null;
