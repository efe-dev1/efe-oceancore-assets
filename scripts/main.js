document.addEventListener('DOMContentLoaded', function () {
    const icones = document.querySelectorAll('.icone');
    const secoes = document.querySelectorAll('.secao');
    const botaoAcessarAulas = document.getElementById('botao-acessar-aulas');
    const botaoConfiguracoes = document.getElementById('botao-configuracoes');
    const modalConfiguracoes = document.getElementById('modal-configuracoes');
    const botoesFecharModal = document.querySelectorAll('.modal-fechar');
    const nomeUsuario = document.getElementById('nome-usuario');
    const statusLogin = document.getElementById('status-login');
    const botaoAlternarRanking = document.getElementById('botao-alternar-ranking');
    const gradeContainer = document.getElementById('grade-cursos-container');
    const scriptViewer = document.getElementById('script-viewer');
    const scriptTitulo = document.getElementById('script-titulo');
    const scriptContent = document.getElementById('script-content');
    const btnVoltar = document.getElementById('btn-voltar');
    const hamburguerBtn = document.querySelector('.hamburguer-btn');
    const fecharMenu = document.querySelector('.fechar-menu');
    const menuLateral = document.querySelector('.menu-lateral-mobile');
    const overlayMenu = document.querySelector('.overlay-menu');
    const opcoesMenu = document.querySelectorAll('.opcao-menu-mobile');
    const botaoSugestoes = document.getElementById('botao-sugestoes');
    const modalSugestoes = document.getElementById('modal-sugestoes');
    const formSugestao = document.getElementById('form-sugestao');
    const nickSugestao = document.getElementById('nick-sugestao');
    const textoSugestao = document.getElementById('texto-sugestao');
    const botaoSugestoesMobile = document.getElementById('botao-sugestoes-mobile');
    const botaoConfiguracoesMobile = document.getElementById('botao-configuracoes-mobile');

    async function fetchSeguro(url, options = {}) {
        return fetch(
            'https://efe-ocean.olordeban.workers.dev?url=' + encodeURIComponent(url),
            options
        );
    }

    const RANKING_URLS = {
        professores: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTAMYg28hPH_haWaWQRY7kM2s3gjkU58ps-u94fa-bjQb7C4qilJdjpqrCIFtdZYl3254FOXsW46b8/pub?gid=482045927&single=true&output=csv',
        mentores: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTx61SHWVa0MP5Q_ep433UcTAQDu0oQvWbWvkwlodxWVaRVUjbCQjR4Z74CN1JfzE5RHZchcfnIdr5_/pub?gid=1666370622&single=true&output=csv',
        capacitadores: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzo0OL1KelfaScsFPkEHuP66befGAv_vMK22-tdaWeqrRTgngAe5pBvP8uDqsUnzoDFp1OhJTMdJIl/pub?gid=1666370622&single=true&output=csv',
        graduadores: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6QAqESsAw6aZZw7Uh4CKXlwvCHsmT3qZWdFbQX5VzZc_JPeHpx47Eapo0ovjZ2tuDAqmHUBCxE-50/pub?gid=1053708693&single=true&output=csv'
    };

    const RANKING_CONFIG = {
        professores: {nickCol: 2, pontosCol: 14},
        mentores: {nickCol: 2, pontosCol: 7},
        capacitadores: {nickCol: 2, pontosCol: 9},
        graduadores: {nickCol: 2, pontosCol: 6}
    };

    const FORMS_POSTAGEM = {
        professor: 'https://efe-relatorio-de-postagem.netlify.app/view/form/prof?nick=',
        mentor: 'https://efe-relatorio-de-postagem.netlify.app/view/form/men?nick=',
        capacitador: 'https://efe-relatorio-de-postagem.netlify.app/view/form/cap?nick=',
        graduador: 'https://efe-relatorio-de-postagem.netlify.app/view/form/grad?nick='
    };

    function atualizarLinksPostagem() {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        let nick = '';

        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            nick = encodeURIComponent(usuario.nick);
        }

        const linksPostagem = document.querySelectorAll('.postar-aula[href*="{{USUARIO_NICK}}"]');

        linksPostagem.forEach(link => {
            const hrefOriginal = link.getAttribute('href');
            const hrefComNick = hrefOriginal.replace('{{USUARIO_NICK}}', nick);
            link.setAttribute('href', hrefComNick);
        });
    }

    if (botaoConfiguracoesMobile) {
        botaoConfiguracoesMobile.addEventListener('click', function () {
            modalConfiguracoes.classList.add('ativo');
            fecharMenuMobile();
        });
    }

    if (botaoSugestoesMobile) {
        botaoSugestoesMobile.addEventListener('click', function () {
            abrirModalSugestoes();
            fecharMenuMobile();
        });
    }

    const SUGESTOES_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-RFDDaBoWli926ddti_O8ACIGWBV7XRNQQ_zWobAf6bjVC2KCZ3YGrW442gYYsQ5Y/exec';

    function configurarModalSugestoes() {
        botaoSugestoes.addEventListener('click', function () {
            abrirModalSugestoes();
        });

        modalSugestoes.querySelector('.modal-fechar').addEventListener('click', fecharModalSugestoes);

        modalSugestoes.addEventListener('click', function (e) {
            if (e.target === modalSugestoes) {
                fecharModalSugestoes();
            }
        });

        formSugestao.addEventListener('submit', function (e) {
            e.preventDefault();
            enviarSugestao();
        });
    }

    function abrirModalSugestoes() {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            nickSugestao.value = usuario.nick;
        } else {
            nickSugestao.value = 'Não logado';
        }

        textoSugestao.value = '';

        modalSugestoes.classList.add('ativo');
    }

    function fecharModalSugestoes() {
        modalSugestoes.classList.remove('ativo');
    }

    async function enviarSugestao() {
        const nick = nickSugestao.value;
        const sugestao = textoSugestao.value.trim();

        if (!sugestao) {
            alert('Por favor, digite sua sugestão!');
            return;
        }

        const btnEnviar = formSugestao.querySelector('.btn-enviar');
        const textoOriginal = btnEnviar.textContent;

        btnEnviar.innerHTML = 'Enviando...';
        btnEnviar.disabled = true;

        try {
            const response = await fetch(SUGESTOES_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nick: nick,
                    sugestao: sugestao,
                    data: new Date().toISOString()
                })
            });

            const mensagem = document.createElement('div');
            mensagem.style.cssText = `
                position: fixed;top: 15px;right: 15px;background: rgba(76, 175, 80, 0.4);color: #e9ffe9; padding: 8px 14px;border-radius: 8px;backdrop-filter: blur(8px);-webkit-backdrop-filter: blur(8px);z-index: 10000;font-family: 'Poppins', sans-serif;font-size: 14px;box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            `;
            mensagem.textContent = 'Sugestão enviada com sucesso!';

            document.body.appendChild(mensagem);

            setTimeout(() => {
                mensagem.remove();
            }, 3000);

            fecharModalSugestoes();

        } catch (error) {
            console.error('Erro ao enviar sugestão:', error);
            alert('Erro ao enviar sugestão. Tente novamente.');
        } finally {
            btnEnviar.innerHTML = textoOriginal;
            btnEnviar.disabled = false;
        }
    }

    function mostrarModalAbrirForms(cargo) {
        const modalExistente = document.getElementById('modal-abrir-forms');
        if (modalExistente) {
            modalExistente.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'modal-abrir-forms';
        modal.className = 'modal ativo';
        modal.style.zIndex = '2000';

        modal.innerHTML = `
                <div class="modal-conteudo">
                    <div class="modal-cabecalho"><h3>CONFIRMAR ABERTURA</h3><button class="modal-fechar" onclick="fecharModalAbrirForms()">&times;</button></div>
                    <div style="padding: 20px; text-align: center;">
                        <p style="margin-bottom: 15px;"><strong>Quer abrir o forms agora?</strong></p>
                        <p style="margin-bottom: 20px; font-size: 14px; color: var(--cinza);">É recomendado para marcar o horário inicial da aula!</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="fecharModalAbrirForms()" style="background: rgba(255,255,255,0.1);color: var(--texto);border: none;padding: 10px 20px;border-radius: 8px;cursor: pointer;font-family: 'Poppins', sans-serif;flex: 1;">Cancelar</button>
                            <button onclick="abrirFormsPostagem('${cargo}')" style="background: var(--botao-ciano);color: white;border: none;padding: 10px 20px;border-radius: 8px;cursor: pointer;font-family: 'Poppins', sans-serif;flex: 1;">Abrir Forms</button>
                        </div>
                    </div>
                </div>
            `;

        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                fecharModalAbrirForms();
            }
        });
    }

    function fecharModalAbrirForms() {
        const modal = document.getElementById('modal-abrir-forms');
        if (modal) {
            modal.remove();
        }
    }

    function abrirFormsPostagem(cargo) {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        let nick = '';

        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            nick = encodeURIComponent(usuario.nick);
        }

        const urlBase = FORMS_POSTAGEM[cargo];
        const urlCompleta = urlBase + nick;

        if (urlBase) {
            window.open(urlCompleta, '_blank');
        }
        fecharModalAbrirForms();
    }

    let rankingAtual = 'professores';
    let slideAtual = 0;
    let totalSlides = 0;
    let intervaloRanking = null;
    let cargoUsuario = null;
    let cargosDisponiveis = [];
    let linhasCopiadas = new Set();
    let ultimaLinhaCopiada = -1;
    let linhasPuladas = new Set();
    let scriptsData = {};
    let historico = [];

    hamburguerBtn.addEventListener('click', function () {
        menuLateral.classList.add('ativo');
        overlayMenu.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    });

    function fecharMenuMobile() {
        menuLateral.classList.remove('ativo');
        overlayMenu.classList.remove('ativo');
        document.body.style.overflow = '';
    }

    fecharMenu.addEventListener('click', fecharMenuMobile);
    overlayMenu.addEventListener('click', fecharMenuMobile);

    opcoesMenu.forEach(opcao => {
        opcao.addEventListener('click', function () {
            const secaoAlvo = this.getAttribute('data-secao');
            alternarSecao(secaoAlvo);
            fecharMenuMobile();
        });
    });

    function iniciarAtualizacaoRanking() {
        if (intervaloRanking) {
            clearInterval(intervaloRanking);
        }
        intervaloRanking = setInterval(carregarRanking, 60000);
    }

    function alternarSecao(secaoAlvo) {
        secoes.forEach(secao => {
            secao.classList.remove('ativa');
        });

        icones.forEach(icone => {
            icone.classList.remove('active');
        });

        const secao = document.getElementById(secaoAlvo);
        if (secao) {
            secao.classList.add('ativa');

            if (secaoAlvo === 'suporte') {
                carregarContatosSuporte();
            }
        }

        const iconeAtivo = document.querySelector(`.icone[data-secao="${secaoAlvo}"]`);
        if (iconeAtivo) {
            iconeAtivo.classList.add('active');
        }
    }

    icones.forEach(icone => {
        icone.addEventListener('click', function () {
            const secaoAlvo = this.getAttribute('data-secao');
            if (secaoAlvo) {
                alternarSecao(secaoAlvo);
            }
        });
    });

    botaoAcessarAulas.addEventListener('click', function () {
        alternarSecao('aulas');
    });

    function configurarModais() {
        botaoConfiguracoes.addEventListener('click', function () {
            modalConfiguracoes.classList.add('ativo');
        });

        botoesFecharModal.forEach(botao => {
            botao.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('ativo');
                }
            });
        });

        [modalConfiguracoes].forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.classList.remove('ativo');
                }
            });
        });
    }

    function configurarModalForms() {
        const checkbox = document.getElementById('modal-forms-automatico');

        let modalAtivo = true;
        const savedSetting = localStorage.getItem('efe_modal_forms');
        if (savedSetting !== null) {
            modalAtivo = savedSetting === 'true';
        }
        checkbox.checked = modalAtivo;

        checkbox.addEventListener('change', function () {
            localStorage.setItem('efe_modal_forms', this.checked.toString());
            console.log('Modal forms configurado para:', this.checked);
        });

        return modalAtivo;
    }

    function configurarTempoBloqueioCopia() {
        const select = document.getElementById('tempo-bloqueio-copia');
        if (!select) return;

        let tempoSalvo = localStorage.getItem('efe_tempo_bloqueio_copia');

        if (!tempoSalvo) {
            tempoSalvo = '30';
            localStorage.setItem('efe_tempo_bloqueio_copia', tempoSalvo);
        }

        select.value = tempoSalvo;

        select.addEventListener('change', function () {
            localStorage.setItem('efe_tempo_bloqueio_copia', this.value);
        });
    }

    function salvarRankingAtual() {
        localStorage.setItem('efe_ranking_atual', rankingAtual);
    }

    function recuperarRankingAtual() {
        const rankingSalvo = localStorage.getItem('efe_ranking_atual');
        if (rankingSalvo && RANKING_URLS[rankingSalvo]) {
            rankingAtual = rankingSalvo;
        }
    }

    function alternarRanking() {
        const rankings = ['professores', 'mentores', 'capacitadores', 'graduadores'];
        const currentIndex = rankings.indexOf(rankingAtual);
        const nextIndex = (currentIndex + 1) % rankings.length;
        rankingAtual = rankings[nextIndex];

        slideAtual = 0;
        salvarRankingAtual();
        carregarRanking();
    }

    function calcularDataReset(tipo) {
        const agora = new Date();

        if (tipo === 'graduadores') {
            const hoje = agora.getDate();
            const mes = agora.getMonth();
            const ano = agora.getFullYear();

            let dataReset;

            if (hoje <= 15) {
                dataReset = new Date(ano, mes, 16, 23, 59, 0, 0);
            } else {
                dataReset = new Date(ano, mes + 1, 1, 23, 59, 0, 0);
            }

            return dataReset;
        } else {
            const sabado = new Date();
            sabado.setDate(agora.getDate() + (6 - agora.getDay()));
            sabado.setHours(23, 59, 0, 0);

            if (agora > sabado) {
                sabado.setDate(sabado.getDate() + 7);
            }

            return sabado;
        }
    }

    function parseCSVComNicks(linhaCSV) {
        const colunas = [];
        let campoAtual = '';
        let dentroDeAspas = false;

        for (let i = 0; i < linhaCSV.length; i++) {
            const char = linhaCSV[i];
            const proximoChar = linhaCSV[i + 1];

            if (char === '"') {
                if (dentroDeAspas && proximoChar === '"') {
                    campoAtual += '"';
                    i++;
                } else {
                    dentroDeAspas = !dentroDeAspas;
                }
            } else if (char === ',' && !dentroDeAspas) {
                colunas.push(campoAtual.trim());
                campoAtual = '';
            } else {
                campoAtual += char;
            }
        }

        colunas.push(campoAtual.trim());

        return colunas;
    }

    function processarNick(nick) {
        if (!nick) return '';

        let nickLimpo = nick.replace(/^"+|"+$/g, '');

        nickLimpo = nickLimpo.trim();

        if (nickLimpo.startsWith(',')) {
            nickLimpo = ',' + nickLimpo.substring(1).trim();
        }

        return nickLimpo;
    }

    async function carregarRanking() {
        try {
            let timerElement = document.getElementById('timer-rank');
            const rankContainer = document.getElementById('ranking-slides');

            if (!rankContainer) {
                console.error('Container do ranking não encontrado');
                return;
            }

            const tituloRank = document.querySelector('.rank-semanal h3');

            if (tituloRank) {
                if (rankingAtual === 'professores') {
                    tituloRank.innerHTML = 'RANK PROFESSOR <span class="timer-rank" id="timer-rank"></span>';
                } else if (rankingAtual === 'mentores') {
                    tituloRank.innerHTML = 'RANK MENTOR <span class="timer-rank" id="timer-rank"></span>';
                } else if (rankingAtual === 'capacitadores') {
                    tituloRank.innerHTML = 'RANK CAP <span class="timer-rank" id="timer-rank"></span>';
                } else if (rankingAtual === 'graduadores') {
                    tituloRank.innerHTML = 'RANK GRAD <span class="timer-rank" id="timer-rank"></span>';
                }
                timerElement = document.getElementById('timer-rank');
            }

            rankContainer.innerHTML = '<div class="ranking-slide"><div class="linha-ranking"><span>Carregando<span class="loading-dots"></span></span></div></div>';

            const config = RANKING_CONFIG[rankingAtual];
            const response = await fetchSeguro(RANKING_URLS[rankingAtual]);

            if (!response.ok) {
                throw new Error('Erro ao carregar CSV');
            }

            const csvData = await response.text();
            const linhas = csvData.split('\n');
            const dados = [];

            linhas.forEach((linha, index) => {
                if (index >= 5 && linha.trim()) {
                    const colunas = parseCSVComNicks(linha);

                    if (colunas.length > Math.max(config.nickCol, config.pontosCol)) {
                        const nick = processarNick(colunas[config.nickCol]);
                        const pontos = colunas[config.pontosCol] ? parseInt(colunas[config.pontosCol].trim()) || 0 : 0;

                        if (nick &&
                            nick !== '' &&
                            nick !== 'NICK' &&
                            nick.length >= 1 &&
                            nick.length <= 50 &&
                            !isNaN(pontos)) {
                            dados.push({nick, pontos});
                        }
                    }
                }
            });

            dados.sort((a, b) => b.pontos - a.pontos);
            dados.forEach((jogador, index) => {
                const usuarioSalvo = localStorage.getItem('efe_usuario');
                if (usuarioSalvo) {
                    const usuario = JSON.parse(usuarioSalvo);
                    if (jogador.nick === usuario.nick) {
                        jogador.nick = `${jogador.nick} <span style="font-size: 0.8em; opacity: 0.7; font-weight: normal; margin-left: 5px;">(você)</span>`;
                    }
                }
            });

            rankContainer.innerHTML = '';

            if (dados.length === 0) {
                rankContainer.innerHTML = '<div class="ranking-slide"><div class="linha-ranking"><span>Nenhum dado encontrado</span></div></div>';
                return;
            }

            const grupos = [];
            for (let i = 0; i < dados.length; i += 5) {
                grupos.push(dados.slice(i, i + 5));
            }

            grupos.forEach((grupo, slideIndex) => {
                const slide = document.createElement('div');
                slide.className = 'ranking-slide';

                grupo.forEach((jogador, index) => {
                    const posicaoGlobal = slideIndex * 5 + index + 1;
                    const linha = document.createElement('div');
                    linha.className = 'linha-ranking';

                    if (posicaoGlobal === 1) {
                        linha.style.background = 'linear-gradient(90deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.15) 100%)';
                        linha.style.color = '#ffd700';
                    } else if (posicaoGlobal === 2) {
                        linha.style.background = 'linear-gradient(90deg, rgba(192,192,192,0.3) 0%, rgba(192,192,192,0.15) 100%)';
                        linha.style.color = '#c0c0c0';
                    } else if (posicaoGlobal === 3) {
                        linha.style.background = 'linear-gradient(90deg, rgba(205,127,50,0.3) 0%, rgba(205,127,50,0.15) 100%)';
                        linha.style.color = '#cd7f32';
                    }

                    if (rankingAtual === 'graduadores') {
                        linha.innerHTML = `<span>${String(posicaoGlobal).padStart(2, '0')} ${jogador.nick}</span><span>${jogador.pontos} total</span>`;
                    } else {
                        linha.innerHTML = `<span>${String(posicaoGlobal).padStart(2, '0')} ${jogador.nick}</span><span>${jogador.pontos} pts</span>`;
                    }
                    slide.appendChild(linha);
                });

                while (slide.children.length < 5) {
                    const linhaVazia = document.createElement('div');
                    linhaVazia.className = 'linha-ranking';
                    linhaVazia.style.opacity = '0.3';
                    linhaVazia.innerHTML = `<span>--</span><span>--</span>`;
                    slide.appendChild(linhaVazia);
                }

                rankContainer.appendChild(slide);
            });

            totalSlides = grupos.length;
            atualizarNavegacaoRanking();

            if (timerElement) {
                const dataReset = calcularDataReset(rankingAtual);
                atualizarTimerRank(dataReset);
            }

        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
            const rankContainer = document.getElementById('ranking-slides');
            if (rankContainer) {
                rankContainer.innerHTML = '<div class="ranking-slide"><div class="linha-ranking"><span>Erro ao carregar</span></div></div>';
            }
        }
    }

    function atualizarNavegacaoRanking() {
        const prevBtn = document.getElementById('rank-prev-btn');
        const nextBtn = document.getElementById('rank-next-btn');
        const rankContainer = document.getElementById('ranking-slides');

        if (!prevBtn || !nextBtn || !rankContainer) return;

        prevBtn.disabled = slideAtual === 0;
        nextBtn.disabled = slideAtual === totalSlides - 1;
        rankContainer.style.transform = `translateX(-${slideAtual * 100}%)`;
    }

    function atualizarTimerRank(dataReset) {
        const timerElement = document.getElementById('timer-rank');
        if (!timerElement) return;

        const agora = new Date();
        const diferenca = dataReset - agora;

        if (diferenca <= 0) {
            timerElement.textContent = 'RESETOU!';
            return;
        }

        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        timerElement.textContent = `${dias}d ${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
    }

    statusLogin.classList.add('login-status');

    async function pegarUsername() {
        try {
            let resposta = await fetch("/forum");
            let html = await resposta.text();

            let regex = /_userdata\["username"\]\s*=\s*"([^"]+)"/;
            let match = html.match(regex);

            if (match && match[1]) {
                const username = match[1];
                return username;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async function verificarLoginSalvo() {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            nomeUsuario.textContent = usuario.nick;
            statusLogin.innerHTML = `Bem-vindo(a)!<br><b>${usuario.nick}</b>`;
            statusLogin.className = 'login-status sucesso';

            cargoUsuario = await detectarCargoUsuario();
            atualizarLinksPostagem();

            if (cargoUsuario) {
                cargosDisponiveis = determinarCargosDisponiveis(cargoUsuario);
                atualizarQuickPlay();
                filtrarAulas(cargoUsuario);
                liberarAulas();
            }

            const avatarImg = document.querySelector('.perfil-topo img');
            if (avatarImg) {
                avatarImg.src = `http://www.habbo.com.br/habbo-imaging/avatarimage?&user=${encodeURIComponent(usuario.nick)}&action=std&direction=4&head_direction=3&img_format=png&gesture=sml&headonly=1&size=l`;
            }
        } else {
            loginAutomatico();
        }
    }

    async function loginAutomatico() {
        const username = await pegarUsername();

        if (username) {
            const usuario = {
                nick: username,
                loginTime: new Date().getTime()
            };

            localStorage.setItem('efe_usuario', JSON.stringify(usuario));

            cargoUsuario = await detectarCargoUsuario();

            if (cargoUsuario) {
                cargosDisponiveis = determinarCargosDisponiveis(cargoUsuario);
                atualizarQuickPlay();
                filtrarAulas(cargoUsuario);
                liberarAulas();
            }

            verificarLoginSalvo();
        }
    }

    async function detectarCargoUsuario() {
        try {
            const usuarioSalvo = localStorage.getItem('efe_usuario');
            if (!usuarioSalvo) return null;

            const usuario = JSON.parse(usuarioSalvo);
            const nickUsuario = usuario.nick;

            const ehGrupoEspecial = await verificarGruposEspeciais(nickUsuario);
            if (ehGrupoEspecial) {
                return 'lider';
            }

            const response = await fetchSeguro('https://docs.google.com/spreadsheets/d/e/2PACX-1vQu5x4PLj1LY_tzBUGaKZQmf6Y9L99B95v5Dl1kCcJnBAx9y5lfOp-n8X1LSMpdlXW9hZEPUKt397zE/pub?gid=0&single=true&output=csv');

            if (!response.ok) throw new Error('Erro ao carregar CSV de cargos');

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            let usuarioEncontrado = false;

            for (let i = 19; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length >= 4) {
                    const nick = processarNick(colunas[3]);
                    const cargoCompleto = processarNick(colunas[2]);

                    const cargoNormalizado = cargoCompleto.replace(/\(a\)$/i, '').trim().toLowerCase();

                    if (nick === nickUsuario) {
                        usuarioEncontrado = true;
                        return cargoNormalizado;
                    }
                }
            }

            const resDA = await fetchSeguro('https://docs.google.com/spreadsheets/d/e/2PACX-1vSMJdPrmdSodMJYbJ9-7oIpUcE_P0Eh_EObOTZC2jcc7msIVHRqQ9Tq8C-8vLRhRYWMvXLi2cxKwMpP/pub?gid=593055626&single=true&output=csv');

            if (!resDA.ok) throw new Error('Erro ao carregar CSV do DA');

            const csvDataDA = await resDA.text();
            const linhasDA = csvDataDA.split('\n');
            for (let i = 4; i < linhasDA.length; i++) {
                if (!linhasDA[i].trim()) continue;

                const colunasDA = parseCSVComNicks(linhasDA[i]);

                if (colunasDA.length >= 7) {
                    const nicksDA = colunasDA[5]
                        .split(' / ')
                        .map(nick => processarNick(nick));

                    const statusDA = processarNick(colunasDA[6]);
                    const dataAprovacaoDA = parseDataBR(colunasDA[4]);

                    const agora = new Date();
                    const tresDiasAtras = new Date();
                    tresDiasAtras.setDate(agora.getDate() - 3);

                    const nickEncontrado = nicksDA.includes(nickUsuario);

                    if (
                        nickEncontrado &&
                        (statusDA === 'Aprovado' || statusDA === 'Aprovada' || statusDA === 'Aprovado(a)') &&
                        dataAprovacaoDA >= tresDiasAtras
                    ) {
                        usuarioEncontrado = true;
                        return 'professor';
                    }
                }
            }

            if (!usuarioEncontrado) {
                localStorage.removeItem('efe_usuario');

                const statusLogin = document.getElementById('status-login');

                statusLogin.innerHTML = `Ops!<br><b>${nickUsuario}</b>`;
                statusLogin.className = 'login-status erro';

                const estadoAulas = document.getElementById('estado-aulas');
                if (estadoAulas) {
                    estadoAulas.innerHTML = `
                                <div class="aviso-login">
                                    <h3>ACESSO NEGADO</h3>
                                    <p>Opa, parece que você <strong>NÃO</strong> é Made in EFE.</p>
                                    <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                                        Se você acha que isso é um erro,<br>
                                        contate a liderança da companhia.
                                    </p>
                                </div>
                        `;
                }

                const quickPlayToggle = document.querySelector('.quick-play-toggle');
                if (quickPlayToggle) {
                    quickPlayToggle.style.opacity = '0.5';
                    quickPlayToggle.style.cursor = 'not-allowed';
                }

                throw new Error('Ops...');
            }

            return null;
        } catch (error) {
            console.error('Erro ao detectar cargo:', error);
            return null;
        }
    }

    function parseDataBR(dataStr) {
        // Ex: "01/01/2026 21:20:10"
        const [data, hora] = dataStr.split(' ');
        const [dia, mes, ano] = data.split('/');
        return new Date(`${ano}-${mes}-${dia}T${hora}`);
    }

    async function verificarGruposEspeciais(nickUsuario) {
        try {
            const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(nickUsuario)}`);

            if (!response.ok) return false;

            const userData = await response.json();
            const grupos = userData.groups || [];

            const gruposEspeciais = [
                '[RCC] Corregedoria',
                '[RCC] G.A.T.E',
                '[RCC] G.S.S',
                '[RCC] Procuradoria Militar'
            ];

            return grupos.some(grupo =>
                gruposEspeciais.includes(grupo.name)
            );

        } catch (error) {
            console.error('Erro ao verificar grupos do Habbo:', error);
            return false;
        }
    }

    function determinarCargosDisponiveis(cargo) {
        const cargoNormalizado = cargo.replace(/\(a\)$/i, '').trim().toLowerCase();

        const cargosLideranca = ['graduador', 'estagiário', 'ministro(a) da contabilidade', 'ministro(a) da administração', 'ministro(a) da documentação', 'ministro(a) da atualização', 'ministro(a) das finanças', 'ministro(a) da segurança', 'vice-líder', 'líder'];

        if (cargosLideranca.includes(cargoNormalizado)) {
            return ['professor', 'mentor', 'capacitador', 'graduador'];
        }

        switch (cargoNormalizado) {
            case 'capacitador':
                return ['professor', 'mentor', 'capacitador'];
            case 'mentor':
                return ['professor', 'mentor'];
            case 'professor':
            default:
                return ['professor'];
        }
    }

    function liberarAulas() {
        const estado = document.getElementById('estado-aulas');
        const grade = document.querySelector('.grade-cursos-container');

        if (estado) estado.remove();
        if (grade) grade.style.display = 'block';
    }

    function atualizarQuickPlay() {
        const quickPlayBotoes = document.querySelector('.quick-play-botoes');
        const quickPlayLabel = document.querySelector('.quick-play-label');
        const quickPlayBar = document.querySelector('.quick-play-bar');
        const usuarioSalvo = localStorage.getItem('efe_usuario');

        if (!quickPlayBotoes || !quickPlayLabel || !quickPlayBar) return;

        quickPlayBotoes.innerHTML = '';

        if (!usuarioSalvo) {
            quickPlayLabel.textContent = 'CENTRAL';
            return;
        }

        quickPlayLabel.textContent = 'CENTRAL';

        cargosDisponiveis.forEach(cargo => {
            const botao = document.createElement('button');
            botao.className = 'quick-play-item';
            botao.textContent = cargo.charAt(0).toUpperCase() + cargo.slice(1);
            botao.dataset.cargo = cargo;

            if (cargo === cargoUsuario) {
                botao.classList.add('ativo');
            }

            botao.addEventListener('click', function () {
                quickPlayBotoes.querySelectorAll('.quick-play-item').forEach(btn => {
                    btn.classList.remove('ativo');
                });

                this.classList.add('ativo');
                filtrarAulas(this.dataset.cargo);
            });

            quickPlayBotoes.appendChild(botao);
        });

        if (cargoUsuario) {
            filtrarAulas(cargoUsuario);
        }

        quickPlayBar.classList.add('expandida');
    }

    function filtrarAulas(cargoSelecionado) {
        const gradeCursos = document.querySelector('.grade-cursos');
        const estadoAulas = document.getElementById('estado-aulas');
        const usuarioSalvo = localStorage.getItem('efe_usuario');

        if (!usuarioSalvo) {
            estadoAulas.innerHTML = `
                        <div class="aviso-login">
                            <h3>LOGIN NECESSÁRIO</h3>
                            <p>Você precisa estar logado para acessar as aulas da Central de Aulas.</p>
                            <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                                Se você já está logado e está vendo esta mensagem,<br>
                                contate a liderança da EFE para resolver o problema.
                            </p>
                        </div>
                `;
            return;
        }

        const cardsCursos = gradeCursos.querySelectorAll('.card-curso');

        if (cardsCursos.length === 0) {
            location.reload();
            return;
        }

        if (!cargoSelecionado) {
            cardsCursos.forEach(card => {
                const cargoCard = card.getAttribute('data-cargo');
                if (cargosDisponiveis.includes(cargoCard)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        } else {
            cardsCursos.forEach(card => {
                const cargoCard = card.getAttribute('data-cargo');
                if (cargoCard === cargoSelecionado) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }

    async function verificarStatusHabbo(nick) {
        try {
            const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(nick)}`);
            if (!response.ok) return 'offline';

            const data = await response.json();
            return data.online ? 'online' : 'offline';
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return 'offline';
        }
    }

    async function carregarContatosSuporte() {
        try {
            const listaContatos = document.querySelector('#suporte .lista-contatos');

            if (!listaContatos) return;

            const response = await fetchSeguro('https://docs.google.com/spreadsheets/d/e/2PACX-1vQu5x4PLj1LY_tzBUGaKZQmf6Y9L99B95v5Dl1kCcJnBAx9y5lfOp-n8X1LSMpdlXW9hZEPUKt397zE/pub?gid=0&single=true&output=csv');

            if (!response.ok) {
                throw new Error('Erro ao carregar CSV');
            }

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            const contatos = [];

            for (let i = 18; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length >= 23) {
                    const nome = processarNick(colunas[21]);
                    const whatsapp = colunas[22] ? colunas[22].trim() : '';
                    const cargo = processarNick(colunas[1]);

                    const cargoLower = cargo.toLowerCase();
                    if (nome && cargo && (cargoLower.includes('estagiário') ||
                        cargoLower.includes('ministro(a)') ||
                        cargoLower.includes('vice-líder') ||
                        cargoLower.includes('líder'))) {

                        let ordem = 0;
                        if (cargoLower.includes('líder') && !cargoLower.includes('vice')) {
                            ordem = 1;
                        } else if (cargoLower.includes('vice-líder')) {
                            ordem = 2;
                        } else if (cargoLower.includes('ministro(a)')) {
                            ordem = 3;
                        } else if (cargoLower.includes('estagiário')) {
                            ordem = 4;
                        }

                        contatos.push({
                            nome: nome,
                            cargo: cargo,
                            whatsapp: whatsapp,
                            ordem: ordem
                        });
                    }
                }
            }

            contatos.sort((a, b) => a.ordem - b.ordem);

            const contatosComStatus = await Promise.all(
                contatos.map(async (contato) => {
                    const status = await verificarStatusHabbo(contato.nome);
                    return {...contato, status};
                })
            );

            listaContatos.innerHTML = '';

            contatosComStatus.forEach(contato => {
                const itemContato = document.createElement('div');
                itemContato.className = 'item-contato';

                const statusIcon = contato.status === 'online'
                    ? 'https://2img.net/i.imgur.com/3P9qnsk.png'
                    : 'https://2img.net/i.imgur.com/dX5g68y.png';

                itemContato.innerHTML = `
                        <div class="info-contato">
                            <div class="nome-cargo-contato">
                                <div class="nome-contato">
                                    <img src="${statusIcon}" alt="${contato.status}" class="status-habbo" title="${contato.status === 'online' ? 'Online' : 'Offline'}">
                                    ${contato.nome}
                                </div>
                                <div class="cargo-contato">${contato.cargo}</div>
                            </div>
                        </div>
                        <div class="botoes-contato">
                            ${contato.whatsapp ? `<button class="botao-contato" onclick="abrirWhatsApp('${contato.whatsapp}')"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button>` : ''}
                        </div>
                    `;

                listaContatos.appendChild(itemContato);
            });

        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
        }
    }

    function abrirWhatsApp(numero) {
        const numeroLimpo = numero.replace(/[^\d+]/g, '');
        const url = `https://wa.me/${numeroLimpo}`;
        window.open(url, '_blank');
    }

    window.abrirWhatsApp = abrirWhatsApp;

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const statusLogin = document.getElementById('status-login');
                if (statusLogin && statusLogin.classList.contains('sucesso')) {
                    atualizarPerfilMobile();
                }
            }
        });
    });

    const suporteSection = document.getElementById('suporte');
    if (suporteSection) {
        observer.observe(suporteSection, {attributes: true});
    }

    if (suporteSection && suporteSection.classList.contains('ativa')) {
        carregarContatosSuporte();
    }

    function atualizarPerfilMobile() {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        const avatarImg = document.getElementById('avatar-mobile-img');
        const nomePerfil = document.getElementById('nome-perfil-mobile');
        const statusPerfil = document.getElementById('status-perfil-mobile');

        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            nomePerfil.textContent = usuario.nick;
            statusPerfil.textContent = '#MADE IN EFE!';

            if (avatarImg) {
                avatarImg.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${encodeURIComponent(usuario.nick)}&action=std&direction=4&head_direction=3&img_format=png&gesture=sml&headonly=1&size=l`;
            }
        } else {
            nomePerfil.textContent = 'Faça login';
            statusPerfil.textContent = 'Bem-vindo(a)!';
        }
    }

    function mostrarModalAvisoPulo() {
        const modalExistente = document.getElementById('modal-aviso-pulo');
        if (modalExistente) {
            modalExistente.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'modal-aviso-pulo';
        modal.className = 'modal ativo';
        modal.style.zIndex = '2000';

        modal.innerHTML = `
                <div class="modal-conteudo">
                    <div class="modal-cabecalho">
                        <h3>AVISO</h3>
                        <button class="modal-fechar" onclick="fecharModalAvisoPulo()">&times;</button>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <p style="margin-bottom: 15px; color: #ff6b6b; font-weight: bold;">
                           ⚠️ CUIDADO!
                        </p>
                        <p style="margin-bottom: 15px;">
                            Pular linhas poderá acarretar em sanções na RCC!
                        </p>
                        <button onclick="fecharModalAvisoPulo()" style="
                            background: var(--botao-ciano);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: 'Poppins', sans-serif;
                        ">
                            Entendi
                        </button>
                    </div>
                </div>
            `;

        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                fecharModalAvisoPulo();
            }
        });
    }

    function fecharModalAvisoPulo() {
        const modal = document.getElementById('modal-aviso-pulo');
        if (modal) {
            modal.remove();
        }
    }

    function marcarLinhasPuladas() {
        document.querySelectorAll('.linha-pulada').forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            }
        });

        const elementosTexto = document.querySelectorAll('.titulo, .texto');
        const elementosVisiveis = Array.from(elementosTexto).filter(el => {
            const spoilerFechado = el.closest('.spoiler:not(.aberto)');
            return !spoilerFechado;
        });

        linhasPuladas.forEach(linhaIndex => {
            if (elementosVisiveis[linhaIndex]) {
                const elemento = elementosVisiveis[linhaIndex];

                if (!elemento.querySelector('.linha-pulada')) {
                    const btnCopiar = elemento.querySelector('.btn-copiar');

                    const novoConteudo = document.createElement('span');
                    novoConteudo.className = 'linha-pulada';

                    const textoElemento = elemento.cloneNode(true);
                    const btnCopiarTemp = textoElemento.querySelector('.btn-copiar');
                    if (btnCopiarTemp) btnCopiarTemp.remove();

                    novoConteudo.innerHTML = textoElemento.innerHTML;

                    elemento.innerHTML = '';
                    elemento.appendChild(novoConteudo);

                    if (btnCopiar) {
                        elemento.appendChild(btnCopiar);
                    }
                }
            }
        });
    }

    function limparEstadoCopias() {
        linhasCopiadas.clear();
        linhasPuladas.clear();
        ultimaLinhaCopiada = -1;
    }

    window.mostrarModalAbrirForms = mostrarModalAbrirForms;
    window.fecharModalAbrirForms = fecharModalAbrirForms;
    window.abrirFormsPostagem = abrirFormsPostagem;
    window.mostrarModalAvisoPulo = mostrarModalAvisoPulo;
    window.fecharModalAvisoPulo = fecharModalAvisoPulo;
    window.marcarLinhasPuladas = marcarLinhasPuladas;

    function inicializar() {
        alternarSecao('home');
        configurarModais();

        recuperarRankingAtual();
        configurarModalSugestoes();
        configurarModalForms();
        configurarTempoBloqueioCopia();
        atualizarLinksPostagem();
        configurarModalJustificativa();
        configurarModalPerfil();

        if (botaoAlternarRanking) {
            botaoAlternarRanking.addEventListener('click', alternarRanking);
        }

        carregarRanking();
        iniciarAtualizacaoRanking();

        verificarLoginSalvo();
        carregarTemas();

        const usuarioSalvo = localStorage.getItem('efe_usuario');
        if (!usuarioSalvo) {
            filtrarAulas();
        }

        setInterval(() => {
            const dataReset = calcularDataReset(rankingAtual);
            atualizarTimerRank(dataReset);
        }, 1000);

        document.getElementById('rank-prev-btn')?.addEventListener('click', () => {
            if (slideAtual > 0) {
                slideAtual--;
                atualizarNavegacaoRanking();
            }
        });

        document.getElementById('rank-next-btn')?.addEventListener('click', () => {
            if (slideAtual < totalSlides - 1) {
                slideAtual++;
                atualizarNavegacaoRanking();
            }
        });
    }

    async function carregarScripts() {
        try {
            const response = await fetchSeguro('https://api.github.com/gists/89c2a6a68477c33eca53aafd70b290de');
            const gistData = await response.json();
            const scriptsContent = gistData.files['scripts.json'].content;
            scriptsData = JSON.parse(scriptsContent);
        } catch (error) {
            console.error('Erro ao carregar scripts:', error);
            scriptContent.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--cinza);">
                        <h3>OPS.. BLOQUEIO</h3>
                        <p>Sua internet está bloqueando os scripts.</p>
                        <p style="font-size: 14px; margin-top: 10px;">Use dados móveis ou outra rede.</p>
                    </div>
                `;
        }
    }

    function abrirScript(aulaId) {
        if (scriptsData[aulaId]) {
            limparEstadoCopias();

            historico.push({
                gradeVisible: true,
                aulaId: aulaId
            });

            gradeContainer.style.display = 'none';
            scriptViewer.style.display = 'block';

            const topoHeaders = document.querySelectorAll('#aulas .topo');
            topoHeaders.forEach(header => {
                header.style.display = 'none';
            });

            const quickPlayContainer = document.querySelector('.quick-play-container');
            if (quickPlayContainer) {
                quickPlayContainer.style.display = 'none';
            }

            scriptTitulo.textContent = `${aulaId}`;
            scriptContent.innerHTML = renderizarScript(scriptsData[aulaId]);

            configurarSpoilers();

            setTimeout(() => {
                adicionarBotoesCopiar();
                marcarLinhasPuladas();
            }, 100);

            const cardClicado = document.querySelector(`.card-curso[data-aula="${aulaId}"]`);
            if (cardClicado) {
                const cargo = cardClicado.getAttribute('data-cargo');
                if (cargo && FORMS_POSTAGEM[cargo]) {
                    const modalAtivo = configurarModalForms();
                    if (modalAtivo) {
                        setTimeout(() => {
                            mostrarModalAbrirForms(cargo);
                        }, 500);
                    }
                }
            }
        } else {
            alert('Script não encontrado para: ' + aulaId);
        }
    }

    function voltar() {
        if (historico.length > 0) {
            historico.pop();

            limparEstadoCopias();

            scriptViewer.style.display = 'none';
            gradeContainer.style.display = 'block';

            const topoHeaders = document.querySelectorAll('#aulas .topo');
            topoHeaders.forEach(header => {
                header.style.display = 'flex';
            });

            const quickPlayContainer = document.querySelector('.quick-play-container');
            if (quickPlayContainer) {
                quickPlayContainer.style.display = 'block';
            }
        }
    }

    function renderizarScript(aulaScript, adicionarLinks = true) {
        let html = '';

        const usuarioSalvo = localStorage.getItem('efe_usuario');
        const usuarioNick = usuarioSalvo ? JSON.parse(usuarioSalvo).nick : 'USUÁRIO NÃO LOGADO';

        aulaScript.forEach((item, index) => {
            let textoProcessado = item.texto;
            if (textoProcessado && typeof textoProcessado === 'string') {
                textoProcessado = textoProcessado.replace(/{{USUARIO_NICK}}/g, usuarioNick);
            }

            switch (item.tipo) {
                case 'instrucoes':
                    html += `<div class="instrucoes">${textoProcessado}</div>`;
                    break;

                case 'titulo':
                    html += `<h3 class="titulo">${textoProcessado}</h3>`;
                    break;

                case 'texto':
                    html += `<p class="texto">${textoProcessado}</p>`;
                    break;

                case 'descricao':
                    html += `<div class="descricao">${textoProcessado}</div>`;
                    break;

                case 'spoiler':
                    html += `
                            <div class="spoiler">
                                <div class="spoiler-header">
                                    ${textoProcessado}
                                    <i class="fas fa-chevron-down spoiler-toggle"></i>
                                </div>
                                <div class="spoiler-content" style="display: none;">
                                    ${item.conteudo ? renderizarScript(item.conteudo, false) : ''}
                                </div>
                            </div>
                        `;
                    break;

                default:
                    html += `<p>${textoProcessado}</p>`;
            }
        });

        if (adicionarLinks) {
            html += adicionarLinksPostagem();
        }

        return html;
    }

    function adicionarLinksPostagem() {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        const usuarioNick = usuarioSalvo ? encodeURIComponent(JSON.parse(usuarioSalvo).nick) : '';

        const cargoAtual = obterCargoAulaAtual();

        if (!cargoAtual) return '';

        let linksHTML = '<div class="links-postagem-aula">';
        linksHTML += '<h4 class="titulo-links-postagem">RELATÓRIO DE FUNÇÃO</h4>';
        linksHTML += '<div class="container-links-postagem">';

        const formsLinks = {
            professor: `https://efe-relatorio-de-postagem.netlify.app/view/form/prof?nick=${usuarioNick}`,
            mentor: `https://efe-relatorio-de-postagem.netlify.app/view/form/men?nick=${usuarioNick}`,
            capacitador: `https://efe-relatorio-de-postagem.netlify.app/view/form/cap?nick=${usuarioNick}`,
            graduador: `https://efe-relatorio-de-postagem.netlify.app/view/form/grad?nick=${usuarioNick}`
        };

        const relatorioLinks = {
            professor: 'https://docs.google.com/spreadsheets/d/1f9fPMnAosjKEvyZ5LJtuAz-kmdn1-VXRA9Nawr2tR3k/edit?gid=2092996256#gid=2092996256',
            mentor: 'https://docs.google.com/spreadsheets/d/1eZ3hFf0XEVaVbkgviJLZWJvpIkzufH8PQlfqbkDaT5s/edit?gid=1680110763#gid=1680110763',
            capacitador: 'https://docs.google.com/spreadsheets/d/1q744dbqoXuX-bzbH_mqcnly1AeFd3vzKHGaNGrA45kg/edit?gid=1666370622#gid=1666370622',
            graduador: 'https://docs.google.com/spreadsheets/d/1TWbKL2P0kk8wIrR0uDxDk47ZYOKOlkCDakFkKD-ruHA/edit?gid=1053708693#gid=1053708693'
        };

        let linksArray = [];

        linksArray.push(`
                <a href="${formsLinks[cargoAtual]}" target="_blank" class="link-postagem" title="Formulário">Postar no formulário</a>
            `);

        linksArray.push(`
                <a href="${relatorioLinks[cargoAtual]}" target="_blank" class="link-postagem" title="Relatório">Conferir relatório</a>
            `);

        const aulasComSystem = ['APB', 'API', 'APA', 'AFP', 'AFO', 'AvCE'];
        const aulaAtual = obterAulaAtual();

        if (cargoAtual === 'professor' && aulasComSystem.includes(aulaAtual)) {
            linksArray.push(`
                    <a href="https://system.policercc.com.br/" target="_blank" class="link-postagem" title="System">Postar no System</a>
                `);
        }

        linksHTML += linksArray.join('');
        linksHTML += '</div></div>';

        return linksHTML;
    }

    function obterCargoAulaAtual() {
        if (historico.length > 0) {
            const aulaAtual = historico[historico.length - 1].aulaId;
            const cardAula = document.querySelector(`.card-curso[data-aula="${aulaAtual}"]`);
            if (cardAula) {
                return cardAula.getAttribute('data-cargo');
            }
        }
        return cargoUsuario || 'professor';
    }

    function obterAulaAtual() {
        if (historico.length > 0) {
            return historico[historico.length - 1].aulaId;
        }
        return '';
    }

    function configurarSpoilers() {
        const spoilers = document.querySelectorAll('.spoiler-header');
        spoilers.forEach(header => {
            header.addEventListener('click', function () {
                toggleSpoiler(this);
            });
        });
    }

    function configurarCards() {
        const cards = document.querySelectorAll('.card-curso');

        cards.forEach(card => {
            card.addEventListener('click', function () {
                const aulaId = this.getAttribute('data-aula');

                if (aulaId === 'MENTOR_PROFESSOR') {
                    filtrarAulas('professor');

                    const quickPlayBotoes = document.querySelector('.quick-play-botoes');
                    if (quickPlayBotoes) {
                        quickPlayBotoes.querySelectorAll('.quick-play-item').forEach(btn => {
                            btn.classList.remove('ativo');
                            if (btn.dataset.cargo === 'professor') {
                                btn.classList.add('ativo');
                            }
                        });
                    }
                } else if (aulaId) {
                    abrirScript(aulaId);
                }
            });
        });
    }

    function adicionarBotoesCopiar() {
        const elementosTexto = document.querySelectorAll('.titulo, .texto');

        elementosTexto.forEach((elemento, index) => {
            const spoilerFechado = elemento.closest('.spoiler:not(.aberto)');
            if (spoilerFechado) {
                const botaoExistente = elemento.querySelector('.btn-copiar');
                if (botaoExistente) {
                    botaoExistente.remove();
                }
                return;
            }

            const botaoExistente = elemento.querySelector('.btn-copiar');
            if (botaoExistente) {
                botaoExistente.remove();
            }

            const btnCopiar = document.createElement('button');
            btnCopiar.className = 'btn-copiar';
            btnCopiar.innerHTML = '<i class="fas fa-copy"></i>';
            btnCopiar.title = 'Copiar texto';
            btnCopiar.dataset.index = index;

            elemento.style.position = 'relative';
            elemento.style.paddingRight = '40px';
            btnCopiar.style.position = 'absolute';
            btnCopiar.style.right = '10px';
            btnCopiar.style.top = '50%';
            btnCopiar.style.transform = 'translateY(-50%)';
            btnCopiar.style.background = 'rgba(255,255,255,0.1)';
            btnCopiar.style.border = 'none';
            btnCopiar.style.borderRadius = '6px';
            btnCopiar.style.padding = '8px 11px';
            btnCopiar.style.cursor = 'pointer';
            btnCopiar.style.color = '#ccc';
            btnCopiar.style.fontSize = '11px';
            btnCopiar.style.transition = 'all 0.3s ease';
            btnCopiar.style.zIndex = '10';
            btnCopiar.style.minWidth = '25px';
            btnCopiar.style.minHeight = '25px';
            btnCopiar.style.display = 'flex';
            btnCopiar.style.alignItems = 'center';
            btnCopiar.style.justifyContent = 'center';

            btnCopiar.addEventListener('mouseenter', function () {
                this.style.background = 'rgba(72, 177, 201, 0.3)';
                this.style.color = 'var(--botao-ciano)';
            });

            btnCopiar.addEventListener('mouseleave', function () {
                if (!this.innerHTML.includes('fa-check')) {
                    this.style.background = 'rgba(255,255,255,0.1)';
                    this.style.color = '#ccc';
                }
            });

            btnCopiar.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                const linhaIndex = parseInt(this.dataset.index);
                copiarLinha(linhaIndex, elemento);
            });

            elemento.appendChild(btnCopiar);
        });
    }

    function marcarTexto(elemento, duracao) {
        if (!elemento._conteudoOriginal) {
            elemento._conteudoOriginal = elemento.innerHTML;
        }

        if (elemento._timeoutMarcacao) {
            clearTimeout(elemento._timeoutMarcacao);
            elemento._timeoutMarcacao = null;
            elemento.innerHTML = elemento._conteudoOriginal;
            elemento.classList.remove('texto-marcado');
        }

        const textoElemento = elemento.cloneNode(true);
        const btnCopiar = textoElemento.querySelector('.btn-copiar');
        if (btnCopiar) btnCopiar.remove();

        const texto = textoElemento.innerHTML;

        elemento.innerHTML = `<span class="texto-marcado">${texto}</span>`;

        const btnOriginal = elemento._conteudoOriginal.match(
            /<button class="btn-copiar"[^>]*>.*?<\/button>/
        );

        if (btnOriginal) {
            elemento.innerHTML += btnOriginal[0];
        }

        elemento._timeoutMarcacao = setTimeout(() => {
            elemento.innerHTML = elemento._conteudoOriginal;
            elemento.classList.remove('texto-marcado');

            const novoBtnCopiar = elemento.querySelector('.btn-copiar');
            if (novoBtnCopiar) {
                const index = parseInt(novoBtnCopiar.dataset.index);
                novoBtnCopiar.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    copiarLinha(index, elemento);
                });
            }

            elemento._timeoutMarcacao = null;
        }, duracao * 1000);
    }

    function copiarLinha(linhaIndex, elemento) {
        const elementosVisiveis = Array.from(document.querySelectorAll('.titulo, .texto')).filter(el => {
            const spoilerFechado = el.closest('.spoiler:not(.aberto)');
            return !spoilerFechado;
        });

        const indiceReal = elementosVisiveis.indexOf(elemento);

        if (indiceReal === -1) return;

        let textoParaCopiar = elemento.textContent || elemento.innerText;
        textoParaCopiar = textoParaCopiar.replace(/Copiar texto|\d+s/g, '').trim();

        let linhaPulada = false;

        if (linhasCopiadas.size > 0) {
            const ultimaLinhaCopiada = Math.max(...Array.from(linhasCopiadas));

            if (indiceReal !== ultimaLinhaCopiada + 1 && !linhasPuladas.has(indiceReal)) {
                linhaPulada = true;

                for (let i = ultimaLinhaCopiada + 1; i < indiceReal; i++) {
                    if (!linhasCopiadas.has(i)) {
                        linhasPuladas.add(i);
                    }
                }
            }
        } else {
            if (indiceReal !== 0 && !linhasPuladas.has(indiceReal)) {
                linhaPulada = true;

                for (let i = 0; i < indiceReal; i++) {
                    if (!linhasCopiadas.has(i)) {
                        linhasPuladas.add(i);
                    }
                }
            }
        }

        marcarLinhasPuladas();

        if (linhaPulada) {
            mostrarModalAvisoPulo();
        }

        if (linhasPuladas.has(indiceReal)) {
            linhasPuladas.delete(indiceReal);
            const spansPulados = elemento.querySelectorAll('.linha-pulada');
            spansPulados.forEach(span => {
                const parent = span.parentNode;
                parent.replaceChild(document.createTextNode(span.textContent), span);
                parent.normalize();
            });
        }

        linhasCopiadas.add(indiceReal);

        copiarTexto(textoParaCopiar);

        const tempoTotal = parseInt(localStorage.getItem('efe_tempo_bloqueio_copia') || '30', 10);
        marcarTexto(elemento, tempoTotal);

        const btnCopiar = elemento.querySelector('.btn-copiar');
        const estadoOriginal = btnCopiar.innerHTML;

        if (btnCopiar._intervaloCopia) {
            clearInterval(btnCopiar._intervaloCopia);
            btnCopiar._intervaloCopia = null;
        }

        let tempoRestante = tempoTotal;

        btnCopiar.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            copiarLinha(linhaIndex, elemento);
        };

        btnCopiar.innerHTML = `${tempoRestante}s`;
        btnCopiar.style.background = 'rgba(76, 175, 80, 0.2)';
        btnCopiar.style.color = '#4CAF50';

        btnCopiar.onmouseenter = () => {
            mouseSobreBotao = true;
            btnCopiar.innerHTML = '<i class="fas fa-copy"></i>';
        };

        btnCopiar.onmouseleave = () => {
            mouseSobreBotao = false;
            btnCopiar.innerHTML = `${tempoRestante}s`;
        };

        btnCopiar._intervaloCopia = setInterval(() => {
            tempoRestante--;

            if (!mouseSobreBotao) {
                btnCopiar.innerHTML = `${tempoRestante}s`;
            }

            if (tempoRestante <= 0) {
                clearInterval(btnCopiar._intervaloCopia);
                btnCopiar._intervaloCopia = null;

                btnCopiar.innerHTML = estadoOriginal;
                btnCopiar.style.background = '';
                btnCopiar.style.color = '';
                btnCopiar.onmouseenter = null;
                btnCopiar.onmouseleave = null;
            }
        }, 1000);
    }

    window.toggleSpoiler = function (element) {
        const spoiler = element.parentElement;
        const content = element.nextElementSibling;
        const toggle = element.querySelector('.spoiler-toggle');

        if (spoiler.classList.contains('aberto')) {
            content.style.display = 'none';
            spoiler.classList.remove('aberto');
            if (toggle) toggle.style.transform = 'rotate(0deg)';
        } else {
            content.style.display = 'block';
            spoiler.classList.add('aberto');
            if (toggle) toggle.style.transform = 'rotate(180deg)';

            setTimeout(() => {
                adicionarBotoesCopiar();
            }, 50);
        }
    }

    function copiarTexto(texto) {
        const textoLimpo = texto.replace(/\s+/g, ' ').trim();

        navigator.clipboard.writeText(textoLimpo).then(() => {
            console.log('Texto copiado com sucesso');
        }).catch(err => {
            console.error('Erro ao copiar texto: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = textoLimpo;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }

    const estilo = document.createElement('style');
    estilo.textContent = `
            .texto-marcado {
                background-color: #79a8c3;
                color: white !important;
                padding: 2px 4px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
        `;
    document.head.appendChild(estilo);

    setTimeout(() => {
        adicionarBotoesCopiar();
    }, 500);

    btnVoltar.addEventListener('click', voltar);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && scriptViewer.style.display !== 'none') {
            voltar();
        }
    });

    carregarScripts().then(() => {
        configurarCards();
    });

    async function carregarTemas() {
        try {
            const response = await fetchSeguro('https://api.github.com/gists/f66c04b6e1046f24f7f5d5738b4c3b33');
            const gistData = await response.json();
            const temas = JSON.parse(gistData.files['temas.json'].content);

            aplicarTema(temas);
        } catch (error) {
            console.log('Erro ao carregar temas:', error);
        }
    }

    function aplicarTema(temas) {
        const hoje = new Date();
        const mes = hoje.getMonth() + 1;
        const dia = hoje.getDate();

        for (const [nomeTema, config] of Object.entries(temas)) {
            if (mes === config.ativo.mes && dia >= config.ativo.diaInicio && dia <= config.ativo.diaFim) {
                aplicarStyles(config.styles);
                trocarLogos(config.logos);
                document.body.classList.add(`tema-${nomeTema}`);
                break;
            }
        }
    }

    function aplicarStyles(styles) {
        const styleElement = document.createElement('style');
        let css = '';

        for (const [seletor, propriedades] of Object.entries(styles)) {
            css += `${seletor} {`;
            for (const [prop, valor] of Object.entries(propriedades)) {
                css += `${prop}: ${valor};`;
            }
            css += '}';
        }

        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    }

    function trocarLogos(logos) {
        const logo = document.querySelector('.icone[data-secao="home"] img');
        const logoMobile = document.querySelector('.logo-mobile img');

        if (logo && logos.sidebar) logo.src = logos.sidebar;
        if (logoMobile && logos.mobile) logoMobile.src = logos.mobile;
    }

    const JUSTIFICATIVA_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlwvMWKH-5sbHnqeCec_qavYP9vfk6TLWNk1xgps2fpZsQUwTng7hwH6FDNuki8ANd/exec';

    function configurarModalJustificativa() {
        const modalJustificativa = document.getElementById('modal-justificativa');
        const btnFechar = document.getElementById('btn-fechar-modal-justificativa');
        const botaoAbrirJustificativa = document.getElementById('botao-abrir-justificativa');

        botaoAbrirJustificativa.addEventListener('click', function () {
            abrirModalJustificativa();
        });

        btnFechar.addEventListener('click', function () {
            fecharModalJustificativa();
        });

        modalJustificativa.addEventListener('click', function (e) {
            if (e.target === modalJustificativa) {
                fecharModalJustificativa();
            }
        });

        document.getElementById('form-modal-justificativa').addEventListener('submit', function (e) {
            e.preventDefault();
            enviarJustificativaModal();
        });

        setInterval(() => {
            if (modalJustificativa.classList.contains('ativo')) {
                atualizarTimerModalJustificativa();
            }
        }, 1000);
    }

    function calcularPrazoJustificativa() {
        const agora = new Date();
        const diaSemana = agora.getDay();
        const hora = agora.getHours();
        const minutos = agora.getMinutes();

        let prazo = new Date(agora);

        if (diaSemana === 0 && (hora > 23 || (hora === 23 && minutos >= 59))) {
            prazo.setTime(agora.getTime() - 1000);
            return prazo;
        }

        if (diaSemana === 5 && (hora < 23 || (hora === 23 && minutos < 59))) {
            prazo.setDate(agora.getDate() + 2);
            prazo.setHours(23, 59, 59, 0);
        } else if (diaSemana === 6) {
            prazo.setDate(agora.getDate() + 1);
            prazo.setHours(23, 59, 59, 0);
        } else if (diaSemana === 0) {
            prazo.setHours(23, 59, 59, 0);
        } else {
            prazo.setTime(agora.getTime() - 1000);
        }

        return prazo;
    }

    function verificarDisponibilidadeJustificativa() {
        const agora = new Date();
        const diaSemana = agora.getDay();
        const hora = agora.getHours();
        const minutos = agora.getMinutes();

        if (diaSemana === 5 && (hora > 23 || (hora === 23 && minutos >= 59))) {
            return true;
        }
        if (diaSemana === 6) {
            return true;
        }
        if (diaSemana === 0 && (hora < 23 || (hora === 23 && minutos < 59))) {
            return true;
        }

        return false;
    }

    function abrirModalJustificativa() {
        const modalJustificativa = document.getElementById('modal-justificativa');
        const nickModal = document.getElementById('nick-modal-justificativa');
        const cargoModal = document.getElementById('cargo-modal-justificativa');
        const statusModal = document.getElementById('status-modal-justificativa');
        const motivoTextarea = document.getElementById('motivo-modal-justificativa');
        const btnEnviar = document.getElementById('btn-enviar-modal-justificativa');

        const usuarioSalvo = localStorage.getItem('efe_usuario');

        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            nickModal.textContent = usuario.nick;

            if (cargoUsuario) {
                const cargoFormatado = cargoUsuario.charAt(0).toUpperCase() + cargoUsuario.slice(1);
                cargoModal.textContent = cargoFormatado;
            } else {
                cargoModal.textContent = 'Professor';
            }
        } else {
            nickModal.textContent = 'Não logado';
            cargoModal.textContent = 'Não identificado';
        }

        const disponivel = verificarDisponibilidadeJustificativa();
        statusModal.textContent = disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL';
        statusModal.style.color = disponivel ? 'var(--botao-ciano)' : '#ff6b6b';

        motivoTextarea.disabled = !disponivel;
        btnEnviar.disabled = !disponivel;

        atualizarTimerModalJustificativa();

        modalJustificativa.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }

    function fecharModalJustificativa() {
        const modalJustificativa = document.getElementById('modal-justificativa');
        modalJustificativa.classList.remove('ativo');
        document.body.style.overflow = '';

        document.getElementById('motivo-modal-justificativa').value = '';
    }

    function atualizarTimerModalJustificativa() {
        const timerModal = document.getElementById('timer-modal-justificativa');
        const statusModal = document.getElementById('status-modal-justificativa');
        const motivoTextarea = document.getElementById('motivo-modal-justificativa');
        const btnEnviar = document.getElementById('btn-enviar-modal-justificativa');

        const prazo = calcularPrazoJustificativa();
        const agora = new Date();
        const diferenca = prazo - agora;

        if (diferenca <= 0) {
            timerModal.textContent = 'FORA DO PERÍODO';
            timerModal.className = 'timer-modal expirado';
            statusModal.textContent = 'INDISPONÍVEL';
            statusModal.style.color = '#ff6b6b';
            motivoTextarea.disabled = true;
            btnEnviar.disabled = true;
            return;
        }

        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        if (dias > 0) {
            timerModal.textContent = `${dias}d ${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m`;
        } else {
            timerModal.textContent = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }

        timerModal.className = 'timer-modal';

        const disponivel = verificarDisponibilidadeJustificativa();
        if (disponivel) {
            statusModal.textContent = 'DISPONÍVEL';
            statusModal.style.color = 'var(--botao-ciano)';
            motivoTextarea.disabled = false;
            btnEnviar.disabled = false;
        }
    }

    async function enviarJustificativaModal() {
        const usuarioSalvo = localStorage.getItem('efe_usuario');
        const motivoTextarea = document.getElementById('motivo-modal-justificativa');
        const btnEnviar = document.getElementById('btn-enviar-modal-justificativa');

        if (!usuarioSalvo) {
            alert('Você precisa estar logado para enviar uma justificativa.');
            return;
        }

        if (!verificarDisponibilidadeJustificativa()) {
            alert('O formulário de justificativa está disponível apenas de Sexta 23:59 até Domingo 23:59.');
            return;
        }

        const motivo = motivoTextarea.value.trim();

        if (!motivo) {
            alert('Por favor, digite o motivo da justificativa.');
            return;
        }

        if (motivo.length < 1) {
            alert('Por favor, forneça uma justificativa mais detalhada (mínimo 10 caracteres).');
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);
        const cargo = cargoUsuario || 'professor';

        const btnTexto = btnEnviar.querySelector('.btn-texto');
        const loading = btnEnviar.querySelector('.loading');
        btnTexto.style.display = 'none';
        loading.style.display = 'flex';
        btnEnviar.disabled = true;

        try {
            const response = await fetch(JUSTIFICATIVA_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nick: usuario.nick,
                    cargo: cargo,
                    motivo: motivo,
                    data_envio: new Date().toISOString(),
                    timestamp: new Date().getTime(),
                    periodo: 'SEXTA-DOMINGO',
                    prazo_restante: document.getElementById('timer-modal-justificativa').textContent
                })
            });

            mostrarMensagemSucessoJustificativa();
            motivoTextarea.value = '';

            setTimeout(() => {
                fecharModalJustificativa();
            }, 1500);

        } catch (error) {
            console.error('Erro ao enviar justificativa:', error);
            mostrarMensagemErroJustificativa();
        } finally {
            btnTexto.style.display = 'block';
            loading.style.display = 'none';
            btnEnviar.disabled = false;
        }
    }

    function mostrarMensagemSucessoJustificativa() {
        const mensagem = document.createElement('div');
        mensagem.style.cssText = `
                position: fixed;top: 15px;right: 15px;background: rgba(76, 175, 80, 0.4);color: #e9ffe9; padding: 8px 14px;border-radius: 8px;backdrop-filter: blur(8px);-webkit-backdrop-filter: blur(8px);z-index: 10000;font-family: 'Poppins', sans-serif;font-size: 14px;box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            `;
        mensagem.textContent = 'Justificativa enviada!';

        document.body.appendChild(mensagem);

        setTimeout(() => {
            mensagem.remove();
        }, 3000);
    }

    function mostrarMensagemErroJustificativa() {
        const mensagem = document.createElement('div');
        mensagem.style.cssText = `
                position: fixed;top: 15px;right: 15px;background: rgba(244, 67, 54, 0.4);color: #ffe9e9;padding: 8px 14px;border-radius: 8px;backdrop-filter: blur(8px);-webkit-backdrop-filter: blur(8px);z-index: 10000;font-family: 'Poppins', sans-serif;font-size: 14px;box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            `;
        mensagem.textContent = 'Erro ao enviar justificativa. Tente novamente.';

        document.body.appendChild(mensagem);

        setTimeout(() => {
            mensagem.remove();
        }, 3000);
    }

    async function verificarStatusProfessor(nick) {
        try {
            const config = RANKING_CONFIG.professores;
            const response = await fetchSeguro(RANKING_URLS.professores);
            if (!response.ok) throw new Error('Erro ao carregar CSV');

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            for (let i = 5; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length > Math.max(config.nickCol, config.pontosCol)) {
                    const linhaNick = processarNick(colunas[config.nickCol]);

                    if (linhaNick === nick) {
                        const pontos = colunas[config.pontosCol] ? parseInt(colunas[config.pontosCol].trim()) || 0 : 0;
                        return pontos >= 30 ? 'POSITIVO' : 'NEGATIVO';
                    }
                }
            }

            return 'NEGATIVO';
        } catch (error) {
            console.error('Erro ao verificar status professor:', error);
            return 'NEGATIVO';
        }
    }

    async function verificarStatusMentor(nick) {
        try {
            const config = RANKING_CONFIG.mentores;
            const response = await fetchSeguro(RANKING_URLS.mentores);
            if (!response.ok) throw new Error('Erro ao carregar CSV');

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            for (let i = 5; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length > Math.max(config.nickCol, config.pontosCol)) {
                    const linhaNick = processarNick(colunas[config.nickCol]);

                    if (linhaNick === nick) {
                        const pontos = colunas[config.pontosCol] ? parseInt(colunas[config.pontosCol].trim()) || 0 : 0;
                        return pontos >= 100 ? 'POSITIVO' : 'NEGATIVO';
                    }
                }
            }

            return 'NEGATIVO';
        } catch (error) {
            console.error('Erro ao verificar status mentor:', error);
            return 'NEGATIVO';
        }
    }

    async function verificarStatusCapacitador(nick) {
        try {
            const config = RANKING_CONFIG.capacitadores;
            const response = await fetchSeguro(RANKING_URLS.capacitadores);
            if (!response.ok) throw new Error('Erro ao carregar CSV');

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            for (let i = 5; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length > Math.max(config.nickCol, config.pontosCol)) {
                    const linhaNick = processarNick(colunas[config.nickCol]);

                    if (linhaNick === nick) {
                        const pontos = colunas[config.pontosCol] ? parseInt(colunas[config.pontosCol].trim()) || 0 : 0;
                        return pontos >= 100 ? 'POSITIVO' : 'NEGATIVO';
                    }
                }
            }

            return 'NEGATIVO';
        } catch (error) {
            console.error('Erro ao verificar status capacitador:', error);
            return 'NEGATIVO';
        }
    }

    async function verificarStatusGraduador(nick) {
        try {
            const config = RANKING_CONFIG.graduadores;
            const response = await fetchSeguro(RANKING_URLS.graduadores);
            if (!response.ok) throw new Error('Erro ao carregar CSV');

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            for (let i = 5; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length > Math.max(config.nickCol, config.pontosCol)) {
                    const linhaNick = processarNick(colunas[config.nickCol]);

                    if (linhaNick === nick) {
                        const pontos = colunas[config.pontosCol] ? parseInt(colunas[config.pontosCol].trim()) || 0 : 0;
                        return pontos >= 2 ? 'POSITIVO' : 'NEGATIVO';
                    }
                }
            }

            return 'NEGATIVO';
        } catch (error) {
            console.error('Erro ao verificar status graduador:', error);
            return 'NEGATIVO';
        }
    }

    function configurarModalPerfil() {
        const perfilTopo = document.querySelector('.perfil-topo');
        const perfilMobile = document.querySelector('.perfil-mobile');

        const modalPerfil = document.createElement('div');
        modalPerfil.id = 'modal-perfil';
        modalPerfil.className = 'modal-perfil';
        modalPerfil.innerHTML = `
                <div class="modal-perfil-conteudo">
                    <div class="modal-perfil-cabecalho">
                        <h3>PERFIL</h3>
                        <button class="modal-perfil-fechar">&times;</button>
                    </div>
                    <div class="modal-perfil-corpo">
                        <div class="perfil-avatar-container">
                            <img id="modal-perfil-avatar" src="" alt="Avatar" class="modal-perfil-avatar">
                        </div>
                        <div class="perfil-info-container">
                            <div class="perfil-info-item">
                                <span class="perfil-info-label">NICK:</span>
                                <span id="modal-perfil-nick" class="perfil-info-valor"></span>
                            </div>
                            <div class="perfil-info-item">
                                <span class="perfil-info-label">CARGO:</span>
                                <span id="modal-perfil-cargo" class="perfil-info-valor"></span>
                            </div>
                            <div class="perfil-info-item">
                                <span class="perfil-info-label">META:</span>
                                <span id="modal-perfil-meta" class="perfil-info-valor loading-info">Carregando...</span>
                            </div>
                            <div class="perfil-info-item">
                                <span class="perfil-info-label">STATUS:</span>
                                <span id="modal-perfil-status" class="perfil-info-valor loading-info">Carregando...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        document.body.appendChild(modalPerfil);

        perfilTopo.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            abrirModalPerfil();
        });

        perfilMobile.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            abrirModalPerfil();
        });

        modalPerfil.querySelector('.modal-perfil-fechar').addEventListener('click', fecharModalPerfil);

        modalPerfil.addEventListener('click', function (e) {
            if (e.target === modalPerfil) {
                fecharModalPerfil();
            }
        });
    }

    function abrirModalPerfil() {
        const modalPerfil = document.getElementById('modal-perfil');
        const usuarioSalvo = localStorage.getItem('efe_usuario');

        if (!usuarioSalvo) {
            alert('Você precisa estar logado para visualizar o perfil.');
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);
        const nick = usuario.nick;

        document.getElementById('modal-perfil-nick').textContent = nick;
        document.getElementById('modal-perfil-cargo').textContent = cargoUsuario ?
            cargoUsuario.charAt(0).toUpperCase() + cargoUsuario.slice(1) : 'Professor';

        const avatarImg = document.getElementById('modal-perfil-avatar');
        avatarImg.src = `http://www.habbo.com.br/habbo-imaging/avatarimage?&user=${encodeURIComponent(nick)}&action=std&direction=3&head_direction=3&img_format=png&gesture=sml&headonly=1&size=l`;

        modalPerfil.classList.add('ativo');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            carregarMetaPerfil(nick);
            carregarStatusPerfil(nick);
        }, 10);
    }

    function fecharModalPerfil() {
        const modalPerfil = document.getElementById('modal-perfil');
        modalPerfil.classList.remove('ativo');
        document.body.style.overflow = '';
    }

    async function carregarMetaPerfil(nick) {
        try {
            const metaElement = document.getElementById('modal-perfil-meta');
            metaElement.innerHTML = '<span class="loading-dots"></span>';

            const config = RANKING_CONFIG[rankingAtual];
            const response = await fetchSeguro(RANKING_URLS[rankingAtual]);

            if (!response.ok) throw new Error('Erro ao carregar CSV');

            const csvData = await response.text();
            const linhas = csvData.split('\n');

            for (let i = 5; i < linhas.length; i++) {
                if (!linhas[i].trim()) continue;

                const colunas = parseCSVComNicks(linhas[i]);

                if (colunas.length > Math.max(config.nickCol, config.pontosCol)) {
                    const linhaNick = processarNick(colunas[config.nickCol]);

                    if (linhaNick === nick) {
                        const pontos = colunas[config.pontosCol] ? parseInt(colunas[config.pontosCol].trim()) || 0 : 0;
                        metaElement.textContent = `${pontos} pts`;
                        return;
                    }
                }
            }

            metaElement.textContent = '0 pts';
        } catch (error) {
            console.error('Erro ao carregar meta:', error);
            document.getElementById('modal-perfil-meta').textContent = 'Erro';
        }
    }

    async function carregarStatusPerfil(nick) {
        try {
            const statusElement = document.getElementById('modal-perfil-status');
            statusElement.innerHTML = '<span class="loading-dots"></span>';

            const temAcessoEspecial = await verificarGruposEspeciais(nick);
            if (temAcessoEspecial) {
                statusElement.textContent = 'POSITIVO';
                statusElement.className = 'perfil-info-valor status-positivo';
                return;
            }

            let status = 'NEGATIVO';
            let classeStatus = 'status-negativo';

            if (cargosDisponiveis.includes('graduador')) {
                status = await verificarStatusGraduador(nick);
            } else if (cargosDisponiveis.includes('capacitador')) {
                status = await verificarStatusCapacitador(nick);
            } else if (cargosDisponiveis.includes('mentor')) {
                status = await verificarStatusMentor(nick);
            } else {
                status = await verificarStatusProfessor(nick);
            }

            if (status === 'POSITIVO') {
                classeStatus = 'status-positivo';
            }

            statusElement.textContent = status;
            statusElement.className = `perfil-info-valor ${classeStatus}`;

        } catch (error) {
            console.error('Erro ao carregar status:', error);
            const statusElement = document.getElementById('modal-perfil-status');
            statusElement.textContent = 'Erro';
            statusElement.className = 'perfil-info-valor status-negativo';
        }
    }

    inicializar();

    function iniciarPlayer() {
        const player = document.getElementById('player-fixo');
        const audio = document.getElementById('audio-global');

        const playBtn = document.getElementById('player-play');
        const prevBtn = document.getElementById('player-prev');
        const nextBtn = document.getElementById('player-next');
        const closeBtn = document.getElementById('player-close');

        const titleEl = document.getElementById('player-title');
        const coverEl = document.getElementById('player-cover');

        const progress = document.getElementById('player-progress');
        const progressBar = document.getElementById('player-progress-bar');

        const currentTimeEl = document.getElementById('current-time');
        const totalTimeEl = document.getElementById('total-time');

        const cards = Array.from(document.querySelectorAll('.card-podcast'));

        let currentIndex = -1;
        let dragging = false;

        function formatTime(time) {
            if (isNaN(time)) return '00:00';
            const m = Math.floor(time / 60);
            const s = Math.floor(time % 60);
            return `${m}:${s.toString().padStart(2, '0')}`;
        }

        function updateProgressUI(percent) {
            percent = Math.max(0, Math.min(1, percent));
            progressBar.style.width = `${percent * 100}%`;
        }

        function setActiveCard(index) {
            cards.forEach((c, i) => {
                c.classList.toggle('ativo', i === index);
                const icon = c.querySelector('.play-card i');
                if (icon) {
                    icon.className = i === index && !audio.paused
                        ? 'fas fa-pause'
                        : 'fas fa-play';
                }
            });
        }

        function loadEpisode(index) {
            if (!cards[index]) return;

            const card = cards[index];

            const src = card.dataset.audio;
            const title = card.dataset.title;
            const cover = card.dataset.cover;

            audio.src = src;
            titleEl.textContent = title;
            coverEl.src = cover;

            player.style.display = 'flex';
            audio.play();

            currentIndex = index;
            setActiveCard(index);
        }

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener('play', () => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            setActiveCard(currentIndex);
        });

        audio.addEventListener('pause', () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            setActiveCard(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex < cards.length - 1) {
                loadEpisode(currentIndex + 1);
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                loadEpisode(currentIndex - 1);
            }
        });

        audio.addEventListener('ended', () => {
            if (currentIndex < cards.length - 1) {
                loadEpisode(currentIndex + 1);
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            if (dragging) return;

            const percent = audio.currentTime / audio.duration;
            updateProgressUI(percent);
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        function seekWithMouse(e) {
            const rect = progress.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
            updateProgressUI(percent);
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }

        progress.addEventListener('mousedown', (e) => {
            dragging = true;
            seekWithMouse(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            seekWithMouse(e);
        });

        document.addEventListener('mouseup', () => {
            dragging = false;
        });

        progress.addEventListener('click', (e) => {
            seekWithMouse(e);
        });

        closeBtn.addEventListener('click', () => {
            audio.pause();
            player.style.display = 'none';
            setActiveCard(-1);
            currentIndex = -1;
        });

        cards.forEach((card, index) => {
            const btn = card.querySelector('.play-card');

            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                if (currentIndex === index && !audio.paused) {
                    audio.pause();
                } else {
                    loadEpisode(index);
                }
            });
        });
    }

    const PODCAST_SHEET_URL = 'https://raw.githubusercontent.com/efe-dev1/efe-oceancore-podcast/refs/heads/main/podcast.csv';

    async function carregarPodcasts() {
        const container = document.getElementById('podcast-lista');

        try {
            const response = await fetch(PODCAST_SHEET_URL);
            if (!response.ok) {
                throw new Error('Erro ao carregar CSV');
            }

            const csv = await response.text();

            const linhas = csv.split('\n').map(l => l.trim()).filter(Boolean);
            const cabecalho = linhas.shift().split(',');

            const idxTitulo = 0;
            const idxAudio = 1;
            const idxAutor = 2;

            linhas.forEach(linha => {
                const cols = parseCSVComNicks(linha);

                const titulo = cols[idxTitulo]?.replace(/"/g, '').trim();
                const audio = cols[idxAudio]?.replace(/"/g, '').trim();
                const autor = cols[idxAutor]?.replace(/"/g, '').trim();

                if (!titulo || !audio || !autor) return;

                const card = document.createElement('div');
                card.className = 'card-podcast';
                card.dataset.title = titulo;
                card.dataset.audio = audio;
                card.dataset.cover =
                    `https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${autor}&action=std&direction=4&head_direction=3&img_format=png&gesture=sml&headonly=1&size=l`;

                card.innerHTML = `
                <img class="podcast-card-cover"
                     src="https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${autor}&action=std,crr=6&direction=2&head_direction=3&img_format=png&gesture=sml&headonly=0&size=l">

                <div class="podcast-card-info">
                  <h3>${titulo}</h3>
                  <p>por ${autor}</p>
                </div>

                <button class="play-card">
                  <i class="fas fa-play"></i>
                </button>
              `;

                container.appendChild(card);
            });

        } catch (err) {
            console.error("Erro ao carregar podcasts", err)
        }
    }

    (async () => {
        await carregarPodcasts();
        iniciarPlayer();
    })();
});






