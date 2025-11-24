// ONG Dashboard
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById('login-btn');
    const vagaModal = document.getElementById('vaga-modal');
    const vagaModalClose = vagaModal ? vagaModal.querySelector('.close-btn') : null;
    const vagaForm = document.getElementById('vaga-form');
    const btnNewVaga = document.getElementById('btn-new-vaga');
    const vagasContainer = document.getElementById('vagas-container');
    const emptyState = document.getElementById('empty-state');
    const vagasCountElem = document.getElementById('vagas-count');
    const inscritosCountElem = document.getElementById('inscritos-count');
    const ongNameElem = document.getElementById('ong-name');

    function verificarLogin() {
        const nome = localStorage.getItem('nome');
        const tipo = localStorage.getItem('tipo');
        if (!nome || tipo !== 'ong') {
            setTimeout(() => {
                const nomeVerif = localStorage.getItem('nome');
                const tipoVerif = localStorage.getItem('tipo');
                if (!nomeVerif || tipoVerif !== 'ong') window.location.href = 'home.html';
            }, 100);
            return false;
        }
        if (ongNameElem) ongNameElem.textContent = nome;
        return true;
    }

    async function carregarVagas() {
        try {
            const resp = await fetch('/vagas');
            if (!resp.ok) return;
            const vagas = await resp.json();
            const meuIdOng = localStorage.getItem('id_ong');
            if (!vagasContainer) return;
            vagasContainer.innerHTML = '';
            if (vagas.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                if (vagasCountElem) vagasCountElem.textContent = '0';
                if (inscritosCountElem) inscritosCountElem.textContent = '0';
                return;
            }
            if (emptyState) emptyState.style.display = 'none';
            if (vagasCountElem) vagasCountElem.textContent = String(vagas.length);
            let totalInscritos = 0;
            vagas.forEach(vaga => {
                totalInscritos += vaga.inscritos_count || 0;
                const ehMinhaVaga = String(vaga.id_ong) === String(meuIdOng);
                const vagaCard = document.createElement('div');
                vagaCard.className = 'vaga-card';
                const actionsHTML = ehMinhaVaga ? `
                    <div class="vaga-actions">
                        <button class="btn btn-secondary" onclick="abrirEdicaoVaga(${vaga.id_vaga})"> Editar</button>
                        <button class="btn btn-danger" onclick="deletarVaga(${vaga.id_vaga})"> Deletar</button>
                    </div>
                ` : '';
                vagaCard.innerHTML = `
                    <div class="vaga-card-image">
                        <img src="${vaga.foto || 'imagens/placeholder.png'}" alt="${vaga.titulo}">
                    </div>
                    <div class="vaga-card-content">
                        <h3 class="vaga-titulo">${vaga.titulo}</h3>
                        <p class="vaga-ong" style="font-size: 0.9em; color: #666; margin: 5px 0;">📋 ${vaga.nome_ong || 'ONG'}</p>
                        <p class="vaga-descricao">${vaga.descricao ? vaga.descricao.substring(0, 100) + '...' : 'Sem descrição'}</p>
                        <div class="vaga-meta">
                            <span class="vaga-inscritos" onclick="listarInscritos(${vaga.id_vaga})" style="cursor: pointer;"> ${vaga.inscritos_count || 0}/${vaga.limite_voluntarios}</span>
                        </div>
                        ${actionsHTML}
                    </div>
                `;
                vagasContainer.appendChild(vagaCard);
            });
            if (inscritosCountElem) inscritosCountElem.textContent = String(totalInscritos);
        } catch (err) {
            console.error('Erro ao carregar vagas:', err);
        }
    }

    async function carregarInscritos() {
        let ongId = localStorage.getItem('id_ong');
        const email = localStorage.getItem('email');
        if (!ongId) {
            if (!email) { alert('ONG não identificada. Por favor, faça login novamente.'); window.location.href = 'home.html'; return; }
            try {
                const resp = await fetch('/ongs');
                if (!resp.ok) { alert('Erro ao buscar informações da ONG.'); return; }
                const ongs = await resp.json();
                const ong = ongs.find(o => o.email === email);
                if (!ong) { alert('ONG não encontrada. Por favor, faça login novamente.'); window.location.href = 'home.html'; return; }
                ongId = ong.id_ong;
                localStorage.setItem('id_ong', ongId);
            } catch (err) { alert('Erro ao identificar a ONG.'); console.error(err); return; }
        }
        try {
            const resp = await fetch(`/inscricoes/ong/${ongId}`);
            if (!resp.ok) { const errorData = await resp.json(); alert('Erro ao carregar inscritos: ' + (errorData.message || 'Erro desconhecido')); return; }
            const inscritos = await resp.json();
            const section = document.getElementById('inscritos-section');
            const tbody = document.getElementById('inscritos-tbody');
            const emptyMsg = document.getElementById('inscritos-empty');
            if (!tbody || !section) return;
            tbody.innerHTML = '';
            if (inscritos.length === 0) { section.style.display = 'block'; tbody.style.display = 'none'; emptyMsg.style.display = 'block'; }
            else { section.style.display = 'block'; emptyMsg.style.display = 'none'; tbody.style.display = 'table-row-group'; inscritos.forEach(inscrito => { const data = new Date(inscrito.data_inscricao).toLocaleDateString('pt-BR'); const row = document.createElement('tr'); row.style.borderBottom = '1px solid #eee'; row.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${inscrito.nome}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><a href="mailto:${inscrito.email}" style="color: #667eea; text-decoration: none;">${inscrito.email}</a></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${inscrito.telefone || '—'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${inscrito.vaga_titulo || 'Sem vaga'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${data}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${inscrito.status || 'pendente'}</span></td>
                `; tbody.appendChild(row); }); }
            section.scrollIntoView({ behavior: 'smooth' });
        } catch (err) { alert('Erro ao carregar inscritos.'); console.error(err); }
    }

    const btnVerInscritos = document.getElementById('btn-ver-inscritos');
    const btnFecharInscritos = document.getElementById('btn-fechar-inscritos');
    if (btnVerInscritos) btnVerInscritos.addEventListener('click', carregarInscritos);
    if (btnFecharInscritos) btnFecharInscritos.addEventListener('click', () => { const section = document.getElementById('inscritos-section'); if (section) section.style.display = 'none'; });

    if (btnNewVaga) { btnNewVaga.addEventListener('click', () => { if (vagaForm) vagaForm.reset(); if (vagaModal) vagaModal.style.display = 'block'; }); }
    if (vagaModalClose) vagaModalClose.addEventListener('click', () => { if (vagaModal) vagaModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === vagaModal) vagaModal.style.display = 'none'; });

    if (vagaForm) {
        vagaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(vagaForm);
            const data = Object.fromEntries(formData.entries());
            const token = localStorage.getItem('token');
            if (!token) { alert('Você precisa estar logado para criar uma vaga. Faça login novamente.'); window.location.href = 'home.html'; return; }
            try { 
                const resp = await fetch('/vagas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(data) }); 
                if (resp.ok) { alert('Vaga criada com sucesso!'); if (vagaModal) vagaModal.style.display = 'none'; carregarVagas(); } 
                else { const result = await resp.json(); alert(result.message || 'Erro ao criar vaga.'); } 
            } catch (err) { alert('Erro de conexão.'); console.error(err); }
        });
    }

    window.deletarVaga = async (vagaId) => {
        if (!confirm('Tem certeza que deseja deletar esta vaga?')) return;
        const token = localStorage.getItem('token');
        if (!token) { alert('Você precisa estar logado para deletar uma vaga. Faça login novamente.'); window.location.href = 'home.html'; return; }
        try { 
            const resp = await fetch(`/vagas/${vagaId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }); 
            if (resp.ok) { alert('Vaga deletada com sucesso!'); carregarVagas(); } 
            else { const result = await resp.json(); alert(result.message || 'Erro ao deletar vaga.'); } 
        } catch (err) { alert('Erro de conexão.'); console.error(err); }
    };

    window.listarInscritos = async (vagaId) => {
        try { 
            const resp = await fetch(`/inscricoes/vaga/${vagaId}`); 
            if (!resp.ok) { alert('Erro ao buscar inscritos.'); return; } 
            const inscritos = await resp.json(); 
            const modal = document.createElement('div'); modal.className = 'modal'; modal.id = 'inscritos-modal'; modal.style.display = 'block'; 
            let inscritosHTML = '<h3 style="margin-top: 0; color: #333;">Voluntários Inscritos</h3>'; 
            if (inscritos.length === 0) inscritosHTML += '<p style="color: #999;">Nenhum voluntário inscrito nesta vaga.</p>'; 
            else { 
                inscritosHTML += '<table style="width: 100%; border-collapse: collapse;">'; 
                inscritosHTML += '<thead style="background: #f0f0f5;"><tr><th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: 600;">Nome</th><th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: 600;">Email</th><th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: 600;">Telefone</th><th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: 600;">Data</th></tr></thead>'; 
                inscritosHTML += '<tbody>'; 
                inscritos.forEach(i => { const data = new Date(i.data_inscricao).toLocaleDateString('pt-BR'); inscritosHTML += `<tr>
                        <td style="border: 1px solid #ddd; padding: 10px;">${i.nome}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;"><a href="mailto:${i.email}" style="color: #667eea; text-decoration: none;">${i.email}</a></td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${i.telefone || '—'}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${data}</td>
                    </tr>`; }); 
                inscritosHTML += '</tbody></table>'; 
            } 
            modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 70vh; overflow-y: auto;">
                <span class="close-btn" onclick="document.getElementById('inscritos-modal').remove()">&times;</span>
                ${inscritosHTML}
            </div>
        `; 
            document.body.appendChild(modal); 
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); }); 
        } catch (err) { alert('Erro ao buscar inscritos.'); console.error(err); }
    };

    window.abrirEdicaoVaga = async (vagaId) => {
        try { 
            const resp = await fetch('/vagas'); 
            const vagas = await resp.json(); 
            const vaga = vagas.find(v => v.id_vaga === parseInt(vagaId)); 
            if (!vaga) { alert('Vaga não encontrada.'); return; } 
            const modal = document.createElement('div'); modal.className = 'modal'; modal.id = 'edicao-vaga-modal'; modal.style.display = 'block'; 
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close-btn" onclick="document.getElementById('edicao-vaga-modal').remove()">&times;</span>
                    <h2 class="modal-title">Editar Vaga</h2>

                    <form id="form-edicao-vaga" class="vaga-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="form-group">
                            <label for="edit-titulo">Título da Vaga</label>
                            <input type="text" id="edit-titulo" name="titulo" value="${vaga.titulo}" required style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                        </div>
                        <div class="form-group">
                            <label for="edit-descricao">Descrição</label>
                            <textarea id="edit-descricao" name="descricao" rows="4" required style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">${vaga.descricao || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-foto">Foto/Imagem (URL)</label>
                            <input type="url" id="edit-foto" name="foto" value="${vaga.foto || ''}" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                        </div>
                        <div class="form-group">
                            <label for="edit-limite">Limite de Voluntários</label>
                            <input type="number" id="edit-limite" name="limite_voluntarios" min="1" value="${vaga.limite_voluntarios}" required style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, #ff47a3 0%, #ff7b00 100%); color: white; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Salvar Alterações</button>
                    </form>
                </div>
            `; 
            document.body.appendChild(modal); 
            const formEdicao = document.getElementById('form-edicao-vaga'); 
            formEdicao.addEventListener('submit', async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(formEdicao); 
                const data = Object.fromEntries(formData.entries()); 
                const token = localStorage.getItem('token'); 
                if (!token) { alert('Você precisa estar logado para editar uma vaga. Faça login novamente.'); window.location.href = 'home.html'; return; } 
                try { 
                    const respEdit = await fetch(`/vagas/${vagaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(data) }); 
                    if (respEdit.ok) { alert('Vaga atualizada com sucesso!'); document.getElementById('edicao-vaga-modal').remove(); carregarVagas(); } 
                    else { const result = await respEdit.json(); alert(result.message || 'Erro ao atualizar vaga.'); } 
                } catch (err) { alert('Erro de conexão.'); console.error(err); } 
            }); 
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); }); 
        } catch (err) { alert('Erro ao carregar dados da vaga.'); console.error(err); }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const existing = document.getElementById('user-popup');
            if (existing) { existing.remove(); window.removeEventListener('resize', updatePopupPosition); document.removeEventListener('click', outsideClickHandler); return; }
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
            function updatePopupPosition() { const rect = loginBtn.getBoundingClientRect(); popup.style.left = `${rect.right - 180}px`; }
            updatePopupPosition();
            function outsideClickHandler(ev) { if (!popup.contains(ev.target) && ev.target !== loginBtn) { popup.remove(); window.removeEventListener('resize', updatePopupPosition); document.removeEventListener('click', outsideClickHandler); } }
            document.addEventListener('click', outsideClickHandler);
            perfilBtn.addEventListener('click', (e) => { e.preventDefault(); popup.remove(); window.removeEventListener('resize', updatePopupPosition); document.removeEventListener('click', outsideClickHandler); abrirModalEditarPerfil(); });
            sairBtn.addEventListener('click', () => { localStorage.removeItem('nome'); localStorage.removeItem('tipo'); localStorage.removeItem('email'); localStorage.removeItem('id_ong'); localStorage.removeItem('id_voluntario'); localStorage.removeItem('token'); popup.remove(); window.removeEventListener('resize', updatePopupPosition); document.removeEventListener('click', outsideClickHandler); window.location.href = 'home.html'; });
        });
    }

    if (verificarLogin()) carregarVagas();

    window.abrirModalEditarPerfil = function() {
        const nome = localStorage.getItem('nome');
        const tipo = localStorage.getItem('tipo');
        const id = tipo === 'ong' ? localStorage.getItem('id_ong') : localStorage.getItem('id_voluntario');
        const modal = document.createElement('div');
        modal.className = 'modal-perfil';
        const content = document.createElement('div');
        content.className = 'modal-perfil-content';
        content.innerHTML = `
            <h2>Editar Perfil</h2>
            <div class="form-group"><label>Nome</label><input type="text" id="perfil-nome" value="${nome}" placeholder="Seu nome"></div>
            <div class="form-group"><label>Senha Atual</label><input type="password" id="perfil-senha-atual" placeholder="Digite sua senha atual"></div>
            <div class="form-group"><label>Nova Senha (deixe em branco para não alterar)</label><input type="password" id="perfil-senha-nova" placeholder="Digite uma nova senha"></div>
            <div class="form-group"><label>Confirmar Nova Senha</label><input type="password" id="perfil-senha-confirma" placeholder="Confirme a nova senha"></div>
            <div class="modal-perfil-actions"><button class="btn-salvar">Salvar</button><button class="btn-cancelar">Cancelar</button></div>
        `;
        modal.appendChild(content);
        document.body.appendChild(modal);
        const btnSalvar = content.querySelector('.btn-salvar');
        const btnCancelar = content.querySelector('.btn-cancelar');
        const inputNome = content.querySelector('#perfil-nome');
        const inputSenhaAtual = content.querySelector('#perfil-senha-atual');
        const inputSenhaNova = content.querySelector('#perfil-senha-nova');
        const inputSenhaConfirma = content.querySelector('#perfil-senha-confirma');
        btnCancelar.addEventListener('click', () => { modal.remove(); });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        btnSalvar.addEventListener('click', async () => {
            const novoNome = inputNome.value.trim();
            const senhaAtual = inputSenhaAtual.value.trim();
            const senhaNova = inputSenhaNova.value.trim();
            const senhaConfirma = inputSenhaConfirma.value.trim();
            if (!novoNome) { alert('Por favor, digite um nome.'); return; }
            if (senhaNova && senhaNova !== senhaConfirma) { alert('As senhas não correspondem.'); return; }
            if (senhaNova && senhaNova.length < 6) { alert('A nova senha deve ter pelo menos 6 caracteres.'); return; }
            try {
                const endpoint = tipo === 'ong' ? '/ongs' : '/voluntarios';
                const body = { nome: novoNome };
                if (senhaNova) { body.senhaAtual = senhaAtual; body.senhaNova = senhaNova; }
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = 'Bearer ' + token;
                const resp = await fetch(`${endpoint}/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
                if (resp.ok) { localStorage.setItem('nome', novoNome); alert('Perfil atualizado com sucesso!'); modal.remove(); location.reload(); }
                else { const result = await resp.json(); alert(result.message || 'Erro ao atualizar perfil.'); }
            } catch (err) { alert('Erro de conexão ao atualizar perfil.'); console.error(err); }
        });
    };
});
