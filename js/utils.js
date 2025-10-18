// Utility Functions for Energy Coins App

/**
 * Date and Time Utilities
 */
export const DateUtils = {
  /**
   * Format date to string
   * @param {Date} date 
   * @returns {string}
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  /**
   * Format time to HH:MM
   * @param {Date} date 
   * @returns {string}
   */
  formatTime(date) {
    return date.toTimeString().slice(0, 5);
  },

  /**
   * Parse time string to minutes
   * @param {string} timeString - Format: "HH:MM"
   * @returns {number}
   */
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  },

  /**
   * Convert minutes to time string
   * @param {number} minutes 
   * @returns {string}
   */
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  /**
   * Get relative time string
   * @param {Date} date 
   * @returns {string}
   */
  getRelativeTime(date) {
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  },

  /**
   * Check if date is today
   * @param {Date} date 
   * @returns {boolean}
   */
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  /**
   * Get week boundaries
   * @param {Date} date 
   * @returns {Object}
   */
  getWeekBoundaries(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }
};

/**
 * DOM Utilities
 */
export const DOMUtils = {
  /**
   * Create element with attributes
   * @param {string} tag 
   * @param {Object} attributes 
   * @param {string} content 
   * @returns {HTMLElement}
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },

  /**
   * Add event listener with cleanup
   * @param {HTMLElement} element 
   * @param {string} event 
   * @param {Function} handler 
   * @returns {Function} cleanup function
   */
  addEventListenerWithCleanup(element, event, handler) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  },

  /**
   * Debounce function
   * @param {Function} func 
   * @param {number} wait 
   * @returns {Function}
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func 
   * @param {number} limit 
   * @returns {Function}
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

/**
 * Validation Utilities
 */
export const ValidationUtils = {
  /**
   * Validate email
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate URL
   * @param {string} url 
   * @returns {boolean}
   */
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate time format (HH:MM)
   * @param {string} time 
   * @returns {boolean}
   */
  isValidTime(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  /**
   * Sanitize HTML string
   * @param {string} str 
   * @returns {string}
   */
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
};

/**
 * Storage Utilities
 */
export const StorageUtils = {
  /**
   * Safe localStorage setItem
   * @param {string} key 
   * @param {any} value 
   * @returns {boolean}
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  /**
   * Safe localStorage getItem
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {any}
   */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key 
   * @returns {boolean}
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @returns {boolean}
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * Array Utilities
 */
export const ArrayUtils = {
  /**
   * Group array by key
   * @param {Array} array 
   * @param {string} key 
   * @returns {Object}
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  /**
   * Sort array by multiple keys
   * @param {Array} array 
   * @param {Array} keys 
   * @returns {Array}
   */
  sortByKeys(array, keys) {
    return array.sort((a, b) => {
      for (const key of keys) {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  },

  /**
   * Remove duplicates from array
   * @param {Array} array 
   * @param {string} key - optional key for object arrays
   * @returns {Array}
   */
  unique(array, key = null) {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  }
};

/**
 * Color Utilities
 */
export const ColorUtils = {
  /**
   * Get category color
   * @param {string} category 
   * @returns {string}
   */
  getCategoryColor(category) {
    const colors = {
      work: '#3b82f6',
      rest: '#fbbf24',
      sport: '#10b981',
      communication: '#ec4899',
      learn: '#8b5cf6',
      entertainment: '#f59e0b',
      tasks: '#ef4444',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  },

  /**
   * Convert hex to rgba
   * @param {string} hex 
   * @param {number} alpha 
   * @returns {string}
   */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * Generate random color
   * @returns {string}
   */
  randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
};

/**
 * Animation Utilities
 */
export const AnimationUtils = {
  /**
   * Animate element with CSS classes
   * @param {HTMLElement} element 
   * @param {string} animationClass 
   * @param {number} duration 
   * @returns {Promise}
   */
  animate(element, animationClass, duration = 300) {
    return new Promise((resolve) => {
      element.classList.add(animationClass);
      
      setTimeout(() => {
        element.classList.remove(animationClass);
        resolve();
      }, duration);
    });
  },

  /**
   * Fade in element
   * @param {HTMLElement} element 
   * @param {number} duration 
   * @returns {Promise}
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '1';
      
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Fade out element
   * @param {HTMLElement} element 
   * @param {number} duration 
   * @returns {Promise}
   */
  fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.style.display = 'none';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }
};

/**
 * Notification Utilities
 */
export const NotificationUtils = {
  /**
   * Show toast notification
   * @param {string} message 
   * @param {string} type 
   * @param {number} duration 
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = DOMUtils.createElement('div', {
      className: `toast toast-${type}`,
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `
    }, message);

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  },

  /**
   * Request notification permission
   * @returns {Promise<boolean>}
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Show browser notification
   * @param {string} title 
   * @param {Object} options 
   */
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        ...options
      });
    }
  }
};

// Export all utilities as default
export default {
  DateUtils,
  DOMUtils,
  ValidationUtils,
  StorageUtils,
  ArrayUtils,
  ColorUtils,
  AnimationUtils,
  NotificationUtils
};
