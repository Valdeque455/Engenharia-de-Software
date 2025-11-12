// RF007, RF008: Sistema de Inscrições
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = dataManager.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    loadAvailableEvents();
    loadMyRegistrations();
});

// RF007: Inscrever-se em evento
function registerForEvent(eventId) {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) {
        showToast('Por favor, faça login para se inscrever', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        dataManager.registerForEvent(eventId);
        showToast('Inscrição realizada com sucesso!', 'success');
        
        // Fechar modal se estiver aberto
        const modal = document.getElementById('eventModal');
        if (modal) {
            setTimeout(() => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }, 1000);
        }
        
        // Recarregar dados se as funções existirem
        if (typeof loadMyRegistrations === 'function') {
            loadMyRegistrations();
        }
        if (typeof loadAvailableEvents === 'function') {
            loadAvailableEvents();
        }
        
        // Recarregar página se estiver na página de eventos
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Tornar função global
window.registerForEvent = registerForEvent;

// RF008: Cancelar inscrição
function cancelRegistration(eventId) {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) {
        return;
    }

    try {
        dataManager.cancelRegistration(eventId);
        showToast('Inscrição cancelada com sucesso!', 'success');
        loadMyRegistrations();
        loadAvailableEvents();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function loadAvailableEvents() {
    const events = dataManager.getEvents();
    const currentUser = dataManager.getCurrentUser();
    const myRegistrations = currentUser ? dataManager.getRegistrations({ userId: currentUser.id }) : [];
    
    const container = document.getElementById('availableEventsContainer');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>Nenhum evento disponível</h3>
                <p>Novos eventos serão exibidos aqui quando disponíveis.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => {
        const registration = myRegistrations.find(r => r.eventId === event.id && r.status !== 'cancelled');
        const isRegistered = !!registration;
        const canCancel = isRegistered && registration.status === 'confirmed';
        
        const registrations = dataManager.getRegistrations({ eventId: event.id });
        const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
        const isFull = event.maxParticipants && confirmedCount >= event.maxParticipants;

        return `
            <div class="event-card">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                    <div class="event-badge">${getEventTypeLabel(event.type)}</div>
                    ${isFull ? '<div class="event-badge" style="background: var(--color-error); top: 60px;">Esgotado</div>' : ''}
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(event.date)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${event.time}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        ${event.maxParticipants ? `
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${confirmedCount} / ${event.maxParticipants} vagas</span>
                        </div>
                        ` : ''}
                    </div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-actions">
                        ${!isRegistered && !isFull ? `
                            <button class="event-button primary" onclick="registerForEvent('${event.id}')">
                                <i class="fas fa-user-plus"></i> Inscrever-se
                            </button>
                        ` : ''}
                        ${isRegistered && registration.status === 'pending' ? `
                            <button class="event-button secondary" disabled>
                                <i class="fas fa-clock"></i> Aguardando Confirmação
                            </button>
                        ` : ''}
                        ${isRegistered && registration.status === 'confirmed' ? `
                            <button class="event-button secondary" onclick="cancelRegistration('${event.id}')">
                                <i class="fas fa-times"></i> Cancelar Inscrição
                            </button>
                        ` : ''}
                        ${isRegistered && registration.status === 'attended' ? `
                            <button class="event-button secondary" disabled>
                                <i class="fas fa-check-circle"></i> Presença Confirmada
                            </button>
                        ` : ''}
                        <a href="evento-detalhes.html?id=${event.id}" class="event-button secondary">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadMyRegistrations() {
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) return;

    const registrations = dataManager.getRegistrations({ userId: currentUser.id });
    const container = document.getElementById('myRegistrationsContainer');
    
    if (!container) return;

    if (registrations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>Nenhuma inscrição encontrada</h3>
                <p>Você ainda não se inscreveu em nenhum evento.</p>
            </div>
        `;
        return;
    }

    // Agrupar por status
    const grouped = {
        confirmed: registrations.filter(r => r.status === 'confirmed'),
        pending: registrations.filter(r => r.status === 'pending'),
        attended: registrations.filter(r => r.status === 'attended'),
        cancelled: registrations.filter(r => r.status === 'cancelled')
    };

    container.innerHTML = `
        <div class="registrations-tabs">
            <button class="tab-button active" data-tab="confirmed">
                Confirmadas (${grouped.confirmed.length})
            </button>
            <button class="tab-button" data-tab="pending">
                Pendentes (${grouped.pending.length})
            </button>
            <button class="tab-button" data-tab="attended">
                Participados (${grouped.attended.length})
            </button>
            <button class="tab-button" data-tab="cancelled">
                Canceladas (${grouped.cancelled.length})
            </button>
        </div>
        <div class="registrations-content">
            ${Object.keys(grouped).map(status => `
                <div class="tab-content ${status === 'confirmed' ? 'active' : ''}" data-tab="${status}">
                    ${grouped[status].length === 0 ? `
                        <div class="empty-state">
                            <p>Nenhuma inscrição ${getStatusLabel(status)}</p>
                        </div>
                    ` : grouped[status].map(reg => {
                        const event = dataManager.getEventById(reg.eventId);
                        if (!event) return '';
                        
                        return `
                            <div class="registration-card">
                                <div class="registration-header">
                                    <h3>${event.title}</h3>
                                    <span class="registration-status ${reg.status}">${getStatusLabel(reg.status)}</span>
                                </div>
                                <div class="registration-info">
                                    <div class="meta-item">
                                        <i class="fas fa-calendar"></i>
                                        <span>${formatDate(event.date)}</span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="fas fa-clock"></i>
                                        <span>${event.time}</span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${event.location}</span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="fas fa-clock"></i>
                                        <span>Inscrito em: ${formatDate(reg.registeredAt)}</span>
                                    </div>
                                </div>
                                <div class="registration-actions">
                                    ${reg.status === 'confirmed' ? `
                                        <button class="event-button secondary" onclick="cancelRegistration('${event.id}')">
                                            <i class="fas fa-times"></i> Cancelar
                                        </button>
                                    ` : ''}
                                    <a href="evento-detalhes.html?id=${event.id}" class="event-button primary">
                                        <i class="fas fa-eye"></i> Ver Evento
                                    </a>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        </div>
    `;

    // Adicionar event listeners para as tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            button.classList.add('active');
            document.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
        });
    });
}

function getStatusLabel(status) {
    const labels = {
        pending: 'Pendente',
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
        attended: 'Participado'
    };
    return labels[status] || status;
}

function getEventTypeLabel(type) {
    const labels = {
        workshop: 'Workshop',
        palestra: 'Palestra',
        competicao: 'Competição'
    };
    return labels[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
}

