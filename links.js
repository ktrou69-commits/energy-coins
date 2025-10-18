// Links Management Module
class LinksManager {
    constructor() {
        this.currentCategory = 'all';
        this.currentSort = 'created';
        this.editingLink = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.updateLinksTitle();
                this.render();
            });
        });

        // Add link button
        document.getElementById('addLinkBtn').addEventListener('click', () => {
            this.openLinkModal();
        });

        // Sort dropdown
        document.getElementById('linksSortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Link modal events
        document.getElementById('closeLinkModal').addEventListener('click', () => {
            this.closeLinkModal();
        });

        document.getElementById('cancelLink').addEventListener('click', () => {
            this.closeLinkModal();
        });

        document.getElementById('deleteLink').addEventListener('click', () => {
            this.deleteLink();
        });

        document.getElementById('linkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLink();
        });

        // Close modal on backdrop click
        document.getElementById('linkModal').addEventListener('click', (e) => {
            if (e.target.id === 'linkModal') {
                this.closeLinkModal();
            }
        });
    }

    openLinkModal(linkId = null) {
        const modal = document.getElementById('linkModal');
        const form = document.getElementById('linkForm');
        const title = document.getElementById('linkModalTitle');
        const deleteBtn = document.getElementById('deleteLink');

        form.reset();
        
        if (linkId) {
            // Edit mode
            this.editingLink = linkId;
            const link = window.dataManager.getLink(linkId);
            if (link) {
                title.textContent = 'Редактировать ссылку';
                deleteBtn.style.display = 'block';
                
                document.getElementById('linkTitle').value = link.title;
                document.getElementById('linkUrl').value = link.url;
                document.getElementById('linkDescription').value = link.description || '';
                document.getElementById('linkCategory').value = link.category;
                document.getElementById('linkTags').value = link.tags ? link.tags.join(', ') : '';
            }
        } else {
            // Create mode
            this.editingLink = null;
            title.textContent = 'Добавить ссылку';
            deleteBtn.style.display = 'none';
            document.getElementById('linkCategory').value = this.currentCategory !== 'all' ? this.currentCategory : 'other';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLinkModal() {
        const modal = document.getElementById('linkModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.editingLink = null;
    }

    saveLink() {
        const formData = {
            title: document.getElementById('linkTitle').value.trim(),
            url: document.getElementById('linkUrl').value.trim(),
            description: document.getElementById('linkDescription').value.trim(),
            category: document.getElementById('linkCategory').value,
            tags: document.getElementById('linkTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
        };

        if (!formData.title) {
            alert('Пожалуйста, введите название ссылки');
            return;
        }

        if (!formData.url) {
            alert('Пожалуйста, введите URL');
            return;
        }

        // Validate URL
        try {
            new URL(formData.url);
        } catch (e) {
            alert('Пожалуйста, введите корректный URL');
            return;
        }

        if (this.editingLink) {
            // Update existing link
            window.dataManager.updateLink(this.editingLink, formData);
        } else {
            // Create new link
            window.dataManager.addLink(formData);
        }

        this.closeLinkModal();
        this.render();
    }

    deleteLink() {
        if (this.editingLink && confirm('Вы уверены, что хотите удалить эту ссылку?')) {
            window.dataManager.deleteLink(this.editingLink);
            this.closeLinkModal();
            this.render();
        }
    }

    updateLinksTitle() {
        const title = document.getElementById('linksTitle');
        const categoryNames = {
            all: 'Все ссылки',
            podcasts: 'Подкасты',
            music: 'Музыка',
            videos: 'Видео',
            articles: 'Статьи',
            tools: 'Инструменты',
            other: 'Другое'
        };
        
        title.textContent = categoryNames[this.currentCategory] || 'Все ссылки';
    }

    getLinks() {
        const allLinks = window.dataManager.getLinks();
        
        if (this.currentCategory === 'all') {
            return allLinks;
        } else {
            return allLinks.filter(link => link.category === this.currentCategory);
        }
    }

    sortLinks(links) {
        return links.sort((a, b) => {
            switch (this.currentSort) {
                case 'title':
                    return a.title.localeCompare(b.title);
                
                case 'category':
                    if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    return a.title.localeCompare(b.title);
                
                case 'created':
                default:
                    return new Date(b.created) - new Date(a.created);
            }
        });
    }

    updateStats(allLinks) {
        const total = allLinks.length;
        const categories = [...new Set(allLinks.map(link => link.category))].length;
        const recent = window.dataManager.getRecentLinks().length;

        document.getElementById('totalLinks').textContent = total;
        document.getElementById('categoriesCount').textContent = categories;
        document.getElementById('recentLinks').textContent = recent;
    }

    getCategoryIcon(category) {
        const icons = {
            podcasts: '🎧',
            music: '🎵',
            videos: '🎬',
            articles: '📰',
            tools: '🛠️',
            other: '📂'
        };
        return icons[category] || '🔗';
    }

    getCategoryName(category) {
        const names = {
            podcasts: 'Подкасты',
            music: 'Музыка',
            videos: 'Видео',
            articles: 'Статьи',
            tools: 'Инструменты',
            other: 'Другое'
        };
        return names[category] || 'Другое';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
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
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (e) {
            return null;
        }
    }

    renderLinkItem(link) {
        const faviconUrl = this.getFaviconUrl(link.url);
        const categoryIcon = this.getCategoryIcon(link.category);
        const categoryName = this.getCategoryName(link.category);
        
        return `
            <div class="link-item" data-link-id="${link.id}">
                <div class="link-favicon">
                    ${faviconUrl ? `<img src="${faviconUrl}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                    <span style="${faviconUrl ? 'display:none' : ''}">${categoryIcon}</span>
                </div>
                <div class="link-content">
                    <a href="${link.url}" target="_blank" class="link-title" rel="noopener noreferrer">
                        ${link.title}
                    </a>
                    <div class="link-url">${link.url}</div>
                    ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                    <div class="link-meta">
                        <span class="link-category ${link.category}">
                            ${categoryIcon} ${categoryName}
                        </span>
                        <span class="link-date">${this.formatDate(link.created)}</span>
                    </div>
                    ${link.tags && link.tags.length > 0 ? `
                        <div class="link-tags">
                            ${link.tags.map(tag => `<span class="link-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="link-actions">
                    <button class="link-action" onclick="window.linksManager.openLinkModal('${link.id}')" title="Редактировать">
                        ✏️
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        const allLinks = window.dataManager.getLinks();
        const filteredLinks = this.getLinks();
        const sortedLinks = this.sortLinks(filteredLinks);
        const linksList = document.getElementById('linksList');
        const linksCount = document.getElementById('linksCount');

        this.updateStats(allLinks);
        this.updateLinksTitle();

        // Update count
        const count = sortedLinks.length;
        linksCount.textContent = `${count} ${count === 1 ? 'ссылка' : count < 5 ? 'ссылки' : 'ссылок'}`;

        if (sortedLinks.length === 0) {
            linksList.innerHTML = `
                <div class="empty-state" id="emptyLinks">
                    <div class="empty-icon">🔗</div>
                    <h3>Пока нет ссылок</h3>
                    <p>Добавьте первую ссылку в вашу библиотеку</p>
                    <button class="btn btn-primary" onclick="window.linksManager.openLinkModal()">
                        Добавить ссылку
                    </button>
                </div>
            `;
        } else {
            linksList.innerHTML = sortedLinks.map(link => this.renderLinkItem(link)).join('');
        }
    }
}

// Initialize links manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for dataManager to be available
    const initLinks = () => {
        if (window.dataManager) {
            window.linksManager = new LinksManager();
        } else {
            setTimeout(initLinks, 100);
        }
    };
    initLinks();
});
