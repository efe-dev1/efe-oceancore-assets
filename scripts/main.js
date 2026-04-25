document.addEventListener('DOMContentLoaded', function () {

            const GS_API_KEY = 'AIzaSyCpy7bGVYkINBv0TyCOGz8uzn2mzS2r7UQ';
            const SS_MAIN = '1RjTU4PSmYAqPPQQdtT3A2ngIfHiont6F1QmYH8ZqIAY';
            const SS_PROF_RANK = '1f9fPMnAosjKEvyZ5LJtuAz-kmdn1-VXRA9Nawr2tR3k';
            const SS_MENT_RANK = '1eZ3hFf0XEVaVbkgviJLZWJvpIkzufH8PQlfqbkDaT5s';
            const SS_GRAD_RANK = '1TWbKL2P0kk8wIrR0uDxDk47ZYOKOlkCDakFkKD-ruHA';
            const GS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwfcrXxS0JpdGoIGOnr8_RR98lYnzsbDYHrz-Zlvx1TgaB30Ti1MzvH_dfGn5BrmIwc/exec';
            const SUGESTOES_URL = GS_WEBAPP_URL;
            const JUSTIFICATIVA_URL = GS_WEBAPP_URL;
            const GS_PROF = GS_WEBAPP_URL;
            const GS_MENTOR = GS_WEBAPP_URL;
            const GS_GRAD = GS_WEBAPP_URL;

            let cargoUsuario = null;
            let cargosDisponiveis = [];
            let rankingAtual = 'professores';
            let rankDados = [];
            let scriptsData = {};
            let aulasData = [];
            let historico = [];
            let linhasCopiadas = new Set();
            let linhasPuladas = new Set();
            let aulaAtualAberta = null;
            let cargoAtualAberto = null;
            let docsCarregados = false;
            let rankLoaded = false;
            const PG_SIZE = 10;
            let pgAtual = 1;
            let timerJusti = null;
            let cargoAtualSidebar = null;

            async function gsGet(spreadsheetId, range) {
                const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${GS_API_KEY}`;
                const r = await fetch(url);
                if (!r.ok) throw new Error('GS error ' + r.status);
                const d = await r.json();
                return d.values || [];
            }

            function showToast(msg) {
                const t = document.createElement('div');
                t.className = 'toast'; t.textContent = msg;
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 3000);
            }

            function showScriptNotFound(msg) {
                const old = document.getElementById('_snf');
                if (old) old.remove();
                const el = document.createElement('div');
                el.id = '_snf'; el.className = 'script-notfound';
                el.innerHTML = `<div class="notfound-icon"><i class="ph ph-warning"></i></div><div class="notfound-text"><strong>${msg || 'Script não encontrado'}</strong><span>Verifique o intervalo na planilha</span></div>`;
                document.body.appendChild(el);
                setTimeout(() => { if (!el.parentNode) return; el.classList.add('hiding'); setTimeout(() => el.remove(), 380); }, 3000);
            }

            document.getElementById('anoFooter').textContent = new Date().getFullYear();

            function aplicarTema(theme) {
                document.documentElement.setAttribute('data-theme', theme === 'oceancore' ? '' : theme);
                localStorage.setItem('efe_tema', theme);
                document.querySelectorAll('.theme-tile').forEach(c => c.classList.toggle('active', c.dataset.theme === theme));
            }
            window.aplicarTema = aplicarTema;

            function aplicarHighlight(hl) {
                if (hl === 'default') {
                    document.documentElement.removeAttribute('data-highlight');
                } else {
                    document.documentElement.setAttribute('data-highlight', hl);
                }
                localStorage.setItem('efe_highlight', hl);
                document.querySelectorAll('.hl-btn').forEach(b => b.classList.toggle('active', b.dataset.hl === hl));
            }
            window.aplicarHighlight = aplicarHighlight;

            aplicarTema(localStorage.getItem('efe_tema') || 'oceancore');
            aplicarHighlight(localStorage.getItem('efe_highlight') || 'default');

            function abrirSettings(tab) {
                document.getElementById('settingsOverlay').classList.add('ativo');
                if (tab) trocarTabSettings(tab);
            }
            function fecharSettings() { document.getElementById('settingsOverlay').classList.remove('ativo'); }
            window.abrirSettings = abrirSettings;
            document.getElementById('settingsClose').onclick = fecharSettings;
            function trocarTabSettings(tab) {
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
                document.querySelectorAll('.settings-section').forEach(s => s.classList.toggle('active', s.id === 'settings-' + tab));
            }
            window.trocarTabSettings = trocarTabSettings;

            (function () {
                const overlay = document.getElementById('settingsOverlay');
                const panel = document.getElementById('settingsPanel');
                const drag = document.getElementById('settingsDrag');
                let startY = 0, currentY = 0, dragging = false;
                const limit = 140;
                function getPointY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
                function start(e) { dragging = true; startY = getPointY(e); panel.style.transition = 'none'; }
                function move(e) {
                    if (!dragging) return;
                    currentY = getPointY(e) - startY;
                    const ty = currentY > 0 ? currentY : currentY * 0.3;
                    panel.style.transform = `translateY(${ty}px)`;
                }
                function end() {
                    if (!dragging) return; dragging = false; panel.style.transition = '';
                    if (currentY > limit) { panel.style.transform = ''; fecharSettings(); }
                    else { panel.style.transform = ''; }
                    currentY = 0;
                }
                drag.addEventListener('mousedown', start);
                drag.addEventListener('touchstart', start, { passive: true });
                window.addEventListener('mousemove', move, { passive: true });
                window.addEventListener('touchmove', move, { passive: true });
                window.addEventListener('mouseup', end);
                window.addEventListener('touchend', end);
            })();

            const navProfileWrap = document.getElementById('navProfileWrap');
            document.getElementById('perfilMiniBtn').onclick = (e) => {
                e.stopPropagation();
                navProfileWrap.classList.toggle('open');
            };
            document.addEventListener('click', (e) => {
                if (!navProfileWrap.contains(e.target)) navProfileWrap.classList.remove('open');
            });
            function fecharSubmenu() { navProfileWrap.classList.remove('open'); }
            window.fecharSubmenu = fecharSubmenu;

            document.getElementById('submenuPerfil').onclick = () => {
                fecharSubmenu();
                const u = localStorage.getItem('efe_usuario');
                if (u) abrirModalPerfil(JSON.parse(u).nick, true);
            };
            document.getElementById('drawerBtnPerfil').onclick = () => {
                fecharDrawer();
                const u = localStorage.getItem('efe_usuario');
                if (u) abrirModalPerfil(JSON.parse(u).nick, true);
            };

            function alternarSecao(id) {
                document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
                const sec = document.getElementById(id);
                if (sec) sec.classList.add('ativa');
                document.querySelectorAll('.nav-icon-btn,[data-secao]').forEach(b => b.classList.toggle('active', b.dataset.secao === id));
                if (id === 'ranking' && !rankLoaded) carregarRanking();
                if (id === 'documentacao') { aplicarNickLogado(); carregarDocs(); }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            window.alternarSecao = alternarSecao;

            document.getElementById('mobMenu').onclick = () => {
                document.getElementById('mobDrawer').classList.add('open');
                document.getElementById('mobOverlay').classList.add('show');
            };
            function fecharDrawer() {
                document.getElementById('mobDrawer').classList.remove('open');
                document.getElementById('mobOverlay').classList.remove('show');
            }
            window.fecharDrawer = fecharDrawer;
            document.getElementById('mobClose').onclick = fecharDrawer;
            document.getElementById('mobOverlay').onclick = fecharDrawer;

            (function () {
                const total = 5, track = document.getElementById('bannerTrack'), dotsEl = document.getElementById('bannerDots');
                let cur = 0, timer;
                for (let i = 0; i < total; i++) {
                    const d = document.createElement('div');
                    d.className = 'dot' + (i === 0 ? ' active' : '');
                    d.onclick = () => { goTo(i); resetAuto(); };
                    dotsEl.appendChild(d);
                }
                function goTo(n) {
                    cur = (n + total) % total;
                    track.style.transform = `translateX(-${cur * 100}%)`;
                    dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
                }
                document.getElementById('bannerPrev').onclick = () => { goTo(cur - 1); resetAuto(); };
                document.getElementById('bannerNext').onclick = () => { goTo(cur + 1); resetAuto(); };
                function resetAuto() { clearInterval(timer); timer = setInterval(() => goTo(cur + 1), 5000); }
                resetAuto();
            })();

            function aplicarConfigs() {
                const realce = localStorage.getItem('efe_realce_linhas') === 'true';
                document.body.classList.toggle('realce-linhas', realce);
                document.getElementById('cfgRealceLinhas').checked = realce;

                const btnLayout = localStorage.getItem('efe_btn_layout') || 'end';
                document.body.classList.toggle('btn-inline', btnLayout === 'inline');
                document.getElementById('cfgBtnLayout').value = btnLayout;

                const btnEstilo = localStorage.getItem('efe_btn_estilo') || 'icone';
                document.body.classList.toggle('btn-texto', btnEstilo === 'texto');
                document.getElementById('cfgBtnEstilo').value = btnEstilo;

                const highlightCor = localStorage.getItem('efe_highlight_cor') || '';
                if (highlightCor) {
                    document.documentElement.style.setProperty('--copy-highlight', highlightCor);
                } else {
                    document.documentElement.style.removeProperty('--copy-highlight');
                }
                document.getElementById('cfgHighlightCor').value = highlightCor;

                const fa = localStorage.getItem('efe_auto_start_time');
                document.getElementById('cfgFormsAuto').checked = fa !== null ? fa === 'true' : true;

                document.getElementById('cfgTempoCopia').value = localStorage.getItem('efe_tempo_bloqueio_copia') || '30';
            }

            function carregarConfigs() { aplicarConfigs(); }

            document.getElementById('cfgFormsAuto').addEventListener('change', function () {
                localStorage.setItem('efe_auto_start_time', this.checked.toString());
            });
            document.getElementById('cfgTempoCopia').addEventListener('change', function () {
                localStorage.setItem('efe_tempo_bloqueio_copia', this.value);
            });
            document.getElementById('cfgRealceLinhas').addEventListener('change', function () {
                localStorage.setItem('efe_realce_linhas', this.checked.toString());
                document.body.classList.toggle('realce-linhas', this.checked);
            });
            document.getElementById('cfgBtnLayout').addEventListener('change', function () {
                localStorage.setItem('efe_btn_layout', this.value);
                document.body.classList.toggle('btn-inline', this.value === 'inline');
                adicionarBotoesCopiar();
            });
            document.getElementById('cfgBtnEstilo').addEventListener('change', function () {
                localStorage.setItem('efe_btn_estilo', this.value);
                document.body.classList.toggle('btn-texto', this.value === 'texto');
                adicionarBotoesCopiar();
            });
            document.getElementById('cfgHighlightCor').addEventListener('change', function () {
                localStorage.setItem('efe_highlight_cor', this.value);
                if (this.value) {
                    document.documentElement.style.setProperty('--copy-highlight', this.value);
                } else {
                    document.documentElement.style.removeProperty('--copy-highlight');
                }
            });
            carregarConfigs();

            document.getElementById('btnSugestoes') && (document.getElementById('btnSugestoes').onclick = abrirModalSugestoes);
            document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('ativo'); }));

            function parseCSVLine(linha) {
                const cols = []; let campo = '', aspas = false;
                for (let i = 0; i < linha.length; i++) {
                    const c = linha[i], n = linha[i + 1];
                    if (c === '"') { if (aspas && n === '"') { campo += '"'; i++; } else aspas = !aspas; }
                    else if (c === ',' && !aspas) { cols.push(campo); campo = ''; }
                    else campo += c;
                }
                cols.push(campo);
                return cols;
            }
            function parseCSV(linha) { return parseCSVLine(linha).map(c => c.trim()); }
            function limparNick(valor) { if (!valor) return ''; return valor.trim().replace(/^"+|"+$/g, '').trim(); }

            function normalizarA1Range(input, defaultSheetName) {
                const original = (input || '').trim();
                if (!original) return null;
                const compact = original.replace(/\s+/g, '');
                const sheetMatch = compact.match(/^(?:'([^']+)'|([^!]+))!(.+)$/);
                let sheetName = '', rawRange = compact;
                if (sheetMatch) { sheetName = (sheetMatch[1] || sheetMatch[2] || '').trim(); rawRange = (sheetMatch[3] || '').trim(); }
                else if (defaultSheetName) { sheetName = defaultSheetName.replace(/^'+|'+$/g, '').trim(); }
                const range = rawRange.toUpperCase();
                let normalized = null;
                if (/^[A-Z]+\d+:[A-Z]+\d+$/.test(range)) normalized = range;
                else if (/^[A-Z]+\d+:[A-Z]+$/.test(range)) normalized = range;
                else if (/^[A-Z]+:[A-Z]+$/.test(range)) normalized = range;
                else if (/^[A-Z]+\d+$/.test(range)) normalized = range;
                else if (/^[A-Z]+$/.test(range)) normalized = `${range}:${range}`;
                else return null;
                if (!sheetName) return normalized;
                return `'${sheetName}'!${normalized}`;
            }

            function getAutoStartEnabled() { const s = localStorage.getItem('efe_auto_start_time'); return s !== null ? s === 'true' : true; }
            function toLocalInputValue(date) { return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
            function rememberClassStart(aulaId) { if (!aulaId || !getAutoStartEnabled()) return; localStorage.setItem('efe_aula_inicio_auto', JSON.stringify({ aulaId, value: toLocalInputValue(new Date()), savedAt: Date.now() })); }
            function getRememberedClassStart(aulaId) { try { const raw = localStorage.getItem('efe_aula_inicio_auto'); if (!raw) return null; const d = JSON.parse(raw); if (!d || d.aulaId !== aulaId || !d.value) return null; return d.value; } catch { return null; } }

            async function postNoCors(url, payload) {
                await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
                return true;
            }

            async function getWebAppJson(params) {
                const url = GS_WEBAPP_URL + '?' + new URLSearchParams(params).toString();
                const res = await fetch(url);
                return await res.json();
            }

            function getJanelaJustificativa() {
                const agora = new Date();
                const dia = agora.getDay();
                const aberto = dia === 5 || dia === 6 || dia === 0;
                const status = document.getElementById('statusJanelaJusti');
                const desc = document.getElementById('descJanelaJusti');
                const btn = document.getElementById('btnEnviarJusti');
                if (status && desc && btn) {
                    if (aberto) {
                        status.textContent = 'Justificativa aberta';
                        desc.textContent = 'Você pode enviar até domingo às 23h59.';
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    } else {
                        status.textContent = 'Justificativa fechada';
                        desc.textContent = 'A janela abre toda sexta às 00h e fecha domingo às 23h59.';
                        btn.disabled = true;
                        btn.style.opacity = '.55';
                    }
                }
                return aberto;
            }

            function renderUltimaJustificativa(data) {
                const box = document.getElementById('ultimaJustiCard');
                if (!box) return;
                if (!data || !data.ok || !data.justificativa) {
                    box.innerHTML = '<div class="ultima-justi-empty">Nenhuma justificativa encontrada para este nick.</div>';
                    return;
                }
                const j = data.justificativa;
                box.innerHTML = `<strong>Última justificativa encontrada</strong><div class="ultima-justi-meta"><span>${j.nick || '—'}</span><span>${j.cargo || '—'}</span><span>${j.data || '—'}</span></div><div>${(j.motivo || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
            }

            async function animateSubmitButton(button, action) {
                const original = button.dataset.originalHtml || button.innerHTML;
                button.dataset.originalHtml = original;
                button.classList.add('is-loading'); button.disabled = true;
                button.innerHTML = `<span class="status-btn-icon"><span class="mini-spinner"></span></span><span>Enviando</span>`;
                try {
                    await action();
                    button.classList.remove('is-loading'); button.classList.add('is-success');
                    button.innerHTML = `<span class="status-btn-icon"><i class="ph ph-check"></i></span><span>Enviado</span>`;
                    setTimeout(() => { button.disabled = false; button.classList.remove('is-success'); button.innerHTML = original; }, 1500);
                    return true;
                } catch (error) {
                    button.classList.remove('is-loading'); button.classList.add('is-error');
                    button.innerHTML = `<span class="status-btn-icon"><i class="ph ph-x"></i></span><span>Erro</span>`;
                    setTimeout(() => { button.disabled = false; button.classList.remove('is-error'); button.innerHTML = original; }, 1800);
                    throw error;
                }
            }

            async function pegarUsername() {
                try {
                    let resposta = await fetch("/forum");
                    let html = await resposta.text();
                    let regex = /_userdata\["username"\]\s*=\s*"([^"]+)"/;
                    let match = html.match(regex);
                    if (match && match[1]) return match[1];
                } catch (err) { console.error('Erro ao pegar username:', err); }
                return null;
            }

            async function verificarGruposEspeciais(nick) {
                try {
                    const r = await fetch(`https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(nick)}`);
                    if (!r.ok) return false;
                    const d = await r.json();
                    const gs = ['[RCC] Corregedoria', '[RCC] G.A.T.E', '[RCC] G.S.S', '[RCC] Procuradoria Militar'];
                    return (d.groups || []).some(g => gs.includes(g.name));
                } catch { return false; }
            }

            async function detectarCargoUsuario() {
                try {
                    const us = localStorage.getItem('efe_usuario');
                    if (!us) return null;
                    const nick = JSON.parse(us).nick;
                    if (await verificarGruposEspeciais(nick)) return 'estagiário';
                    const r = await fetch('https://proxy.reinasdev.workers.dev?url=' + encodeURIComponent('https://docs.google.com/spreadsheets/d/e/2PACX-1vQu5x4PLj1LY_tzBUGaKZQmf6Y9L99B95v5Dl1kCcJnBAx9y5lfOp-n8X1LSMpdlXW9hZEPUKt397zE/pub?gid=0&single=true&output=csv'));
                    if (!r.ok) throw new Error();
                    const csv = await r.text();
                    const linhas = csv.split('\n');
                    for (let i = 19; i < linhas.length; i++) {
                        if (!linhas[i].trim()) continue;
                        const cols = parseCSV(linhas[i]);
                        if (cols.length >= 4) { const n = limparNick(cols[3]); const cargo = limparNick(cols[2]).replace(/\(a\)$/i, '').trim().toLowerCase(); if (n === nick) return cargo; }
                    }
                    const rDA = await fetch('https://proxy.reinasdev.workers.dev?url=' + encodeURIComponent('https://docs.google.com/spreadsheets/d/e/2PACX-1vSMJdPrmdSodMJYbJ9-7oIpUcE_P0Eh_EObOTZC2jcc7msIVHRqQ9Tq8C-8vLRhRYWMvXLi2cxKwMpP/pub?gid=593055626&single=true&output=csv'));
                    if (!rDA.ok) throw new Error();
                    const csvDA = await rDA.text();
                    const linhasDA = csvDA.split('\n');
                    for (let i = 4; i < linhasDA.length; i++) {
                        if (!linhasDA[i].trim()) continue;
                        const cols = parseCSV(linhasDA[i]);
                        if (cols.length >= 7) {
                            const nicks = cols[5].split('/').map(x => limparNick(x));
                            const status = limparNick(cols[6]);
                            const [d, mo, a] = (cols[4] || '').split(' ')[0].split('/');
                            const data = new Date(`${a}-${mo}-${d}`);
                            const tresDias = new Date(); tresDias.setDate(tresDias.getDate() - 3);
                            if (nicks.includes(nick) && (status === 'Aprovado' || status === 'Aprovada') && data >= tresDias) return 'professor';
                        }
                    }
                    localStorage.removeItem('efe_usuario');
                    atualizarHeaderPerfil(null);
                    document.getElementById('estadoAulas').innerHTML = '<div class="aviso-login"><h3>ACESSO NEGADO</h3><p>Você não é Made in EFE. Se acha que é um erro, contate a liderança.</p></div>';
                    return null;
                } catch (e) { console.error(e); return null; }
            }

            function determinarCargosDisponiveis(cargo) {
                const c = cargo.replace(/\(a\)$/i, '').trim().toLowerCase();
                const lideres = ['estagiário', 'graduador', 'ministro(a) da contabilidade', 'ministro(a) da administração', 'ministro(a) da documentação', 'ministro(a) da atualização', 'ministro(a) das finanças', 'ministro(a) da segurança', 'vice-líder', 'líder', 'lider'];
                if (lideres.includes(c)) return ['professor', 'mentor', 'graduador'];
                if (c === 'graduador') return ['professor', 'mentor', 'graduador'];
                if (c === 'mentor') return ['professor', 'mentor'];
                return ['professor'];
            }

            function avatarUrl(nick) { return `https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${encodeURIComponent(nick)}&action=std&direction=2&head_direction=3&img_format=png&gesture=sml&headonly=1&size=l`; }
            function avatarHeadUrl(nick) { return `https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${encodeURIComponent(nick)}&action=std&direction=2&head_direction=3&img_format=png&gesture=sml&headonly=1&size=l`; }

            function obterNickLogado() {
                try {
                    const u = localStorage.getItem('efe_usuario');
                    return u ? (JSON.parse(u).nick || 'USUÁRIO') : 'USUÁRIO';
                } catch {
                    return 'USUÁRIO';
                }
            }

            function aplicarNickLogado(root = document) {
                const nick = obterNickLogado();
                root.querySelectorAll('[data-nick-logado]').forEach(el => { el.textContent = nick; });
                root.querySelectorAll('[data-src-nickp]').forEach(el => {
                    el.src = el.dataset.srcNickp.replace(/NICK AQUI|\$\{nickP\}/g, encodeURIComponent(nick));
                });
            }

            function atualizarHeaderPerfil(usuario) {
                aplicarNickLogado();
                if (!usuario) {
                    document.getElementById('miniNick').textContent = 'Não logado';
                    document.getElementById('miniCargo').textContent = 'Faça login para continuar';
                    document.getElementById('miniPts').textContent = '—';
                    document.getElementById('drawerNick').textContent = 'Não logado';
                    document.getElementById('drawerCargo').textContent = '—';
                    document.getElementById('submenuPerfilLabel').textContent = 'Meu Perfil';
                    document.getElementById('drawerPerfilLabel').textContent = 'Meu Perfil';
                    return;
                }
                document.getElementById('miniNick').textContent = usuario.nick;
                document.getElementById('miniCargo').textContent = cargoUsuario || '—';
                document.getElementById('drawerNick').textContent = usuario.nick;
                document.getElementById('drawerCargo').textContent = cargoUsuario || '—';
                document.getElementById('headerAvatar').src = avatarHeadUrl(usuario.nick);
                document.getElementById('miniAvatar').src = avatarUrl(usuario.nick);
                document.getElementById('drawerAvatar').src = avatarHeadUrl(usuario.nick);
                const label = `Perfil de ${usuario.nick}`;
                document.getElementById('submenuPerfilLabel').textContent = label;
                document.getElementById('drawerPerfilLabel').textContent = label;
                carregarPontuacaoHeader(usuario.nick);
            }

            const RANKING_GS = {
                professores: { id: SS_PROF_RANK, tab: 'Ranking Parcial', nickCol: 2, pontosCol: 14 },
                mentores: { id: SS_MENT_RANK, tab: 'Ranking Parcial', nickCol: 2, pontosCol: 7 },
                graduadores: { id: SS_GRAD_RANK, tab: 'Ranking Parcial', nickCol: 2, pontosCol: 6 }
            };
            const RANKING_CARGO_LABEL = { professores: 'Professor', mentores: 'Mentor', graduadores: 'Graduador' };

            async function getRowsRanking(tipo) {
                const cfg = RANKING_GS[tipo];
                const nickLetter = String.fromCharCode(65 + cfg.nickCol);
                const ptsLetter = String.fromCharCode(65 + cfg.pontosCol);
                const maxLetter = String.fromCharCode(65 + Math.max(cfg.nickCol, cfg.pontosCol));
                const range = `'${cfg.tab}'!A6:${maxLetter}`;
                const rows = await gsGet(cfg.id, range);
                const dados = [];
                for (const row of rows) {
                    const nick = limparNick(row[cfg.nickCol] || '');
                    const pts = parseInt((row[cfg.pontosCol] || '').replace(/[^\d-]/g, '')) || 0;
                    if (nick && nick.toUpperCase() !== 'NICK' && nick.length >= 1) dados.push({ nick, pts });
                }
                return dados;
            }

            async function carregarPontuacaoHeader(nick) {
                try {
                    const dados = await getRowsRanking('professores');
                    const found = dados.find(d => d.nick === nick);
                    document.getElementById('miniPts').textContent = (found ? found.pts : 0) + ' pts';
                } catch { document.getElementById('miniPts').textContent = '—'; }
            }

            async function verificarLoginSalvo() {
                const us = localStorage.getItem('efe_usuario');
                if (us) {
                    const usuario = JSON.parse(us);
                    cargoUsuario = await detectarCargoUsuario();
                    atualizarHeaderPerfil(usuario);
                    if (cargoUsuario) { cargosDisponiveis = determinarCargosDisponiveis(cargoUsuario); liberarAulas(); }
                } else { loginAutomatico(); }
            }

            async function loginAutomatico() {
                const username = await pegarUsername();
                if (username) {
                    localStorage.setItem('efe_usuario', JSON.stringify({ nick: username, loginTime: Date.now() }));
                    verificarLoginSalvo();
                } else {
                    document.getElementById('estadoAulas').innerHTML = '<div class="aviso-login"><h3>LOGIN NECESSÁRIO</h3><p>Você precisa estar logado para acessar as aulas.</p></div>';
                }
            }

            async function carregarRanking() {
                rankLoaded = true;
                const cardsTop = document.getElementById('rankingCardsTop');
                const tableSection = document.getElementById('rankingTableSection');
                cardsTop.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;font-size:13px;color:var(--text3)">Carregando<span class="loading-dots"></span></div>';
                tableSection.style.display = 'none';
                try {
                    const meuNick = (() => { const u = localStorage.getItem('efe_usuario'); return u ? JSON.parse(u).nick : ''; })();
                    const dados = await getRowsRanking(rankingAtual);
                    dados.sort((a, b) => b.pts - a.pts);
                    rankDados = dados.map(d => ({ ...d, sou: d.nick === meuNick }));
                    pgAtual = 1;
                    renderizarTop3(rankDados);
                    renderizarTabela(rankDados);
                } catch {
                    cardsTop.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;font-size:13px;color:var(--text3)">Erro ao carregar.</div>';
                }
            }

            function renderizarTop3(dados) {
                const el = document.getElementById('rankingCardsTop');
                if (!dados.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);width:100%">Sem dados</div>'; return; }
                const top = dados.slice(0, 3);
                const cargoLabel = RANKING_CARGO_LABEL[rankingAtual] || '';
                const ordem = top.length >= 3 ? [1, 0, 2] : top.map((_, i) => i);
                const slotClass = ['p2', 'p1', 'p3'];
                const medalEmoji = ['🥈', '🥇', '🥉'];
                const degrauLabel = ['2', '1', '3'];
                el.innerHTML = '';
                ordem.forEach((idx, pos) => {
                    if (!top[idx]) return;
                    const d = top[idx];
                    const slot = document.createElement('div');
                    slot.className = `podio-slot ${slotClass[pos]}`;
                    slot.onclick = () => abrirModalPerfil(d.nick, false, cargoLabel);
                    const crown = slotClass[pos] === 'p1' ? `<div class="podio-crown">
                                                                    <img src="https://i.imgur.com/4QH1EFR.png" alt="Coroa">
                                                                </div>` : '';
                    slot.innerHTML = `
                        <div class="podio-avatar-wrap">
                            ${crown}
                            <img class="podio-avatar-img" src="${avatarHeadUrl(d.nick)}" onerror="this.src='https://2img.net/i.imgur.com/LdjVmCJ.png'" alt="${d.nick}">
                        </div>
                        <div class="podio-nick">${d.nick}</div>
                        <div class="podio-pts">${d.pts} pts</div>
                        <div class="podio-degrau">${degrauLabel[pos]}º</div>
                    `;
                    el.appendChild(slot);
                });
            }

            function renderizarTabela(dados) {
                const tableSection = document.getElementById('rankingTableSection');
                tableSection.style.display = '';
                const cargoLabel = RANKING_CARGO_LABEL[rankingAtual] || '';
                let totalPgs = Math.max(1, Math.ceil(dados.length / PG_SIZE));
                function renderPg(pg) {
                    pgAtual = pg;
                    const table = document.getElementById('rankingTable');
                    table.innerHTML = '';
                    const start = (pg - 1) * PG_SIZE;
                    dados.slice(start, start + PG_SIZE).forEach((d, i) => {
                        const pos = start + i + 1;
                        const posClass = pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : '';
                        const tr = document.createElement('tr');
                        tr.onclick = () => abrirModalPerfil(d.nick, false, cargoLabel);
                        tr.innerHTML = `<td class="rt-pos ${posClass}">${pos}º</td><td class="rt-avatar"><img src="${avatarHeadUrl(d.nick)}" onerror="this.src='https://2img.net/i.imgur.com/LdjVmCJ.png'" alt="${d.nick}"></td><td class="rt-nick${d.sou ? ' me' : ''}">${d.nick}${d.sou ? ' <span style="font-size:10px;font-weight:700;color:var(--accent)">(você)</span>' : ''}</td><td class="rt-cargo">${cargoLabel}</td><td class="rt-pts">${d.pts} pts</td>`;
                        table.appendChild(tr);
                    });
                    document.getElementById('pgInfo').textContent = `${pg} / ${totalPgs}`;
                    document.getElementById('pgPrev').disabled = pg <= 1;
                    document.getElementById('pgNext').disabled = pg >= totalPgs;
                }
                document.getElementById('pgPrev').onclick = () => { if (pgAtual > 1) renderPg(pgAtual - 1); };
                document.getElementById('pgNext').onclick = () => { if (pgAtual < totalPgs) renderPg(pgAtual + 1); };
                renderPg(1);
            }

            function mudarRanking(tipo) {
                rankingAtual = tipo;
                localStorage.setItem('efe_ranking_atual', tipo);
                document.querySelectorAll('.ranking-left-tab').forEach(t => t.classList.toggle('active', t.dataset.rank === tipo));
                carregarRanking();
            }
            window.mudarRanking = mudarRanking;

            function calcularReset(tipo) {
                const agora = new Date();
                if (tipo === 'graduadores') {
                    const hoje = agora.getDate(), mes = agora.getMonth(), ano = agora.getFullYear();
                    return hoje <= 15 ? new Date(ano, mes, 16, 23, 59, 0) : new Date(ano, mes + 1, 1, 23, 59, 0);
                }
                const sab = new Date(); sab.setDate(agora.getDate() + (6 - agora.getDay())); sab.setHours(23, 59, 0, 0);
                if (agora > sab) sab.setDate(sab.getDate() + 7);
                return sab;
            }
            setInterval(() => {
                const el = document.getElementById('timerRank');
                if (!el) return;
                const diff = calcularReset(rankingAtual) - new Date();
                if (diff <= 0) { el.textContent = 'RESETOU!'; return; }
                const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
                el.textContent = `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
            }, 1000);

            async function carregarTop1Home() {
                const el = document.getElementById('top1List');
                el.innerHTML = '<div style="font-size:12px;color:var(--text3)">Carregando<span class="loading-dots"></span></div>';
                const tipos = ['professores', 'mentores', 'graduadores'];
                const labels = ['Professor', 'Mentor', 'Graduador'];
                const resultados = [];
                for (let i = 0; i < tipos.length; i++) {
                    try {
                        const dados = await getRowsRanking(tipos[i]);
                        dados.sort((a, b) => b.pts - a.pts);
                        if (dados.length) resultados.push({ cargo: labels[i], nick: dados[0].nick, pts: dados[0].pts });
                    } catch { }
                }
                el.innerHTML = '';
                if (!resultados.length) { el.innerHTML = '<div style="font-size:12px;color:var(--text3)">Sem dados</div>'; return; }
                resultados.forEach(r => {
                    const item = document.createElement('div');
                    item.className = 'top1-side-item';
                    item.innerHTML = `<img class="top1-side-avatar" src="${avatarHeadUrl(r.nick)}" onerror="this.src='https://2img.net/i.imgur.com/LdjVmCJ.png'" alt="${r.nick}"><div class="top1-side-info"><div class="top1-side-cargo">${r.cargo}</div><div class="top1-side-nick">${r.nick}</div></div><span class="top1-side-pts">${r.pts}pts</span>`;
                    el.appendChild(item);
                });
            }

            async function carregarAulasGS() {
                const rows = await gsGet(SS_MAIN, "'[AulasCentralEFE]'!A2:G");
                aulasData = [];
                for (const row of rows) {
                    if (!row[0] || !row[0].trim()) continue;
                    aulasData.push({
                        nome: (row[0] || '').trim(),
                        cargo: (row[1] || 'professor').trim().toLowerCase().replace(/\(a\)$/i, '').trim(),
                        codigo: (row[2] || '').trim(),
                        publico: (row[3] || '').trim(),
                        banner: (row[4] || '').trim(),
                        intervalo: (row[5] || '').trim(),
                        categoria: (row[6] || 'Aula').trim(),
                    });
                }
            }

            function liberarAulas() {
                document.getElementById('estadoAulas')?.remove();
                document.getElementById('gradeCursosContainer').style.display = 'block';
                carregarAulasGS().then(() => {
                    renderizarSidebarAulas();
                    carregarScripts();
                }).catch(e => {
                    console.error('Erro ao carregar aulas:', e);
                    document.getElementById('gradeAulas').innerHTML = '<div class="aulas-loading">Erro ao carregar aulas.</div>';
                });
            }

            function renderizarSidebarAulas() {
                const sidebar = document.getElementById('aulasTabs');
                sidebar.innerHTML = '';
                const iconMap = { professor: '', mentor: '', graduador: '' };
                const labelMap = { professor: 'Professor', mentor: 'Mentor', graduador: 'Graduador' };
                cargosDisponiveis.forEach((c, i) => {
                    const btn = document.createElement('button');
                    btn.className = 'aulas-cargo-btn' + (i === 0 ? ' active' : '');
                    btn.innerHTML = `<i class="ph ${iconMap[c] || 'ph-user'}"></i> ${labelMap[c] || c}`;
                    btn.onclick = () => {
                        sidebar.querySelectorAll('.aulas-cargo-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        cargoAtualSidebar = c;
                        renderizarCardsAulas(c);
                    };
                    sidebar.appendChild(btn);
                });
                if (cargosDisponiveis.length) {
                    cargoAtualSidebar = cargosDisponiveis[0];
                    renderizarCardsAulas(cargosDisponiveis[0]);
                }
            }

            function renderizarCardsAulas(cargFiltro) {
                const grid = document.getElementById('gradeAulas');
                grid.innerHTML = '';
                const cargo = cargFiltro || cargosDisponiveis[0] || 'professor';
                const aulasVisiveis = aulasData.filter(a => a.cargo === cargo);
                if (!aulasVisiveis.length) { grid.innerHTML = '<div class="aulas-loading">Nenhuma aula disponível.</div>'; return; }
                aulasVisiveis.forEach(aula => {
                    const card = document.createElement('div');
                    card.className = 'card-curso';
                    card.dataset.cargo = aula.cargo;
                    card.dataset.aula = aula.codigo;
                    const bannerStyle = aula.banner ? `background-image:url('${aula.banner}')` : 'background:linear-gradient(135deg,#0a1828,#0e2a40)';
                    card.innerHTML = `<div class="card-curso-banner" style="${bannerStyle}"><div class="card-curso-banner-overlay"></div><div class="card-curso-cat">${aula.categoria}</div></div><div class="card-curso-body"><div class="card-curso-icon" style="${bannerStyle}"></div><div class="card-curso-info"><h3>${aula.codigo || aula.nome}</h3><p>${aula.publico || 'Para todos'}</p></div><span class="card-curso-tag">${aula.cargo.charAt(0).toUpperCase() + aula.cargo.slice(1)}</span></div>`;
                    card.onclick = () => abrirAula(aula.codigo);
                    grid.appendChild(card);
                });
            }

            async function carregarScripts() {
                const promises = aulasData.map(async (aula) => {
                    if (!aula.intervalo) return;
                    try {
                        const range = normalizarA1Range(aula.intervalo, '[AulasCentralEFE]');
                        if (!range) { scriptsData[aula.codigo] = null; return; }
                        const rows = await gsGet(SS_MAIN, range);
                        const parsed = parseScriptRows(rows);
                        scriptsData[aula.codigo] = parsed.length ? parsed : null;
                    } catch { scriptsData[aula.codigo] = null; }
                });
                await Promise.all(promises);
            }

            function parseScriptRows(rows) {
                const items = [];
                const normalize = value => (value || '').toString().replace(/\s+/g, ' ').trim();
                const token = value => normalize(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const isOpenToken = value => ['abrir', 'spoiler', 'abrir spoiler', 'spoiler abrir', 'inicio spoiler', 'iniciar spoiler'].includes(token(value));
                const isCloseToken = value => ['fechar', 'fim', 'fechar spoiler', 'fim spoiler', 'encerrar spoiler'].includes(token(value));
                const compactRow = row => { const base = Array.isArray(row) ? row.slice(0, 5) : []; while (base.length < 5) base.push(''); return base.map(normalize); };
                const genericItemsFromRow = (row, insideSpoiler) => {
                    const cells = compactRow(row);
                    const first = cells[0];
                    const firstToken = token(first);
                    if (!cells.some(Boolean)) return [];
                    if (isOpenToken(first) || isCloseToken(first)) return [];
                    const descricaoFinal = cells[4];
                    const contentCells = cells.slice(0, 4);
                    const payload = first ? contentCells.slice(1).filter(Boolean) : contentCells.filter(Boolean);
                    const out = [];
                    if (!contentCells.some(Boolean) && !descricaoFinal) return [];
                    if (!contentCells.some(Boolean) && descricaoFinal) {
                        out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (!payload.length && first && !['titulo', 'titulo normal', 'texto', 'conteudo', 'descricao', 'instrucoes', 'instrucao', 'instrução', 'slide', 'observacao', 'observação', 'obs'].includes(firstToken)) {
                        out.push({ tipo: insideSpoiler ? 'conteudo' : 'texto', texto: first });
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (['titulo', 'titulo normal'].includes(firstToken)) {
                        if (payload[0]) { out.push({ tipo: insideSpoiler ? 'titulo spoiler' : 'titulo', texto: payload[0] }); payload.slice(1).forEach(t => out.push({ tipo: insideSpoiler ? 'conteudo' : 'conteudo', texto: t })); }
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (['texto', 'conteudo', 'fala'].includes(firstToken)) {
                        payload.forEach(t => out.push({ tipo: 'conteudo', texto: t }));
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (['descricao', 'observacao', 'observação', 'obs'].includes(firstToken)) {
                        payload.forEach(t => out.push({ tipo: 'descricao', texto: t }));
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (['instrucoes', 'instrucao', 'instrução'].includes(firstToken)) {
                        payload.forEach(t => out.push({ tipo: 'instrucoes', texto: t }));
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (firstToken === 'slide') {
                        if (payload[0]) out.push({ tipo: insideSpoiler ? 'titulo spoiler' : 'titulo', texto: payload[0] });
                        if (payload[1]) out.push({ tipo: 'conteudo', texto: payload[1] });
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (insideSpoiler) {
                        if (payload[0]) out.push({ tipo: 'titulo spoiler', texto: payload[0] });
                        if (payload[1]) out.push({ tipo: 'conteudo', texto: payload[1] });
                        if (!payload.length && first) out.push({ tipo: 'conteudo', texto: first });
                        if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                        return out;
                    }
                    if (payload[0]) out.push({ tipo: 'titulo', texto: payload[0] });
                    if (payload[1]) out.push({ tipo: 'conteudo', texto: payload[1] });
                    if (!payload.length && first) out.push({ tipo: 'texto', texto: first });
                    if (descricaoFinal) out.push({ tipo: 'descricao', texto: descricaoFinal });
                    return out;
                };
                let i = 0;
                while (i < rows.length) {
                    const row = compactRow(rows[i]);
                    if (!row.some(Boolean)) { i++; continue; }
                    const first = row[0];
                    if (isCloseToken(first)) { i++; continue; }
                    if (isOpenToken(first)) {
                        const tituloSpoiler = row.slice(1).find(Boolean) || 'Spoiler';
                        const conteudo = [];
                        i++;
                        while (i < rows.length) {
                            const inner = compactRow(rows[i]);
                            if (!inner.some(Boolean)) { i++; continue; }
                            if (isCloseToken(inner[0])) { i++; break; }
                            const parsedInner = genericItemsFromRow(inner, true);
                            if (parsedInner.length) conteudo.push(...parsedInner);
                            i++;
                        }
                        items.push({ tipo: 'spoiler', texto: tituloSpoiler, conteudo });
                        continue;
                    }
                    const parsed = genericItemsFromRow(row, false);
                    if (parsed.length) items.push(...parsed);
                    i++;
                }
                return items;
            }

            function abrirAula(aulaId) {
                const aula = aulasData.find(a => a.codigo === aulaId);
                if (aula) { aulaAtualAberta = aulaId; cargoAtualAberto = aula.cargo; }
                if (!scriptsData[aulaId] || !scriptsData[aulaId].length) { showScriptNotFound('Script não encontrado'); return; }
                limparEstadoCopias();
                document.getElementById('gradeAulas').style.display = 'none';
                historico.push({ aulaId });
                const sv = document.getElementById('scriptViewer');
                sv.style.display = 'block';
                document.getElementById('scriptTitulo').textContent = aula ? (aula.nome || aulaId) : aulaId;
                document.getElementById('scriptContent').innerHTML = renderizarScript(scriptsData[aulaId]);
                configurarSpoilers();
                setTimeout(() => { adicionarBotoesCopiar(); }, 100);
                if (aula) rememberClassStart(aulaId);
            }

            function voltar() {
                if (historico.length > 0) historico.pop();
                limparEstadoCopias();
                document.getElementById('scriptViewer').style.display = 'none';
                document.getElementById('gradeAulas').style.display = '';
                aulaAtualAberta = null; cargoAtualAberto = null;
                if (cargoAtualSidebar) renderizarCardsAulas(cargoAtualSidebar);
            }
            document.getElementById('btnVoltar').onclick = voltar;

            function renderizarScript(items, addLinks) {
                if (addLinks === undefined) addLinks = true;
                if (!items) return '<p style="color:var(--text3)">Script não disponível.</p>';
                let html = '';
                const nick = obterNickLogado();
                items.forEach(item => {
                    let txt = (item.texto || '').replace(/\{\{USUARIO_NICK\}\}/g, nick).replace(/\$\{nickP\}/g, nick);
                    const tipo = (item.tipo || '').toLowerCase();
                    if (tipo === 'instrucoes') {
                        html += `<div class="instrucoes">${txt}</div>`;
                    } else if (tipo === 'titulo' || tipo === 'titulo normal') {
                        html += `<h3 class="titulo copiavel"><span class="texto-realce-copia">${txt}</span></h3>`;
                    } else if (tipo === 'titulo spoiler') {
                        html += `<h3 class="titulo-spoiler-inner copiavel" style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:5px;padding:6px 50px 6px 12px;position:relative;width:100%"><span class="texto-realce-copia">${txt}</span></h3>`;
                    } else if (tipo === 'conteudo' || tipo === 'texto') {
                        html += `<p class="texto copiavel"><span class="texto-realce-copia">${txt}</span></p>`;
                    } else if (tipo === 'descricao') {
                        html += `<div class="descricao">${txt}</div>`;
                    } else if (tipo === 'spoiler') {
                        const conteudoHtml = item.conteudo ? renderizarScript(item.conteudo, false) : '';
                        html += `<div class="spoiler"><div class="spoiler-header"><span class="spoiler-label">${txt}</span><div class="spoiler-actions"><i class="ph ph-caret-down spoiler-toggle"></i></div></div><div class="spoiler-content">${conteudoHtml}</div></div>`;
                    } else if (tipo && txt) {
                        html += `<p class="texto copiavel"><span class="texto-realce-copia">${txt}</span></p>`;
                    }
                });
                if (addLinks) html += adicionarPostagemSection();
                return html;
            }

            window.copiarSpoiler = function (btn) {
                btn.stopPropagation && btn.stopPropagation();
                const spoilerContent = btn.closest('.spoiler').querySelector('.spoiler-content');
                const textos = Array.from(spoilerContent.querySelectorAll('.copiavel')).map(el => {
                    const clone = el.cloneNode(true);
                    clone.querySelector('.btn-copiar')?.remove();
                    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
                }).filter(Boolean);
                const texto = textos.join('\n');
                navigator.clipboard.writeText(texto).catch(() => {
                    const ta = document.createElement('textarea');
                    ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
                });
                showToast('Spoiler copiado!');
            };

            function adicionarPostagemSection() {
                const cargo = cargoAtualAberto;
                if (!cargo) return '';
                const relLinks = {
                    professor: 'https://docs.google.com/spreadsheets/d/1f9fPMnAosjKEvyZ5LJtuAz-kmdn1-VXRA9Nawr2tR3k/edit?gid=2092996256#gid=2092996256',
                    mentor: 'https://docs.google.com/spreadsheets/d/1eZ3hFf0XEVaVbkgviJLZWJvpIkzufH8PQlfqbkDaT5s/edit?gid=1680110763#gid=1680110763',
                    graduador: 'https://docs.google.com/spreadsheets/d/1TWbKL2P0kk8wIrR0uDxDk47ZYOKOlkCDakFkKD-ruHA/edit?gid=1053708693#gid=1053708693'
                };
                const aulaAtual = aulaAtualAberta || '';
                const aulasSystem = ['APB', 'API', 'APA', 'AFP', 'AFO', 'AvCE'];
                let html = `<div class="postagem-section"><div class="postagem-section-title">Relatório de Função</div><div class="postagem-btns"><button class="btn-post" onclick="abrirModalRelatorio('${cargo}','${aulaAtual}')"><i class="ph ph-clipboard-text"></i><span class="btn-post-label">Relatório</span><span class="btn-post-desc">Registre sua função</span></button><a class="btn-post" href="${relLinks[cargo] || '#'}" target="_blank"><i class="ph ph-eye"></i><span class="btn-post-label">Conferir</span><span class="btn-post-desc">Ver relatório</span></a>`;
                if (cargo === 'professor' && aulasSystem.includes(aulaAtual)) {
                    html += `<a class="btn-post" href="https://system.policercc.com.br/" target="_blank"><i class="ph ph-desktop"></i><span class="btn-post-label">System</span><span class="btn-post-desc">Postar no System</span></a>`;
                }
                html += '</div></div>';
                return html;
            }

            function configurarSpoilers() {
                document.querySelectorAll('.spoiler-header').forEach(h => {
                    h.addEventListener('click', (e) => {
                        if (e.target.closest('.spoiler-copy-all')) return;
                        const sp = h.parentNode;
                        sp.classList.toggle('aberto');
                        setTimeout(() => {
                            adicionarBotoesCopiar();
                            marcarLinhasPuladas();
                        }, 260);
                    });
                });
            }

            function adicionarBotoesCopiar() {
                const visíveis = Array.from(document.querySelectorAll('.copiavel')).filter(el => !el.closest('.spoiler:not(.aberto)') && !el.classList.contains('descricao'));

                document.querySelectorAll('.copiavel').forEach(el => {
                    if (el.closest('.spoiler:not(.aberto)') || el.classList.contains('descricao')) { el.querySelector('.btn-copiar')?.remove(); }
                });

                visíveis.forEach((el, idx) => {
                    el.querySelector('.btn-copiar')?.remove();
                    const btn = document.createElement('button');
                    btn.className = 'btn-copiar';
                    btn.innerHTML = '<i class="ph ph-copy btn-copiar-icone"></i><span class="btn-copiar-texto">Copiar</span>';
                    btn.title = 'Copiar';
                    btn.dataset.index = idx;
                    btn.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); copiarLinha(el); });
                    el.appendChild(btn);
                });

                _aplicarMarcacaoVisualPuladas();
            }

            function _aplicarMarcacaoVisualPuladas() {
                const els = Array.from(document.querySelectorAll('.copiavel')).filter(el => !el.closest('.spoiler:not(.aberto)') && !el.classList.contains('descricao'));
                document.querySelectorAll('.copiavel .linha-pulada').forEach(sp => {
                    const parent = sp.parentElement;
                    if (parent) {
                        const txt = sp.textContent;
                        const btn = parent.querySelector('.btn-copiar');
                        parent.innerHTML = '';
                        const realceSpan = document.createElement('span');
                        realceSpan.className = 'texto-realce-copia';
                        realceSpan.textContent = txt;
                        parent.appendChild(realceSpan);
                        if (btn) parent.appendChild(btn);
                    }
                });
                linhasPuladas.forEach(idx => {
                    if (!els[idx]) return;
                    const el = els[idx];
                    const btn = el.querySelector('.btn-copiar');
                    const clone = el.cloneNode(true);
                    clone.querySelector('.btn-copiar')?.remove();
                    const txt = (clone.textContent || '').trim();
                    el.innerHTML = '';
                    const span = document.createElement('span');
                    span.className = 'linha-pulada';
                    span.textContent = txt;
                    el.appendChild(span);
                    if (btn) el.appendChild(btn);
                });
            }

            function marcarLinhasPuladas() {
                _aplicarMarcacaoVisualPuladas();
            }

            function copiarLinha(el) {
                const els = Array.from(document.querySelectorAll('.copiavel')).filter(e => !e.closest('.spoiler:not(.aberto)') && !e.classList.contains('descricao'));
                const real = els.indexOf(el);
                if (real === -1) return;

                let pulou = false;
                if (linhasCopiadas.size === 0) {
                    if (real !== 0) {
                        pulou = true;
                        for (let i = 0; i < real; i++) linhasPuladas.add(i);
                    }
                } else {
                    const ultima = Math.max(...linhasCopiadas);
                    if (real > ultima + 1) {
                        pulou = true;
                        for (let i = ultima + 1; i < real; i++) {
                            if (!linhasCopiadas.has(i)) linhasPuladas.add(i);
                        }
                    } else if (real <= ultima && !linhasCopiadas.has(real) && real !== 0) {
                    }
                }

                marcarLinhasPuladas();
                if (pulou) {
                    mostrarModalPulo();
                    registrarPuloLinha({ linhaClicada: real + 1 });
                }

                if (linhasPuladas.has(real)) {
                    linhasPuladas.delete(real);
                    const sp = el.querySelector('.linha-pulada');
                    if (sp) {
                        const btn = el.querySelector('.btn-copiar');
                        const txt = sp.textContent;
                        el.innerHTML = '';
                        const realceSpan = document.createElement('span');
                        realceSpan.className = 'texto-realce-copia';
                        realceSpan.textContent = txt;
                        el.appendChild(realceSpan);
                        if (btn) el.appendChild(btn);
                    }
                }

                linhasCopiadas.add(real);

                const clone = el.cloneNode(true);
                clone.querySelector('.btn-copiar')?.remove();
                clone.querySelector('.linha-pulada') && (clone.querySelector('.linha-pulada').outerHTML = clone.querySelector('.linha-pulada').textContent);
                const texto = (clone.textContent || '').replace(/\s+/g, ' ').trim();
                navigator.clipboard.writeText(texto).catch(() => {
                    const ta = document.createElement('textarea');
                    ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
                });
                showToast('Copiado!');

                const tempoBloqueio = parseInt(localStorage.getItem('efe_tempo_bloqueio_copia') || '30', 10);
                const btn = el.querySelector('.btn-copiar');

                if (tempoBloqueio > 0) {
                    el.classList.add('copia-bloqueada');
                    if (btn) {
                        btn.classList.add('bloqueado');
                        btn.disabled = true;
                        const htmlOriginal = btn.innerHTML;

                        let segundos = tempoBloqueio;
                        btn.innerHTML = `<span>${segundos}s</span>`;

                        const intervalo = setInterval(() => {
                            segundos--;
                            if (btn && btn.parentElement) {
                                if (segundos > 0) {
                                    btn.innerHTML = `<span>${segundos}s</span>`;
                                } else {
                                    clearInterval(intervalo);
                                    btn.classList.remove('bloqueado');
                                    btn.disabled = false;
                                    btn.innerHTML = htmlOriginal;
                                    el.classList.remove('copia-bloqueada');
                                }
                            } else {
                                clearInterval(intervalo);
                            }
                        }, 1000);
                    } else {
                        setTimeout(() => el.classList.remove('copia-bloqueada'), tempoBloqueio * 1000);
                    }
                } else {
                    el.classList.add('copiado');
                    setTimeout(() => el.classList.remove('copiado'), 600);
                }
            }

            function limparEstadoCopias() {
                linhasCopiadas.clear();
                linhasPuladas.clear();
                document.querySelectorAll('.copiavel.copia-bloqueada').forEach(el => el.classList.remove('copia-bloqueada'));
                document.querySelectorAll('.copiavel.copiado').forEach(el => el.classList.remove('copiado'));
                document.querySelectorAll('.copiavel .linha-pulada').forEach(sp => {
                    const parent = sp.parentElement;
                    if (parent) {
                        const btn = parent.querySelector('.btn-copiar');
                        const txt = sp.textContent;
                        parent.innerHTML = '';
                        const realceSpan = document.createElement('span');
                        realceSpan.className = 'texto-realce-copia';
                        realceSpan.textContent = txt;
                        parent.appendChild(realceSpan);
                        if (btn) parent.appendChild(btn);
                    }
                });
            }

            function registrarPuloLinha(info) {
                const us = localStorage.getItem('efe_usuario');
                const nick = us ? JSON.parse(us).nick : '';
                postNoCors(GS_WEBAPP_URL, { action: 'pulo_linha', nick, cargo: cargoUsuario || '', aula: aulaAtualAberta || '', cargo_aula: cargoAtualAberto || '', linha_clicada: info?.linhaClicada ?? '', linhas_puladas: Array.from(linhasPuladas).join(', '), data: new Date().toISOString() }).catch(() => {});
            }

            function mostrarModalPulo() {
                const existing = document.getElementById('modalPulo');
                if (existing) existing.remove();
                const modal = document.createElement('div');
                modal.id = 'modalPulo';
                modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:3000;display:flex;align-items:center;justify-content:center;padding:18px';
                modal.innerHTML = `<div class="pulo-alert-box"><div class="pulo-alert-icon"><i class="ph ph-warning-circle"></i></div><h3>Linha pulada</h3><p>Você pulou uma linha. Continue com atenção para manter a ordem correta da aplicação.</p><button onclick="document.getElementById('modalPulo').remove()">Entendi</button></div>`;
                document.body.appendChild(modal);
            }

            function abrirModalRelatorio(cargo, aulaId) {
                const us = localStorage.getItem('efe_usuario');
                const nick = us ? JSON.parse(us).nick : '';
                const now = new Date();
                const localIso = (new Date(now - now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                if (cargo === 'professor') {
                    document.getElementById('rp_professor').value = nick;
                    document.getElementById('rp_aula').value = aulaId || '';
                    document.getElementById('rp_aluno').value = '';
                    document.getElementById('rp_inicio').value = getRememberedClassStart(aulaId) || localIso;
                    document.getElementById('rp_termino').value = localIso;
                    document.getElementById('rp_resultado').value = '';
                    document.getElementById('rp_comentarios').value = '';
                    document.getElementById('rp_comprova_wrap').style.display = 'none';
                    document.getElementById('rp_acompanhada').checked = false;
                    document.getElementById('rp_mentor_wrap').style.display = 'none';
                    document.getElementById('modalRelProf').classList.add('ativo');
                } else if (cargo === 'mentor') {
                    document.getElementById('rm_datetime').value = localIso;
                    document.getElementById('rm_mentor').value = nick;
                    document.getElementById('rm_professor').value = '';
                    document.getElementById('rm_aluno').value = '';
                    document.getElementById('rm_comprova').value = '';
                    document.getElementById('rm_comentarios').value = '';
                    document.getElementById('modalRelMentor').classList.add('ativo');
                } else if (cargo === 'graduador') {
                    document.getElementById('rg_datetime').value = localIso;
                    document.getElementById('rg_graduador').value = nick;
                    document.getElementById('rg_graduado').value = '';
                    document.getElementById('rg_graduacao').value = '';
                    document.getElementById('rg_status').value = '';
                    document.getElementById('modalRelGrad').classList.add('ativo');
                }
            }
            window.abrirModalRelatorio = abrirModalRelatorio;

            document.getElementById('rp_resultado').addEventListener('change', function () {
                document.getElementById('rp_comprova_wrap').style.display = this.value === 'Caiu/Saiu' ? '' : 'none';
            });

            function fecharModalRel(id) { document.getElementById(id).classList.remove('ativo'); }
            window.fecharModalRel = fecharModalRel;

            function mostrarResultadoEnvio(estado, mensagem, sub) {
                const modal = document.getElementById('modalSendResult');
                const icon = document.getElementById('sendAnimIcon');
                const txt = document.getElementById('sendResultText');
                const subtxt = document.getElementById('sendResultSub');
                const btnFechar = document.getElementById('btnFecharSendResult');
                modal.classList.add('ativo');
                icon.className = 'send-anim-icon'; icon.innerHTML = '';
                if (estado === 'loading') {
                    icon.innerHTML = `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" stroke-width="3"/><circle cx="28" cy="28" r="22" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-dasharray="34.5 103.7" style="animation:sendSpin .85s linear infinite;transform-origin:center"/></svg>`;
                    txt.innerHTML = '<span style="color:var(--text3);font-size:16px;letter-spacing:2px">ENVIANDO</span>';
                    subtxt.textContent = ''; btnFechar.style.display = 'none';
                } else if (estado === 'sucesso') {
                    icon.innerHTML = `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="22" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="138.2" stroke-dashoffset="138.2" style="animation:sendDrawCircle .5s cubic-bezier(.4,0,.2,1) forwards;transform-origin:center"/><polyline points="16,29 24,37 40,19" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="42" stroke-dashoffset="42" style="animation:sendDrawMark .38s ease .45s forwards"/></svg>`;
                    txt.innerHTML = '<span style="color:var(--accent);letter-spacing:2px">ENVIADO</span>';
                    subtxt.textContent = sub || 'Registrado com sucesso.'; btnFechar.style.display = '';
                } else {
                    icon.innerHTML = `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="22" fill="none" stroke="#e06060" stroke-width="2.5" stroke-dasharray="138.2" stroke-dashoffset="138.2" style="animation:sendDrawCircle .5s cubic-bezier(.4,0,.2,1) forwards;transform-origin:center"/><line x1="19" y1="19" x2="37" y2="37" stroke="#e06060" stroke-width="3" stroke-linecap="round" stroke-dasharray="26" stroke-dashoffset="26" style="animation:sendDrawLine1 .28s ease .45s forwards"/><line x1="37" y1="19" x2="19" y2="37" stroke="#e06060" stroke-width="3" stroke-linecap="round" stroke-dasharray="26" stroke-dashoffset="26" style="animation:sendDrawLine2 .28s ease .62s forwards"/></svg>`;
                    txt.innerHTML = '<span style="color:#e06060;letter-spacing:2px">ERRO</span>';
                    subtxt.textContent = sub || 'Tente novamente.'; btnFechar.style.display = '';
                }
            }

            async function enviarRelatorio(tipo) {
                let dados = {}, url = '', modalId = '';
                const us = localStorage.getItem('efe_usuario');
                const nick = us ? JSON.parse(us).nick : '';
                if (tipo === 'professor') {
                    const aluno = document.getElementById('rp_aluno').value.trim();
                    if (!aluno) { showToast('Informe o nick do aluno!'); return; }
                    const resultado = document.getElementById('rp_resultado').value;
                    if (!resultado) { showToast('Selecione o resultado!'); return; }
                    dados = { action: 'relatorio_professor', tipo: 'professor', professor: nick, aluno, aula: document.getElementById('rp_aula').value, inicio: document.getElementById('rp_inicio').value, termino: document.getElementById('rp_termino').value, resultado, comprova: resultado === 'Caiu/Saiu' ? document.getElementById('rp_comprova').value.trim() : '', comentarios: document.getElementById('rp_comentarios').value.trim(), acompanhada: document.getElementById('rp_acompanhada').checked ? 'Sim' : 'Não', mentor_nick: document.getElementById('rp_acompanhada').checked ? document.getElementById('rp_mentor').value.trim() : '', comprovacoes: document.getElementById('rp_comprovacoes').value.trim(), simulada: document.getElementById('rp_simulada').value };
                    url = GS_PROF; modalId = 'modalRelProf';
                } else if (tipo === 'mentor') {
                    const prof = document.getElementById('rm_professor').value.trim();
                    if (!prof) { showToast('Informe o nick do professor!'); return; }
                    dados = { action: 'relatorio_mentor', tipo: 'mentor', datetime: document.getElementById('rm_datetime').value, mentor: nick, professor: prof, comprova: document.getElementById('rm_comprova').value.trim(), comentarios: document.getElementById('rm_comentarios').value.trim(), tipo_mentoria: 'ACOMPANHAMENTO', aluno: document.getElementById('rm_aluno').value.trim() };
                    url = GS_MENTOR; modalId = 'modalRelMentor';
                } else if (tipo === 'graduador') {
                    const graduado = document.getElementById('rg_graduado').value.trim();
                    const grad = document.getElementById('rg_graduacao').value;
                    const status = document.getElementById('rg_status').value;
                    if (!graduado || !grad || !status) { showToast('Preencha todos os campos!'); return; }
                    dados = { action: 'relatorio_graduador', tipo: 'graduador', datetime: document.getElementById('rg_datetime').value, graduador: nick, graduado, graduacao: grad, status };
                    url = GS_GRAD; modalId = 'modalRelGrad';
                }
                document.getElementById(modalId).classList.remove('ativo');
                mostrarResultadoEnvio('loading');
                try {
                    await postNoCors(url, dados);
                    mostrarResultadoEnvio('sucesso', 'ENVIADO!', 'Seu relatório foi registrado.');
                } catch { mostrarResultadoEnvio('erro', 'ERRO', 'Não foi possível enviar. Tente novamente.'); }
            }
            window.enviarRelatorio = enviarRelatorio;

            async function carregarDocs() {
                if (docsCarregados) return;
                const tabsEl = document.getElementById('docsLeftTabs');
                tabsEl.innerHTML = '<div class="docs-loading-state"><div class="docs-spinner"></div><span>Carregando<span class="loading-dots"></span></span></div>';
                let regimento = '', codigoPenal = '';
                try {
                    const rows = await gsGet(SS_MAIN, "'[Documentos]'!A2:B2");
                    if (rows[0]) { regimento = (rows[0][0] || '').trim(); codigoPenal = (rows[0][1] || '').trim(); }
                } catch { }
                docsCarregados = true;

                const docs = [
                    { id: 'ri', titulo: 'Regimento Interno', conteudo: regimento },
                    { id: 'cp', titulo: 'Código Penal Interno', conteudo: codigoPenal },
                ];
                window._docsData = docs;

                tabsEl.innerHTML = '';
                docs.forEach((doc, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'docs-left-tab' + (idx === 0 ? ' active' : '');
                    btn.dataset.docId = doc.id;
                    btn.innerHTML = `<i class="ph ${doc.icon}"></i> ${doc.titulo}`;
                    btn.onclick = () => mostrarDoc(doc.id);
                    tabsEl.appendChild(btn);
                });

                const container = document.getElementById('docsContentContainer');
                container.innerHTML = '';
                docs.forEach((doc, idx) => {
                    const area = document.createElement('div');
                    area.className = 'docs-content-area' + (idx === 0 ? ' active' : '');
                    area.id = 'doc-area-' + doc.id;
                    area.innerHTML = `
                        <div class="docs-scroll-wrap">
                            <div class="docs-scroll-header">
                                <span style="font-size:12px;color:#888;font-weight:600;margin-left:6px">${doc.titulo}</span>
                            </div>
                            <div class="docs-scroll-inner">
                                <div class="docs-doc-body">${doc.conteudo || '<p style="color:#9a9ab0;font-style:italic">Documento ainda não disponível.</p>'}</div>
                            </div>
                        </div>
                    `;
                    container.appendChild(area);
                });

                document.getElementById('docsWelcome').style.display = 'none';
                mostrarDoc(docs[0].id);
            }

            function mostrarDoc(id) {
                document.getElementById('docsWelcome').style.display = 'none';
                document.querySelectorAll('.docs-left-tab').forEach(t => t.classList.toggle('active', t.dataset.docId === id));
                document.querySelectorAll('.docs-content-area').forEach(a => a.classList.toggle('active', a.id === 'doc-area-' + id));
            }
            window.mostrarDoc = mostrarDoc;

            async function abrirModalPerfil(nick, isMeuPerfil, cargoOverride) {
                const modal = document.getElementById('modalPerfil');
                modal.classList.add('ativo');

                document.getElementById('modalPerfilNick').textContent = nick;
                document.getElementById('modalPerfilAvatar').src = avatarHeadUrl(nick);

                const cargoExibir = cargoOverride || (isMeuPerfil ? cargoUsuario : null) || '—';
                document.getElementById('modalPerfilCargo').textContent = cargoExibir;

                const dataEl = document.getElementById('modalPerfilDataLabel');
                if (dataEl) dataEl.textContent = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });

                ['modalPerfilPts', 'modalPerfilMeta', 'modalPerfilStatus'].forEach(id => {
                    const el = document.getElementById(id);
                    el.innerHTML = '<span class="loading-dots"></span>';
                    el.className = 'perfil-stat-valor';
                });

                try {
                    let pts = 0, tipoEncontrado = null;
                    for (const tipo of ['professores', 'mentores', 'graduadores']) {
                        try {
                            const dados = await getRowsRanking(tipo);
                            const found = dados.find(d => d.nick === nick);
                            if (found) { pts = found.pts; tipoEncontrado = tipo; break; }
                        } catch { }
                    }

                    document.getElementById('modalPerfilPts').textContent = pts + ' pts';
                    document.getElementById('modalPerfilMeta').textContent = pts > 0 ? 'Atingida' : 'Pendente';

                    const statusEl = document.getElementById('modalPerfilStatus');
                    statusEl.textContent = pts > 0 ? 'POSITIVO' : 'NEGATIVO';
                    statusEl.className = 'perfil-stat-valor ' + (pts > 0 ? 'positivo' : 'negativo');
                } catch {
                    ['modalPerfilPts', 'modalPerfilMeta', 'modalPerfilStatus'].forEach(id => {
                        const el = document.getElementById(id);
                        el.textContent = 'Erro';
                        el.className = 'perfil-stat-valor';
                    });
                }
            }

            function abrirModalSugestoes() {
                const us = localStorage.getItem('efe_usuario');
                document.getElementById('nickSugestao').value = us ? JSON.parse(us).nick : 'Não logado';
                document.getElementById('textoSugestao').value = '';
                document.getElementById('modalSugestoes').classList.add('ativo');
            }
            window.abrirModalSugestoes = abrirModalSugestoes;

            document.getElementById('btnEnviarSugestao').onclick = async function () {
                const nick = document.getElementById('nickSugestao').value;
                const txt = document.getElementById('textoSugestao').value.trim();
                if (!txt) { showToast('Digite sua sugestão!'); return; }
                try {
                    await animateSubmitButton(this, () => postNoCors(SUGESTOES_URL, { action: 'sugestao', nick, sugestao: txt, data: new Date().toISOString() }));
                    document.getElementById('modalSugestoes').classList.remove('ativo');
                    showToast('Sugestão enviada!');
                } catch { showToast('Erro ao enviar.'); }
            };

            function abrirModalJustificativa() {
                const us = localStorage.getItem('efe_usuario');
                if (!us) { showToast('Você precisa estar logado!'); return; }
                const usuario = JSON.parse(us);
                document.getElementById('nickJusti').textContent = usuario.nick;
                document.getElementById('cargoJusti').textContent = cargoUsuario || '—';
                document.getElementById('motivoJusti').value = '';
                document.getElementById('ultimaJustiCard').innerHTML = '<div class="ultima-justi-empty">Clique em verificar para puxar sua justificativa mais recente.</div>';
                document.getElementById('modalJustificativa').classList.add('ativo');
                getJanelaJustificativa();
            }

            function trocarAbaJustificativa(tab) {
                document.querySelectorAll('.justi-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.justiTab === tab));
                document.getElementById('justiPanelEnviar').classList.toggle('active', tab === 'enviar');
                document.getElementById('justiPanelVerificar').classList.toggle('active', tab === 'verificar');
            }

            document.querySelectorAll('.justi-tab').forEach(btn => { btn.onclick = () => trocarAbaJustificativa(btn.dataset.justiTab); });

            function fecharModalJustificativa() { document.getElementById('modalJustificativa').classList.remove('ativo'); }

            document.getElementById('btnFecharJusti').onclick = fecharModalJustificativa;
            document.getElementById('btnCancelarJusti').onclick = fecharModalJustificativa;

            document.getElementById('btnEnviarJusti').onclick = async function () {
                if (!getJanelaJustificativa()) { showToast('A justificativa está fechada.'); return; }
                const motivo = document.getElementById('motivoJusti').value.trim();
                if (!motivo) { showToast('Digite o motivo!'); return; }
                const us = localStorage.getItem('efe_usuario');
                const nick = us ? JSON.parse(us).nick : '';
                try {
                    await animateSubmitButton(this, () => postNoCors(JUSTIFICATIVA_URL, { action: 'justificativa', nick, cargo: cargoUsuario, motivo, data: new Date().toISOString() }));
                    fecharModalJustificativa();
                    showToast('Justificativa enviada!');
                } catch { showToast('Erro ao enviar.'); }
            };

            document.getElementById('btnVerificarJusti').onclick = async function () {
                const us = localStorage.getItem('efe_usuario');
                const nick = us ? JSON.parse(us).nick : '';
                const box = document.getElementById('ultimaJustiCard');
                box.innerHTML = '<div class="ultima-justi-empty">Buscando justificativa...</div>';
                try {
                    const data = await getWebAppJson({ action: 'verificar_justificativa', nick });
                    renderUltimaJustificativa(data);
                } catch {
                    box.innerHTML = '<div class="ultima-justi-empty">Não foi possível verificar agora.</div>';
                }
            };

            document.getElementById('btnJustificativa').onclick = abrirModalJustificativa;

            const rSalvo = localStorage.getItem('efe_ranking_atual');
            if (rSalvo && RANKING_GS[rSalvo]) rankingAtual = rSalvo;
            verificarLoginSalvo();
            carregarTop1Home();

        });
