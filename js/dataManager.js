// Gerenciador de Dados - Sistema de persistência usando localStorage
class DataManager {
    constructor() {
        this.init();
    }

    init() {
        // Inicializar dados se não existirem
        if (!localStorage.getItem('events')) {
            localStorage.setItem('events', JSON.stringify([]));
        }
        if (!localStorage.getItem('registrations')) {
            localStorage.setItem('registrations', JSON.stringify([]));
        }
        if (!localStorage.getItem('certificates')) {
            localStorage.setItem('certificates', JSON.stringify([]));
        }
        if (!localStorage.getItem('notifications')) {
            localStorage.setItem('notifications', JSON.stringify([]));
        }
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
        
        // Garantir que o usuário admin sempre exista
        let users = [];
        if (localStorage.getItem('users')) {
            users = JSON.parse(localStorage.getItem('users'));
        }
        
        // Verificar se o admin já existe
        const adminExists = users.find(u => u.email === 'admin@admin.com');
        if (!adminExists) {
            // Criar usuário admin padrão para testes
            const adminUser = {
                id: 'admin-001',
                name: 'Administrador',
                email: 'admin@admin.com',
                phone: '(00) 00000-0000',
                password: 'admin123', // Em produção, usar hash
                role: 'admin',
                institution: 'Sistema',
                createdAt: new Date().toISOString(),
                isActive: true
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // RF001: Cadastrar utilizador
    registerUser(userData) {
        const users = this.getUsers();
        
        // Verificar se email já existe
        if (users.find(u => u.email === userData.email)) {
            throw new Error('Email já cadastrado');
        }

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // Em produção, usar hash
            role: userData.role || 'participante', // 'organizador' ou 'participante'
            institution: userData.institution || '',
            createdAt: new Date().toISOString(),
            isActive: true
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

    // RF002: Autenticar utilizador
    login(email, password) {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }
        
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.isActive);
        
        if (!user) {
            throw new Error('Email ou senha inválidos');
        }
        
        if (user.password !== password) {
            throw new Error('Email ou senha inválidos');
        }

        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution
        };

        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return userSession;
    }

    logout() {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // RF003: Criar evento académico
    createEvent(eventData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const events = this.getEvents();
        const newEvent = {
            id: Date.now().toString(),
            title: eventData.title,
            description: eventData.description,
            type: eventData.type, // 'workshop', 'palestra', 'competicao'
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            image: eventData.image || 'assets/images/eventoscientificos.png',
            tags: eventData.tags || [],
            speakers: eventData.speakers || [],
            maxParticipants: eventData.maxParticipants || null,
            organizerId: currentUser.id,
            organizerName: currentUser.name,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        events.push(newEvent);
        localStorage.setItem('events', JSON.stringify(events));
        return newEvent;
    }

    // RF004: Editar informações de evento
    updateEvent(eventId, eventData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const events = this.getEvents();
        const eventIndex = events.findIndex(e => e.id === eventId);
        
        if (eventIndex === -1) {
            throw new Error('Evento não encontrado');
        }

        const event = events[eventIndex];
        
        // Verificar se é o organizador ou admin
        if (event.organizerId !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('Sem permissão para editar este evento');
        }

        events[eventIndex] = {
            ...event,
            ...eventData,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('events', JSON.stringify(events));
        return events[eventIndex];
    }

    // RF005: Excluir evento académico
    deleteEvent(eventId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const events = this.getEvents();
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            throw new Error('Evento não encontrado');
        }

        // Verificar se é o organizador ou admin
        if (event.organizerId !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('Sem permissão para excluir este evento');
        }

        // Marcar como inativo ao invés de deletar
        const eventIndex = events.findIndex(e => e.id === eventId);
        events[eventIndex].isActive = false;
        localStorage.setItem('events', JSON.stringify(events));
        
        return true;
    }

    // RF006: Consultar lista de eventos disponíveis
    getEvents(filters = {}) {
        let events = JSON.parse(localStorage.getItem('events') || '[]');
        
        // Filtrar apenas eventos ativos
        events = events.filter(e => e.isActive);
        
        // Aplicar filtros
        if (filters.type) {
            events = events.filter(e => e.type === filters.type);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            events = events.filter(e => 
                e.title.toLowerCase().includes(search) ||
                e.description.toLowerCase().includes(search) ||
                e.tags.some(tag => tag.toLowerCase().includes(search))
            );
        }
        if (filters.organizerId) {
            events = events.filter(e => e.organizerId === filters.organizerId);
        }

        return events;
    }

    getEventById(eventId) {
        const events = this.getEvents();
        return events.find(e => e.id === eventId);
    }

    // RF007: Inscrever-se em evento
    registerForEvent(eventId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const event = this.getEventById(eventId);
        if (!event) {
            throw new Error('Evento não encontrado');
        }

        const registrations = this.getRegistrations();
        
        // Verificar se já está inscrito
        if (registrations.find(r => r.eventId === eventId && r.userId === currentUser.id && r.status !== 'cancelled')) {
            throw new Error('Você já está inscrito neste evento');
        }

        // Verificar limite de participantes
        if (event.maxParticipants) {
            const activeRegistrations = registrations.filter(
                r => r.eventId === eventId && r.status === 'confirmed'
            ).length;
            if (activeRegistrations >= event.maxParticipants) {
                throw new Error('Evento esgotado');
            }
        }

        const newRegistration = {
            id: Date.now().toString(),
            eventId: eventId,
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            status: 'pending', // 'pending', 'confirmed', 'cancelled', 'attended'
            registeredAt: new Date().toISOString()
        };

        registrations.push(newRegistration);
        localStorage.setItem('registrations', JSON.stringify(registrations));
        
        // Criar notificação
        this.createNotification({
            userId: event.organizerId,
            type: 'new_registration',
            title: 'Nova Inscrição',
            message: `${currentUser.name} se inscreveu no evento "${event.title}"`,
            eventId: eventId
        });

        return newRegistration;
    }

    // RF008: Cancelar inscrição em evento
    cancelRegistration(eventId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const registrations = this.getRegistrations();
        const registration = registrations.find(
            r => r.eventId === eventId && r.userId === currentUser.id
        );

        if (!registration) {
            throw new Error('Inscrição não encontrada');
        }

        if (registration.status === 'cancelled') {
            throw new Error('Inscrição já foi cancelada');
        }

        registration.status = 'cancelled';
        registration.cancelledAt = new Date().toISOString();
        localStorage.setItem('registrations', JSON.stringify(registrations));

        const event = this.getEventById(eventId);
        if (event) {
            this.createNotification({
                userId: event.organizerId,
                type: 'registration_cancelled',
                title: 'Inscrição Cancelada',
                message: `${currentUser.name} cancelou a inscrição no evento "${event.title}"`,
                eventId: eventId
            });
        }

        return registration;
    }

    // RF009: Confirmar presença em evento
    confirmAttendance(eventId, userId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const event = this.getEventById(eventId);
        if (!event) {
            throw new Error('Evento não encontrado');
        }

        // Verificar se é o organizador ou admin
        if (event.organizerId !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('Sem permissão para confirmar presença');
        }

        const registrations = this.getRegistrations();
        const registration = registrations.find(
            r => r.eventId === eventId && r.userId === userId
        );

        if (!registration) {
            throw new Error('Inscrição não encontrada');
        }

        registration.status = 'attended';
        registration.attendedAt = new Date().toISOString();
        localStorage.setItem('registrations', JSON.stringify(registrations));

        // Gerar certificado automaticamente
        this.generateCertificate(eventId, userId);

        return registration;
    }

    // RF010: Emitir certificado de participação
    generateCertificate(eventId, userId) {
        const event = this.getEventById(eventId);
        if (!event) {
            throw new Error('Evento não encontrado');
        }

        const registrations = this.getRegistrations();
        const registration = registrations.find(
            r => r.eventId === eventId && r.userId === userId && r.status === 'attended'
        );

        if (!registration) {
            throw new Error('Presença não confirmada');
        }

        const certificates = this.getCertificates();
        
        // Verificar se certificado já existe
        if (certificates.find(c => c.eventId === eventId && c.userId === userId)) {
            return certificates.find(c => c.eventId === eventId && c.userId === userId);
        }

        const certificate = {
            id: Date.now().toString(),
            eventId: eventId,
            eventTitle: event.title,
            userId: userId,
            userName: registration.userName,
            userEmail: registration.userEmail,
            code: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            issuedAt: new Date().toISOString(),
            status: 'available'
        };

        certificates.push(certificate);
        localStorage.setItem('certificates', JSON.stringify(certificates));

        return certificate;
    }

    getCertificates(filters = {}) {
        let certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
        
        if (filters.userEmail) {
            certificates = certificates.filter(c => c.userEmail === filters.userEmail);
        }
        if (filters.userId) {
            certificates = certificates.filter(c => c.userId === filters.userId);
        }
        if (filters.eventId) {
            certificates = certificates.filter(c => c.eventId === filters.eventId);
        }

        return certificates;
    }

    // RF011: Gerar relatórios de eventos e inscrições
    generateReport(type, filters = {}) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Acesso negado. Apenas administradores podem gerar relatórios.');
        }

        let report = {
            type: type,
            generatedAt: new Date().toISOString(),
            generatedBy: currentUser.name,
            data: {}
        };

        if (type === 'events') {
            const events = this.getEvents(filters);
            report.data = {
                total: events.length,
                byType: this.groupBy(events, 'type'),
                events: events
            };
        } else if (type === 'registrations') {
            const registrations = this.getRegistrations(filters);
            report.data = {
                total: registrations.length,
                byStatus: this.groupBy(registrations, 'status'),
                registrations: registrations
            };
        } else if (type === 'users') {
            const users = this.getUsers();
            report.data = {
                total: users.length,
                byRole: this.groupBy(users, 'role'),
                users: users
            };
        }

        return report;
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'unknown';
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    // RF012: Enviar notificações e lembretes aos utilizadores
    createNotification(notificationData) {
        const notifications = this.getNotifications();
        const notification = {
            id: Date.now().toString(),
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            eventId: notificationData.eventId || null,
            read: false,
            createdAt: new Date().toISOString()
        };

        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        return notification;
    }

    getNotifications(userId = null) {
        let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        if (userId) {
            notifications = notifications.filter(n => n.userId === userId);
        }

        return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    markNotificationAsRead(notificationId) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    }

    // RF013: Gerir utilizadores e permissões (administrador)
    updateUser(userId, userData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Acesso negado. Apenas administradores podem gerenciar usuários.');
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        users[userIndex] = {
            ...users[userIndex],
            ...userData,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
        return users[userIndex];
    }

    deactivateUser(userId) {
        return this.updateUser(userId, { isActive: false });
    }

    activateUser(userId) {
        return this.updateUser(userId, { isActive: true });
    }

    getRegistrations(filters = {}) {
        let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        
        if (filters.eventId) {
            registrations = registrations.filter(r => r.eventId === filters.eventId);
        }
        if (filters.userId) {
            registrations = registrations.filter(r => r.userId === filters.userId);
        }
        if (filters.status) {
            registrations = registrations.filter(r => r.status === filters.status);
        }

        return registrations;
    }
}

// Instância global
const dataManager = new DataManager();

