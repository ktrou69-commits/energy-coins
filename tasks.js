// Tasks Management Module
class TasksManager {
    constructor() {
        this.currentPeriod = 'day'; // 'day' or 'week'
        this.currentSort = 'created';
        this.editingTask = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.updateTasksTitle();
                this.render();
            });
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Sort dropdown
        document.getElementById('tasksSortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Task modal events
        document.getElementById('closeTaskModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancelTask').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('deleteTask').addEventListener('click', () => {
            this.deleteTask();
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Close modal on backdrop click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });
    }

    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('taskModalTitle');
        const deleteBtn = document.getElementById('deleteTask');

        form.reset();
        
        if (taskId) {
            // Edit mode
            this.editingTask = taskId;
            const task = window.dataManager.getTask(taskId);
            if (task) {
                title.textContent = 'Редактировать задачу';
                deleteBtn.style.display = 'block';
                
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskStatus').value = task.status;
                document.getElementById('taskPeriod').value = task.period;
                document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
                
                if (task.deadline) {
                    const deadline = new Date(task.deadline);
                    document.getElementById('taskDeadline').value = deadline.toISOString().slice(0, 16);
                }
            }
        } else {
            // Create mode
            this.editingTask = null;
            title.textContent = 'Добавить задачу';
            deleteBtn.style.display = 'none';
            document.getElementById('taskPeriod').value = this.currentPeriod;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.editingTask = null;
    }

    saveTask() {
        const formData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            period: document.getElementById('taskPeriod').value,
            deadline: document.getElementById('taskDeadline').value || null,
            tags: document.getElementById('taskTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
        };

        if (!formData.title) {
            alert('Пожалуйста, введите название задачи');
            return;
        }

        if (this.editingTask) {
            // Update existing task
            window.dataManager.updateTask(this.editingTask, formData);
        } else {
            // Create new task
            const task = {
                id: Date.now().toString(),
                ...formData,
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            };
            window.dataManager.addTask(task);
        }

        this.closeTaskModal();
        this.render();
    }

    deleteTask() {
        if (this.editingTask && confirm('Вы уверены, что хотите удалить эту задачу?')) {
            window.dataManager.deleteTask(this.editingTask);
            this.closeTaskModal();
            this.render();
        }
    }

    toggleTaskStatus(taskId) {
        const task = window.dataManager.getTask(taskId);
        if (task) {
            let newStatus;
            switch (task.status) {
                case 'pending':
                    newStatus = 'in_progress';
                    break;
                case 'in_progress':
                    newStatus = 'completed';
                    break;
                case 'completed':
                    newStatus = 'pending';
                    break;
                default:
                    newStatus = 'pending';
            }
            
            window.dataManager.updateTask(taskId, { 
                status: newStatus,
                updated: new Date().toISOString()
            });
            this.render();
        }
    }

    updateTasksTitle() {
        const title = document.getElementById('tasksTitle');
        const filterLabel = document.getElementById('tasksFilterLabel');
        
        if (this.currentPeriod === 'day') {
            title.textContent = 'Задачи на сегодня';
            filterLabel.textContent = 'на день';
        } else {
            title.textContent = 'Задачи на неделю';
            filterLabel.textContent = 'на неделю';
        }
    }

    getTasks() {
        const allTasks = window.dataManager.getTasks();
        const currentDate = new Date();
        
        return allTasks.filter(task => {
            if (this.currentPeriod === 'day') {
                return task.period === 'day';
            } else {
                return task.period === 'week';
            }
        });
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                
                case 'deadline':
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                
                case 'status':
                    const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                
                case 'created':
                default:
                    return new Date(b.created) - new Date(a.created);
            }
        });
    }

    updateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const overdue = tasks.filter(t => {
            if (!t.deadline) return false;
            return new Date(t.deadline) < new Date() && t.status !== 'completed';
        }).length;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('overdueTasks').textContent = overdue;

        document.getElementById('completionRate').textContent = 
            total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';
        document.getElementById('pendingRate').textContent = 
            total > 0 ? Math.round(((pending + inProgress) / total) * 100) + '%' : '0%';
        document.getElementById('overdueRate').textContent = 
            total > 0 ? Math.round((overdue / total) * 100) + '%' : '0%';
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Просрочено на ${Math.abs(diffDays)} дн.`;
        } else if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Завтра';
        } else if (diffDays <= 7) {
            return `Через ${diffDays} дн.`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    renderTaskItem(task) {
        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-checkbox ${task.status}" onclick="window.tasksManager.toggleTaskStatus('${task.id}')">
                    ${task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '⏳' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">
                            ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
                            ${task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                        ${task.deadline ? `
                            <span class="task-deadline ${isOverdue ? 'overdue' : ''}">
                                📅 ${this.formatDeadline(task.deadline)}
                            </span>
                        ` : ''}
                    </div>
                    ${task.tags && task.tags.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-action" onclick="window.tasksManager.openTaskModal('${task.id}')" title="Редактировать">
                        ✏️
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        const tasks = this.getTasks();
        const sortedTasks = this.sortTasks(tasks);
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyTasks');

        this.updateStats(tasks);
        this.updateTasksTitle();

        if (sortedTasks.length === 0) {
            tasksList.innerHTML = emptyState.outerHTML;
        } else {
            tasksList.innerHTML = sortedTasks.map(task => this.renderTaskItem(task)).join('');
        }
    }
}

// Initialize tasks manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for dataManager to be available
    const initTasks = () => {
        if (window.dataManager) {
            window.tasksManager = new TasksManager();
        } else {
            setTimeout(initTasks, 100);
        }
    };
    initTasks();
});
