// Certificate Manager
class CertificateManager {
    constructor() {
        this.certificates = [];
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Setup filter buttons
        document.querySelectorAll('.certificate-filter').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.certificate-filter.active').classList.remove('active');
                button.classList.add('active');
                this.currentFilter = button.dataset.filter;
                this.filterCertificates();
            });
        });

        // Setup load more button
        const loadMoreButton = document.getElementById('loadMoreCertificates');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => this.loadMore());
        }
    }

    async buscarCertificados() {
        const emailInput = document.getElementById('emailCertificado');
        if (!emailInput) return;
        
        const email = emailInput.value;
        if (!this.validateEmail(email)) {
            this.showToast('Por favor, insira um email válido', 'error');
            return;
        }

        try {
            // Buscar certificados do dataManager
            if (typeof dataManager !== 'undefined') {
                const certificates = dataManager.getCertificates({ userEmail: email });
                this.certificates = certificates;
            } else {
                // Fallback para mock data
                const mockCertificates = this.generateMockCertificates(email);
                this.certificates = mockCertificates;
            }
            
            this.currentPage = 1;
            this.renderCertificates();
            this.updateLoadMoreButton();
            
            if (this.certificates.length === 0) {
                this.showToast('Nenhum certificado encontrado para este email', 'info');
            }
        } catch (error) {
            this.showToast('Erro ao buscar certificados', 'error');
            console.error('Erro ao buscar certificados:', error);
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    generateMockCertificates(email) {
        // Simulação de dados de certificados
        return [
            {
                id: 1,
                title: 'Workshop de Pesquisa Científica',
                event: 'Congresso Internacional de Tecnologia',
                date: '2024-03-15',
                status: 'available',
                code: 'CERT-2024-001',
                hours: 8,
                type: 'workshop'
            },
            {
                id: 2,
                title: 'Palestra: Inteligência Artificial',
                event: 'Simpósio de Tecnologia',
                date: '2024-03-10',
                status: 'pending',
                code: 'CERT-2024-002',
                hours: 4,
                type: 'palestra'
            },
            {
                id: 3,
                title: 'Curso de Metodologia Científica',
                event: 'Semana Acadêmica',
                date: '2024-02-28',
                status: 'available',
                code: 'CERT-2024-003',
                hours: 12,
                type: 'curso'
            }
        ];
    }

    filterCertificates() {
        const filtered = this.certificates.filter(cert => {
            switch (this.currentFilter) {
                case 'recent':
                    return this.isRecent(cert.date);
                case 'pending':
                    return cert.status === 'pending';
                case 'downloaded':
                    return cert.status === 'downloaded';
                default:
                    return true;
            }
        });

        this.renderCertificates(filtered);
        this.updateLoadMoreButton();
    }

    isRecent(date) {
        const certDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - certDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    }

    renderCertificates(certificates = this.certificates) {
        const container = document.getElementById('listaCertificados');
        const emptyState = document.querySelector('.certificates-empty');
        
        if (!certificates.length) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        const start = 0;
        const end = this.currentPage * this.itemsPerPage;
        const paginatedCertificates = certificates.slice(start, end);

        container.innerHTML = paginatedCertificates.map(cert => this.createCertificateCard(cert)).join('');
    }

    createCertificateCard(certificate) {
        const statusClass = certificate.status === 'available' ? 'available' : 'pending';
        const statusText = certificate.status === 'available' ? 'Disponível' : 'Pendente';
        const formattedDate = this.formatDate(certificate.date);

        return `
            <div class="certificate-card" data-aos="fade-up">
                <div class="certificate-header">
                    <span class="certificate-status ${statusClass}">${statusText}</span>
                    <h3 class="certificate-title">${certificate.title}</h3>
                    <p class="certificate-event">${certificate.event}</p>
                </div>
                <div class="certificate-content">
                    <div class="certificate-info">
                        <div class="certificate-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Data: ${formattedDate}</span>
                        </div>
                        <div class="certificate-info-item">
                            <i class="fas fa-clock"></i>
                            <span>Carga Horária: ${certificate.hours}h</span>
                        </div>
                        <div class="certificate-info-item">
                            <i class="fas fa-hashtag"></i>
                            <span>Código: ${certificate.code}</span>
                        </div>
                    </div>
                    <div class="certificate-actions">
                        ${certificate.status === 'available' ? `
                            <button class="certificate-button primary" onclick="certificateManager.downloadCertificate(${certificate.id})">
                                <i class="fas fa-download"></i> Baixar
                            </button>
                            <button class="certificate-button secondary" onclick="certificateManager.verifyCertificate(${certificate.id})">
                                <i class="fas fa-check-circle"></i> Verificar
                            </button>
                        ` : `
                            <button class="certificate-button secondary" disabled>
                                <i class="fas fa-clock"></i> Aguardando
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    downloadCertificate(id) {
        const certificate = this.certificates.find(cert => cert.id === id);
        if (!certificate) return;

        // Simulação de download - RF010: Emitir certificado
        this.showToast('Iniciando download do certificado...', 'info');
        
        // Criar conteúdo do certificado
        const certificateContent = this.generateCertificatePDF(certificate);
        
        // Simular download
        setTimeout(() => {
            // Em produção, aqui seria gerado um PDF real
            this.showToast('Certificado baixado com sucesso!', 'success');
            
            // Marcar como baixado
            if (typeof dataManager !== 'undefined') {
                // Atualizar status no dataManager se necessário
            }
        }, 1500);
    }
    
    generateCertificatePDF(certificate) {
        // RF010: Gerar conteúdo do certificado
        return `
            CERTIFICADO DE PARTICIPAÇÃO
            
            Certificamos que ${certificate.userName}
            participou do evento "${certificate.eventTitle}"
            
            Código de Verificação: ${certificate.code}
            Data de Emissão: ${new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
        `;
    }

    verifyCertificate(id) {
        const certificate = this.certificates.find(cert => cert.id === id);
        if (!certificate) return;

        // Simulação de verificação
        this.showToast(`Verificando certificado ${certificate.code}...`, 'info');
        setTimeout(() => {
            this.showToast('Certificado verificado com sucesso!', 'success');
        }, 1000);
    }

    loadMore() {
        this.currentPage++;
        this.renderCertificates();
        this.updateLoadMoreButton();
    }

    updateLoadMoreButton() {
        const loadMoreButton = document.getElementById('loadMoreCertificates');
        if (!loadMoreButton) return;

        const totalPages = Math.ceil(this.certificates.length / this.itemsPerPage);
        loadMoreButton.style.display = this.currentPage >= totalPages ? 'none' : 'inline-flex';
    }

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
}

// Initialize Certificate Manager
const certificateManager = new CertificateManager();

// Make buscarCertificados available globally
window.buscarCertificados = () => certificateManager.buscarCertificados(); 