// RF012: Sistema de Notificações e Lembretes
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = dataManager.getCurrentUser();
    
    if (!currentUser) {
        return;
    }

    loadNotifications();
    setupNotificationBell();
    checkEventReminders();
});

function setupNotificationBell() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const notifications = dataManager.getNotifications(currentUser.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Adicionar badge de notificações no header se não existir
    let notificationBell = document.getElementById('notificationBell');
    if (!notificationBell) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            notificationBell = document.createElement('li');
            notificationBell.id = 'notificationBell';
            notificationBell.innerHTML = `
                <a href="#" class="notification-link" onclick="toggleNotifications(); return false;">
                    <i class="fas fa-bell"></i>
                    ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
                </a>
                <div class="notifications-dropdown" id="notificationsDropdown">
                    <div class="notifications-header">
                        <h3>Notificações</h3>
                        ${unreadCount > 0 ? `<button onclick="markAllAsRead()">Marcar todas como lidas</button>` : ''}
                    </div>
                    <div class="notifications-list" id="notificationsList">
                        <!-- Notificações serão carregadas aqui -->
                    </div>
                    <div class="notifications-footer">
                        <a href="notificacoes.html">Ver todas as notificações</a>
                    </div>
                </div>
            `;
            navLinks.insertBefore(notificationBell, navLinks.firstChild);
        }
    }

    updateNotificationBell();
}

function updateNotificationBell() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const notifications = dataManager.getNotifications(currentUser.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    
    if (unreadCount > 0) {
        if (!badge) {
            const bell = document.querySelector('.notification-link');
            if (bell) {
                const newBadge = document.createElement('span');
                newBadge.className = 'notification-badge';
                newBadge.textContent = unreadCount;
                bell.appendChild(newBadge);
            }
        } else {
            badge.textContent = unreadCount;
        }
    } else if (badge) {
        badge.remove();
    }

    loadNotificationsDropdown();
}

function loadNotificationsDropdown() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const notifications = dataManager.getNotifications(currentUser.id).slice(0, 5);
    const container = document.getElementById('notificationsList');
    
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" onclick="markAsRead('${notif.id}')">
            <div class="notification-icon">
                <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <span class="notification-time">${formatTime(notif.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function loadNotifications() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const notifications = dataManager.getNotifications(currentUser.id);
    const container = document.getElementById('notificationsContainer');
    
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>Nenhuma notificação</h3>
                <p>Você não tem notificações no momento.</p>
            </div>
        `;
        return;
    }

    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read);

    container.innerHTML = `
        <div class="notifications-header-page">
            <h3>Notificações Não Lidas (${unread.length})</h3>
            ${unread.length > 0 ? `
                <button class="event-button secondary" onclick="markAllAsRead()">
                    <i class="fas fa-check-double"></i> Marcar todas como lidas
                </button>
            ` : ''}
        </div>
        <div class="notifications-section">
            ${unread.map(notif => createNotificationCard(notif)).join('')}
        </div>
        ${read.length > 0 ? `
            <div class="notifications-header-page">
                <h3>Notificações Lidas</h3>
            </div>
            <div class="notifications-section">
                ${read.map(notif => createNotificationCard(notif)).join('')}
            </div>
        ` : ''}
    `;
}

function createNotificationCard(notif) {
    const event = notif.eventId ? dataManager.getEventById(notif.eventId) : null;
    
    return `
        <div class="notification-card ${notif.read ? 'read' : 'unread'}" onclick="markAsRead('${notif.id}')">
            <div class="notification-icon-large">
                <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content-full">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                ${event ? `
                    <a href="evento-detalhes.html?id=${event.id}" class="notification-link-event">
                        Ver evento <i class="fas fa-arrow-right"></i>
                    </a>
                ` : ''}
                <span class="notification-time">${formatTime(notif.createdAt)}</span>
            </div>
        </div>
    `;
}

function markAsRead(notificationId) {
    dataManager.markNotificationAsRead(notificationId);
    updateNotificationBell();
    loadNotifications();
}

function markAllAsRead() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const notifications = dataManager.getNotifications(currentUser.id);
    notifications.filter(n => !n.read).forEach(n => {
        dataManager.markNotificationAsRead(n.id);
    });

    updateNotificationBell();
    loadNotifications();
    showToast('Todas as notificações foram marcadas como lidas', 'success');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function getNotificationIcon(type) {
    const icons = {
        new_registration: 'user-plus',
        registration_cancelled: 'user-times',
        event_created: 'calendar-plus',
        event_updated: 'calendar-check',
        event_reminder: 'bell',
        certificate_issued: 'certificate'
    };
    return icons[type] || 'info-circle';
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (days < 7) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// RF012: Verificar lembretes de eventos
function checkEventReminders() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const registrations = dataManager.getRegistrations({ userId: currentUser.id, status: 'confirmed' });
    const now = new Date();

    registrations.forEach(reg => {
        const event = dataManager.getEventById(reg.eventId);
        if (!event) return;

        const eventDate = new Date(event.date);
        const diffHours = (eventDate - now) / (1000 * 60 * 60);

        // Criar lembrete 24h antes do evento
        if (diffHours > 0 && diffHours <= 24) {
            const existingNotifications = dataManager.getNotifications(currentUser.id);
            const reminderExists = existingNotifications.find(
                n => n.type === 'event_reminder' && n.eventId === event.id
            );

            if (!reminderExists) {
                dataManager.createNotification({
                    userId: currentUser.id,
                    type: 'event_reminder',
                    title: 'Lembrete de Evento',
                    message: `O evento "${event.title}" acontece em ${Math.floor(diffHours)} horas!`,
                    eventId: event.id
                });
                updateNotificationBell();
            }
        }
    });
}

// Verificar lembretes a cada hora
setInterval(checkEventReminders, 3600000);

