/* ==========================================================================
   bloom english - comportamento das telas
   --------------------------------------------------------------------------
   JavaScript puro, sem framework e sem servidor. Os dados vem do objeto
   BLOOM_DB (js/mock-data.js, carregado antes deste arquivo). Na primeira
   visita a base e copiada para o localStorage; dali em diante todas as
   telas leem e gravam la, por isso o pedido que o aluno envia aparece na
   tela da professora ao abrir a pagina dela.

   O HTML so traz a estrutura vazia (tbody, .numeros, diarios e selects).
   Tudo e desenhado aqui com as mesmas classes que ja existiam no CSS.

   Areas: cada tela interna declara <body data-area="professora|aluno"> e
   so abre com a sessao do perfil dela. Sem sessao, volta para a entrada;
   com o perfil trocado, vai para o inicio da propria area. O aluno ve
   apenas os proprios dados; a professora consulta o historico de qualquer
   aluno na propria Gestao de Alunos, sem abrir telas do aluno.

   ATENCAO: nao existe autenticacao real. A tela de entrar apenas confere
   se o e-mail ou o nome existe na base, e o controle de area acima roda no
   navegador. Nao use isso para proteger nada: qualquer pessoa com acesso ao
   navegador le e altera esses dados pelo console.
   ========================================================================== */

(function () {
    'use strict';

    var CHAVE = 'bloom-english-db-v2';
    var BASE = window.BLOOM_DB || null;

    var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'];
    var CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];


    /* ------------------------------------------------------------ dados ---- */

    function vazio() {
        return {
            versao: 0,
            calendario: { hoje: '', semana: [], horarios: [], intervalo: '' },
            professoras: [], alunos: [], leads: [], gradeAulas: [],
            diariosClasse: [], atividades: [], vinculos: [], tiposAula: []
        };
    }

    function copiaDaBase() {
        var d = BASE ? JSON.parse(JSON.stringify(BASE)) : vazio();
        d.sessao = null;
        return d;
    }

    var dados = carregar();

    function carregar() {
        try {
            var cru = window.localStorage.getItem(CHAVE);
            if (cru) {
                var d = JSON.parse(cru);
                if (d && d.alunos && (!BASE || d.versao === BASE.versao)) { return d; }
            }
        } catch (e) {
            /* localStorage indisponivel ou corrompido: recomeca pela base */
        }
        var novo = copiaDaBase();
        gravar(novo);
        return novo;
    }

    function gravar(d) {
        dados = d || dados;
        try {
            window.localStorage.setItem(CHAVE, JSON.stringify(dados));
        } catch (e) {
            /* sem persistencia: a tela continua funcionando na sessao atual */
        }
    }


    /* ----------------------------------------------------------- apoio ---- */

    function esc(v) {
        return String(v === null || v === undefined ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* texto entre *asteriscos* nos diarios vira italico, depois de escapar */
    function enfase(v) {
        return esc(v).replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }

    function achar(lista, teste) {
        for (var i = 0; i < lista.length; i++) { if (teste(lista[i])) { return lista[i]; } }
        return null;
    }

    function filtrar(lista, teste) {
        var saida = [];
        for (var i = 0; i < lista.length; i++) { if (teste(lista[i])) { saida.push(lista[i]); } }
        return saida;
    }

    function contar(lista, teste) {
        return filtrar(lista, teste).length;
    }

    function mesmoId(a, b) {
        return a !== null && a !== undefined && b !== null && b !== undefined && Number(a) === Number(b);
    }

    function proximoId(lista) {
        var maior = 0;
        for (var i = 0; i < lista.length; i++) { if (Number(lista[i].id) > maior) { maior = Number(lista[i].id); } }
        return maior + 1;
    }

    function pegar(id) {
        return document.getElementById(id);
    }

    function valor(id) {
        var c = pegar(id);
        return c ? String(c.value).replace(/^\s+|\s+$/g, '') : '';
    }

    function escrever(seletor, html) {
        var el = document.querySelector(seletor);
        if (el) { el.innerHTML = html; }
    }

    function linkSeguro(url) {
        return /^https?:\/\//i.test(String(url));
    }

    /* link da aula; sem link proprio, abre a reuniao instantanea do Meet */
    function linkDaSala(g) {
        if (g && g.link && linkSeguro(g.link)) { return g.link; }
        return dados.salaVirtualPadrao || 'https://meet.google.com/new';
    }


    /* ---------------------------------------------------- datas e horas --- */

    function cal() { return dados.calendario; }
    function hoje() { return cal().hoje; }

    /* datas sao tratadas como texto aaaa-mm-dd para nao depender de fuso */
    function partes(iso) {
        var p = String(iso).split('-');
        if (p.length !== 3) { return null; }
        return { a: Number(p[0]), m: Number(p[1]), d: Number(p[2]), mm: p[1], dd: p[2] };
    }

    function fmtBr(iso) {
        var p = partes(iso);
        return p ? p.dd + '/' + p.mm + '/' + p.a : String(iso);
    }

    function nomeDia(iso) {
        var p = partes(iso);
        return p ? DIAS[new Date(p.a, p.m - 1, p.d).getDay()] : '';
    }

    function diaCurto(iso) {
        return nomeDia(iso).replace('-feira', '');
    }

    function rotuloCurto(iso) {
        var p = partes(iso);
        return p ? diaCurto(iso) + ' (' + p.dd + '/' + p.mm + ')' : String(iso);
    }

    function rotuloLongo(iso, comAno) {
        var p = partes(iso);
        if (!p) { return String(iso); }
        return nomeDia(iso) + ', ' + p.d + ' de ' + MESES[p.m - 1] + (comAno ? ' de ' + p.a : '');
    }

    /* "21 a 25 de Setembro de 2026" ou "28 de Setembro a 2 de Outubro de 2026" */
    function periodoSemana(minusculo) {
        var s = cal().semana;
        var a = partes(s[0]);
        var b = partes(s[s.length - 1]);
        if (!a || !b) { return ''; }
        var mesA = MESES[a.m - 1];
        var mesB = MESES[b.m - 1];
        if (minusculo) { mesA = mesA.toLowerCase(); mesB = mesB.toLowerCase(); }
        return a.m === b.m
            ? a.d + ' a ' + b.d + ' de ' + mesB + ' de ' + b.a
            : a.d + ' de ' + mesA + ' a ' + b.d + ' de ' + mesB + ' de ' + b.a;
    }

    function hh(hora) {
        return String(hora).slice(0, 2);
    }

    function fimDaAula(hora) {
        var p = String(hora).split(':');
        var total = Number(p[0]) * 60 + Number(p[1] || 0) + 50;
        var h = Math.floor(total / 60) % 24;
        var m = total % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }

    function faixa(hora) {
        return hora + ' - ' + fimDaAula(hora);
    }


    /* ------------------------------------------------------- consultas ---- */

    function professoraPorId(id) {
        return achar(dados.professoras, function (p) { return mesmoId(p.id, id); });
    }

    function alunoPorId(id) {
        return achar(dados.alunos, function (a) { return mesmoId(a.id, id); });
    }

    function leadPorId(id) {
        return achar(dados.leads, function (l) { return mesmoId(l.id, id); });
    }

    function aulaPorId(id) {
        return achar(dados.gradeAulas, function (g) { return mesmoId(g.id, id); });
    }

    function atividadePorId(id) {
        return achar(dados.atividades, function (t) { return mesmoId(t.id, id); });
    }

    function ativa(g) {
        return g.status !== 'cancelada' && g.status !== 'recusada';
    }

    function ordenar(lista) {
        return lista.sort(function (a, b) {
            if (a.data !== b.data) { return a.data < b.data ? -1 : 1; }
            if (a.hora !== b.hora) { return a.hora < b.hora ? -1 : 1; }
            return Number(a.professoraId) - Number(b.professoraId);
        });
    }

    function compromissosDoDia(iso) {
        return ordenar(filtrar(dados.gradeAulas, function (g) { return g.data === iso && ativa(g); }));
    }

    function compromissosNoHorario(iso, hora) {
        return filtrar(compromissosDoDia(iso), function (g) { return hh(g.hora) === hh(hora); });
    }

    /* horario ja tomado por aula confirmada, concluida ou pedido pendente */
    function ocupado(professoraId, iso, hora, ignorarId) {
        return !!achar(dados.gradeAulas, function (g) {
            return ativa(g) && mesmoId(g.professoraId, professoraId) && g.data === iso
                && hh(g.hora) === hh(hora) && !mesmoId(g.id, ignorarId);
        });
    }

    /* ao aprovar, so bloqueia o que ja esta firmado (pedidos nao bloqueiam) */
    function conflitoFirmado(g) {
        return achar(dados.gradeAulas, function (x) {
            return !mesmoId(x.id, g.id) && (x.status === 'confirmada' || x.status === 'concluida')
                && mesmoId(x.professoraId, g.professoraId) && x.data === g.data && hh(x.hora) === hh(g.hora);
        });
    }

    function pendentes() {
        return ordenar(filtrar(dados.gradeAulas, function (g) { return g.status === 'pendente'; }));
    }

    function confirmadasDeAlunos() {
        return ordenar(filtrar(dados.gradeAulas, function (g) {
            return g.status === 'confirmada' && g.alunoId !== null && g.alunoId !== undefined;
        }));
    }

    function horariosLivres(professoraId) {
        var livres = [];
        var semana = cal().semana;
        var horas = cal().horarios;
        for (var d = 0; d < semana.length; d++) {
            if (semana[d] < hoje()) { continue; }
            for (var h = 0; h < horas.length; h++) {
                if (!ocupado(professoraId, semana[d], horas[h], null)) {
                    livres.push({ data: semana[d], hora: horas[h] });
                }
            }
        }
        return livres;
    }

    /* nome que aparece nos cartoes e nas tabelas */
    function pessoa(g) {
        var l = leadPorId(g.leadId);
        if (l) { return { nome: l.nome, rotulo: 'Lead: ' + l.nome, lead: l, aluno: null }; }
        var a = alunoPorId(g.alunoId);
        if (a) { return { nome: a.nome, rotulo: (a.trato || 'Aluno(a)') + ': ' + a.nome, lead: null, aluno: a }; }
        return { nome: 'Horário bloqueado', rotulo: 'Horário bloqueado', lead: null, aluno: null };
    }

    function atualizarStatusAluno(alunoId) {
        var a = alunoPorId(alunoId);
        if (!a) { return; }
        var temPedido = !!achar(dados.gradeAulas, function (g) {
            return g.status === 'pendente' && mesmoId(g.alunoId, alunoId);
        });
        a.status = temPedido ? 'Pendente' : 'Ativo';
    }

    function emailEmUso(email) {
        var e = String(email).toLowerCase();
        if (!e) { return false; }
        var todos = dados.professoras.concat(dados.alunos, dados.leads);
        return !!achar(todos, function (x) { return String(x.email).toLowerCase() === e; });
    }


    /* ---------------------------------------------------------- sessao ---- */

    var INICIO_DA_AREA = { professora: 'professora-agenda.html', aluno: 'aluno-minha-agenda.html' };

    /* area da tela atual, marcada em <body data-area="professora|aluno">.
       Entrar, criar conta e recuperar senha nao tem area. */
    function areaDaPagina() {
        return document.body ? document.body.getAttribute('data-area') : null;
    }

    function sessaoValida() {
        var s = dados.sessao;
        if (!s) { return null; }
        if (s.perfil === 'professora' && professoraPorId(s.professoraId)) { return s; }
        if (s.perfil === 'aluno' && alunoPorId(s.alunoId)) { return s; }
        return null;
    }

    /* cada area so abre com a sessao do perfil dela: sem sessao volta para
       a tela de entrar; com o perfil trocado vai para o inicio da propria
       area. Devolve false quando a tela esta sendo redirecionada. */
    function protegerArea() {
        var area = areaDaPagina();
        if (!area) { return true; }
        var s = sessaoValida();
        if (!s) {
            if (dados.sessao) { dados.sessao = null; gravar(); }
            alert('Entre com a sua conta para acessar esta área.');
            window.location.replace('index.html');
            return false;
        }
        if (s.perfil !== area) {
            alert(area === 'professora' ? 'Esta área é exclusiva da professora.' : 'Esta área é exclusiva do aluno.');
            window.location.replace(INICIO_DA_AREA[s.perfil]);
            return false;
        }
        return true;
    }

    /* o aluno so enxerga os proprios dados: sempre o aluno da sessao,
       nunca um id vindo da URL */
    function alunoAtual() {
        var s = sessaoValida();
        return s && s.perfil === 'aluno' ? alunoPorId(s.alunoId) : null;
    }

    /* historico aberto na Gestao de Alunos (?historico=ID abre direto,
       usado pelo "Ver Diario" da agenda). Fica so na memoria da tela. */
    var historicoAberto = (function () {
        var m = /[?&]historico=(\d+)/.exec(window.location.search || '');
        return m ? Number(m[1]) : null;
    }());

    function professoraAtual() {
        var s = sessaoValida();
        if (s && s.perfil === 'professora') { return professoraPorId(s.professoraId); }
        return dados.professoras[0] || null;
    }


    /* ------------------------------------------------ gestao de alunos ---- */

    function cartaoNumero(cls, id, numero, rotulo) {
        return '<div class="' + cls + '"><strong' + (id ? ' id="' + id + '"' : '') + '>'
            + esc(numero) + '</strong><span>' + esc(rotulo) + '</span></div>';
    }

    function renderNumerosAlunos() {
        var alvo = pegar('numeros-alunos');
        if (!alvo) { return; }
        var direto = contar(dados.alunos, function (a) { return a.vinculo === 'Aluno Direto'; });
        var escola = contar(dados.alunos, function (a) { return a.vinculo === 'Escola de Idiomas'; });
        alvo.innerHTML = cartaoNumero('num', 'n-ativos', dados.alunos.length, 'Alunos ativos')
            + cartaoNumero('num', 'n-direto', direto, 'Aluno direto')
            + cartaoNumero('num', 'n-escola', escola, 'Escola de idiomas')
            + cartaoNumero('num num-fim num-alerta', 'n-leads', dados.leads.length, 'Leads em experimental');
    }

    /* ficha do historico, aberta logo abaixo da linha do aluno: a professora
       consulta sem sair da Gestao de Alunos */
    function linhaHistorico(a, zebra) {
        var p = professoraPorId(a.professoraId);
        var freq = a.frequencia === null || a.frequencia === undefined ? '—' : a.frequencia + '%';
        var diarios = filtrar(dados.diariosClasse, function (d) { return mesmoId(d.alunoId, a.id); });
        diarios.sort(function (x, y) { return x.dataAula < y.dataAula ? 1 : -1; });
        var ativs = filtrar(dados.atividades, function (t) { return mesmoId(t.alunoId, a.id); });
        ativs.sort(function (x, y) {
            if (x.status !== y.status) { return x.status === 'Pendente' ? -1 : 1; }
            return x.envio < y.envio ? 1 : -1;
        });
        var espaco = ' style="margin-top:8px"';

        var html = '<div class="registro">'
            + '<p class="registro-data">Histórico &mdash; ' + esc(a.nome) + '</p>'
            + '<h3>' + esc(a.aulasRealizadas) + ' aulas realizadas &nbsp;|&nbsp; ' + esc(freq) + ' de frequência'
            + ' &nbsp;|&nbsp; Tarefas ' + esc(String(a.tarefas).replace('/', ' / '))
            + ' &nbsp;|&nbsp; Professora: ' + esc(p ? p.nome : '—') + '</h3>';
        if (!diarios.length) {
            html += '<p><em>Nenhum registro de aula ainda.</em></p>';
        }
        for (var i = 0; i < diarios.length; i++) {
            var d = diarios[i];
            html += '<p' + (i ? espaco : '') + '><strong>' + esc(fmtBr(d.dataAula)) + ' &mdash; Aula ' + esc(d.aula)
                + ' &mdash; ' + esc(d.topico) + ':</strong> ' + enfase(d.feedback) + '</p>';
        }
        var itens = [];
        for (var k = 0; k < ativs.length; k++) {
            var t = ativs[k];
            itens.push(esc(t.titulo) + ' <span class="selo ' + (t.status === 'Pendente' ? 'selo-espera' : 'selo-ok') + '">'
                + esc(t.status) + '</span> '
                + (t.status === 'Pendente' ? 'prazo ' + esc(fmtBr(t.prazo)) : esc(t.resultado || 'entregue')));
        }
        html += '<p' + espaco + '><strong>Atividades:</strong> ' + (itens.length ? itens.join(' &nbsp;&middot;&nbsp; ') : 'nenhuma enviada ainda.') + '</p>'
            + '</div>';
        return '<tr' + (zebra ? ' class="par"' : '') + '><td colspan="6" id="historico-aberto">' + html + '</td></tr>';
    }

    function renderAlunos() {
        var alvo = pegar('lista-alunos');
        if (!alvo) { return; }
        var html = '';
        var n = 0;
        var i;
        for (i = 0; i < dados.alunos.length; i++, n++) {
            var a = dados.alunos[i];
            var aberto = mesmoId(a.id, historicoAberto);
            html += '<tr' + (n % 2 ? ' class="par"' : '') + '>'
                + '<td class="nome">' + esc(a.nome) + '</td>'
                + '<td>' + esc(a.email) + '</td>'
                + '<td>' + esc(a.telefone) + '</td>'
                + '<td><span class="' + (a.vinculo === 'Aluno Direto' ? 'selo selo-ok' : 'selo') + '">' + esc(a.vinculo) + '</span></td>'
                + '<td class="' + (a.status === 'Ativo' ? 'status-ativo' : 'status-prospecto') + '">' + esc(a.status) + '</td>'
                + '<td class="acoes"><button class="pmini" type="submit" name="historico" value="' + esc(a.id) + '"'
                + ' aria-expanded="' + (aberto ? 'true' : 'false') + '">' + (aberto ? 'Fechar Histórico' : 'Ver Histórico') + '</button></td>'
                + '</tr>';
            if (aberto) { html += linhaHistorico(a, n % 2); }
        }
        for (i = 0; i < dados.leads.length; i++, n++) {
            var l = dados.leads[i];
            html += '<tr' + (n % 2 ? ' class="par"' : '') + '>'
                + '<td class="nome">' + esc(l.nome) + '</td>'
                + '<td>' + esc(l.email) + '</td>'
                + '<td>' + esc(l.telefone) + '</td>'
                + '<td><span class="selo selo-exp">Lead (Experimental)</span></td>'
                + '<td class="status-prospecto">' + esc(l.status) + '</td>'
                + '<td class="acoes"><button class="pmini pmini-forte" type="submit" name="efetivar" value="' + esc(l.id) + '">Efetivar Matrícula</button></td>'
                + '</tr>';
        }
        alvo.innerHTML = html || '<tr><td colspan="6">Nenhum aluno ou lead cadastrado.</td></tr>';
    }


    /* ------------------------------------------------- gestao de aulas ---- */

    function seloPendente(g) {
        var p = pessoa(g);
        if (p.lead) {
            return p.lead.status === 'Aguardando Contato'
                ? '<span class="selo">Aguardando Contato</span>'
                : '<span class="selo selo-exp">Experimental Pendente</span>';
        }
        return '<span class="selo selo-espera">Aguardando Aprovação</span>';
    }

    function vinculoDa(g) {
        var p = pessoa(g);
        if (p.lead) { return 'Lead (Aula Experimental)'; }
        if (!p.aluno) { return 'Bloqueio'; }
        return p.aluno.vinculo + (g.tipo === 'reposicao' ? ' (Reposição)' : '')
            + (g.tipo === 'experimental' ? ' (Experimental)' : '');
    }

    function renderPendentes() {
        var alvo = pegar('lista-pendentes');
        if (!alvo) { return; }
        var itens = pendentes();
        if (!itens.length) {
            alvo.innerHTML = '<tr><td colspan="6">Nenhuma solicitação pendente no momento.</td></tr>';
            return;
        }
        var html = '';
        for (var i = 0; i < itens.length; i++) {
            var g = itens[i];
            html += '<tr' + (i % 2 ? ' class="par"' : '') + '>'
                + '<td class="nome">' + esc(pessoa(g).nome) + '</td>'
                + '<td>' + esc(vinculoDa(g)) + '</td>'
                + '<td>' + esc(fmtBr(g.data)) + ' (' + esc(nomeDia(g.data)) + ')</td>'
                + '<td>' + esc(faixa(g.hora)) + '</td>'
                + '<td>' + seloPendente(g) + '</td>'
                + '<td class="acoes">'
                + '<button class="pmini pmini-forte" type="submit" name="aprovar" value="' + esc(g.id) + '">Aprovar</button>'
                + '<button class="pmini pmini-perigo" type="submit" name="recusar" value="' + esc(g.id) + '">Recusar</button>'
                + '</td></tr>';
        }
        alvo.innerHTML = html;
    }

    function renderConfirmadas() {
        var alvo = pegar('lista-confirmadas');
        if (!alvo) { return; }
        var itens = confirmadasDeAlunos();
        if (!itens.length) {
            alvo.innerHTML = '<tr><td colspan="6">Nenhuma aula confirmada na agenda.</td></tr>';
            return;
        }
        var html = '';
        for (var i = 0; i < itens.length; i++) {
            var g = itens[i];
            html += '<tr' + (i % 2 ? ' class="par"' : '') + '>'
                + '<td class="nome">' + esc(pessoa(g).nome) + '</td>'
                + '<td>' + esc(fmtBr(g.data)) + '</td>'
                + '<td>' + esc(faixa(g.hora)) + '</td>'
                + '<td>' + esc(vinculoDa(g)) + '</td>'
                + '<td><span class="selo selo-ok">Confirmada</span></td>'
                + '<td class="acoes">'
                + '<button class="pmini" type="submit" name="reagendar" value="' + esc(g.id) + '">Reagendar</button>'
                + '<button class="pmini pmini-perigo" type="submit" name="cancelar" value="' + esc(g.id) + '">Cancelar</button>'
                + '</td></tr>';
        }
        alvo.innerHTML = html;
    }


    /* ---------------------------------------------------------- selects --- */

    /* refaz as opcoes mantendo a escolha atual, se ela ainda existir */
    function preencherSelect(id, opcoes) {
        var sel = pegar(id);
        if (!sel) { return; }
        var atual = sel.value;
        sel.options.length = 0;
        for (var i = 0; i < opcoes.length; i++) {
            sel.options[sel.options.length] = new Option(opcoes[i].rotulo, opcoes[i].valor);
        }
        for (var k = 0; k < sel.options.length; k++) {
            if (atual && sel.options[k].value === atual) { sel.selectedIndex = k; }
        }
    }

    function preencherSelects() {
        preencherSelect('vinculo', dados.vinculos);
        preencherSelect('tipo-aula', dados.tiposAula);

        if (pegar('aluno-lead')) {
            var pessoas = [{ valor: '', rotulo: 'Selecione na lista...' }];
            var i;
            for (i = 0; i < dados.alunos.length; i++) {
                pessoas.push({ valor: 'aluno-' + dados.alunos[i].id, rotulo: dados.alunos[i].nome + ' (' + dados.alunos[i].vinculo + ')' });
            }
            for (i = 0; i < dados.leads.length; i++) {
                pessoas.push({ valor: 'lead-' + dados.leads[i].id, rotulo: dados.leads[i].nome + ' (Lead)' });
            }
            preencherSelect('aluno-lead', pessoas);
        }

        if (pegar('horario-livre')) {
            var eu = alunoAtual();
            var livres = eu ? horariosLivres(eu.professoraId) : [];
            var vagos = [{ valor: '', rotulo: livres.length ? 'Selecione um horário vago...' : 'Nenhum horário vago nesta semana' }];
            for (var v = 0; v < livres.length; v++) {
                var p = partes(livres[v].data);
                vagos.push({
                    valor: livres[v].data + ' ' + livres[v].hora,
                    rotulo: diaCurto(livres[v].data) + ' ' + p.dd + '/' + p.mm + ' — ' + livres[v].hora
                });
            }
            preencherSelect('horario-livre', vagos);
        }
    }


    /* ------------------------------------------- agenda da professora ---- */

    function descricao(g) {
        if (g.status === 'concluida') { return g.leadId ? 'Experimental Realizada' : 'Concluída'; }
        if (g.status === 'pendente') { return 'Pendente de Confirmação'; }
        if (g.tipo === 'experimental') { return 'Aula Experimental'; }
        if (g.tipo === 'reposicao') { return 'Reposição'; }
        var a = alunoPorId(g.alunoId);
        return a && a.vinculo === 'Escola de Idiomas' ? 'Escola de Idiomas' : 'Aula Regular (Direto)';
    }

    function classeEvento(g) {
        if (g.status === 'concluida' || g.tipo === 'bloqueio') { return 'evento ev-fim'; }
        if (g.status === 'pendente') { return 'evento ev-espera'; }
        if (g.tipo === 'experimental') { return 'evento ev-exp'; }
        return 'evento';
    }

    function cartaoProfessora(g, segundo) {
        var p = professoraPorId(g.professoraId);
        /* dois compromissos no mesmo horario (um por professora): um respiro
           entre os cartoes para nao parecerem um bloco so */
        var abre = '<div class="' + classeEvento(g) + '"' + (segundo ? ' style="margin-top:6px"' : '') + '>';
        var com = '<span>com ' + esc(p ? p.nome : 'professora') + '</span>';
        if (g.tipo === 'bloqueio') {
            return abre + '<strong>Horário bloqueado</strong><span>' + esc(faixa(g.hora)) + '</span>' + com + '</div>';
        }
        var acao = '';
        if (g.status === 'concluida') {
            acao = g.alunoId ? '<a href="#" data-acao="diario" data-aluno="' + esc(g.alunoId) + '">Ver Diário</a>' : '';
        } else if (g.status === 'pendente') {
            acao = '<a href="professora-gestao-aulas.html#pendentes">Aprovar</a>';
        } else {
            acao = '<a href="#" data-acao="sala" data-link="' + esc(linkDaSala(g)) + '">'
                + (g.tipo === 'experimental' ? 'Link Meet' : 'Entrar na Sala Virtual') + '</a>';
        }
        return abre + '<strong>' + esc(pessoa(g).rotulo) + '</strong><span>' + esc(descricao(g)) + '</span>'
            + com + acao + '</div>';
    }

    function celulaProfessora(iso, hora) {
        var itens = compromissosNoHorario(iso, hora);
        var html = '';
        for (var i = 0; i < itens.length; i++) { html += cartaoProfessora(itens[i], i > 0); }
        return html;
    }

    function vistaAtual() {
        var m = /[?&]v=([a-z]+)/.exec(window.location.search || '');
        var v = m ? m[1] : 'semana';
        return (v === 'dia' || v === 'mes') ? v : 'semana';
    }

    function diaDaUrl() {
        var m = /[?&]d=(\d{4}-\d{2}-\d{2})/.exec(window.location.search || '');
        return m ? m[1] : (hoje() || cal().semana[0]);
    }

    function linhasDeHora(isos) {
        var horas = cal().horarios;
        var html = '';
        for (var h = 0; h < horas.length; h++) {
            html += '<tr><th class="hora" scope="row">' + esc(horas[h]) + '</th>';
            for (var d = 0; d < isos.length; d++) {
                html += '<td>' + celulaProfessora(isos[d], horas[h]) + '</td>';
            }
            html += '</tr>';
        }
        if (cal().intervalo) {
            html += '<tr><th class="hora" scope="row">' + esc(cal().intervalo) + '</th>'
                + '<td class="pausa" colspan="' + isos.length + '">Intervalo / Preparação Pedagógica</td></tr>';
        }
        return html;
    }

    function itensDoMes(iso) {
        var lista = compromissosDoDia(iso);
        var html = '';
        for (var i = 0; i < lista.length && i < 3; i++) {
            var g = lista[i];
            var cls = 'mes-item';
            if (g.status === 'concluida' || g.tipo === 'bloqueio') { cls += ' mes-fim'; }
            else if (g.status === 'pendente') { cls += ' mes-espera'; }
            else if (g.tipo === 'experimental') { cls += ' mes-exp'; }
            html += '<span class="' + cls + '">' + esc(g.hora + '  ' + pessoa(g).nome) + '</span>';
        }
        if (lista.length > 3) {
            html += '<span class="mes-mais">+ ' + (lista.length - 3) + ' compromisso(s)</span>';
        }
        return html;
    }

    function cabecalhoHorario(isos) {
        var html = '<tr><th class="hora hora-topo" scope="col">Horário</th>';
        for (var i = 0; i < isos.length; i++) {
            html += '<th scope="col"><a href="professora-agenda.html?v=dia&amp;d=' + esc(isos[i]) + '">'
                + esc(rotuloCurto(isos[i])) + '</a></th>';
        }
        return html + '</tr>';
    }

    function montarMes(iso) {
        var p = partes(iso) || partes(hoje());
        var inicio = new Date(p.a, p.m - 1, 1).getDay();
        var total = new Date(p.a, p.m, 0).getDate();
        var cab = '<tr>';
        for (var c = 0; c < 7; c++) { cab += '<th scope="col">' + CURTOS[c] + '</th>'; }
        cab += '</tr>';

        var linhas = '';
        var dia = 1 - inicio;
        while (dia <= total) {
            linhas += '<tr>';
            for (var k = 0; k < 7; k++, dia++) {
                if (dia < 1 || dia > total) { linhas += '<td class="mes mes-fora"></td>'; continue; }
                var isoDia = p.a + '-' + (p.m < 10 ? '0' : '') + p.m + '-' + (dia < 10 ? '0' : '') + dia;
                linhas += '<td class="mes">'
                    + '<span class="dia-num"><a href="professora-agenda.html?v=dia&amp;d=' + isoDia + '">' + dia + '</a></span>'
                    + itensDoMes(isoDia) + '</td>';
            }
            linhas += '</tr>';
        }
        return { cab: cab, linhas: linhas, legenda: 'Agenda de ' + MESES[p.m - 1] + ' de ' + p.a, faixa: MESES[p.m - 1] + ' de ' + p.a };
    }

    function marcarAba(vista) {
        var caixa = pegar('abas-agenda');
        if (!caixa) { return; }
        var abas = caixa.getElementsByTagName('a');
        for (var i = 0; i < abas.length; i++) {
            if (abas[i].getAttribute('data-vista') === vista) {
                abas[i].className = 'aba aba-atual';
                abas[i].setAttribute('aria-current', 'page');
            } else {
                abas[i].className = 'aba';
                abas[i].removeAttribute('aria-current');
            }
        }
    }

    function renderAgendaProfessora() {
        var corpo = pegar('grade-prof');
        if (!corpo) { return; }
        var tabela = corpo.parentNode;
        var cabeca = tabela.tHead || tabela.createTHead();
        var legenda = tabela.caption || tabela.createCaption();
        var vista = vistaAtual();
        var dia = diaDaUrl();
        var faixaTxt;

        if (vista === 'dia') {
            cabeca.innerHTML = cabecalhoHorario([dia]);
            corpo.innerHTML = linhasDeHora([dia]);
            legenda.innerHTML = 'Agenda de ' + esc(rotuloLongo(dia, true));
            faixaTxt = esc(rotuloLongo(dia, true));
        } else if (vista === 'mes') {
            var mes = montarMes(dia);
            cabeca.innerHTML = mes.cab;
            corpo.innerHTML = mes.linhas;
            legenda.innerHTML = esc(mes.legenda);
            faixaTxt = esc(mes.faixa);
        } else {
            cabeca.innerHTML = cabecalhoHorario(cal().semana);
            corpo.innerHTML = linhasDeHora(cal().semana);
            legenda.innerHTML = 'Grade da semana de ' + esc(periodoSemana(true)) + ', das '
                + esc(cal().horarios[0] || '') + ' às ' + esc(cal().intervalo || '');
            faixaTxt = 'Semana Atual: ' + esc(periodoSemana(false));
        }
        escrever('.faixa-dir', faixaTxt);

        var aviso = pegar('agenda-vazio');
        if (aviso) { aviso.parentNode.removeChild(aviso); }
        if (vista === 'dia' && !compromissosDoDia(dia).length) {
            var p = document.createElement('p');
            p.className = 'vazio-dia';
            p.id = 'agenda-vazio';
            p.innerHTML = 'Nenhum compromisso neste dia.';
            tabela.parentNode.appendChild(p);
        }
        marcarAba(vista);
    }


    /* ------------------------------------------------- agenda do aluno ---- */

    function cartaoAluno(eu, iso, hora) {
        if (!eu) { return ''; }
        var minha = achar(compromissosNoHorario(iso, hora), function (g) { return mesmoId(g.alunoId, eu.id); });
        if (minha) {
            if (minha.status === 'pendente') {
                return '<div class="evento ev-espera"><strong>Solicitação Pendente</strong><span>Aguardando validação</span></div>';
            }
            if (minha.status === 'concluida') {
                return '<div class="evento ev-fim"><strong>Aula Concluída</strong><span>' + esc(faixa(minha.hora)) + '</span></div>';
            }
            return '<div class="evento"><strong>Aula Confirmada</strong><span>' + esc(faixa(minha.hora)) + '</span></div>';
        }
        /* a agenda de outras pessoas nao aparece para o aluno: so o que e
           dele e os horarios livres da professora dele */
        if (iso >= hoje() && !ocupado(eu.professoraId, iso, hora, null)) {
            return '<div class="ev-livre">Horário Livre</div>';
        }
        return '';
    }

    function renderGradeAluno() {
        var corpo = pegar('grade-aluno');
        if (!corpo) { return; }
        var tabela = corpo.parentNode;
        var cabeca = tabela.tHead || tabela.createTHead();
        var legenda = tabela.caption || tabela.createCaption();
        var eu = alunoAtual();
        var semana = cal().semana;
        var horas = cal().horarios;

        var cab = '<tr><th class="hora hora-topo" scope="col">Horário</th>';
        for (var i = 0; i < semana.length; i++) { cab += '<th scope="col">' + esc(rotuloCurto(semana[i])) + '</th>'; }
        cabeca.innerHTML = cab + '</tr>';
        legenda.innerHTML = 'Seus horários de ' + esc(periodoSemana(true));

        var html = '';
        for (var h = 0; h < horas.length; h++) {
            html += '<tr><th class="hora" scope="row">' + esc(horas[h]) + '</th>';
            for (var d = 0; d < semana.length; d++) {
                html += '<td>' + cartaoAluno(eu, semana[d], horas[h]) + '</td>';
            }
            html += '</tr>';
        }
        corpo.innerHTML = html;
    }

    function renderProxima() {
        var quando = document.querySelector('.proxima-quando');
        if (!quando) { return; }
        var eu = alunoAtual();
        var botao = document.querySelector('.proxima-acao .pbotao');
        var minhas = eu ? ordenar(filtrar(dados.gradeAulas, function (g) {
            return mesmoId(g.alunoId, eu.id) && g.status === 'confirmada' && g.data >= hoje();
        })) : [];
        if (!minhas.length) {
            quando.innerHTML = 'Nenhuma aula confirmada ainda';
            escrever('.proxima-onde', 'Use o formulário abaixo para solicitar um horário à professora.');
            if (botao) { botao.setAttribute('data-link', ''); }
            return;
        }
        var a = minhas[0];
        var p = professoraPorId(a.professoraId);
        quando.innerHTML = esc(rotuloLongo(a.data, false)) + ' às ' + esc(a.hora);
        escrever('.proxima-onde', 'Professora: ' + esc(p ? p.nome : '') + ' &nbsp;|&nbsp; Módulo: ' + esc(a.modulo || 'Aula Regular'));
        if (botao) { botao.setAttribute('data-link', linkDaSala(a)); }
    }


    /* ---------------------------------------------------- meu progresso --- */

    function renderNumerosProgresso() {
        var alvo = pegar('numeros-progresso');
        if (!alvo) { return; }
        var eu = alunoAtual();
        if (!eu) { alvo.innerHTML = ''; return; }
        var freq = eu.frequencia === null || eu.frequencia === undefined ? '—' : eu.frequencia + '%';
        alvo.innerHTML = cartaoNumero('num num-3', '', eu.aulasRealizadas, 'Aulas realizadas')
            + cartaoNumero('num num-3', '', freq, 'Frequência e presença')
            + cartaoNumero('num num-3 num-fim', '', String(eu.tarefas).replace('/', ' / '), 'Tarefas concluídas');
    }

    function renderDiarios() {
        var alvo = pegar('container-diarios');
        if (!alvo) { return; }
        var eu = alunoAtual();
        var lista = eu ? filtrar(dados.diariosClasse, function (d) { return mesmoId(d.alunoId, eu.id); }) : [];
        lista.sort(function (a, b) { return a.dataAula < b.dataAula ? 1 : -1; });
        if (!lista.length) {
            alvo.innerHTML = '<p class="vazio-dia">Nenhum registro de aula ainda.</p>';
            return;
        }
        var html = '';
        for (var i = 0; i < lista.length; i++) {
            var d = lista[i];
            html += '<div class="registro">'
                + '<p class="registro-data">' + esc(fmtBr(d.dataAula)) + ' &mdash; Aula ' + esc(d.aula) + '</p>'
                + '<h3>Topic: ' + esc(d.topico) + '</h3>'
                + '<p><strong>Feedback da Professora:</strong> ' + enfase(d.feedback) + '</p>'
                + '</div>';
        }
        alvo.innerHTML = html;
    }

    function acaoDaAtividade(t) {
        if (t.tipo === 'Material') { return 'baixar'; }
        return t.status === 'Pendente' ? 'enviar' : 'respostas';
    }

    function renderAtividades() {
        var alvo = pegar('lista-atividades');
        if (!alvo) { return; }
        var eu = alunoAtual();
        var lista = eu ? filtrar(dados.atividades, function (t) { return mesmoId(t.alunoId, eu.id); }) : [];
        lista.sort(function (a, b) {
            if (a.status !== b.status) { return a.status === 'Pendente' ? -1 : 1; }
            return a.envio < b.envio ? 1 : -1;
        });
        if (!lista.length) {
            alvo.innerHTML = '<tr><td colspan="5">Nenhuma atividade enviada pela professora ainda.</td></tr>';
            return;
        }
        var html = '';
        for (var i = 0; i < lista.length; i++) {
            var t = lista[i];
            html += '<tr' + (i % 2 ? ' class="par"' : '') + '>'
                + '<td class="nome">' + esc(t.titulo) + '</td>'
                + '<td>' + esc(fmtBr(t.envio)) + '</td>'
                + '<td>' + esc(fmtBr(t.prazo)) + '</td>'
                + '<td><span class="selo ' + (t.status === 'Pendente' ? 'selo-espera' : 'selo-ok') + '">' + esc(t.status) + '</span></td>'
                + '<td class="acoes"><button class="pmini" type="submit" name="atividade" value="' + esc(t.id) + '">' + esc(t.botao) + '</button></td>'
                + '</tr>';
        }
        alvo.innerHTML = html;
    }


    /* ------------------------------------------------------------ acoes --- */

    function aprovar(id) {
        var g = aulaPorId(id);
        if (!g || g.status !== 'pendente') { return; }
        var conflito = conflitoFirmado(g);
        if (conflito) {
            var prof = professoraPorId(g.professoraId);
            alert('Não foi possível aprovar: ' + (prof ? prof.nome : 'a professora') + ' já tem ' + pessoa(conflito).nome
                + ' em ' + fmtBr(g.data) + ' às ' + g.hora + '. Recuse ou reagende esta solicitação.');
            return;
        }
        var quem = pessoa(g);
        g.status = 'confirmada';
        if (quem.lead) { quem.lead.status = 'Experimental Confirmada'; }
        if (quem.aluno) { atualizarStatusAluno(quem.aluno.id); }
        gravar();
        renderTudo();
        alert('Aula aprovada: ' + quem.nome + ' em ' + fmtBr(g.data) + ' às ' + g.hora + '. Ela já aparece na agenda.');
    }

    function recusar(id) {
        var g = aulaPorId(id);
        if (!g || g.status !== 'pendente') { return; }
        var quem = pessoa(g);
        g.status = 'recusada';
        if (quem.lead) { quem.lead.status = 'Aguardando Contato'; }
        if (quem.aluno) { atualizarStatusAluno(quem.aluno.id); }
        gravar();
        renderTudo();
        alert('Solicitação de ' + quem.nome + ' recusada. O horário de ' + fmtBr(g.data) + ' às ' + g.hora + ' ficou livre.');
    }

    function cancelar(id) {
        var g = aulaPorId(id);
        if (!g || !ativa(g)) { return; }
        var quem = pessoa(g);
        g.status = 'cancelada';
        gravar();
        renderTudo();
        alert('Aula de ' + quem.nome + ' em ' + fmtBr(g.data) + ' às ' + g.hora + ' cancelada.');
    }

    function reagendar(id) {
        var g = aulaPorId(id);
        if (!g) { return; }
        var marca = pegar('reagendando');
        if (marca) { marca.value = String(g.id); }
        if (pegar('tipo-aula')) { pegar('tipo-aula').value = g.tipo; }
        if (pegar('aluno-lead')) { pegar('aluno-lead').value = g.leadId ? 'lead-' + g.leadId : 'aluno-' + g.alunoId; }
        if (pegar('data-aula')) { pegar('data-aula').value = g.data; }
        if (pegar('hora-inicio')) { pegar('hora-inicio').value = g.hora; }
        if (pegar('sala-virtual')) { pegar('sala-virtual').value = g.link || ''; }
        var destino = pegar('nova-aula');
        if (destino && destino.scrollIntoView) { destino.scrollIntoView(); }
        alert('Ajuste a data e o horário no formulário e confirme para reagendar a aula de ' + pessoa(g).nome + '.');
    }

    function efetivar(id) {
        var l = leadPorId(id);
        if (!l) { return; }
        var minhas = filtrar(dados.gradeAulas, function (g) { return mesmoId(g.leadId, l.id); });
        var referencia = achar(minhas, ativa);
        var prof = referencia ? professoraPorId(referencia.professoraId) : professoraAtual();
        var feitas = contar(minhas, function (g) { return g.status === 'concluida'; });
        var novo = {
            id: proximoId(dados.alunos), nome: l.nome, trato: 'Aluno(a)', email: l.email, telefone: l.telefone,
            vinculo: 'Aluno Direto', status: 'Ativo', professoraId: prof ? prof.id : 1,
            aulasRealizadas: feitas, frequencia: feitas ? 100 : null, tarefas: '0/0'
        };
        for (var i = 0; i < minhas.length; i++) {
            minhas[i].leadId = null;
            minhas[i].alunoId = novo.id;
        }
        dados.leads = filtrar(dados.leads, function (x) { return !mesmoId(x.id, l.id); });
        dados.alunos.push(novo);
        atualizarStatusAluno(novo.id);
        gravar();
        renderTudo();
        alert('Matrícula efetivada: ' + novo.nome + ' agora é aluno(a) direto(a) de ' + (prof ? prof.nome : 'Bloom English') + '.');
    }

    function concluirAtividade(t) {
        var a = alunoPorId(t.alunoId);
        t.status = 'Concluído';
        if (a) {
            var p = String(a.tarefas).split('/');
            var feitas = Number(p[0]) || 0;
            var total = Number(p[1]) || 0;
            a.tarefas = Math.min(feitas + 1, Math.max(total, feitas + 1)) + '/' + Math.max(total, feitas + 1);
        }
    }

    function usarAtividade(id) {
        var t = atividadePorId(id);
        if (!t) { return; }
        var acao = acaoDaAtividade(t);
        if (acao === 'baixar') {
            var eraPendente = t.status === 'Pendente';
            if (eraPendente) { concluirAtividade(t); gravar(); renderTudo(); }
            alert('Download simulado: "' + t.titulo + '".' + (eraPendente ? ' Material marcado como concluído.' : ''));
            return;
        }
        if (acao === 'enviar') {
            concluirAtividade(t);
            t.botao = t.tipo === 'Quiz' ? 'Ver Respostas' : 'Ver Correção';
            t.resultado = 'enviado em ' + fmtBr(hoje()) + ', aguardando correção da professora';
            gravar();
            renderTudo();
            alert('Atividade enviada: "' + t.titulo + '". A professora já pode corrigir.');
            return;
        }
        alert('Resultado de "' + t.titulo + '": ' + (t.resultado || 'correção disponível com a professora') + '.');
    }

    function alternarHistorico(id) {
        historicoAberto = mesmoId(id, historicoAberto) ? null : Number(id);
        renderAlunos();
    }


    /* ------------------------------------------------------- formularios -- */

    function ligarLogin() {
        var quem = pegar('login');
        var senha = pegar('senha');
        if (!quem || !senha || pegar('senha2') || !quem.form) { return; }
        quem.form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var txt = quem.value.replace(/^\s+|\s+$/g, '').toLowerCase();
            if (!txt || !senha.value) { return; }
            var confere = function (x) { return String(x.email).toLowerCase() === txt || String(x.nome).toLowerCase() === txt; };

            /* o perfil vem do campo "entrar como" da propria tela de entrada */
            var campoPerfil = pegar('perfil');
            if ((campoPerfil ? campoPerfil.value : 'aluno') === 'professora') {
                var p = achar(dados.professoras, confere);
                if (!p) {
                    alert('Professora não encontrada na base simulada. Use parceira.bloom@email.com ou professora2.bloom@email.com.');
                    return;
                }
                dados.sessao = { perfil: 'professora', professoraId: p.id, nome: p.nome };
                gravar();
                window.location.href = 'professora-agenda.html';
                return;
            }
            var a = achar(dados.alunos, confere);
            if (!a) {
                alert('Aluno não encontrado na base simulada. Use, por exemplo, carlos.silva@email.com, ou crie sua conta.');
                return;
            }
            dados.sessao = { perfil: 'aluno', alunoId: a.id, nome: a.nome };
            gravar();
            window.location.href = 'aluno-minha-agenda.html';
        }, false);
    }

    function ligarCadastro() {
        var s2 = pegar('senha2');
        if (!s2 || !s2.form) { return; }
        s2.form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var nome = valor('nome');
            var email = valor('email');
            var s1 = pegar('senha') ? pegar('senha').value : '';
            var dica = pegar('dica-senha');
            if (s1.length < 8 || !/[0-9]/.test(s1)) {
                if (dica) { dica.innerHTML = 'a senha precisa de 8 caracteres e pelo menos 1 número.'; }
                return;
            }
            if (s1 !== s2.value) {
                if (dica) { dica.innerHTML = 'as duas senhas precisam ser iguais.'; }
                return;
            }
            if (emailEmUso(email)) {
                alert('Este e-mail já está cadastrado. Use a tela de entrar ou recupere sua senha.');
                return;
            }
            var novo = {
                id: proximoId(dados.alunos), nome: nome, trato: 'Aluno(a)', email: email, telefone: '',
                vinculo: 'Aluno Direto', status: 'Ativo', professoraId: 1,
                aulasRealizadas: 0, frequencia: null, tarefas: '0/0', nivel: valor('nivel')
            };
            dados.alunos.push(novo);
            dados.sessao = { perfil: 'aluno', alunoId: novo.id, nome: nome };
            gravar();
            alert('Conta criada! Bem-vindo(a), ' + nome + '. Agora é só escolher um horário com a professora.');
            window.location.href = 'aluno-minha-agenda.html';
        }, false);
    }

    function ligarRecuperar() {
        var campo = pegar('email-rec');
        if (!campo || !campo.form) { return; }
        campo.form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            /* mesma resposta exista ou nao o e-mail, para nao revelar contas */
            escrever('.aviso', '<strong>pronto:</strong> enviamos o link de recuperação para '
                + esc(campo.value) + '. ele vale por 30 minutos.');
            campo.value = '';
        }, false);
    }

    function ligarNovaAula() {
        var form = pegar('form-nova-aula');
        if (!form) { return; }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var tipo = valor('tipo-aula') || 'regular';
            var quem = /^(aluno|lead)-(\d+)$/.exec(valor('aluno-lead'));
            var data = valor('data-aula');
            var hora = valor('hora-inicio').slice(0, 5);
            var link = valor('sala-virtual');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
                alert('Informe a data e o horário de início.');
                return;
            }
            var aluno = tipo !== 'bloqueio' && quem && quem[1] === 'aluno' ? alunoPorId(quem[2]) : null;
            var lead = tipo !== 'bloqueio' && quem && quem[1] === 'lead' ? leadPorId(quem[2]) : null;
            if (tipo !== 'bloqueio' && !aluno && !lead) { alert('Selecione o aluno ou lead da aula.'); return; }
            if (lead && tipo !== 'experimental') {
                alert('Lead só pode receber Aula Experimental. Para outro tipo de aula, efetive a matrícula antes.');
                return;
            }
            if (link && !linkSeguro(link)) { alert('O link da sala virtual precisa começar com https://'); return; }

            var prof = aluno ? professoraPorId(aluno.professoraId) : professoraAtual();
            var marca = pegar('reagendando');
            var antiga = marca && marca.value ? aulaPorId(marca.value) : null;
            if (ocupado(prof.id, data, hora, antiga ? antiga.id : null)) {
                alert(prof.nome + ' já tem um compromisso em ' + fmtBr(data) + ' às ' + hora + '. Escolha outro horário.');
                return;
            }
            if (antiga) { antiga.status = 'cancelada'; }
            if (marca) { marca.value = ''; }

            var nova = {
                id: proximoId(dados.gradeAulas), data: data, hora: hora, professoraId: prof.id,
                alunoId: aluno ? aluno.id : null, leadId: lead ? lead.id : null,
                tipo: tipo, status: 'confirmada',
                modulo: tipo === 'experimental' ? 'Aula Experimental' : (antiga && antiga.modulo) || 'Aula Regular',
                link: tipo === 'bloqueio' ? '' : link
            };
            dados.gradeAulas.push(nova);
            if (lead) { lead.status = 'Experimental Confirmada'; }
            gravar();
            form.reset();
            renderTudo();
            alert((tipo === 'bloqueio' ? 'Horário bloqueado' : 'Aula de ' + pessoa(nova).nome + ' registrada')
                + ' na agenda de ' + prof.nome + ': ' + fmtBr(data) + ' às ' + hora + (antiga ? ' (reagendamento).' : '.'));
        }, false);
    }

    function ligarNovoAluno() {
        var form = pegar('form-novo-aluno');
        if (!form) { return; }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var nome = valor('nome-aluno');
            var email = valor('email-aluno');
            var vinculo = valor('vinculo') || 'Aluno Direto';
            if (!nome) { alert('Informe o nome do aluno.'); return; }
            if (emailEmUso(email)) { alert('Este e-mail já está na base de alunos e leads.'); return; }
            if (vinculo === 'Lead') {
                dados.leads.push({
                    id: proximoId(dados.leads), nome: nome, email: email, telefone: valor('telefone-aluno'),
                    status: 'Aguardando Contato', dataSolicitacao: hoje(), horarioSugerido: 'A combinar'
                });
            } else {
                var prof = professoraAtual();
                dados.alunos.push({
                    id: proximoId(dados.alunos), nome: nome, trato: 'Aluno(a)', email: email, telefone: valor('telefone-aluno'),
                    vinculo: vinculo, status: 'Ativo', professoraId: prof ? prof.id : 1,
                    aulasRealizadas: 0, frequencia: null, tarefas: '0/0'
                });
            }
            gravar();
            form.reset();
            renderTudo();
            alert(nome + (vinculo === 'Lead' ? ' entrou na lista de leads (aguardando contato).' : ' foi matriculado(a) como ' + vinculo + '.'));
        }, false);
    }

    function ligarSolicitacao() {
        var form = pegar('form-solicitacao');
        if (!form) { return; }
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var eu = alunoAtual();
            if (!eu) { alert('Entre com a sua conta para solicitar um horário.'); return; }
            var slot = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/.exec(valor('horario-livre'));
            var data = slot ? slot[1] : valor('data-pretendida');
            var hora = slot ? slot[2] : (data ? cal().horarios[0] : '');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !hora) {
                alert('Escolha um horário disponível na lista ou informe a data pretendida.');
                return;
            }
            if (ocupado(eu.professoraId, data, hora, null)) {
                alert('Esse horário não está mais livre. Escolha outro na lista de horários disponíveis.');
                return;
            }
            var obs = valor('observacao');
            dados.gradeAulas.push({
                id: proximoId(dados.gradeAulas), data: data, hora: hora, professoraId: eu.professoraId,
                alunoId: eu.id, leadId: null, tipo: /repos/i.test(obs) ? 'reposicao' : 'regular', status: 'pendente',
                modulo: 'Aula Regular', link: '', obs: obs
            });
            atualizarStatusAluno(eu.id);
            gravar();
            form.reset();
            renderTudo();
            alert('Solicitação enviada para ' + fmtBr(data) + ' às ' + hora + '. Ela já aparece na agenda da professora.');
        }, false);
    }


    /* -------------------------------------------------------- cliques ----- */

    function alvoClicavel(no) {
        while (no && no !== document) {
            if (no.tagName === 'BUTTON' || no.tagName === 'A') { return no; }
            no = no.parentNode;
        }
        return null;
    }

    document.addEventListener('click', function (ev) {
        var b = alvoClicavel(ev.target);
        if (!b) { return; }

        var area = areaDaPagina();

        if (b.tagName === 'BUTTON') {
            var nome = b.getAttribute('name');
            var val = b.getAttribute('value');
            /* sem name = botao de enviar formulario, tratado no submit */
            if (!nome) { return; }
            /* todo botao com name e acao deste script: nunca envia o form */
            ev.preventDefault();

            /* cada perfil so executa as acoes da propria area */
            if (nome === 'atividade') {
                if (area === 'aluno') { usarAtividade(val); }
                return;
            }
            if (area !== 'professora') { return; }

            if (nome === 'aprovar') { aprovar(val); return; }
            if (nome === 'recusar') { recusar(val); return; }
            if (nome === 'reagendar') { reagendar(val); return; }
            if (nome === 'cancelar') {
                if (window.confirm('Cancelar esta aula da agenda?')) { cancelar(val); }
                return;
            }
            if (nome === 'efetivar') { efetivar(val); return; }
            if (nome === 'historico') { alternarHistorico(val); return; }
            return;
        }

        var acao = b.getAttribute('data-acao');
        if (acao === 'sala') {
            ev.preventDefault();
            var link = b.getAttribute('data-link');
            if (link && linkSeguro(link)) {
                window.open(link, '_blank', 'noopener,noreferrer');
            } else {
                alert('Nenhum link de sala virtual cadastrado para esta aula.');
            }
            return;
        }
        if (acao === 'diario') {
            ev.preventDefault();
            if (area === 'professora') {
                window.location.href = 'professora-gestao-alunos.html?historico=' + encodeURIComponent(b.getAttribute('data-aluno') || '');
            }
            return;
        }
        if (String(b.className).indexOf('nav-sair') >= 0) {
            dados.sessao = null;
            gravar();
            return; /* deixa o link navegar */
        }
    }, false);


    /* ------------------------------------------------------- inicializa --- */

    function renderTudo() {
        renderNumerosAlunos();
        renderAlunos();
        renderPendentes();
        renderConfirmadas();
        preencherSelects();
        renderAgendaProfessora();
        renderGradeAluno();
        renderProxima();
        renderNumerosProgresso();
        renderDiarios();
        renderAtividades();
    }

    function iniciar() {
        if (!protegerArea()) { return; }
        renderTudo();
        /* veio do "Ver Diario" da agenda: mostra a ficha aberta */
        var ficha = pegar('historico-aberto');
        if (ficha && ficha.scrollIntoView) { ficha.scrollIntoView(); }
        ligarLogin();
        ligarCadastro();
        ligarRecuperar();
        ligarNovaAula();
        ligarNovoAluno();
        ligarSolicitacao();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar, false);
    } else {
        iniciar();
    }

    /* exposto apenas para teste manual pelo console */
    window.bloom = {
        dados: function () { return dados; },
        reiniciar: function () { gravar(copiaDaBase()); renderTudo(); }
    };
}());
