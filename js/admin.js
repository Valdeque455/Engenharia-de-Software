// RF013: Gerenciamento de Utilizadores e Permissões (Administrador)
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = dataManager.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (currentUser.role !== 'admin') {
        showToast('Acesso negado. Apenas administradores podem acessar esta página.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    loadUsers();
    setupTabs();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${target}Content`).classList.add('active');
        });
    });
}

function loadUsers() {
    const users = dataManager.getUsers();
    const container = document.getElementById('usersList');
    
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Nenhum usuário cadastrado</h3>
            </div>
        `;
        return;
    }

    container.innerHTML = users.map(user => {
        return `
            <div class="user-card">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                        <p><i class="fas fa-phone"></i> ${user.phone || 'Não informado'}</p>
                        <p><i class="fas fa-building"></i> ${user.institution || 'Não informado'}</p>
                    </div>
                </div>
                <div class="user-meta">
                    <span class="role-badge ${user.role}">${getRoleLabel(user.role)}</span>
                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span class="date-badge">
                        Cadastrado em: ${formatDate(user.createdAt)}
                    </span>
                </div>
                <div class="user-actions">
                    <select class="role-select" onchange="updateUserRole('${user.id}', this.value)">
                        <option value="participante" ${user.role === 'participante' ? 'selected' : ''}>Participante</option>
                        <option value="organizador" ${user.role === 'organizador' ? 'selected' : ''}>Organizador</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                    ${user.isActive ? `
                        <button class="event-button secondary" onclick="deactivateUser('${user.id}')">
                            <i class="fas fa-ban"></i> Desativar
                        </button>
                    ` : `
                        <button class="event-button primary" onclick="activateUser('${user.id}')">
                            <i class="fas fa-check"></i> Ativar
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// RF013: Atualizar papel do usuário
function updateUserRole(userId, newRole) {
    try {
        dataManager.updateUser(userId, { role: newRole });
        showToast('Papel do usuário atualizado com sucesso!', 'success');
        loadUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// RF013: Desativar usuário
function deactivateUser(userId) {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) {
        return;
    }

    try {
        dataManager.deactivateUser(userId);
        showToast('Usuário desativado com sucesso!', 'success');
        loadUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// RF013: Ativar usuário
function activateUser(userId) {
    try {
        dataManager.activateUser(userId);
        showToast('Usuário ativado com sucesso!', 'success');
        loadUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
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
        year: 'numeric' 
    });
}

