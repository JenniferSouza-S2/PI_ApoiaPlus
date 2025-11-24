// Script para a página de doação
document.addEventListener("DOMContentLoaded", () => {
    let valorSelecionado = 10; 
    let frequenciaSelecionada = 'unica'; 
    let metodoPagamento = 'pix'; 

    // Botões de Valor 
    const botoesValor = document.querySelectorAll('.btn-valor-doacao');
    const inputValorPersonalizado = document.getElementById('valor-personalizado');
    const valorDisplay = document.getElementById('valor-display');

    botoesValor.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesValor.forEach(b => {
                b.style.borderColor = '#ddd';
                b.style.background = 'white';
            });
            btn.style.borderColor = '#ff47a3';
            btn.style.background = '#fff5fa';
            valorSelecionado = parseFloat(btn.dataset.valor);
            inputValorPersonalizado.value = '';
            atualizarValorDisplay();
         
            if (typeof gerarQRCode === 'function') gerarQRCode();
        });
    });

    inputValorPersonalizado.addEventListener('input', () => {
        if (inputValorPersonalizado.value) {
            const valor = parseFloat(inputValorPersonalizado.value);
            if (!isNaN(valor) && valor >= 5) {
                valorSelecionado = valor;
                botoesValor.forEach(b => {
                    b.style.borderColor = '#ddd';
                    b.style.background = 'white';
                });
                atualizarValorDisplay();
                if (typeof gerarQRCode === 'function') gerarQRCode();
            }
        }
    });

    function atualizarValorDisplay() {
        valorDisplay.textContent = `R$ ${valorSelecionado.toFixed(2)}`;
    }

    // Botões de Frequência 
    const botoesFrequencia = document.querySelectorAll('.btn-frequencia');
    botoesFrequencia.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesFrequencia.forEach(b => {
                b.style.borderColor = '#ddd';
                b.style.background = 'white';
                b.style.color = '#333';
            });
            btn.style.borderColor = '#ff47a3';
            btn.style.background = '#fff5fa';
            frequenciaSelecionada = btn.dataset.frequencia;
           
            if (typeof gerarQRCode === 'function') gerarQRCode();
        });
    });

    // Botões de Método de Pagamento 
    const botoesPagamento = document.querySelectorAll('.btn-pagamento');
    const formPix = document.getElementById('form-pix');
    const formCartao = document.getElementById('form-cartao');

    botoesPagamento.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesPagamento.forEach(b => {
                b.style.borderColor = '#ddd';
                b.style.background = 'white';
            });
            btn.style.borderColor = '#ff47a3';
            btn.style.background = '#fff5fa';
            metodoPagamento = btn.dataset.pagamento;

            if (metodoPagamento === 'pix') {
                formPix.style.display = 'block';
                formCartao.style.display = 'none';
                gerarQRCode();
            } else {
                formPix.style.display = 'none';
                formCartao.style.display = 'block';
              
                const qrContainer = document.getElementById("qrcode");
                if (qrContainer) qrContainer.innerHTML = '';
            }
        });
    });

    // Navegar entre passos 
    window.proximaPasso = function(passo) {
      
        if (passo === 'frequencia') {
            if (valorSelecionado < 5) {
                alert('Por favor, escolha um valor acima de R$ 5');
                return;
            }
        }

        if (passo === 'dados') {
            // Valida frequência 
        }

        if (passo === 'pagamento') {
            const nome = document.getElementById('nome-doador').value.trim();
            const email = document.getElementById('email-doador').value.trim();
            const ongSelecionada = document.getElementById('select-ong') ? document.getElementById('select-ong').value : '';

            if (!nome) {
                alert('Por favor, digite seu nome completo');
                return;
            }
            if (!email) {
                alert('Por favor, digite seu email');
                return;
            }
            if (!ongSelecionada) {
                alert('Por favor, selecione uma ONG para receber sua doação.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Por favor, digite um email válido');
                return;
            }
        }

       
        document.querySelectorAll('.tab-content-doacao').forEach(el => {
            el.style.display = 'none';
        });

        
        document.getElementById(passo).style.display = 'block';

       
        document.querySelectorAll('.tab-doacao').forEach(tab => {
            tab.style.color = '#999';
            tab.style.borderBottomColor = 'transparent';
        });
        document.querySelector(`[data-tab="${passo}"]`).style.color = '#333';
        document.querySelector(`[data-tab="${passo}"]`).style.borderBottomColor = '#ff47a3';

        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        
        if (passo === 'pagamento') {
            setTimeout(() => {
                gerarQRCode();
            }, 100);
        }
    };

    window.passoAnterior = function(passo) {
        document.querySelectorAll('.tab-content-doacao').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById(passo).style.display = 'block';

        document.querySelectorAll('.tab-doacao').forEach(tab => {
            tab.style.color = '#999';
            tab.style.borderBottomColor = 'transparent';
        });
        document.querySelector(`[data-tab="${passo}"]`).style.color = '#333';
        document.querySelector(`[data-tab="${passo}"]`).style.borderBottomColor = '#ff47a3';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Gerar QR Code 
    let qrCodeInstance;
    function gerarQRCode() {
        const qrContainer = document.getElementById("qrcode");
        if (!qrContainer) return;
        qrContainer.innerHTML = ""; 

        
        const basePath = window.location.href.replace(/[^/]*$/, '');
        const ongSel = document.getElementById('select-ong') ? document.getElementById('select-ong').value : '';
        const testeUrl = basePath + 'doacao-teste.html'
            + `?valor=${encodeURIComponent(valorSelecionado.toFixed(2))}`
            + `&frequencia=${encodeURIComponent(frequenciaSelecionada)}`
            + `&metodo=${encodeURIComponent(metodoPagamento)}`
            + `&ong=${encodeURIComponent(ongSel)}`;

        
        const link = document.createElement('a');
        link.href = testeUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        qrContainer.appendChild(link);

        
        qrCodeInstance = new QRCode(link, {
            text: testeUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        
        const urlText = document.createElement('div');
        urlText.style.marginTop = '8px';
        urlText.style.fontSize = '12px';
        urlText.style.textAlign = 'center';
        urlText.style.color = '#666';
        urlText.innerHTML = `<a href="${testeUrl}" target="_blank" style="color:#667eea; text-decoration:none;">Abrir link de teste</a>`;
        qrContainer.appendChild(urlText);
    }

    // Finalizar Doação 
    window.finalizarDoacao = async function() {
        const nome = document.getElementById('nome-doador').value.trim();
        const email = document.getElementById('email-doador').value.trim();
        const telefone = document.getElementById('telefone-doador').value.trim();
        const ongSelecionada = document.getElementById('select-ong') ? document.getElementById('select-ong').value : '';

        
        if (!nome || !email) {
            alert('Por favor, preencha todos os dados obrigatórios');
            return;
        }

        if (metodoPagamento === 'cartao') {
            const numeroCartao = document.getElementById('numero-cartao').value.trim();
            const validadeCartao = document.getElementById('validade-cartao').value.trim();
            const cvvCartao = document.getElementById('cvv-cartao').value.trim();
            const titularCartao = document.getElementById('titular-cartao').value.trim();

            if (!numeroCartao || !validadeCartao || !cvvCartao || !titularCartao) {
                alert('Por favor, preencha todos os dados do cartão');
                return;
            }

            // Validar formato do cartão 
            const apenasNumeros = numeroCartao.replace(/\s/g, '');
            if (apenasNumeros.length < 13 || apenasNumeros.length > 19) {
                alert('Número do cartão inválido');
                return;
            }
        }

       
        try {
            const dadosDoacacao = {
                nome,
                email,
                telefone,
                valor: valorSelecionado,
                frequencia: frequenciaSelecionada,
                metodoPagamento: metodoPagamento,
                id_ong: ongSelecionada,
                data: new Date().toISOString()
            };

            console.log('Doação realizada:', dadosDoacacao);

            // Mostrar mensagem de sucesso
            alert(`Doação de R$ ${valorSelecionado.toFixed(2)} (${frequenciaSelecionada}) realizada com sucesso!\n\nUm email de confirmação foi enviado para ${email}`);

            // Mostrar confete antes de redirecionar
            showConfetti();
            // Redirecionar para página de sucesso após a animação
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 3000);

        } catch (err) {
            alert('Erro ao processar doação. Tente novamente.');
            console.error(err);
        }
    };

    // Carregar lista de ONGs para o select 
    async function carregarOngs() {
        try {
            const resp = await fetch('/ongs');
            if (!resp.ok) return;
            const ongs = await resp.json();
            const select = document.getElementById('select-ong');
            if (!select) return;
           
            select.innerHTML = '<option value="">-- Selecione uma ONG --</option>';
            ongs.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.id_ong || o.id || o.id_ong;
                opt.textContent = o.nome_fantasia || o.nome || o.razao_social || o.nome_fantasia || o.email || ('ONG ' + opt.value);
                select.appendChild(opt);
            });
        } catch (err) {
            console.error('Erro ao carregar ONGs:', err);
        }
    }
    carregarOngs();

    // Formatar campos de entrada 
    const numeroCartao = document.getElementById('numero-cartao');
    if (numeroCartao) {
        numeroCartao.addEventListener('input', (e) => {
            const valor = e.target.value.replace(/\D/g, '');
            const formatado = valor.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = formatado;
        });
    }

    
    const validadeCartao = document.getElementById('validade-cartao');
    if (validadeCartao) {
        validadeCartao.addEventListener('input', (e) => {
            const valor = e.target.value.replace(/\D/g, '');
            if (valor.length >= 2) {
                e.target.value = valor.substring(0, 2) + '/' + valor.substring(2, 4);
            } else {
                e.target.value = valor;
            }
        });
    }

    
    const telefonedoador = document.getElementById('telefone-doador');
    if (telefonedoador) {
        telefonedoador.addEventListener('input', (e) => {
            const valor = e.target.value.replace(/\D/g, '');
            const formatado = valor
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d{4})$/, '$1-$2');
            e.target.value = formatado;
        });
    }

    // Confete em canvas 
    function showConfetti() {
        const duration = 2500; 
        const animationEnd = Date.now() + duration;
        const colors = ['#ff47a3', '#ff7b00', '#ffd166', '#6be4c1', '#6f00ff'];

        // Tocar áudio
        (function playCelebrateSound() {
            function playFallback() {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const now = ctx.currentTime;
                    const gain = ctx.createGain();
                    gain.connect(ctx.destination);
                    gain.gain.setValueAtTime(0, now);

                  
                    const freqs = [880, 1320, 1760];
                    freqs.forEach((f, i) => {
                        const osc = ctx.createOscillator();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, now + i * 0.06);
                        osc.connect(gain);
                        osc.start(now + i * 0.06);
                        osc.stop(now + i * 0.06 + 0.12);
                    });

                  
                    gain.gain.linearRampToValueAtTime(0.9, now + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                } catch (err) {
                    console.warn('WebAudio não suportado ou falha ao gerar som:', err);
                }
            }

            const audioEl = document.getElementById('confetti-audio');
            if (audioEl && audioEl.src) {
                const playPromise = audioEl.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(() => {
                       
                    }).catch(err => {
                        console.warn('Não foi possível tocar áudio automaticamente:', err);
                       
                        playFallback();
                    });
                } else {
                    
                    playFallback();
                }
                return;
            }

            
            playFallback();
        })();

        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '2000';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const maxParticles = 120;
        const particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                w: 6 + Math.random() * 8,
                h: 8 + Math.random() * 10,
                vx: -2 + Math.random() * 4,
                vy: 2 + Math.random() * 6,
                rot: Math.random() * 360,
                vr: -8 + Math.random() * 16,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const now = Date.now();
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; 
                p.rot += p.vr;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
                ctx.restore();
            });

           
            const t = Math.max(0, (animationEnd - now) / duration);
            particles.forEach(p => p.opacity = t);

            if (now < animationEnd) {
                requestAnimationFrame(draw);
            } else {
                
                window.removeEventListener('resize', resize);
                canvas.parentNode && canvas.parentNode.removeChild(canvas);
            }
        }

        draw();
    }

    // Atualizar navegação para redirecionar para doacao.html 
    const doarBtn = document.getElementById('doar-btn');
    if (doarBtn) {
        doarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'doacao.html';
        });
    }

    
    setTimeout(() => {
        gerarQRCode();
    }, 500);
});
