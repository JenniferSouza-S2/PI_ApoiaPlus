document.addEventListener("DOMContentLoaded", () => {
    // Redirecionar para home.html mantendo login
    const homeButton = document.querySelector('.home-btn');
    if (homeButton) {
        homeButton.addEventListener('click', (event) => {
            event.preventDefault();
            
            if (window.location.pathname.includes('home.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                document.querySelector('body').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
               
                window.location.href = 'home.html';
            }
        });
    }

    //  CARROSSEL 
    const track = document.querySelector(".carousel-track");
    if (track) {
        const cards = Array.from(track.children);
        const duplicateCount = 10;
        let animationId;
        let position = 0;

        for (let i = 0; i < duplicateCount; i++) {
            cards.forEach(card => track.appendChild(card.cloneNode(true)));
        }

        const cardStyle = getComputedStyle(cards[0]);
        const cardMargin = parseInt(cardStyle.marginRight) + parseInt(cardStyle.marginLeft);

        const moveCarousel = () => {
            position += 0.5;
            if (position >= cards.length * (cards[0].offsetWidth + cardMargin)) position = 0;
            track.style.transform = `translateX(-${position}px)`;
            animationId = requestAnimationFrame(moveCarousel);
        };

        const stopAnimation = () => cancelAnimationFrame(animationId);
        const startAnimation = () => moveCarousel();

        track.addEventListener('mouseenter', stopAnimation);
        track.addEventListener('mouseleave', startAnimation);
        startAnimation();
    }

    //  MODAL LOGIN / CADASTRO 
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const loginClose = loginModal.querySelector('.close-btn');
    const loginContent = loginModal.querySelector('.modal-content');

    const tabButtons = loginModal.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTabBtn = loginModal.querySelector('[data-tab="login"]');
    const registerTabBtn = loginModal.querySelector('[data-tab="register"]');
    const accountTypeRadios = document.querySelectorAll('input[name="account_type"]');
    const ongDropdownGroup = loginModal.querySelector('.ong-dropdown-group');
    const registerCnpjInput = document.getElementById('reg-cnpj');
    let ongsCache = [];

    //  ONGs 
    async function loadOngs() {
        try {
            const resp = await fetch('/ongs');
            if (!resp.ok) return;
            const ongs = await resp.json();
            
            ongsCache = ongs;
            
            const countElem = document.getElementById('ongs-count');
            if (countElem) countElem.textContent = ongs.length;
        } catch (err) {
            console.error('Não foi possível carregar ONGs', err);
        }
    }
    loadOngs();

    //  VAGAS
    async function loadVagas() {
        try {
            const resp = await fetch('/vagas');
            if (!resp.ok) return;
            const vagas = await resp.json();
            const vagasCountElem = document.getElementById('vagas-count');
            if (vagasCountElem) vagasCountElem.textContent = vagas.length;
        } catch (err) {
            console.error('Não foi possível carregar vagas', err);
        }
    }
    loadVagas();

    // Nav 'Vagas'
    const navVagas = document.getElementById('nav-vagas');
    if (navVagas) {
        navVagas.addEventListener('click', (e) => {
            e.preventDefault();
            const tipo = localStorage.getItem('tipo');
            if (tipo === 'ong') {
                window.location.href = 'ong-dashboard.html';
            } else {
                window.location.href = 'vagas.html';
            }
        });
    }

    // Exibir o nome da ONG quando o usuário digitar um CNPJ no cadastro
    if (registerCnpjInput) {
        const regOngName = document.getElementById('reg-ong-name');
        registerCnpjInput.addEventListener('input', () => {
            const raw = registerCnpjInput.value.replace(/\D/g, '');
            const found = ongsCache.find(o => (o.cnpj || '').replace(/\D/g, '') === raw);
            if (regOngName) {
                if (found) regOngName.textContent = found.nome_fantasia || '';
                else regOngName.textContent = raw.length >= 8 ? 'ONG não encontrada' : '';
            }
        });
    }

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginContent.classList.remove('exit', 'animated');
        loginModal.style.display = 'block';
        void loginContent.offsetWidth;
        loginContent.classList.add('animated');
    });

    function fecharLoginModal() {
        loginContent.classList.remove('animated');
        loginContent.classList.add('exit');
        loginContent.addEventListener('animationend', () => {
            loginModal.style.display = 'none';
            loginContent.classList.remove('exit');
        }, { once: true });
    }

    loginClose.addEventListener('click', fecharLoginModal);
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) fecharLoginModal();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            loginForm.classList.remove('active-form');
            registerForm.classList.remove('active-form');
            button.classList.add('active');
            if (targetTab === 'login') loginForm.classList.add('active-form');
            else registerForm.classList.add('active-form');
        });
    });

    accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'ong' && radio.checked) ongDropdownGroup.style.display = 'block';
            else ongDropdownGroup.style.display = 'none';
        });
    });
    registerTabBtn.click();
    loginTabBtn.classList.remove('active');

    //  REDIRECIONAR PARA PÁGINA 
    const doarBtn = document.getElementById('doar-btn');

    // Abre página de doação
    if (doarBtn) {
        doarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'doacao.html';
        });
    }

    
    function setUserLoggedIn(nome) {
        const loginBtn = document.getElementById('login-btn');
        let userElem = document.getElementById('user-nome');
        let logoutElem = document.getElementById('logout-btn');
        if (!userElem) {
            userElem = document.createElement('a');
            userElem.id = 'user-nome';
            userElem.className = 'nav-item';
            userElem.href = '#';
            userElem.style.cursor = 'pointer';
            loginBtn.insertAdjacentElement('beforebegin', userElem);
        }
        userElem.textContent = nome;
        loginBtn.style.display = 'none';
        
        if (logoutElem) logoutElem.remove();
        
        userElem.onclick = function(e) {
            e.preventDefault();
            
            const existing = document.getElementById('user-popup');
            if (existing) {
                existing.remove();
                window.removeEventListener('resize', updatePopupPosition);
                document.removeEventListener('click', outsideClickHandler);
                return;
            }

            
            const popup = document.createElement('div');
            popup.id = 'user-popup';

            
            const perfilBtn = document.createElement('button');
            perfilBtn.innerHTML = ' Meu Perfil';
            perfilBtn.style.fontFamily = "'Poppins', sans-serif";

            
            const separator = document.createElement('div');
            separator.style.height = '1px';
            separator.style.background = 'rgba(0, 0, 0, 0.08)';
            separator.style.margin = '0';

            
            const sairBtn = document.createElement('button');
            sairBtn.innerHTML = '🚪 Sair';
            sairBtn.style.fontFamily = "'Poppins', sans-serif";
            sairBtn.style.color = '#ff4757';

            popup.appendChild(perfilBtn);
            popup.appendChild(separator);
            popup.appendChild(sairBtn);
            document.body.appendChild(popup);

            
            function updatePopupPosition() {
                const rect = userElem.getBoundingClientRect();
                popup.style.left = `${rect.right - 180}px`;
            }

            
            updatePopupPosition();

            
            window.addEventListener('resize', updatePopupPosition);

            
            perfilBtn.addEventListener('mouseover', () => {
                perfilBtn.style.background = 'linear-gradient(135deg, #ff47a3 0%, #ff7b00 100%)';
                perfilBtn.style.color = 'white';
                perfilBtn.style.paddingLeft = '20px';
            });
            perfilBtn.addEventListener('mouseout', () => {
                perfilBtn.style.background = 'none';
                perfilBtn.style.color = '#333';
                perfilBtn.style.paddingLeft = '16px';
            });

            
            sairBtn.addEventListener('mouseover', () => {
                sairBtn.style.background = 'linear-gradient(135deg, #ff47a3 0%, #ff7b00 100%)';
                sairBtn.style.color = 'white';
                sairBtn.style.paddingLeft = '20px';
            });
            sairBtn.addEventListener('mouseout', () => {
                sairBtn.style.background = 'none';
                sairBtn.style.color = '#ff4757';
                sairBtn.style.paddingLeft = '16px';
            });

            
            perfilBtn.addEventListener('click', (e) => {
                e.preventDefault();
                popup.remove();
                window.removeEventListener('resize', updatePopupPosition);
                document.removeEventListener('click', outsideClickHandler);
                abrirModalEditarPerfil();
            });

            
            function outsideClickHandler(ev) {
                if (!popup.contains(ev.target) && ev.target !== userElem) {
                    popup.remove();
                    window.removeEventListener('resize', updatePopupPosition);
                    document.removeEventListener('click', outsideClickHandler);
                }
            }
            document.addEventListener('click', outsideClickHandler);

            sairBtn.addEventListener('click', function(ev) {
                ev.preventDefault();
                
                localStorage.removeItem('nome');
                localStorage.removeItem('tipo');
                localStorage.removeItem('email');
                localStorage.removeItem('id_voluntario');
                localStorage.removeItem('id_ong');
                
                popup.remove();
                const userNode = document.getElementById('user-nome');
                if (userNode) userNode.remove();
                loginBtn.style.display = '';
                window.removeEventListener('resize', updatePopupPosition);
                document.removeEventListener('click', outsideClickHandler);
                
                window.location.href = 'home.html';
            });
        };
    }

    
    const nomeSalvo = localStorage.getItem('nome');
    if (nomeSalvo) setUserLoggedIn(nomeSalvo);

    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const resp = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                let result = null;
                try {
                    result = await resp.json();
                } catch (err) {
                    result = { message: await resp.text() };
                }
                if (resp.ok && result.usuario && result.usuario.nome) {
                    localStorage.setItem('nome', result.usuario.nome);
                    localStorage.setItem('tipo', result.usuario.tipo);
                    if (result.usuario.email) localStorage.setItem('email', result.usuario.email);
                    if (result.token) localStorage.setItem('token', result.token);
                    if (result.usuario.tipo === 'ong') {
                        localStorage.setItem('id_ong', result.usuario.id || '');
                    } else {
                        localStorage.setItem('id_voluntario', result.usuario.id || '');
                    }
                    setUserLoggedIn(result.usuario.nome);
                    if (typeof fecharLoginModal === 'function') fecharLoginModal();

                    
                    if (result.usuario.tipo === 'ong') {
                        setTimeout(() => {
                            window.location.href = 'ong-dashboard.html';
                        }, 500);
                    }
                } else {
                    alert(result.message || 'Erro ao autenticar.');
                }
            } catch (err) {
                alert('Erro de conexão.');
            }
        });
    }

    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            data.tipo = data.tipo || data.account_type || 'voluntario';
           
            if (data.account_type === 'ong' || data.tipo === 'ong') {
                
                const selected = formData.get('cnpj');
                if (selected) data.cnpj = selected;
            }
            let url = data.tipo === 'voluntario' ? '/voluntarios' : '/ongs';
            try {
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                let result = null;
                try {
                    result = await resp.json();
                } catch (err) {
                    result = { message: await resp.text() };
                }
                if (resp.ok) {
                    
                    if (result.usuario && result.usuario.nome) {
                        localStorage.setItem('nome', result.usuario.nome);
                        if (result.usuario.tipo) localStorage.setItem('tipo', result.usuario.tipo);
                        if (result.usuario.email) localStorage.setItem('email', result.usuario.email);
                        if (result.token) localStorage.setItem('token', result.token);
                        if (result.usuario.tipo === 'ong') {
                            localStorage.setItem('id_ong', result.usuario.id || '');
                        } else {
                            localStorage.setItem('id_voluntario', result.usuario.id || '');
                        }
                        setUserLoggedIn(result.usuario.nome);
                        if (typeof fecharLoginModal === 'function') fecharLoginModal();
                       
                        if (result.usuario.tipo === 'ong') window.location.href = 'ong-dashboard.html';
                    } else {
                        
                        alert(result.message || 'Cadastro realizado! Faça login.');
                        if (typeof fecharLoginModal === 'function') fecharLoginModal();
                    }
                } else if (resp.status === 409 || resp.status === 400) {
                    alert(result.message || 'Erro ao cadastrar.');
                } else {
                    alert(result.message || 'Erro ao cadastrar.');
                }
            } catch (err) {
                alert('Erro de conexão.');
            }
        });
    }

    
    window.abrirModalEditarPerfil = function() {
        const nome = localStorage.getItem('nome');
        const tipo = localStorage.getItem('tipo');
        const id = localStorage.getItem('id_voluntario') || localStorage.getItem('id_ong');

        if (!id) {
            alert('Erro: ID do usuário não encontrado. Por favor, faça login novamente.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-perfil';
        
        const content = document.createElement('div');
        content.className = 'modal-perfil-content';
        
        content.innerHTML = `
            <h2>Editar Perfil</h2>
            <div class="form-group">
                <label>Nome</label>
                <input type="text" id="perfil-nome" value="${nome}" placeholder="Seu nome">
            </div>
            <div class="form-group">
                <label>Email (confirmação)</label>
                <input type="email" id="perfil-email" value="${localStorage.getItem('email') || ''}" placeholder="seu@email.com">
            </div>
            <div class="form-group">
                <label>Senha Atual</label>
                <input type="password" id="perfil-senha-atual" placeholder="Digite sua senha atual">
            </div>
            <div class="form-group">
                <label>Nova Senha (deixe em branco para não alterar)</label>
                <input type="password" id="perfil-senha-nova" placeholder="Digite uma nova senha">
            </div>
            <div class="form-group">
                <label>Confirmar Nova Senha</label>
                <input type="password" id="perfil-senha-confirma" placeholder="Confirme a nova senha">
            </div>
            <div class="modal-perfil-actions">
                <button class="btn-salvar">Salvar</button>
                <button class="btn-cancelar">Cancelar</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);

        const btnSalvar = content.querySelector('.btn-salvar');
        const btnCancelar = content.querySelector('.btn-cancelar');
        const inputNome = content.querySelector('#perfil-nome');
        const inputSenhaAtual = content.querySelector('#perfil-senha-atual');
        const inputSenhaNova = content.querySelector('#perfil-senha-nova');
        const inputSenhaConfirma = content.querySelector('#perfil-senha-confirma');

        btnCancelar.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        btnSalvar.addEventListener('click', async () => {
            const novoNome = inputNome.value.trim();
            const senhaAtual = inputSenhaAtual.value.trim();
            const senhaNova = inputSenhaNova.value.trim();
            const senhaConfirma = inputSenhaConfirma.value.trim();

            if (!novoNome) {
                alert('Por favor, digite um nome.');
                return;
            }

            if (senhaNova && senhaNova !== senhaConfirma) {
                alert('As senhas não correspondem.');
                return;
            }

            if (senhaNova && senhaNova.length < 6) {
                alert('A nova senha deve ter pelo menos 6 caracteres.');
                return;
            }

            try {
                const endpoint = tipo === 'ong' ? '/ongs' : '/voluntarios';
                const emailInformado = content.querySelector('#perfil-email').value.trim();
                const body = {
                    nome: novoNome,
                    email: emailInformado
                };

                if (senhaNova) {
                    body.senhaAtual = senhaAtual;
                    body.senhaNova = senhaNova;
                }

                const resp = await fetch(`${endpoint}/${id}`, {
                    method: 'PUT',
                    headers: (function(){ const h = { 'Content-Type': 'application/json' }; const t = localStorage.getItem('token'); if (t) h['Authorization'] = 'Bearer ' + t; return h; })(),
                    body: JSON.stringify(body)
                });

                console.log('Attempting profile update', { endpoint: `${endpoint}/${id}`, body });

                if (resp.ok) {
                    localStorage.setItem('nome', novoNome);
                    alert('Perfil atualizado com sucesso!');
                    modal.remove();
                    location.reload();
                } else {
                    const result = await resp.json();
                    alert(result.message || 'Erro ao atualizar perfil.');
                }
            } catch (err) {
                alert('Erro de conexão ao atualizar perfil.');
                console.error(err);
            }
        });
    };

    
    window.abrirModalEsqueceuSenha = function(e) {
        if (e) e.preventDefault();

        const modal = document.createElement('div');
        modal.className = 'modal-perfil';
        
        const content = document.createElement('div');
        content.className = 'modal-perfil-content';
        
        content.innerHTML = `
            <h2>Recuperar Senha</h2>
            <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 20px;">
                Digite seu email para receber um link de recuperação de senha
            </p>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="recupera-email" placeholder="seu@email.com">
            </div>
            <div class="modal-perfil-actions">
                <button class="btn-salvar">Enviar Email</button>
                <button class="btn-cancelar">Cancelar</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);

        const btnEnviar = content.querySelector('.btn-salvar');
        const btnCancelar = content.querySelector('.btn-cancelar');
        const inputEmail = content.querySelector('#recupera-email');

        btnCancelar.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        btnEnviar.addEventListener('click', async () => {
            const email = inputEmail.value.trim();

            if (!email) {
                alert('Por favor, digite um email.');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Por favor, digite um email válido.');
                return;
            }

            try {
                // Nota: Esta funcionalidade requer implementação no backend(Arrumar depois)
                alert('Um email de recuperação foi enviado para: ' + email + '\n\n(Nota: Esta funcionalidade requer confirmação no backend)');
                modal.remove();
            } catch (err) {
                alert('Erro ao enviar email de recuperação.');
                console.error(err);
            }
        });
    };
});


