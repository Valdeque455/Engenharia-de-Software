// RF001 e RF002: Sistema de Autenticação Completo
document.addEventListener('DOMContentLoaded', function() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validar campos
            if (!email || !password) {
                showToast('Por favor, preencha todos os campos', 'error');
                return;
            }
            
            try {
                // Garantir que dataManager está disponível
                if (typeof dataManager === 'undefined') {
                    showToast('Erro: Sistema não inicializado. Recarregue a página.', 'error');
                    return;
                }
                
                const user = dataManager.login(email, password);
                showToast('Login realizado com sucesso!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                console.error('Erro no login:', error);
                showToast(error.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
            }
        });
    }

    // Registration Form (RF001: Cadastrar utilizador)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Adicionar campo de tipo de usuário se não existir
        const formGroup = registerForm.querySelector('.form-group:last-of-type');
        if (formGroup && !document.getElementById('userRole')) {
            const roleGroup = document.createElement('div');
            roleGroup.className = 'form-group';
            roleGroup.innerHTML = `
                <label class="form-label" for="userRole">Tipo de Conta</label>
                <select id="userRole" class="form-control" required>
                    <option value="participante">Participante</option>
                    <option value="organizador">Organizador</option>
                </select>
            `;
            formGroup.parentNode.insertBefore(roleGroup, formGroup);
        }

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('userRole')?.value || 'participante';

            if (password !== confirmPassword) {
                showToast('As senhas não coincidem!', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('A senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }

            try {
                const user = dataManager.registerUser({
                    name,
                    email,
                    phone,
                    password,
                    role
                });
                
                showToast('Cadastro realizado com sucesso!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // Password Recovery Form
    const recoverForm = document.getElementById('recoverForm');
    if (recoverForm) {
        recoverForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            // Simulação de recuperação de senha
            showToast('Se este email estiver cadastrado, você receberá as instruções de recuperação de senha.', 'info');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // Verificar se usuário está logado e atualizar navegação
    updateNavigation();
});

// RF002: Função de logout
function logout() {
    dataManager.logout();
    showToast('Logout realizado com sucesso!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Atualizar navegação baseado no estado de autenticação
function updateNavigation() {
    const currentUser = dataManager.getCurrentUser();
    const authLinks = document.querySelector('.auth-links');
    
    if (currentUser && authLinks) {
        authLinks.innerHTML = `
            <li class="user-menu">
                <a href="#" class="user-link">
                    <i class="fas fa-user"></i> ${currentUser.name}
                    <i class="fas fa-chevron-down"></i>
                </a>
                <ul class="user-dropdown">
                    ${currentUser.role === 'admin' ? '<li><a href="admin.html"><i class="fas fa-cog"></i> Administração</a></li>' : ''}
                    ${currentUser.role === 'organizador' || currentUser.role === 'admin' ? '<li><a href="meus-eventos.html"><i class="fas fa-calendar"></i> Meus Eventos</a></li>' : ''}
                    <li><a href="perfil.html"><i class="fas fa-user-circle"></i> Meu Perfil</a></li>
                    <li><a href="inscricoes.html"><i class="fas fa-ticket-alt"></i> Minhas Inscrições</a></li>
                    <li><a href="#" onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
                </ul>
            </li>
        `;
    }
}

// Função auxiliar para mostrar toast
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
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
