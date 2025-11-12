// RF011: Gerar Relatórios de Eventos e Inscrições
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = dataManager.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
        return;
    }

    loadReports();
});

function loadReports() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="reports-actions">
            <button class="event-button primary" onclick="generateReport('events')">
                <i class="fas fa-calendar"></i> Relatório de Eventos
            </button>
            <button class="event-button primary" onclick="generateReport('registrations')">
                <i class="fas fa-ticket-alt"></i> Relatório de Inscrições
            </button>
            <button class="event-button primary" onclick="generateReport('users')">
                <i class="fas fa-users"></i> Relatório de Usuários
            </button>
        </div>
        <div id="reportResults" class="report-results">
            <!-- Resultados dos relatórios serão exibidos aqui -->
        </div>
    `;
}

// RF011: Gerar relatório
function generateReport(type) {
    try {
        const report = dataManager.generateReport(type);
        displayReport(report);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function displayReport(report) {
    const container = document.getElementById('reportResults');
    if (!container) return;

    let html = `
        <div class="report-card">
            <div class="report-header">
                <h3>Relatório de ${getReportTypeLabel(report.type)}</h3>
                <span class="report-date">Gerado em: ${formatDate(report.generatedAt)}</span>
                <span class="report-author">Por: ${report.generatedBy}</span>
            </div>
            <div class="report-content">
    `;

    if (report.type === 'events') {
        html += `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total de Eventos</h4>
                    <p class="summary-value">${report.data.total}</p>
                </div>
                <div class="summary-item">
                    <h4>Por Tipo</h4>
                    <ul>
                        ${Object.entries(report.data.byType).map(([type, count]) => `
                            <li>${getEventTypeLabel(type)}: ${count}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <div class="report-table">
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Organizador</th>
                            <th>Inscrições</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.data.events.map(event => {
                            const registrations = dataManager.getRegistrations({ eventId: event.id });
                            return `
                                <tr>
                                    <td>${event.title}</td>
                                    <td>${getEventTypeLabel(event.type)}</td>
                                    <td>${formatDate(event.date)}</td>
                                    <td>${event.organizerName}</td>
                                    <td>${registrations.filter(r => r.status === 'confirmed').length}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (report.type === 'registrations') {
        html += `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total de Inscrições</h4>
                    <p class="summary-value">${report.data.total}</p>
                </div>
                <div class="summary-item">
                    <h4>Por Status</h4>
                    <ul>
                        ${Object.entries(report.data.byStatus).map(([status, count]) => `
                            <li>${getStatusLabel(status)}: ${count}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    } else if (report.type === 'users') {
        html += `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total de Usuários</h4>
                    <p class="summary-value">${report.data.total}</p>
                </div>
                <div class="summary-item">
                    <h4>Por Papel</h4>
                    <ul>
                        ${Object.entries(report.data.byRole).map(([role, count]) => `
                            <li>${getRoleLabel(role)}: ${count}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    html += `
            </div>
            <div class="report-actions">
                <button class="event-button secondary" onclick="exportReport('${report.type}')">
                    <i class="fas fa-download"></i> Exportar PDF
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function exportReport(type) {
    // Simulação de exportação
    showToast('Funcionalidade de exportação será implementada em breve', 'info');
}

function getReportTypeLabel(type) {
    const labels = {
        events: 'Eventos',
        registrations: 'Inscrições',
        users: 'Usuários'
    };
    return labels[type] || type;
}

function getEventTypeLabel(type) {
    const labels = {
        workshop: 'Workshop',
        palestra: 'Palestra',
        competicao: 'Competição'
    };
    return labels[type] || type;
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

function getRoleLabel(role) {
    const labels = {
        participante: 'Participante',
        organizador: 'Organizador',
        admin: 'Administrador'
    };
    return labels[role] || role;
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

