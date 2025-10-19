// Virtual Mentor System with Random User API
class MentorManager {
    constructor() {
        this.apiUrl = 'https://randomuser.me/api/';
        this.currentMentor = null;
        this.storageKey = 'dailyMentor';
        
        // Культурные инсайты по странам
        this.culturalInsights = {
            US: {
                flag: '🇺🇸',
                country: 'США',
                greetings: ['Привет!', 'Hey there!', 'What\'s up!'],
                workStyle: 'американском стиле - амбициозно и эффективно',
                tips: [
                    'В Америке ценят инициативу - не бойся предлагать идеи!',
                    'Time is money - используй каждую минуту продуктивно!',
                    'Думай масштабно - американцы любят большие цели!',
                    'Networking важен - общайся и заводи полезные связи!'
                ],
                timeAdvice: {
                    morning: 'Время для кофе и больших планов!',
                    afternoon: 'Продуктивный день в американском стиле!',
                    evening: 'Время подвести итоги и планировать завтра!',
                    night: 'Отдых после продуктивного дня!'
                }
            },
            GB: {
                flag: '🇬🇧',
                country: 'Великобритания',
                greetings: ['Hello!', 'Good day!', 'Cheerio!'],
                workStyle: 'британском стиле - с достоинством и пунктуальностью',
                tips: [
                    'Keep calm and carry on - сохраняй спокойствие в любой ситуации!',
                    'Пунктуальность - вежливость королей!',
                    'Планируй день как настоящий джентльмен!',
                    'Чашка чая поможет собраться с мыслями!'
                ],
                timeAdvice: {
                    morning: 'Время для чая и планирования дня!',
                    afternoon: 'Деловой день с британской пунктуальностью!',
                    evening: 'Время для культурного развития!',
                    night: 'Уютный отдых в английском стиле!'
                }
            },
            CA: {
                flag: '🇨🇦',
                country: 'Канада',
                greetings: ['Hello!', 'Hey!', 'How are you doing?'],
                workStyle: 'канадском стиле - дружелюбно и сбалансированно',
                tips: [
                    'Work-life balance - главный секрет канадцев!',
                    'Будь дружелюбен и вежлив ко всем!',
                    'Природа дает энергию - не забывай о прогулках!',
                    'Sorry, not sorry за высокую продуктивность!'
                ],
                timeAdvice: {
                    morning: 'Время для дружелюбного старта дня!',
                    afternoon: 'Продуктивность с канадской улыбкой!',
                    evening: 'Время для семьи и друзей!',
                    night: 'Спокойный сон под северными звездами!'
                }
            },
            AU: {
                flag: '🇦🇺',
                country: 'Австралия',
                greetings: ['G\'day mate!', 'How ya going?', 'Hey there!'],
                workStyle: 'австралийском стиле - расслабленно но эффективно',
                tips: [
                    'No worries, mate - не переживай по мелочам!',
                    'Жизнь слишком коротка для стресса!',
                    'Активный образ жизни - ключ к продуктивности!',
                    'Солнце дает энергию для новых свершений!'
                ],
                timeAdvice: {
                    morning: 'Время для активности на свежем воздухе!',
                    afternoon: 'Продуктивный день с австралийской легкостью!',
                    evening: 'Время для отдыха у океана!',
                    night: 'Спокойный сон под южными звездами!'
                }
            },
            FR: {
                flag: '🇫🇷',
                country: 'Франция',
                greetings: ['Bonjour!', 'Salut!', 'Bonsoir!'],
                workStyle: 'французском стиле - с изяществом и вдохновением',
                tips: [
                    'La vie est belle - жизнь прекрасна, наслаждайся каждым моментом!',
                    'Творчество и красота важны в любом деле!',
                    'Хороший обед - залог продуктивного дня!',
                    'Искусство жить - это тоже искусство!'
                ],
                timeAdvice: {
                    morning: 'Время для кофе и вдохновения!',
                    afternoon: 'Творческий день в городе искусств!',
                    evening: 'Время для культуры и красоты!',
                    night: 'Романтический отдых!'
                }
            },
            DE: {
                flag: '🇩🇪',
                country: 'Германия',
                greetings: ['Hallo!', 'Guten Tag!', 'Wie geht\'s?'],
                workStyle: 'немецком стиле - организованно и качественно',
                tips: [
                    'Ordnung muss sein - порядок превыше всего!',
                    'Качество важнее количества!',
                    'Планирование - основа успеха!',
                    'Пунктуальность - признак уважения!'
                ],
                timeAdvice: {
                    morning: 'Время для четкого планирования дня!',
                    afternoon: 'Продуктивная работа с немецким качеством!',
                    evening: 'Время для систематизации достижений!',
                    night: 'Заслуженный отдых после качественной работы!'
                }
            },
            ES: {
                flag: '🇪🇸',
                country: 'Испания',
                greetings: ['¡Hola!', '¡Buenos días!', '¿Qué tal?'],
                workStyle: 'испанском стиле - страстно и с удовольствием',
                tips: [
                    '¡Vamos! - давай, ты можешь все!',
                    'Страсть к делу - секрет успеха!',
                    'Сиеста - это не лень, а мудрость!',
                    'Жизнь слишком коротка для скучных дел!'
                ],
                timeAdvice: {
                    morning: 'Время для энергичного старта!',
                    afternoon: 'Страстная работа с испанским темпераментом!',
                    evening: 'Время для общения и радости!',
                    night: 'Сладкие сны под испанскими звездами!'
                }
            },
            IT: {
                flag: '🇮🇹',
                country: 'Италия',
                greetings: ['Ciao!', 'Buongiorno!', 'Come stai?'],
                workStyle: 'итальянском стиле - с душой и удовольствием',
                tips: [
                    'La dolce vita - сладкая жизнь в каждом моменте!',
                    'Делай все с amore - с любовью!',
                    'Хорошая еда - топливо для мозга!',
                    'Красота вокруг нас - источник вдохновения!'
                ],
                timeAdvice: {
                    morning: 'Время для cappuccino и вдохновения!',
                    afternoon: 'Творческая работа с итальянской страстью!',
                    evening: 'Время для famiglia и друзей!',
                    night: 'Сладкие сны в стране искусства!'
                }
            },
            BR: {
                flag: '🇧🇷',
                country: 'Бразилия',
                greetings: ['Oi!', 'Olá!', 'E aí?'],
                workStyle: 'бразильском стиле - с энергией и оптимизмом',
                tips: [
                    'Tudo bem! - все будет хорошо!',
                    'Энергия самбы поможет в любом деле!',
                    'Улыбка - лучший инструмент продуктивности!',
                    'Жизнь - это карнавал, наслаждайся!'
                ],
                timeAdvice: {
                    morning: 'Время для энергичного танца жизни!',
                    afternoon: 'Продуктивность с бразильской энергией!',
                    evening: 'Время для музыки и веселья!',
                    night: 'Сладкие сны под тропическими звездами!'
                }
            },
            JP: {
                flag: '🇯🇵',
                country: 'Япония',
                greetings: ['こんにちは!', 'Konnichiwa!', 'Ohayo!'],
                workStyle: 'японском стиле - с дисциплиной и совершенством',
                tips: [
                    'Kaizen - постоянное улучшение каждый день!',
                    'Ikigai - найди смысл в том, что делаешь!',
                    'Omotenashi - делай все от души!',
                    'Shoganai - то, что нельзя изменить, нужно принять!'
                ],
                timeAdvice: {
                    morning: 'Время для утренней зарядки и медитации!',
                    afternoon: 'Продуктивный день в стиле кайдзен!',
                    evening: 'Время для рефлексии и планирования!',
                    night: 'Спокойный отдых и подготовка к завтра!'
                }
            }
        };

        this.motivationalTemplates = [
            "Привет! Я {name} из {country}. Сегодня я твой виртуальный наставник! 🌟",
            "Здравствуй! Меня зовут {name}, и я помогу тебе провести день в {workStyle}! 💪",
            "Добро пожаловать! Я {name} из {country}, и у меня есть отличные идеи для твоего дня! ✨",
            "Привет, друг! {name} на связи из {country}. Давай сделаем этот день невероятным! 🚀"
        ];

        this.init();
    }

    async init() {
        await this.loadDailyMentor();
        this.render();
        this.startDailyUpdate();
    }

    async loadDailyMentor() {
        const today = new Date().toDateString();
        const cached = this.getCachedMentor();

        if (cached && cached.date === today) {
            this.currentMentor = cached;
            return;
        }

        try {
            // Запрашиваем наставника из определенных стран для лучших культурных инсайтов
            const response = await fetch(`${this.apiUrl}?nat=us,gb,ca,au,fr,de,es,it,br,jp&inc=name,picture,location,nat,dob`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const user = data.results[0];
                this.currentMentor = {
                    date: today,
                    name: `${user.name.first} ${user.name.last}`,
                    firstName: user.name.first,
                    photo: user.picture.large,
                    country: user.location.country,
                    nationality: user.nat,
                    age: user.dob.age,
                    cultural: this.culturalInsights[user.nat] || this.getDefaultCultural(user.nat),
                    loadedAt: new Date().toISOString()
                };
                
                this.cacheMentor(this.currentMentor);
            } else {
                this.currentMentor = this.getFallbackMentor();
            }
        } catch (error) {
            console.error('Error loading mentor:', error);
            this.currentMentor = this.getFallbackMentor();
        }
    }

    getCachedMentor() {
        try {
            const cached = localStorage.getItem(this.storageKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error loading cached mentor:', error);
            return null;
        }
    }

    cacheMentor(mentor) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(mentor));
        } catch (error) {
            console.error('Error caching mentor:', error);
        }
    }

    getFallbackMentor() {
        const fallbackMentors = [
            {
                name: 'Alex Johnson',
                firstName: 'Alex',
                photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                country: 'United States',
                nationality: 'US',
                age: 28,
                cultural: this.culturalInsights.US
            },
            {
                name: 'Emma Wilson',
                firstName: 'Emma',
                photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                country: 'United Kingdom',
                nationality: 'GB',
                age: 25,
                cultural: this.culturalInsights.GB
            }
        ];
        
        const randomMentor = fallbackMentors[Math.floor(Math.random() * fallbackMentors.length)];
        return {
            ...randomMentor,
            date: new Date().toDateString(),
            loadedAt: new Date().toISOString()
        };
    }

    getDefaultCultural(nationality) {
        return {
            flag: '🌍',
            country: 'Мир',
            greetings: ['Привет!', 'Hello!', 'Hola!'],
            workStyle: 'международном стиле - открыто и дружелюбно',
            tips: [
                'Каждый день - новая возможность!',
                'Мир полон удивительных людей и идей!',
                'Разнообразие - источник силы!',
                'Учись у людей из разных культур!'
            ],
            timeAdvice: {
                morning: 'Время для нового дня!',
                afternoon: 'Продуктивность без границ!',
                evening: 'Время для размышлений!',
                night: 'Спокойной ночи!'
            }
        };
    }

    getCurrentTimeAdvice() {
        if (!this.currentMentor) return '';
        
        const hour = new Date().getHours();
        let timeOfDay;
        
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
        else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
        else timeOfDay = 'night';
        
        return this.currentMentor.cultural.timeAdvice[timeOfDay];
    }

    getRandomTip() {
        if (!this.currentMentor) return '';
        const tips = this.currentMentor.cultural.tips;
        return tips[Math.floor(Math.random() * tips.length)];
    }

    getRandomGreeting() {
        if (!this.currentMentor) return 'Привет!';
        const greetings = this.currentMentor.cultural.greetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getMotivationalMessage() {
        if (!this.currentMentor) return '';
        
        const template = this.motivationalTemplates[Math.floor(Math.random() * this.motivationalTemplates.length)];
        return template
            .replace('{name}', this.currentMentor.firstName)
            .replace('{country}', this.currentMentor.cultural.country)
            .replace('{workStyle}', this.currentMentor.cultural.workStyle);
    }

    async refreshMentor() {
        // Принудительно загружаем нового наставника
        localStorage.removeItem(this.storageKey);
        await this.loadDailyMentor();
        this.render();
        
        // Показываем уведомление
        if (window.app && window.app.showNotification) {
            window.app.showNotification('Новый наставник готов помочь! 🎭', 'success');
        }
    }

    render() {
        const mentorCard = document.getElementById('mentorCard');
        if (!mentorCard || !this.currentMentor) return;

        const greeting = this.getRandomGreeting();
        const timeAdvice = this.getCurrentTimeAdvice();
        const tip = this.getRandomTip();
        const motivation = this.getMotivationalMessage();

        mentorCard.innerHTML = `
            <div class="mentor-header">
                <div class="mentor-avatar">
                    <img src="${this.currentMentor.photo}" alt="${this.currentMentor.name}" class="mentor-photo">
                    <div class="mentor-flag">${this.currentMentor.cultural.flag}</div>
                </div>
                <div class="mentor-info">
                    <div class="mentor-name">${this.currentMentor.name}</div>
                    <div class="mentor-location">${this.currentMentor.cultural.country}</div>
                    <div class="mentor-role">Твой наставник дня</div>
                </div>
                <button class="mentor-refresh" id="refreshMentor" title="Новый наставник">🔄</button>
            </div>
            <div class="mentor-message">
                <div class="mentor-greeting">${greeting}</div>
                <div class="mentor-motivation">${motivation}</div>
            </div>
            <div class="mentor-advice">
                <div class="time-advice">
                    <span class="advice-icon">⏰</span>
                    <span class="advice-text">${timeAdvice}</span>
                </div>
            </div>
            <div class="mentor-tip">
                <div class="tip-icon">💡</div>
                <div class="tip-text">${tip}</div>
            </div>
        `;

        // Добавляем обработчик для кнопки обновления
        document.getElementById('refreshMentor')?.addEventListener('click', () => {
            this.refreshMentor();
        });
    }

    startDailyUpdate() {
        // Проверяем каждый час, не наступил ли новый день
        setInterval(() => {
            const today = new Date().toDateString();
            if (!this.currentMentor || this.currentMentor.date !== today) {
                this.loadDailyMentor().then(() => this.render());
            }
        }, 60 * 60 * 1000); // Каждый час

        // Обновляем советы каждые 30 минут
        setInterval(() => {
            if (this.currentMentor) {
                this.render();
            }
        }, 30 * 60 * 1000); // Каждые 30 минут
    }

    // Получить персонализированный совет для конкретной ситуации
    getPersonalizedAdvice(situation = 'general') {
        if (!this.currentMentor) return '';

        const adviceMap = {
            procrastination: [
                `${this.currentMentor.firstName} говорит: "В ${this.currentMentor.cultural.country} мы не откладываем на завтра!"`,
                `Совет от ${this.currentMentor.firstName}: "Начни с малого - большие дела состоят из маленьких шагов!"`,
                `${this.currentMentor.firstName} мотивирует: "Ты сильнее, чем думаешь! Просто начни!"`,
            ],
            stress: [
                `${this.currentMentor.firstName} советует: "Сделай глубокий вдох - все решаемо!"`,
                `Мудрость от ${this.currentMentor.firstName}: "В ${this.currentMentor.cultural.country} мы знаем - стресс временен, а успех вечен!"`,
                `${this.currentMentor.firstName} говорит: "Одна задача за раз - и горы свернешь!"`,
            ],
            motivation: [
                `${this.currentMentor.firstName} верит в тебя: "Ты можешь больше, чем кажется!"`,
                `Энергия от ${this.currentMentor.firstName}: "Каждый день - новая возможность стать лучше!"`,
                `${this.currentMentor.firstName} мотивирует: "Твой потенциал безграничен!"`,
            ]
        };

        const advice = adviceMap[situation] || adviceMap.motivation;
        return advice[Math.floor(Math.random() * advice.length)];
    }

    // Получить текущего наставника для использования в других частях приложения
    getCurrentMentor() {
        return this.currentMentor;
    }

    destroy() {
        // Очистка при необходимости
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ждем загрузки основного приложения
    const initMentor = () => {
        if (document.getElementById('mentorCard')) {
            window.mentorManager = new MentorManager();
        } else {
            setTimeout(initMentor, 100);
        }
    };
    initMentor();
});
