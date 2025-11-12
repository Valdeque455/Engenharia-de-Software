// RF003, RF004, RF005: Gerenciamento de Eventos
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = dataManager.getCurrentUser();
    
    // Verificar autenticação
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Verificar se é organizador ou admin
    if (currentUser.role !== 'organizador' && currentUser.role !== 'admin') {
        showToast('Acesso negado. Apenas organizadores podem gerenciar eventos.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Carregar eventos do organizador
    loadMyEvents();

    // Formulário de criação/edição de evento
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }

    // Botão de criar evento
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            openEventModal();
        });
    }

    // Botões de editar e excluir
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-event-btn')) {
            const eventId = e.target.closest('.edit-event-btn').dataset.eventId;
            openEventModal(eventId);
        }
        
        if (e.target.closest('.delete-event-btn')) {
            const eventId = e.target.closest('.delete-event-btn').dataset.eventId;
            deleteEvent(eventId);
        }
    });
});

// RF003: Criar evento
function handleEventSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const eventId = form.dataset.eventId;
    const submitButton = form.querySelector('button[type="submit"]');
    
    const formData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        image: document.getElementById('eventImage').value || 'assets/images/eventoscientificos.png',
        tags: document.getElementById('eventTags').value.split(',').map(t => t.trim()).filter(t => t),
        maxParticipants: document.getElementById('eventMaxParticipants').value || null
    };

    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="spinner"></div> Salvando...';

    try {
        if (eventId) {
            // RF004: Editar evento
            dataManager.updateEvent(eventId, formData);
            showToast('Evento atualizado com sucesso!', 'success');
        } else {
            // RF003: Criar evento
            dataManager.createEvent(formData);
            showToast('Evento criado com sucesso!', 'success');
        }
        
        setTimeout(() => {
            loadMyEvents();
            closeEventModal();
            form.reset();
        }, 1000);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = eventId ? 'Atualizar Evento' : 'Criar Evento';
    }
}

// RF005: Excluir evento
function deleteEvent(eventId) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
        return;
    }

    try {
        dataManager.deleteEvent(eventId);
        showToast('Evento excluído com sucesso!', 'success');
        loadMyEvents();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function loadMyEvents() {
    const currentUser = dataManager.getCurrentUser();
    const events = dataManager.getEvents({ organizerId: currentUser.id });
    const eventsContainer = document.getElementById('myEventsContainer');
    
    if (!eventsContainer) return;

    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>Nenhum evento criado</h3>
                <p>Comece criando seu primeiro evento acadêmico!</p>
                <button class="event-button primary" onclick="openEventModal()">
                    <i class="fas fa-plus"></i> Criar Evento
                </button>
            </div>
        `;
        return;
    }

    eventsContainer.innerHTML = events.map(event => {
        const registrations = dataManager.getRegistrations({ eventId: event.id });
        const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed').length;
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                    <div class="event-badge">${getEventTypeLabel(event.type)}</div>
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
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${confirmedRegistrations}${event.maxParticipants ? ` / ${event.maxParticipants}` : ''} inscritos</span>
                        </div>
                    </div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-actions">
                        <button class="event-button secondary edit-event-btn" data-event-id="${event.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="event-button secondary delete-event-btn" data-event-id="${event.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                        <a href="evento-detalhes.html?id=${event.id}" class="event-button primary">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openEventModal(eventId = null) {
    const modal = document.getElementById('eventModal');
    if (!modal) {
        createEventModal();
        return;
    }

    const form = document.getElementById('eventForm');
    const formTitle = document.getElementById('modalTitle');
    
    if (eventId) {
        // Editar evento existente
        const event = dataManager.getEventById(eventId);
        if (!event) {
            showToast('Evento não encontrado', 'error');
            return;
        }

        formTitle.textContent = 'Editar Evento';
        form.dataset.eventId = eventId;
        form.querySelector('button[type="submit"]').textContent = 'Atualizar Evento';
        
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventImage').value = event.image;
        document.getElementById('eventTags').value = event.tags.join(', ');
        document.getElementById('eventMaxParticipants').value = event.maxParticipants || '';
    } else {
        // Criar novo evento
        formTitle.textContent = 'Criar Novo Evento';
        form.dataset.eventId = '';
        form.reset();
        form.querySelector('button[type="submit"]').textContent = 'Criar Evento';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        const form = document.getElementById('eventForm');
        if (form) {
            form.reset();
            form.dataset.eventId = '';
        }
    }
}

function createEventModal() {
    const modalHTML = `
        <div class="event-modal" id="eventModal">
            <div class="modal-content">
                <button class="modal-close" onclick="closeEventModal()">
                    <i class="fas fa-times"></i>
                </button>
                <h2 id="modalTitle">Criar Novo Evento</h2>
                <form id="eventForm">
                    <div class="form-group">
                        <label for="eventTitle">Título do Evento *</label>
                        <input type="text" id="eventTitle" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="eventDescription">Descrição *</label>
                        <textarea id="eventDescription" class="form-control form-textarea" required></textarea>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="eventType">Tipo *</label>
                            <select id="eventType" class="form-control" required>
                                <option value="workshop">Workshop</option>
                                <option value="palestra">Palestra</option>
                                <option value="competicao">Competição</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="eventDate">Data *</label>
                            <input type="date" id="eventDate" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="eventTime">Horário *</label>
                            <input type="time" id="eventTime" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="eventLocation">Local *</label>
                            <input type="text" id="eventLocation" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="eventImage">URL da Imagem</label>
                            <input type="text" id="eventImage" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="eventMaxParticipants">Máximo de Participantes</label>
                            <input type="number" id="eventMaxParticipants" class="form-control" min="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="eventTags">Tags (separadas por vírgula)</label>
                        <input type="text" id="eventTags" class="form-control" placeholder="Ex: Tecnologia, Inovação, IA">
                    </div>
                    <button type="submit" class="form-submit">
                        Criar Evento
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
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

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('eventModal');
    if (modal && e.target === modal) {
        closeEventModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEventModal();
    }
});

