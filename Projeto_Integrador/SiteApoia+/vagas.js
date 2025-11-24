document.addEventListener('DOMContentLoaded', () => {
    const vagasList = document.getElementById('vagas-list');
    const id_voluntario = localStorage.getItem('id_voluntario');
    let minhasInscricoes = new Set();

    // Função para validar telefone
    function validarTelefone(telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
    }

    // Carregar inscrições do voluntário
    async function carregarMinhasInscricoes() {
        if (!id_voluntario) return;
        try {
            const resp = await fetch('/inscricoes');
            const inscricoes = await resp.json();
            minhasInscricoes = new Set(
                inscricoes
                    .filter(i => i.id_voluntario === parseInt(id_voluntario))
                    .map(i => i.id_vaga)
            );
        } catch (err) {
            console.error('Erro ao carregar inscrições:', err);
        }
    }

    async function carregarVagas() {
        try {
            const resp = await fetch('/vagas');
            if (!resp.ok) {
                vagasList.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #999;"><p>Não foi possível carregar as vagas.</p></div>';
                return;
            }
            const vagas = await resp.json();
            if (!Array.isArray(vagas) || vagas.length === 0) {
                vagasList.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #999;"><p>Nenhuma vaga disponível no momento. Volte em breve!</p></div>';
                return;
            }
            vagasList.innerHTML = '';
            vagas.forEach(v => {
                const card = document.createElement('div');
                card.className = 'vaga-card';

                const imgWrap = document.createElement('div');
                imgWrap.className = 'vaga-card-image';
                const img = document.createElement('img');
                img.src = v.foto && v.foto.length ? v.foto : 'imagens/placeholder.png';
                img.alt = v.titulo || 'Vaga';
                imgWrap.appendChild(img);

                const content = document.createElement('div');
                content.className = 'vaga-card-content';

                const org = document.createElement('p');
                org.className = 'vaga-org';
                org.textContent = v.nome_fantasia ? `${v.nome_fantasia}` : 'ONG';
                org.style.fontSize = '12px';
                org.style.color = '#667eea';
                org.style.marginBottom = '8px';
                org.style.fontWeight = '600';
                org.style.textTransform = 'uppercase';
                org.style.letterSpacing = '0.5px';

                const title = document.createElement('h3');
                title.className = 'vaga-titulo';
                title.textContent = v.titulo || 'Sem título';

                const desc = document.createElement('p');
                desc.className = 'vaga-descricao';
                desc.textContent = v.descricao ? (v.descricao.length > 150 ? v.descricao.slice(0, 147) + '...' : v.descricao) : 'Descrição não disponível';

                const meta = document.createElement('div');
                meta.className = 'vaga-meta';
                meta.innerHTML = `<span class="vaga-inscritos"> ${v.inscritos_count || 0}/${v.limite_voluntarios || '—'}</span>`;

                const actions = document.createElement('div');
                actions.className = 'vaga-actions';
                
                const btnDetalhes = document.createElement('button');
                btnDetalhes.className = 'btn btn-primary';
                btnDetalhes.textContent = ' Ver Detalhes';
                btnDetalhes.style.flex = '1';
                btnDetalhes.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                btnDetalhes.onclick = () => abrirDetalhesVaga(v);

                const btnInscrever = document.createElement('button');
                btnInscrever.className = 'btn btn-primary';
                
                // Verificar se já está inscrito
                const jaInscrito = minhasInscricoes.has(v.id_vaga);
                btnInscrever.textContent = jaInscrito ? ' Cancelar' : ' Inscrever';
                btnInscrever.style.flex = '1';
                btnInscrever.style.background = jaInscrito ? '#ff6b6b' : 'linear-gradient(135deg, #ff47a3 0%, #ff7b00 100%)';
                
                btnInscrever.onclick = () => {
                    if (jaInscrito) {
                        cancelarInscricao(v.id_vaga);
                    } else {
                        inscreverEmVaga(v.id_vaga);
                    }
                };

                actions.appendChild(btnDetalhes);
                actions.appendChild(btnInscrever);

                content.appendChild(org);
                content.appendChild(title);
                content.appendChild(desc);
                content.appendChild(meta);
                content.appendChild(actions);

                card.appendChild(imgWrap);
                card.appendChild(content);

                vagasList.appendChild(card);
            });
        } catch (err) {
            vagasList.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #999;"><p>Erro ao carregar vagas.</p></div>';
            console.error(err);
        }
    }

    // Função para inscrever em uma vaga com telefone
    async function inscreverEmVaga(id_vaga, callback) {
        const tipo = localStorage.getItem('tipo');
        const nome = localStorage.getItem('nome');

        if (!tipo || !nome) {
            alert('Você precisa estar logado para se inscrever em uma vaga!');
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'block';
            }
            return;
        }

        if (tipo !== 'voluntario') {
            alert('Apenas voluntários podem se inscrever em vagas!');
            return;
        }

        // Criar modal para pedir telefone
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2 class="modal-title">Completar Inscrição</h2>
                <form id="form-inscricao" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="form-group">
                        <label for="inscricao-telefone">Telefone *</label>
                        <input type="tel" id="inscricao-telefone" name="telefone" placeholder="(11) 99999-9999" required style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit;">
                        <small style="color: #999; margin-top: 5px;">Use um telefone válido com DDD (10 ou 11 dígitos)</small>
                    </div>
                    <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, #ff47a3 0%, #ff7b00 100%); color: white; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Confirmar Inscrição</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = document.getElementById('form-inscricao');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const telefone = document.getElementById('inscricao-telefone').value.trim();

            if (!validarTelefone(telefone)) {
                alert('Telefone inválido! Use um telefone válido com DDD (10 ou 11 dígitos).');
                return;
            }

            try {
                const resp = await fetch('/inscricoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id_voluntario: parseInt(id_voluntario), 
                        id_vaga: id_vaga,
                        telefone: telefone
                    })
                });

                const result = await resp.json();

                if (resp.ok) {
                    alert('Inscrição realizada com sucesso! A ONG entrará em contato.');
                    modal.remove();
                    await carregarMinhasInscricoes();
                    carregarVagas();
                    if (callback) callback();
                } else {
                    alert(result.message || 'Erro ao se inscrever na vaga.');
                }
            } catch (err) {
                alert('Erro de conexão ao inscrever-se na vaga.');
                console.error(err);
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Função para cancelar inscrição
    async function cancelarInscricao(id_vaga, callback) {
        if (!confirm('Tem certeza que deseja cancelar sua inscrição nesta vaga?')) {
            return;
        }

        try {
            const resp = await fetch(`/inscricoes/${id_voluntario}/${id_vaga}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await resp.json();

            if (resp.ok) {
                alert('Inscrição cancelada com sucesso!');
                await carregarMinhasInscricoes();
                carregarVagas();
                if (callback) callback();
            } else {
                alert(result.message || 'Erro ao cancelar inscrição.');
            }
        } catch (err) {
            alert('Erro de conexão ao cancelar inscrição.');
            console.error(err);
        }
    }

    // Inicializar
    carregarMinhasInscricoes().then(() => carregarVagas());

    // Atualizar ticket form se existir
    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const assunto = document.getElementById('ticket-assunto').value.trim();
            const descricao = document.getElementById('ticket-descricao').value.trim();
            const email = document.getElementById('ticket-email').value.trim();

            if (!assunto || !descricao || !email) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            try {
                const resp = await fetch('/suporte', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        Assunto: assunto,
                        Mensagem: descricao,
                        EmailUsuario: email
                    })
                });

                if (resp.ok) {
                    alert('Ticket enviado com sucesso! Você receberá uma resposta em breve.');
                    ticketForm.reset();
                } else {
                    const result = await resp.json();
                    alert(result.message || 'Erro ao enviar ticket.');
                }
            } catch (err) {
                alert('Erro ao enviar ticket. Verifique sua conexão.');
                console.error(err);
            }
        });
    }

    // Função para abrir detalhes da vaga
    window.abrirDetalhesVaga = function(vaga) {
        const modal = document.createElement('div');
        modal.className = 'vaga-modal';

        const jaInscrito = minhasInscricoes.has(vaga.id_vaga);

        const content = document.createElement('div');
        content.className = 'vaga-modal-content';

        // Header com imagem
        const header = document.createElement('div');
        header.className = 'vaga-modal-header';
        const img = document.createElement('img');
        img.src = vaga.foto && vaga.foto.length ? vaga.foto : 'imagens/placeholder.png';
        img.alt = vaga.titulo;
        header.appendChild(img);

        // Botão fechar
        const btnFechar = document.createElement('button');
        btnFechar.className = 'vaga-modal-close';
        btnFechar.innerHTML = '✕';
        btnFechar.onclick = () => modal.remove();
        header.appendChild(btnFechar);

        // Body
        const body = document.createElement('div');
        body.className = 'vaga-modal-body';

        // Título
        const titulo = document.createElement('h2');
        titulo.textContent = vaga.titulo || 'Sem título';
        body.appendChild(titulo);

        // Informações
        const infoDiv = document.createElement('div');
        infoDiv.className = 'vaga-modal-info';
        infoDiv.innerHTML = `
            <div class="vaga-info-item">
                <span class="vaga-info-label">Organização</span>
                <span class="vaga-info-value">${vaga.nome_fantasia || 'ONG'}</span>
            </div>
            <div class="vaga-info-item">
                <span class="vaga-info-label">Inscritos</span>
                <span class="vaga-info-value">${vaga.inscritos_count || 0}/${vaga.limite_voluntarios || '—'}</span>
            </div>
            <div class="vaga-info-item">
                <span class="vaga-info-label">Status</span>
                <span class="vaga-info-value">${vaga.status || 'Aberta'}</span>
            </div>
            <div class="vaga-info-item">
                <span class="vaga-info-label">Sua Inscrição</span>
                <span class="vaga-info-value">${jaInscrito ? ' Inscrito' : ' Não inscrito'}</span>
            </div>
        `;
        body.appendChild(infoDiv);

        // Descrição
        const descDiv = document.createElement('div');
        descDiv.className = 'vaga-modal-descricao';
        descDiv.innerHTML = `
            <h3>Descrição da Vaga</h3>
            <p>${vaga.descricao || 'Descrição não disponível'}</p>
        `;
        body.appendChild(descDiv);

        // Requisitos
        if (vaga.requisitos) {
            const reqDiv = document.createElement('div');
            reqDiv.className = 'vaga-modal-descricao';
            reqDiv.innerHTML = `
                <h3>Requisitos</h3>
                <p>${vaga.requisitos}</p>
            `;
            body.appendChild(reqDiv);
        }

        // Footer com botões
        const footer = document.createElement('div');
        footer.className = 'vaga-modal-footer';

        const btnInscrever = document.createElement('button');
        btnInscrever.className = 'btn-inscrever';
        btnInscrever.textContent = jaInscrito ? ' Cancelar Inscrição' : ' Me Inscrever';
        btnInscrever.onclick = () => {
            if (jaInscrito) {
                cancelarInscricao(vaga.id_vaga, () => {
                    modal.remove();
                    carregarMinhasInscricoes();
                    carregarVagas();
                });
            } else {
                inscreverEmVaga(vaga.id_vaga, () => {
                    modal.remove();
                    carregarMinhasInscricoes();
                    carregarVagas();
                });
            }
        };

        const btnFecharModal = document.createElement('button');
        btnFecharModal.className = 'btn-fechar';
        btnFecharModal.textContent = 'Fechar';
        btnFecharModal.onclick = () => modal.remove();

        footer.appendChild(btnInscrever);
        footer.appendChild(btnFecharModal);
        body.appendChild(footer);

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);

        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };
});

