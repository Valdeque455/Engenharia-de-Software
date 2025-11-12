// RF009: Confirmação de Presença em Eventos
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        showToast('Evento não especificado', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const event = dataManager.getEventById(eventId);
    if (!event) {
        showToast('Evento não encontrado', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Verificar se é o organizador ou admin
    if (event.organizerId !== currentUser.id && currentUser.role !== 'admin') {
        showToast('Acesso negado. Apenas o organizador pode confirmar presenças.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    loadEventRegistrations(eventId);
});

function loadEventRegistrations(eventId) {
    const event = dataManager.getEventById(eventId);
    const registrations = dataManager.getRegistrations({ eventId: eventId });
    const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed' || r.status === 'attended');
    
    const container = document.getElementById('registrationsContainer');
    if (!container) return;

    // Atualizar informações do evento
    const eventInfo = document.getElementById('eventInfo');
    if (eventInfo) {
        eventInfo.innerHTML = `
            <h2>${event.title}</h2>
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
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${confirmedRegistrations.length}${event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participantes</span>
                </div>
            </div>
        `;
    }

    if (confirmedRegistrations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Nenhum participante confirmado</h3>
                <p>Ainda não há participantes confirmados para este evento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="attendance-filters">
            <button class="filter-btn active" data-filter="all">
                Todos (${confirmedRegistrations.length})
            </button>
            <button class="filter-btn" data-filter="confirmed">
                Confirmados (${registrations.filter(r => r.status === 'confirmed').length})
            </button>
            <button class="filter-btn" data-filter="attended">
                Presentes (${registrations.filter(r => r.status === 'attended').length})
            </button>
        </div>
        <div class="registrations-list">
            ${confirmedRegistrations.map(reg => {
                const user = dataManager.getUsers().find(u => u.id === reg.userId);
                return `
                    <div class="registration-item ${reg.status}">
                        <div class="registration-user">
                            <div class="user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="user-info">
                                <h4>${reg.userName}</h4>
                                <p>${reg.userEmail}</p>
                                <span class="registration-date">Inscrito em: ${formatDate(reg.registeredAt)}</span>
                            </div>
                        </div>
                        <div class="registration-status-badge ${reg.status}">
                            ${getStatusLabel(reg.status)}
                        </div>
                        <div class="registration-actions">
                            ${reg.status === 'confirmed' ? `
                                <button class="event-button primary" onclick="confirmAttendance('${event.id}', '${reg.userId}')">
                                    <i class="fas fa-check"></i> Confirmar Presença
                                </button>
                            ` : reg.status === 'attended' ? `
                                <button class="event-button secondary" disabled>
                                    <i class="fas fa-check-circle"></i> Presença Confirmada
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // Adicionar filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.registration-item').forEach(item => {
                if (filter === 'all') {
                    item.style.display = '';
                } else {
                    item.style.display = item.classList.contains(filter) ? '' : 'none';
                }
            });
        });
    });
}

// RF009: Confirmar presença
function confirmAttendance(eventId, userId) {
    try {
        dataManager.confirmAttendance(eventId, userId);
        showToast('Presença confirmada com sucesso! Certificado gerado automaticamente.', 'success');
        loadEventRegistrations(eventId);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function getStatusLabel(status) {
    const labels = {
        pending: 'Pendente',
        confirmed: 'Confirmado',
        cancelled: 'Cancelado',
        attended: 'Presente'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

