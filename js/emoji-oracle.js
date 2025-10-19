// Emoji Oracle - Daily Mood & Productivity Predictor
class EmojiOracle {
    constructor() {
        this.currentEmoji = null;
        this.storageKey = 'dailyEmojiOracle';
        
        // Эмодзи с их значениями и предсказаниями
        this.emojiPredictions = {
            '🚀': {
                name: 'Ракета',
                mood: 'Амбициозный',
                energy: 'Высокая',
                focus: 'Большие цели',
                color: '#3b82f6',
                predictions: [
                    'Сегодня твой день для покорения новых высот!',
                    'Время запускать амбициозные проекты!',
                    'Энергия космического масштаба - используй ее!',
                    'Сегодня ты можешь достичь невозможного!'
                ],
                activities: [
                    'Начни новый большой проект',
                    'Поставь амбициозную цель на месяц',
                    'Сделай то, что давно откладывал',
                    'Выйди из зоны комфорта'
                ],
                workStyle: 'Быстро и решительно - как ракета к звездам!',
                timeAdvice: {
                    morning: 'Утренний запуск - время для больших планов!',
                    afternoon: 'Полет на полной скорости!',
                    evening: 'Подведи итоги космических достижений!',
                    night: 'Отдых перед новым запуском!'
                }
            },
            '🌱': {
                name: 'Росток',
                mood: 'Развивающийся',
                energy: 'Стабильная',
                focus: 'Рост и обучение',
                color: '#10b981',
                predictions: [
                    'День для посева семян будущих успехов!',
                    'Каждый маленький шаг ведет к большому росту!',
                    'Время инвестировать в свое развитие!',
                    'Сегодня ты растешь как личность!'
                ],
                activities: [
                    'Изучи что-то новое',
                    'Прочитай развивающую статью',
                    'Начни новый курс или хобби',
                    'Поработай над навыками'
                ],
                workStyle: 'Постепенно и устойчиво - как растение к солнцу!',
                timeAdvice: {
                    morning: 'Утренний полив знаний!',
                    afternoon: 'Время активного роста!',
                    evening: 'Рефлексия и планирование развития!',
                    night: 'Отдых для восстановления сил!'
                }
            },
            '⚡': {
                name: 'Молния',
                mood: 'Энергичный',
                energy: 'Максимальная',
                focus: 'Скорость и эффективность',
                color: '#f59e0b',
                predictions: [
                    'Электрическая энергия бьет через край!',
                    'Сегодня ты - живая молния продуктивности!',
                    'Время для быстрых и решительных действий!',
                    'Твоя скорость сегодня поражает всех!'
                ],
                activities: [
                    'Закрой все мелкие задачи',
                    'Сделай быструю уборку',
                    'Ответь на все сообщения',
                    'Проведи интенсивную тренировку'
                ],
                workStyle: 'Молниеносно и эффективно - как разряд энергии!',
                timeAdvice: {
                    morning: 'Утренний разряд энергии!',
                    afternoon: 'Пиковая активность!',
                    evening: 'Финальный рывок!',
                    night: 'Разрядка после активного дня!'
                }
            },
            '🎯': {
                name: 'Мишень',
                mood: 'Сфокусированный',
                energy: 'Направленная',
                focus: 'Точность и концентрация',
                color: '#ef4444',
                predictions: [
                    'Сегодня ты попадаешь точно в цель!',
                    'Лазерная фокусировка на главном!',
                    'Время для точных и выверенных действий!',
                    'Твоя концентрация сегодня непробиваема!'
                ],
                activities: [
                    'Сосредоточься на одной важной задаче',
                    'Составь четкий план действий',
                    'Устрани все отвлекающие факторы',
                    'Доведи начатое до конца'
                ],
                workStyle: 'Точно и методично - как снайпер по целям!',
                timeAdvice: {
                    morning: 'Прицеливание на день!',
                    afternoon: 'Точное попадание в цели!',
                    evening: 'Анализ результатов стрельбы!',
                    night: 'Подготовка к новым целям!'
                }
            },
            '🌟': {
                name: 'Звезда',
                mood: 'Вдохновленный',
                energy: 'Сияющая',
                focus: 'Творчество и вдохновение',
                color: '#8b5cf6',
                predictions: [
                    'Сегодня ты сияешь как звезда!',
                    'Твое вдохновение освещает путь другим!',
                    'День для творческих прорывов!',
                    'Звездный час твоих талантов!'
                ],
                activities: [
                    'Займись творческим проектом',
                    'Поделись идеями с другими',
                    'Создай что-то красивое',
                    'Вдохнови кого-то своим примером'
                ],
                workStyle: 'Ярко и вдохновляюще - как звезда на небе!',
                timeAdvice: {
                    morning: 'Утреннее сияние идей!',
                    afternoon: 'Пик творческого света!',
                    evening: 'Звездное вдохновение!',
                    night: 'Сны полные звездной пыли!'
                }
            },
            '🔥': {
                name: 'Огонь',
                mood: 'Страстный',
                energy: 'Пылающая',
                focus: 'Страсть и интенсивность',
                color: '#dc2626',
                predictions: [
                    'Внутренний огонь горит ярче солнца!',
                    'Страсть к делу зажигает все вокруг!',
                    'Сегодня ты - пламя продуктивности!',
                    'Твой энтузиазм заразителен!'
                ],
                activities: [
                    'Займись тем, что любишь',
                    'Поделись энтузиазмом с командой',
                    'Работай над страстным проектом',
                    'Зажги огонь в других'
                ],
                workStyle: 'Горячо и страстно - как пламя костра!',
                timeAdvice: {
                    morning: 'Разжигание внутреннего огня!',
                    afternoon: 'Пламя на пике!',
                    evening: 'Теплое сияние результатов!',
                    night: 'Тлеющие угли вдохновения!'
                }
            },
            '🌊': {
                name: 'Волна',
                mood: 'Плавный',
                energy: 'Текучая',
                focus: 'Гибкость и адаптация',
                color: '#0ea5e9',
                predictions: [
                    'Сегодня ты течешь как мудрая река!',
                    'Гибкость - твоя суперсила дня!',
                    'Время плыть по течению возможностей!',
                    'Твоя адаптивность поражает!'
                ],
                activities: [
                    'Будь гибким в планах',
                    'Адаптируйся к изменениям',
                    'Найди баланс в хаосе',
                    'Помоги другим найти путь'
                ],
                workStyle: 'Плавно и гибко - как волна океана!',
                timeAdvice: {
                    morning: 'Утренний прилив энергии!',
                    afternoon: 'Плавное течение дел!',
                    evening: 'Спокойная гладь результатов!',
                    night: 'Убаюкивающий шум волн!'
                }
            },
            '🏔️': {
                name: 'Гора',
                mood: 'Стойкий',
                energy: 'Непоколебимая',
                focus: 'Стабильность и надежность',
                color: '#6b7280',
                predictions: [
                    'Сегодня ты непоколебим как гора!',
                    'Твоя стойкость вдохновляет других!',
                    'День для фундаментальных дел!',
                    'Твоя надежность - опора для всех!'
                ],
                activities: [
                    'Работай над долгосрочными проектами',
                    'Укрепи основы своих дел',
                    'Будь опорой для других',
                    'Планируй на перспективу'
                ],
                workStyle: 'Устойчиво и надежно - как горная вершина!',
                timeAdvice: {
                    morning: 'Восход над горными пиками!',
                    afternoon: 'Стойкость горного хребта!',
                    evening: 'Закат за горизонтом!',
                    night: 'Тишина горных вершин!'
                }
            },
            '🦋': {
                name: 'Бабочка',
                mood: 'Трансформирующийся',
                energy: 'Легкая',
                focus: 'Изменения и красота',
                color: '#ec4899',
                predictions: [
                    'Сегодня ты проходишь красивую трансформацию!',
                    'Легкость и грация в каждом движении!',
                    'Время для красивых изменений!',
                    'Твоя эволюция вдохновляет!'
                ],
                activities: [
                    'Внеси красоту в свою жизнь',
                    'Измени что-то к лучшему',
                    'Будь легким и грациозным',
                    'Помоги кому-то измениться'
                ],
                workStyle: 'Легко и изящно - как танец бабочки!',
                timeAdvice: {
                    morning: 'Утреннее превращение!',
                    afternoon: 'Полет на крыльях перемен!',
                    evening: 'Красота трансформации!',
                    night: 'Сны о новых возможностях!'
                }
            },
            '🌈': {
                name: 'Радуга',
                mood: 'Радостный',
                energy: 'Многогранная',
                focus: 'Разнообразие и позитив',
                color: '#a855f7',
                predictions: [
                    'Сегодня твоя жизнь играет всеми цветами!',
                    'Радость и позитив освещают путь!',
                    'День полон ярких возможностей!',
                    'Твой оптимизм заразителен!'
                ],
                activities: [
                    'Займись разными интересными делами',
                    'Подари радость окружающим',
                    'Найди красоту в обычном',
                    'Празднуй маленькие победы'
                ],
                workStyle: 'Ярко и разнообразно - как цвета радуги!',
                timeAdvice: {
                    morning: 'Утренняя радуга возможностей!',
                    afternoon: 'Полный спектр активности!',
                    evening: 'Радужное завершение дня!',
                    night: 'Сны в ярких красках!'
                }
            }
        };

        this.init();
    }

    async init() {
        await this.loadDailyEmoji();
        this.render();
        this.startDailyUpdate();
    }

    async loadDailyEmoji() {
        const today = new Date().toDateString();
        const cached = this.getCachedEmoji();

        if (cached && cached.date === today) {
            this.currentEmoji = cached;
            return;
        }

        // Выбираем случайный эмодзи для дня
        const emojiKeys = Object.keys(this.emojiPredictions);
        const randomKey = emojiKeys[Math.floor(Math.random() * emojiKeys.length)];
        
        this.currentEmoji = {
            date: today,
            emoji: randomKey,
            data: this.emojiPredictions[randomKey],
            loadedAt: new Date().toISOString()
        };
        
        this.cacheEmoji(this.currentEmoji);
    }

    getCachedEmoji() {
        try {
            const cached = localStorage.getItem(this.storageKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error loading cached emoji:', error);
            return null;
        }
    }

    cacheEmoji(emoji) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(emoji));
        } catch (error) {
            console.error('Error caching emoji:', error);
        }
    }

    getCurrentTimeAdvice() {
        if (!this.currentEmoji) return '';
        
        const hour = new Date().getHours();
        let timeOfDay;
        
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
        else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
        else timeOfDay = 'night';
        
        return this.currentEmoji.data.timeAdvice[timeOfDay];
    }

    getRandomPrediction() {
        if (!this.currentEmoji) return '';
        const predictions = this.currentEmoji.data.predictions;
        return predictions[Math.floor(Math.random() * predictions.length)];
    }

    getRandomActivity() {
        if (!this.currentEmoji) return '';
        const activities = this.currentEmoji.data.activities;
        return activities[Math.floor(Math.random() * activities.length)];
    }

    async refreshEmoji() {
        // Принудительно загружаем новый эмодзи
        localStorage.removeItem(this.storageKey);
        await this.loadDailyEmoji();
        this.render();
        
        // Показываем уведомление
        if (window.app && window.app.showNotification) {
            window.app.showNotification('Новое предсказание от Эмодзи-Оракула! 🔮', 'success');
        }
    }

    render() {
        const oracleCard = document.getElementById('emojiOracleCard');
        if (!oracleCard || !this.currentEmoji) return;

        const timeAdvice = this.getCurrentTimeAdvice();
        const prediction = this.getRandomPrediction();
        const activity = this.getRandomActivity();

        oracleCard.innerHTML = `
            <div class="oracle-header">
                <div class="oracle-emoji-container">
                    <div class="oracle-emoji" style="color: ${this.currentEmoji.data.color}">${this.currentEmoji.emoji}</div>
                    <div class="oracle-pulse"></div>
                </div>
                <div class="oracle-info">
                    <div class="oracle-title">Эмодзи-Оракул</div>
                    <div class="oracle-subtitle">Предсказание дня</div>
                </div>
                <button class="oracle-refresh" id="refreshOracle" title="Новое предсказание">🔮</button>
            </div>
            
            <div class="oracle-main">
                <div class="oracle-mood">
                    <div class="mood-label">Настроение дня:</div>
                    <div class="mood-value" style="color: ${this.currentEmoji.data.color}">
                        ${this.currentEmoji.data.name} - ${this.currentEmoji.data.mood}
                    </div>
                </div>
                
                <div class="oracle-stats">
                    <div class="oracle-stat">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-info">
                            <div class="stat-label">Энергия</div>
                            <div class="stat-value">${this.currentEmoji.data.energy}</div>
                        </div>
                    </div>
                    <div class="oracle-stat">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-label">Фокус</div>
                            <div class="stat-value">${this.currentEmoji.data.focus}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="oracle-prediction">
                <div class="prediction-icon">🔮</div>
                <div class="prediction-text">${prediction}</div>
            </div>
            
            <div class="oracle-advice">
                <div class="advice-time">
                    <div class="advice-icon">⏰</div>
                    <div class="advice-text">${timeAdvice}</div>
                </div>
            </div>
            
            <div class="oracle-activity">
                <div class="activity-label">Рекомендуемая активность:</div>
                <div class="activity-text">${activity}</div>
            </div>
            
            <div class="oracle-workstyle">
                <div class="workstyle-text">${this.currentEmoji.data.workStyle}</div>
            </div>
        `;

        // Добавляем обработчик для кнопки обновления
        document.getElementById('refreshOracle')?.addEventListener('click', () => {
            this.refreshEmoji();
        });

        // Применяем цветовую тему к карточке
        oracleCard.style.setProperty('--oracle-color', this.currentEmoji.data.color);
    }

    startDailyUpdate() {
        // Проверяем каждый час, не наступил ли новый день
        setInterval(() => {
            const today = new Date().toDateString();
            if (!this.currentEmoji || this.currentEmoji.date !== today) {
                this.loadDailyEmoji().then(() => this.render());
            }
        }, 60 * 60 * 1000); // Каждый час

        // Обновляем советы каждые 20 минут
        setInterval(() => {
            if (this.currentEmoji) {
                this.render();
            }
        }, 20 * 60 * 1000); // Каждые 20 минут
    }

    // Получить персонализированный совет для конкретной ситуации
    getPersonalizedAdvice(situation = 'general') {
        if (!this.currentEmoji) return '';

        const emoji = this.currentEmoji.emoji;
        const name = this.currentEmoji.data.name;

        const adviceMap = {
            procrastination: {
                '🚀': `${name} говорит: "Запускайся прямо сейчас - промедление не для ракет!"`,
                '⚡': `${name} мотивирует: "Молниеносное действие - лучшее лекарство от прокрастинации!"`,
                '🎯': `${name} советует: "Прицелься в задачу и действуй - точность против лени!"`,
                '🔥': `${name} зажигает: "Пламя действия сжигает все отговорки!"`,
            },
            stress: {
                '🌊': `${name} успокаивает: "Плыви по волнам стресса - они приведут к берегу!"`,
                '🌱': `${name} мудро говорит: "Стресс - это удобрение для роста!"`,
                '🏔️': `${name} укрепляет: "Будь устойчив как гора - стресс пройдет!"`,
                '🦋': `${name} вдохновляет: "Стресс - это кокон, из которого выйдет новая ты!"`,
            },
            motivation: {
                '🌟': `${name} сияет: "Ты звезда - время показать свой свет миру!"`,
                '🌈': `${name} радует: "После дождя всегда радуга - твой день наступил!"`,
                '🚀': `${name} мотивирует: "К звездам! Твой потенциал безграничен!"`,
                '🔥': `${name} зажигает: "Внутренний огонь горит - время действовать!"`,
            }
        };

        const situationAdvice = adviceMap[situation];
        if (situationAdvice && situationAdvice[emoji]) {
            return situationAdvice[emoji];
        }

        return this.getRandomPrediction();
    }

    // Получить текущий эмодзи для использования в других частях приложения
    getCurrentEmoji() {
        return this.currentEmoji;
    }

    // Получить цвет дня для изменения темы интерфейса
    getDayColor() {
        return this.currentEmoji ? this.currentEmoji.data.color : '#3b82f6';
    }

    // Применить цвет дня к интерфейсу
    applyDayTheme() {
        if (!this.currentEmoji) return;
        
        const color = this.currentEmoji.data.color;
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--oracle-accent', color);
    }

    destroy() {
        // Очистка при необходимости
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ждем загрузки основного приложения
    const initOracle = () => {
        if (document.getElementById('emojiOracleCard')) {
            window.emojiOracle = new EmojiOracle();
        } else {
            setTimeout(initOracle, 100);
        }
    };
    initOracle();
});
