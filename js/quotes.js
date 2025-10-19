/**
 * Quotes Manager - Управление мотивационными цитатами
 * Интеграция с Quotable API для получения ежедневных мотивационных сообщений
 */

class QuotesManager {
    constructor() {
        this.apiUrl = 'https://api.quotable.io';
        this.currentQuote = null;
        this.fallbackQuotes = [
            {
                content: "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма.",
                author: "Уинстон Черчилль"
            },
            {
                content: "Единственный способ делать великую работу — любить то, что ты делаешь.",
                author: "Стив Джобс"
            },
            {
                content: "Жизнь — это то, что происходит с тобой, пока ты строишь планы.",
                author: "Джон Леннон"
            },
            {
                content: "Будь собой. Все остальные роли уже заняты.",
                author: "Оскар Уайльд"
            },
            {
                content: "Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.",
                author: "Китайская пословица"
            },
            {
                content: "Не ждите. Время никогда не будет подходящим.",
                author: "Наполеон Хилл"
            },
            {
                content: "Ваше время ограничено, не тратьте его, живя чужой жизнью.",
                author: "Стив Джобс"
            },
            {
                content: "Мечты не работают, если не работаете вы.",
                author: "Джон С. Максвелл"
            }
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDailyQuote();
    }

    bindEvents() {
        const refreshBtn = document.getElementById('refreshQuote');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.getNewQuote();
            });
        }
    }

    async loadDailyQuote() {
        // Проверяем, есть ли сохраненная цитата на сегодня
        const today = new Date().toDateString();
        const savedQuote = this.getSavedQuote(today);
        
        if (savedQuote) {
            this.displayQuote(savedQuote);
        } else {
            await this.getNewQuote(true);
        }
    }

    async getNewQuote(saveAsDaily = false) {
        this.showLoading();
        
        try {
            // Пробуем получить цитату с API
            const quote = await this.fetchQuoteFromAPI();
            
            if (quote) {
                this.currentQuote = quote;
                this.displayQuote(quote);
                
                if (saveAsDaily) {
                    this.saveDailyQuote(quote);
                }
            } else {
                throw new Error('API недоступен');
            }
        } catch (error) {
            console.log('Используем резервную цитату:', error.message);
            // Используем случайную резервную цитату
            const fallbackQuote = this.getRandomFallbackQuote();
            this.displayQuote(fallbackQuote);
            
            if (saveAsDaily) {
                this.saveDailyQuote(fallbackQuote);
            }
        }
    }

    async fetchQuoteFromAPI() {
        try {
            // Получаем случайную цитату
            const response = await fetch(`${this.apiUrl}/random?minLength=50&maxLength=150`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                content: data.content,
                author: data.author
            };
        } catch (error) {
            console.error('Ошибка получения цитаты:', error);
            return null;
        }
    }

    getRandomFallbackQuote() {
        const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
        return this.fallbackQuotes[randomIndex];
    }

    displayQuote(quote) {
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        
        if (quoteText && quoteAuthor) {
            // Анимация появления
            const quoteCard = document.getElementById('quoteCard');
            quoteCard.style.opacity = '0.5';
            
            setTimeout(() => {
                quoteText.textContent = `"${quote.content}"`;
                quoteAuthor.textContent = `— ${quote.author}`;
                
                quoteCard.style.opacity = '1';
                quoteCard.style.transform = 'translateY(-2px)';
                
                setTimeout(() => {
                    quoteCard.style.transform = 'translateY(0)';
                }, 200);
            }, 150);
        }
    }

    showLoading() {
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        
        if (quoteText && quoteAuthor) {
            quoteText.textContent = 'Загружаем новую мотивационную цитату...';
            quoteAuthor.textContent = '— Загрузка...';
        }
    }

    saveDailyQuote(quote) {
        const today = new Date().toDateString();
        const dailyQuotes = JSON.parse(localStorage.getItem('dailyQuotes') || '{}');
        
        dailyQuotes[today] = {
            ...quote,
            timestamp: Date.now()
        };
        
        // Очищаем старые цитаты (старше 7 дней)
        this.cleanOldQuotes(dailyQuotes);
        
        localStorage.setItem('dailyQuotes', JSON.stringify(dailyQuotes));
    }

    getSavedQuote(date) {
        const dailyQuotes = JSON.parse(localStorage.getItem('dailyQuotes') || '{}');
        return dailyQuotes[date] || null;
    }

    cleanOldQuotes(dailyQuotes) {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        Object.keys(dailyQuotes).forEach(date => {
            if (dailyQuotes[date].timestamp < weekAgo) {
                delete dailyQuotes[date];
            }
        });
    }

    // Получить статистику цитат
    getQuotesStats() {
        const dailyQuotes = JSON.parse(localStorage.getItem('dailyQuotes') || '{}');
        const quotesCount = Object.keys(dailyQuotes).length;
        
        return {
            totalQuotes: quotesCount,
            currentQuote: this.currentQuote,
            hasQuoteToday: !!this.getSavedQuote(new Date().toDateString())
        };
    }

    // Получить все сохраненные цитаты
    getAllSavedQuotes() {
        return JSON.parse(localStorage.getItem('dailyQuotes') || '{}');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.quotesManager = new QuotesManager();
    }
});
