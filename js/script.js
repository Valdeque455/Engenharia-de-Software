document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();

    // Initialize AOS with custom settings
    AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
    });

    // Header scroll effect with smooth transition
    const header = document.querySelector('.header');
    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
            if (currentScroll > lastScroll) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu with smooth animation
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuButton.setAttribute('aria-label', 'Menu');
    header.querySelector('nav').prepend(mobileMenuButton);

    const navLinks = document.querySelector('.nav-links');
    mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        mobileMenuButton.innerHTML = isExpanded ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            navLinks.style.display = 'flex';
            requestAnimationFrame(() => {
                navLinks.style.opacity = '1';
                navLinks.style.transform = 'translateY(0)';
            });
        } else {
            navLinks.style.opacity = '0';
            navLinks.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (!navLinks.classList.contains('active')) {
                    navLinks.style.display = 'none';
                }
            }, 300);
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = header.offsetHeight;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    mobileMenuButton.click();
                }
            }
        });
    });

    // Form validation with real-time feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Add input event for real-time validation
            input.addEventListener('input', () => validateField(input));
            
            // Add blur event for final validation
            input.addEventListener('blur', () => validateField(input));
            
            // Add focus event for better UX
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                submitForm(this);
            } else {
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    });

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.opacity = '0';
            setTimeout(() => errorElement.remove(), 300);
        }
        field.classList.remove('error');

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Email inválido';
            }
        }

        // Password validation
        if (field.type === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = 'A senha deve ter pelo menos 8 caracteres';
            } else if (!/[A-Z]/.test(value)) {
                isValid = false;
                errorMessage = 'A senha deve conter pelo menos uma letra maiúscula';
            } else if (!/[a-z]/.test(value)) {
                isValid = false;
                errorMessage = 'A senha deve conter pelo menos uma letra minúscula';
            } else if (!/[0-9]/.test(value)) {
                isValid = false;
                errorMessage = 'A senha deve conter pelo menos um número';
            }
        }

        // Password confirmation validation
        if (field.id === 'confirmarSenha' && value) {
            const password = document.getElementById('senha').value;
            if (value !== password) {
                isValid = false;
                errorMessage = 'As senhas não coincidem';
            }
        }

        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.style.opacity = '0';
            field.parentElement.appendChild(errorDiv);
            requestAnimationFrame(() => {
                errorDiv.style.opacity = '1';
            });
        }

        return isValid;
    }

    function submitForm(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="spinner"></div>';

        // Simulate form submission with animation
        setTimeout(() => {
            showToast('Formulário enviado com sucesso!', 'success');
            form.reset();
            
            // Reset all form fields
            form.querySelectorAll('input, select, textarea').forEach(field => {
                field.classList.remove('error');
                const errorElement = field.parentElement.querySelector('.error-message');
                if (errorElement) errorElement.remove();
            });
            
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 1500);
    }

    // Toast notifications with smooth animations
    function showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    // Event filtering with smooth transitions
    const filterButtons = document.querySelectorAll('.filter-button');
    const eventList = document.getElementById('eventList');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.transform = 'scale(1)';
            });
            
            this.classList.add('active');
            this.style.transform = 'scale(1.05)';
            
            const filter = this.dataset.filter;
            filterEvents(filter);
        });
    });

    function filterEvents(filter) {
        if (!eventList) return;

        // Add fade-out animation
        eventList.style.opacity = '0';
        eventList.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            const events = getFilteredEvents(filter);
            displayEvents(events);
            
            // Add fade-in animation
            requestAnimationFrame(() => {
                eventList.style.opacity = '1';
                eventList.style.transform = 'translateY(0)';
            });
        }, 300);
    }

    function getFilteredEvents(filter) {
        // TODO: Replace with actual API call
        const events = [
            {
                title: 'Congresso de Tecnologia',
                type: 'congressos',
                date: '15-17 Junho 2024',
                location: 'São Paulo, SP',
                image: 'https://via.placeholder.com/400x250',
                description: 'O maior congresso de tecnologia do Brasil.'
            },
            {
                title: 'Workshop de Pesquisa',
                type: 'workshops',
                date: '20-22 Julho 2024',
                location: 'Rio de Janeiro, RJ',
                image: 'https://via.placeholder.com/400x250',
                description: 'Workshop prático sobre metodologia científica.'
            },
            {
                title: 'Simpósio de IA',
                type: 'simposios',
                date: '10-12 Agosto 2024',
                location: 'Belo Horizonte, MG',
                image: 'https://via.placeholder.com/400x250',
                description: 'Discussões sobre IA e machine learning.'
            }
        ];

        return filter === 'todos' ? events : events.filter(event => event.type === filter);
    }

    function displayEvents(events) {
        if (!eventList) return;

        eventList.innerHTML = events.map((event, index) => `
            <div class="event-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <img src="${event.image}" alt="${event.title}">
                <div class="event-content">
                    <h4>${event.title}</h4>
                    <p class="event-date"><i class="fas fa-calendar"></i> ${event.date}</p>
                    <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p class="event-description">${event.description}</p>
                    <button class="event-button" onclick="showEventDetails('${event.title}')">
                        Saiba Mais
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Event details modal
    window.showEventDetails = function(eventTitle) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" data-aos="zoom-in">
                <button class="modal-close"><i class="fas fa-times"></i></button>
                <h3>${eventTitle}</h3>
                <p>Detalhes do evento serão carregados aqui...</p>
                <button class="button button-primary">Inscrever-se</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    // Initialize events
    filterEvents('todos');

    // Certificate search with debounce
    const certificateSearch = document.getElementById('emailCertificado');
    if (certificateSearch) {
        let searchTimeout;
        certificateSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                buscarCertificados();
            }, 500);
        });
    }

    // Add hover effects to cards
    const cards = document.querySelectorAll('.event-card, .featured-event-card, .news-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow-md)';
        });
    });

    // Intersection Observer for infinite scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreEvents();
            }
        });
    }, {
        rootMargin: '100px'
    });

    const lastEventCard = document.querySelector('.event-card:last-child');
    if (lastEventCard) {
        observer.observe(lastEventCard);
    }

    // Event Navigation and Filtering
    const eventFilters = document.querySelectorAll('.event-filter');
    const eventGrid = document.querySelector('.event-grid');
    let currentFilter = 'all';

    // Event Management
    const mockEvents = [
        {
            id: 1,
            title: 'Workshop de Programação Web Moderna',
            type: 'workshop',
            date: '2024-03-15',
            time: '14:00 - 18:00',
            location: 'Auditório Principal',
            image: 'assets/images/anais-de-eventos-930x534.png',
            description: 'Aprenda as últimas tecnologias web em um workshop prático e interativo.',
            tags: ['Web', 'JavaScript', 'React'],
            speakers: [
                {
                    name: 'Ana Silva',
                    role: 'Desenvolvedora Senior',
                    image: 'https://source.unsplash.com/random/100x100?woman'
                }
            ]
        },
        {
            id: 2,
            title: 'Palestra: Inteligência Artificial na Educação',
            type: 'palestra',
            date: '2024-03-20',
            time: '19:00 - 21:00',
            location: 'Sala de Conferências',
            image: 'assets/images/eventoscientificos.png',
            description: 'Descubra como a IA está transformando o futuro da educação.',
            tags: ['IA', 'Educação', 'Tecnologia'],
            speakers: [
                {
                    name: 'Dr. Carlos Oliveira',
                    role: 'Pesquisador em IA',
                    image: 'https://source.unsplash.com/random/100x100?professor'
                }
            ]
        },
        {
            id: 3,
            title: 'Mesa Redonda: Mulheres na Tecnologia',
            type: 'palestra',
            date: '2024-03-25',
            time: '16:00 - 18:00',
            location: 'Sala 101',
            image: 'assets/images/images.jpeg',
            description: 'Debate sobre a presença feminina no setor de tecnologia.',
            tags: ['Diversidade', 'Tecnologia', 'Mulheres'],
            speakers: [
                {
                    name: 'Maria Souza',
                    role: 'Engenheira de Software',
                    image: 'https://source.unsplash.com/random/100x100?woman,tech'
                }
            ]
        },
        {
            id: 4,
            title: 'Promoção de Eventos Acadêmicos',
            type: 'workshop',
            date: '2024-04-01',
            time: '10:00 - 12:00',
            location: 'Sala de Eventos',
            image: 'assets/images/Promocao-de-eventos-930x534.png',
            description: 'Como promover eventos acadêmicos de forma eficiente e inovadora.',
            tags: ['Eventos', 'Promoção', 'Inovação'],
            speakers: [
                {
                    name: 'João Pereira',
                    role: 'Organizador de Eventos',
                    image: 'https://source.unsplash.com/random/100x100?man,event'
                }
            ]
        }
    ];

    let currentEvents = [];
    let displayedEvents = [];
    let currentPage = 1;
    const eventsPerPage = 6;

    function initializeEvents() {
        // Tentar carregar eventos do dataManager
        if (typeof dataManager !== 'undefined') {
            const dbEvents = dataManager.getEvents();
            if (dbEvents.length > 0) {
                currentEvents = dbEvents.map(e => ({
                    id: e.id,
                    title: e.title,
                    type: e.type,
                    date: e.date,
                    time: e.time,
                    location: e.location,
                    image: e.image,
                    description: e.description,
                    tags: e.tags || [],
                    speakers: e.speakers || []
                }));
            } else {
                currentEvents = [...mockEvents];
            }
        } else {
            currentEvents = [...mockEvents];
        }
        
        displayedEvents = currentEvents.slice(0, eventsPerPage);
        renderEvents(displayedEvents);
        setupEventFilters();
        setupEventSearch();
        setupEventSort();
        setupEventModal();
        setupLoadMore();
    }

    function renderEvents(events) {
        const eventGrid = document.getElementById('eventGrid');
        if (!eventGrid) return;

        eventGrid.innerHTML = events.map(event => `
            <div class="event-card" data-event-type="${event.type}">
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
                    </div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-tags">
                        ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="event-button primary" onclick="showEventDetails(${event.id})">
                        Saiba Mais <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function setupEventFilters() {
        const filters = document.querySelectorAll('.event-filter');
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterType = filter.dataset.filter;
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                currentEvents = filterType === 'all' 
                    ? mockEvents 
                    : mockEvents.filter(event => event.type === filterType);
                
                currentPage = 1;
                displayedEvents = currentEvents.slice(0, eventsPerPage);
                renderEvents(displayedEvents);
                updateLoadMoreButton();
            });
        });
    }

    function setupEventSearch() {
        const searchInput = document.getElementById('eventSearch');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                currentEvents = mockEvents.filter(event => 
                    event.title.toLowerCase().includes(searchTerm) ||
                    event.description.toLowerCase().includes(searchTerm) ||
                    event.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
                
                currentPage = 1;
                displayedEvents = currentEvents.slice(0, eventsPerPage);
                renderEvents(displayedEvents);
                updateLoadMoreButton();
            }, 300);
        });
    }

    function setupEventSort() {
        const sortSelect = document.getElementById('eventSort');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', (e) => {
            const sortType = e.target.value;
            currentEvents.sort((a, b) => {
                switch (sortType) {
                    case 'date-asc': return new Date(a.date) - new Date(b.date);
                    case 'date-desc': return new Date(b.date) - new Date(a.date);
                    case 'name-asc': return a.title.localeCompare(b.title);
                    case 'name-desc': return b.title.localeCompare(a.title);
                    default: return 0;
                }
            });
            
            currentPage = 1;
            displayedEvents = currentEvents.slice(0, eventsPerPage);
            renderEvents(displayedEvents);
            updateLoadMoreButton();
        });
    }

    function showEventDetails(eventId) {
        // Tentar buscar do dataManager primeiro
        let event = dataManager ? dataManager.getEventById(eventId) : null;
        
        // Se não encontrar, usar mockEvents como fallback
        if (!event) {
            event = mockEvents.find(e => e.id === eventId);
        }
        
        if (!event) return;

        const modal = document.getElementById('eventModal');
        if (!modal) return;

        modal.querySelector('#modalEventImage').src = event.image;
        modal.querySelector('#modalEventTitle').textContent = event.title;
        modal.querySelector('#modalEventDate').textContent = formatDate(event.date, true);
        modal.querySelector('#modalEventTime').textContent = event.time;
        modal.querySelector('#modalEventLocation').textContent = event.location;
        modal.querySelector('#modalEventDescription').textContent = event.description;
        
        const tagsContainer = modal.querySelector('#modalEventTags');
        tagsContainer.innerHTML = (event.tags || []).map(tag => 
            `<span class="event-tag">${tag}</span>`
        ).join('');
        
        const speakersContainer = modal.querySelector('#modalEventSpeakers');
        if (event.speakers && event.speakers.length > 0) {
            speakersContainer.innerHTML = event.speakers.map(speaker => `
                <div class="speaker-card">
                    <img src="${speaker.image}" alt="${speaker.name}">
                    <div class="speaker-name">${speaker.name}</div>
                    <div class="speaker-role">${speaker.role}</div>
                </div>
            `).join('');
        } else {
            speakersContainer.innerHTML = '';
        }

        // Atualizar botão de inscrição
        const registerBtn = modal.querySelector('#modalEventRegister');
        if (registerBtn && dataManager) {
            const currentUser = dataManager.getCurrentUser();
            const registrations = currentUser ? dataManager.getRegistrations({ userId: currentUser.id, eventId: eventId }) : [];
            const isRegistered = registrations.some(r => r.status !== 'cancelled');
            
            if (isRegistered) {
                registerBtn.innerHTML = 'Já Inscrito <i class="fas fa-check"></i>';
                registerBtn.disabled = true;
            } else {
                registerBtn.innerHTML = 'Inscrever-se <i class="fas fa-user-plus"></i>';
                registerBtn.disabled = false;
                registerBtn.onclick = () => handleEventRegistration(eventId);
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Função global para inscrição em eventos
    window.handleEventRegistration = function(eventId) {
        if (!eventId) {
            const modal = document.getElementById('eventModal');
            const eventTitle = modal.querySelector('#modalEventTitle').textContent;
            const events = dataManager.getEvents();
            const event = events.find(e => e.title === eventTitle);
            if (event) eventId = event.id;
        }
        
        if (eventId) {
            registerForEvent(eventId);
        }
    };

    function closeEventModal() {
        const modal = document.getElementById('eventModal');
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function setupEventModal() {
        const modal = document.getElementById('eventModal');
        if (!modal) return;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeEventModal();
        });

        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeEventModal);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeEventModal();
            }
        });
    }

    function setupLoadMore() {
        const loadMoreButton = document.getElementById('loadMoreEvents');
        if (!loadMoreButton) return;

        loadMoreButton.addEventListener('click', () => {
            currentPage++;
            const nextEvents = currentEvents.slice(
                (currentPage - 1) * eventsPerPage,
                currentPage * eventsPerPage
            );
            displayedEvents = [...displayedEvents, ...nextEvents];
            renderEvents(displayedEvents);
            updateLoadMoreButton();
        });
    }

    function updateLoadMoreButton() {
        const loadMoreButton = document.getElementById('loadMoreEvents');
        if (!loadMoreButton) return;

        loadMoreButton.style.display = 
            displayedEvents.length < currentEvents.length ? 'inline-flex' : 'none';
    }

    function getEventTypeLabel(type) {
        const labels = {
            workshop: 'Workshop',
            palestra: 'Palestra',
            competicao: 'Competição'
        };
        return labels[type] || type;
    }

    function formatDate(dateString, full = false) {
        const date = new Date(dateString);
        const options = full 
            ? { day: 'numeric', month: 'long', year: 'numeric' }
            : { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeEvents();
        // ... existing initialization code ...
    });

    // Authentication Functions
    function initializeAuth() {
        // Password toggle functionality
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        });

        // Form validation and submission
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const recoverForm = document.getElementById('recoverForm');

        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
            // Phone number mask
            const phoneInput = registerForm.querySelector('#phone');
            if (phoneInput) {
                phoneInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 11) value = value.slice(0, 11);
                    if (value.length > 2) {
                        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                    }
                    if (value.length > 9) {
                        value = `${value.slice(0, 9)}-${value.slice(9)}`;
                    }
                    e.target.value = value;
                });
            }
        }

        if (recoverForm) {
            recoverForm.addEventListener('submit', handlePasswordRecovery);
        }
    }

    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('.form-submit');
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const remember = form.querySelector('#remember')?.checked;

        try {
            // Show loading state
            submitButton.classList.add('loading');
            submitButton.innerHTML = '<div class="spinner"></div>';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // TODO: Replace with actual API call
            if (email === 'teste@teste.com' && password === '123456') {
                // Save remember preference
                if (remember) {
                    localStorage.setItem('rememberEmail', email);
                } else {
                    localStorage.removeItem('rememberEmail');
                }

                // Show success message
                showToast('Login realizado com sucesso!', 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error('E-mail ou senha inválidos');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            // Reset button state
            submitButton.classList.remove('loading');
            submitButton.innerHTML = 'Entrar <i class="fas fa-sign-in-alt"></i>';
        }
    }

    // Handle register form submission
    async function handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('.form-submit');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Validate password match
            if (data.password !== data.confirmPassword) {
                throw new Error('As senhas não coincidem');
            }

            // Validate password strength
            if (data.password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            // Show loading state
            submitButton.classList.add('loading');
            submitButton.innerHTML = '<div class="spinner"></div>';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            showToast('Cadastro realizado com sucesso!', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            // Reset button state
            submitButton.classList.remove('loading');
            submitButton.innerHTML = 'Criar Conta <i class="fas fa-user-plus"></i>';
        }
    }

    // Handle password recovery form submission
    async function handlePasswordRecovery(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('.form-submit');
        const email = form.querySelector('#email').value;

        try {
            // Show loading state
            submitButton.classList.add('loading');
            submitButton.innerHTML = '<div class="spinner"></div>';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            const successCard = document.querySelector('.auth-success');
            const formCard = document.querySelector('.auth-card:not(.auth-success)');
            
            if (successCard && formCard) {
                formCard.style.display = 'none';
                successCard.style.display = 'block';
                successCard.style.animation = 'slideUp 0.5s ease-out';
            } else {
                showToast('E-mail de recuperação enviado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            // Reset button state
            submitButton.classList.remove('loading');
            submitButton.innerHTML = 'Enviar Instruções <i class="fas fa-paper-plane"></i>';
        }
    }

    // Social login handlers
    function handleGoogleLogin() {
        // TODO: Implement Google OAuth
        showToast('Login com Google em desenvolvimento', 'info');
    }

    function handleFacebookLogin() {
        // TODO: Implement Facebook OAuth
        showToast('Login com Facebook em desenvolvimento', 'info');
    }

    // Initialize auth functionality when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeAuth();
        
        // Load remembered email if exists
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            const rememberedEmail = localStorage.getItem('rememberEmail');
            if (rememberedEmail) {
                const emailInput = loginForm.querySelector('#email');
                const rememberCheckbox = loginForm.querySelector('#remember');
                if (emailInput && rememberCheckbox) {
                    emailInput.value = rememberedEmail;
                    rememberCheckbox.checked = true;
                }
            }
        }

        // Add social login handlers
        document.querySelectorAll('.auth-social-button').forEach(button => {
            button.addEventListener('click', function() {
                const provider = this.querySelector('i').classList.contains('fa-google') ? 'google' : 'facebook';
                if (provider === 'google') {
                    handleGoogleLogin();
                } else {
                    handleFacebookLogin();
                }
            });
        });
    });

    // Notícias
    const newsSearch = document.getElementById('newsSearch');
    const newsCategories = document.querySelectorAll('.news-category');
    const newsGrid = document.getElementById('newsGrid');
    const loadMoreBtn = document.getElementById('loadMoreNews');
    const formInscricao = document.getElementById('formInscricao');

    // Dados de exemplo para notícias
    const newsData = [
        {
            id: 1,
            title: 'Novas Tecnologias na Educação',
            excerpt: 'Descubra as tendências tecnológicas que estão transformando o ensino superior e revolucionando a forma como aprendemos.',
            image: 'assets/images/anais-de-eventos-930x534.png',
            category: 'educacao',
            date: '15 Março 2024',
            readTime: '5 min de leitura',
            tags: ['Tecnologia', 'Educação', 'Inovação']
        },
        {
            id: 2,
            title: 'Importância da Pesquisa Acadêmica',
            excerpt: 'Como a pesquisa acadêmica está impactando o desenvolvimento social e tecnológico, e por que ela é fundamental para o progresso.',
            image: 'assets/images/eventoscientificos.png',
            category: 'pesquisa',
            date: '10 Março 2024',
            readTime: '7 min de leitura',
            tags: ['Pesquisa', 'Ciência', 'Desenvolvimento']
        },
        {
            id: 3,
            title: 'Eventos Híbridos: O Futuro',
            excerpt: 'A combinação de eventos presenciais e virtuais está revolucionando o cenário acadêmico e criando novas oportunidades de conexão.',
            image: 'assets/images/images.jpeg',
            category: 'tecnologia',
            date: '5 Março 2024',
            readTime: '4 min de leitura',
            tags: ['Eventos', 'Híbrido', 'Inovação']
        },
        {
            id: 4,
            title: 'Promoção de Eventos Acadêmicos',
            excerpt: 'Como promover eventos acadêmicos de forma eficiente e inovadora.',
            image: 'assets/images/Promocao-de-eventos-930x534.png',
            category: 'tecnologia',
            date: '2 Março 2024',
            readTime: '3 min de leitura',
            tags: ['Eventos', 'Promoção', 'Inovação']
        },
        {
            id: 5,
            title: 'Pesquisa e Inovação no Brasil',
            excerpt: 'O cenário da pesquisa científica e tecnológica no país e seus desafios.',
            image: 'https://source.unsplash.com/random/800x600?science',
            category: 'pesquisa',
            date: '28 Fevereiro 2024',
            readTime: '6 min de leitura',
            tags: ['Pesquisa', 'Inovação', 'Brasil']
        }
    ];

    // Escopo específico para as funcionalidades de notícias
    const newsManager = {
        currentPage: 1,
        newsPerPage: 3,
        filteredNews: [...newsData],

        createNewsCard(news) {
            return `
                <article class="news-card" data-aos="fade-up">
                    <div class="news-image">
                        <img src="${news.image}" alt="${news.title}">
                        <div class="news-category-tag">${news.category.charAt(0).toUpperCase() + news.category.slice(1)}</div>
                    </div>
                    <div class="news-content">
                        <div class="news-meta">
                            <span class="news-date"><i class="fas fa-calendar"></i> ${news.date}</span>
                            <span class="news-read-time"><i class="fas fa-clock"></i> ${news.readTime}</span>
                        </div>
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-excerpt">${news.excerpt}</p>
                        <div class="news-tags">
                            ${news.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                        </div>
                        <a href="#" class="news-link">Ler mais <i class="fas fa-arrow-right"></i></a>
                    </div>
                </article>
            `;
        },

        renderNews() {
            const start = 0;
            const end = this.currentPage * this.newsPerPage;
            const newsToShow = this.filteredNews.slice(start, end);
            
            newsGrid.innerHTML = newsToShow.map(news => this.createNewsCard(news)).join('');
            
            // Atualiza visibilidade do botão "Carregar Mais"
            loadMoreBtn.style.display = this.filteredNews.length > end ? 'inline-flex' : 'none';
        },

        filterNews() {
            const searchTerm = newsSearch.value.toLowerCase();
            const activeCategory = document.querySelector('.news-category.active').dataset.category;

            this.filteredNews = newsData.filter(news => {
                const matchesSearch = news.title.toLowerCase().includes(searchTerm) ||
                                    news.excerpt.toLowerCase().includes(searchTerm) ||
                                    news.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                
                const matchesCategory = activeCategory === 'all' || news.category === activeCategory;

                return matchesSearch && matchesCategory;
            });

            this.currentPage = 1;
            this.renderNews();
        },

        loadMore() {
            this.currentPage++;
            this.renderNews();
        }
    };

    // Event listeners para busca e filtros
    newsSearch.addEventListener('input', () => newsManager.filterNews());

    newsCategories.forEach(category => {
        category.addEventListener('click', () => {
            newsCategories.forEach(cat => cat.classList.remove('active'));
            category.classList.add('active');
            newsManager.filterNews();
        });
    });

    // Event listener para "Carregar Mais"
    loadMoreBtn.addEventListener('click', () => newsManager.loadMore());

    // Validação do formulário de inscrição
    if (formInscricao) {
        const validateField = (field, rules) => {
            const value = field.value.trim();
            const errorElement = field.parentElement.querySelector('.form-error');
            let errorMessage = '';

            if (rules.required && !value) {
                errorMessage = 'Este campo é obrigatório';
            } else if (value) {
                if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Email inválido';
                }
                if (rules.phone && !/^\(\d{2}\) \d{5}-\d{4}$/.test(value)) {
                    errorMessage = 'Telefone inválido';
                }
                if (rules.minLength && value.length < rules.minLength) {
                    errorMessage = `Mínimo de ${rules.minLength} caracteres`;
                }
            }

            errorElement.textContent = errorMessage;
            field.classList.toggle('error', !!errorMessage);
            return !errorMessage;
        };

        // Máscara para telefone
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                
                if (value.length > 2) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                }
                if (value.length > 9) {
                    value = `${value.slice(0, 9)}-${value.slice(9)}`;
                }
                
                e.target.value = value;
            });
        }

        // Validação em tempo real
        const formFields = formInscricao.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            const rules = {
                required: field.hasAttribute('required'),
                email: field.type === 'email',
                phone: field.id === 'telefone',
                minLength: field.dataset.minLength ? parseInt(field.dataset.minLength) : null
            };

            field.addEventListener('blur', () => validateField(field, rules));
            field.addEventListener('input', () => validateField(field, rules));
        });

        // Validação no envio
        formInscricao.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            formFields.forEach(field => {
                const rules = {
                    required: field.hasAttribute('required'),
                    email: field.type === 'email',
                    phone: field.id === 'telefone',
                    minLength: field.dataset.minLength ? parseInt(field.dataset.minLength) : null
                };

                if (!validateField(field, rules)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Simula envio do formulário
                const submitButton = formInscricao.querySelector('.form-submit');
                const originalText = submitButton.innerHTML;
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

                setTimeout(() => {
                    // Aqui você adicionaria o código para enviar os dados do formulário
                    alert('Inscrição realizada com sucesso!');
                    
                    formInscricao.reset();
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }, 1500);
            }
        });
    }

    // Inicializa a renderização das notícias
    newsManager.renderNews();

    // Scroll to event category and activate filter if anchor is present
    function activateEventCategoryFromHash() {
        const hash = window.location.hash;
        if (!hash) return;
        let filterType = null;
        if (hash === '#eventos-palestra') filterType = 'palestra';
        if (hash === '#eventos-workshop') filterType = 'workshop';
        if (hash === '#eventos-competicao') filterType = 'competicao';
        if (filterType) {
            const filterBtn = document.querySelector(`.event-filter[data-filter="${filterType}"]`);
            if (filterBtn) {
                filterBtn.click();
                // Scroll suavemente para a seção de eventos
                const eventosSection = document.getElementById('eventos');
                if (eventosSection) {
                    eventosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }
    // Ativar ao carregar a página
    activateEventCategoryFromHash();
    // Ativar ao mudar o hash
    window.addEventListener('hashchange', activateEventCategoryFromHash);
});

// Theme toggle functionality
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.querySelector('i').className = 'fas fa-sun';
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        icon.className = document.body.classList.contains('dark-theme') ? 
            'fas fa-sun' : 'fas fa-moon';
        
        // Save preference
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
} 