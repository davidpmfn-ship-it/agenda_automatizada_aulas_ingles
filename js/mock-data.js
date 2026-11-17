/* ==========================================================================
   bloom english - base simulada (mock) do Sistema Controle de Agenda
   --------------------------------------------------------------------------
   Unica fonte de dados das telas internas. Na primeira visita o main.js
   copia este objeto para o localStorage do navegador e, dali em diante,
   le e grava la. Para voltar ao estado inicial, rode no console do
   navegador:  bloom.reiniciar()

   Semana de referencia: 21 a 25/09/2026, com "hoje" na quarta-feira 23/09.
   Por isso as aulas de segunda e terca ja aparecem como concluidas.

   gradeAulas - cada registro e um compromisso de 50 minutos:
     tipo ..... regular | experimental | reposicao | bloqueio
     status ... confirmada | pendente | concluida
     aparencia na grade (classes que ja existem no css/style.css):
       regular ou reposicao confirmada ... .evento
       experimental confirmada ........... .evento.ev-exp
       qualquer pendente ................. .evento.ev-espera
       qualquer concluida ................ .evento.ev-fim

   alunos.status:  Ativo | Pendente
     Pendente = aluno matriculado com solicitacao de horario aguardando
     aprovacao da professora (aparece na tabela de pendentes).

   leads.status:   Aguardando Contato | Experimental Pendente |
                   Experimental Confirmada | Atendido
   ========================================================================== */

var BLOOM_DB = {

    versao: 3,

    /* reuniao instantanea do Google Meet: e para onde vao "Entrar na Sala
       Virtual" e "Link Meet" quando a aula nao tem um link proprio */
    salaVirtualPadrao: 'https://meet.google.com/new',

    calendario: {
        hoje: '2026-09-23',
        semana: ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'],
        horarios: ['08:00', '09:00', '10:00'],
        intervalo: '11:00'
    },


    /* ------------------------------------------------------- professoras -- */

    professoras: [
        { id: 1, nome: 'Bloom English', email: 'parceira.bloom@email.com', fone: '(11) 98888-1111', espec: 'Business English & Conversation Practice' },
        { id: 2, nome: 'Professora Parceira 2', email: 'professora2.bloom@email.com', fone: '(11) 97777-2222', espec: 'General English & Grammar Focus' }
    ],


    /* ------------------------------------------------------------ alunos -- */

    alunos: [
        { id: 1,  nome: 'Wilson Kasai',    trato: 'Aluno', email: 'wilson.kasai@email.com',    telefone: '(11) 99321-4455', vinculo: 'Aluno Direto',      status: 'Ativo',    professoraId: 1, aulasRealizadas: 18, frequencia: 95,  tarefas: '12/14' },
        { id: 2,  nome: 'Carlos Silva',    trato: 'Aluno', email: 'carlos.silva@email.com',    telefone: '(11) 98888-7777', vinculo: 'Aluno Direto',      status: 'Pendente', professoraId: 1, aulasRealizadas: 13, frequencia: 100, tarefas: '8/10' },
        { id: 3,  nome: 'Fernanda Ramos',  trato: 'Aluna', email: 'fernanda.ramos@email.com',  telefone: '(11) 97777-6666', vinculo: 'Escola de Idiomas', status: 'Ativo',    professoraId: 1, aulasRealizadas: 24, frequencia: 96,  tarefas: '18/19' },
        { id: 4,  nome: 'João Kendi',      trato: 'Aluno', email: 'joao.kendi@email.com',      telefone: '(11) 96666-5555', vinculo: 'Aluno Direto',      status: 'Pendente', professoraId: 2, aulasRealizadas: 9,  frequencia: 90,  tarefas: '6/8' },
        { id: 5,  nome: 'Beatriz Lima',    trato: 'Aluna', email: 'beatriz.lima@email.com',    telefone: '(11) 95432-1188', vinculo: 'Aluno Direto',      status: 'Ativo',    professoraId: 2, aulasRealizadas: 15, frequencia: 94,  tarefas: '10/12' },
        { id: 6,  nome: 'Rafael Moreira',  trato: 'Aluno', email: 'rafael.moreira@email.com',  telefone: '(11) 94567-2233', vinculo: 'Aluno Direto',      status: 'Ativo',    professoraId: 1, aulasRealizadas: 7,  frequencia: 88,  tarefas: '4/6' },
        { id: 7,  nome: 'Juliana Costa',   trato: 'Aluna', email: 'juliana.costa@email.com',   telefone: '(11) 93456-7788', vinculo: 'Escola de Idiomas', status: 'Ativo',    professoraId: 1, aulasRealizadas: 11, frequencia: 92,  tarefas: '9/10' },
        { id: 8,  nome: 'Lucas Andrade',   trato: 'Aluno', email: 'lucas.andrade@email.com',   telefone: '(11) 92345-6677', vinculo: 'Escola de Idiomas', status: 'Ativo',    professoraId: 2, aulasRealizadas: 20, frequencia: 87,  tarefas: '14/16' },
        { id: 9,  nome: 'Camila Nogueira', trato: 'Aluna', email: 'camila.nogueira@email.com', telefone: '(11) 91234-5566', vinculo: 'Aluno Direto',      status: 'Ativo',    professoraId: 2, aulasRealizadas: 5,  frequencia: 100, tarefas: '4/5' },
        { id: 10, nome: 'Thiago Martins',  trato: 'Aluno', email: 'thiago.martins@email.com',  telefone: '(11) 99876-5432', vinculo: 'Escola de Idiomas', status: 'Ativo',    professoraId: 2, aulasRealizadas: 3,  frequencia: 100, tarefas: '2/3' }
    ],


    /* ------------------------------------------------------------- leads -- */

    leads: [
        { id: 1,  nome: 'Gabriel Souza',    email: 'gabriel.souza@email.com',    telefone: '(11) 98123-4567', status: 'Atendido',                dataSolicitacao: '2026-09-14', horarioSugerido: '2026-09-21 09:00' },
        { id: 2,  nome: 'Larissa Mendes',   email: 'larissa.mendes@email.com',   telefone: '(11) 97234-5678', status: 'Atendido',                dataSolicitacao: '2026-09-15', horarioSugerido: '2026-09-21 09:00' },
        { id: 3,  nome: 'Bruno Carvalho',   email: 'bruno.carvalho@email.com',   telefone: '(11) 96345-6789', status: 'Atendido',                dataSolicitacao: '2026-09-16', horarioSugerido: '2026-09-22 09:00' },
        { id: 4,  nome: 'Patrícia Gomes',   email: 'patricia.gomes@email.com',   telefone: '(11) 95456-7890', status: 'Experimental Confirmada', dataSolicitacao: '2026-09-17', horarioSugerido: '2026-09-23 09:00' },
        { id: 5,  nome: 'Diego Fernandes',  email: 'diego.fernandes@email.com',  telefone: '(11) 94567-8901', status: 'Experimental Confirmada', dataSolicitacao: '2026-09-18', horarioSugerido: '2026-09-24 08:00' },
        { id: 6,  nome: 'Aline Barbosa',    email: 'aline.barbosa@email.com',    telefone: '(11) 93678-9012', status: 'Experimental Confirmada', dataSolicitacao: '2026-09-19', horarioSugerido: '2026-09-25 09:00' },
        { id: 7,  nome: 'Mariana Pedroza',  email: 'mariana.pedroza@email.com',  telefone: '(11) 95555-4444', status: 'Experimental Pendente',   dataSolicitacao: '2026-09-20', horarioSugerido: '2026-09-24 10:00' },
        { id: 8,  nome: 'Felipe Rocha',     email: 'felipe.rocha@email.com',     telefone: '(11) 92789-0123', status: 'Experimental Pendente',   dataSolicitacao: '2026-09-21', horarioSugerido: '2026-09-25 09:00' },
        { id: 9,  nome: 'Vanessa Ribeiro',  email: 'vanessa.ribeiro@email.com',  telefone: '(11) 91890-1234', status: 'Experimental Pendente',   dataSolicitacao: '2026-09-21', horarioSugerido: '2026-09-23 09:00' },
        { id: 10, nome: 'Rodrigo Teixeira', email: 'rodrigo.teixeira@email.com', telefone: '(11) 98901-2345', status: 'Experimental Pendente',   dataSolicitacao: '2026-09-22', horarioSugerido: '2026-09-28 09:00' },
        { id: 11, nome: 'Isabela Cardoso',  email: 'isabela.cardoso@email.com',  telefone: '(11) 97012-3456', status: 'Experimental Pendente',   dataSolicitacao: '2026-09-22', horarioSugerido: '2026-09-28 10:00' },
        { id: 12, nome: 'Gustavo Pereira',  email: 'gustavo.pereira@email.com',  telefone: '(11) 96123-4568', status: 'Aguardando Contato',      dataSolicitacao: '2026-09-22', horarioSugerido: '2026-09-28 08:00' },
        { id: 13, nome: 'Natália Freitas',  email: 'natalia.freitas@email.com',  telefone: '(11) 95234-5679', status: 'Aguardando Contato',      dataSolicitacao: '2026-09-22', horarioSugerido: '2026-09-29 08:00' },
        { id: 14, nome: 'Eduardo Lopes',    email: 'eduardo.lopes@email.com',    telefone: '(11) 94345-6780', status: 'Aguardando Contato',      dataSolicitacao: '2026-09-23', horarioSugerido: '2026-09-30 09:00' },
        { id: 15, nome: 'Renata Azevedo',   email: 'renata.azevedo@email.com',   telefone: '(11) 93456-7891', status: 'Aguardando Contato',      dataSolicitacao: '2026-09-23', horarioSugerido: '2026-09-30 10:00' }
    ],


    /* -------------------------------------------------------- gradeAulas -- */
    /* semana de referencia (21 a 25/09) e os pedidos ja feitos para a
       semana seguinte (28 a 30/09), das 08:00 as 11:00, nas 2 professoras */

    gradeAulas: [
        /* segunda 21/09 - concluidas */
        { id: 1,  data: '2026-09-21', hora: '08:00', professoraId: 1, alunoId: 2,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 2,  data: '2026-09-21', hora: '08:00', professoraId: 2, alunoId: 5,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Grammar Focus',         link: 'https://meet.google.com/new' },
        { id: 3,  data: '2026-09-21', hora: '09:00', professoraId: 1, alunoId: null, leadId: 1,    tipo: 'experimental', status: 'concluida',  modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 4,  data: '2026-09-21', hora: '09:00', professoraId: 2, alunoId: null, leadId: 2,    tipo: 'experimental', status: 'concluida',  modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 5,  data: '2026-09-21', hora: '10:00', professoraId: 1, alunoId: 3,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 6,  data: '2026-09-21', hora: '10:00', professoraId: 2, alunoId: 8,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'General English',       link: 'https://meet.google.com/new' },

        /* terca 22/09 - concluidas */
        { id: 7,  data: '2026-09-22', hora: '08:00', professoraId: 1, alunoId: 1,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 8,  data: '2026-09-22', hora: '08:00', professoraId: 2, alunoId: 4,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Grammar Focus',         link: 'https://meet.google.com/new' },
        { id: 9,  data: '2026-09-22', hora: '09:00', professoraId: 1, alunoId: 7,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Conversation Practice', link: 'https://meet.google.com/new' },
        { id: 10, data: '2026-09-22', hora: '09:00', professoraId: 2, alunoId: null, leadId: 3,    tipo: 'experimental', status: 'concluida',  modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 11, data: '2026-09-22', hora: '10:00', professoraId: 1, alunoId: 6,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 12, data: '2026-09-22', hora: '10:00', professoraId: 2, alunoId: 9,    leadId: null, tipo: 'regular',      status: 'concluida',  modulo: 'General English',       link: 'https://meet.google.com/new' },

        /* quarta 23/09 (hoje) */
        { id: 13, data: '2026-09-23', hora: '08:00', professoraId: 1, alunoId: 2,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Conversation Practice', link: 'https://meet.google.com/new' },
        { id: 14, data: '2026-09-23', hora: '08:00', professoraId: 2, alunoId: 5,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Grammar Focus',         link: 'https://meet.google.com/new' },
        { id: 15, data: '2026-09-23', hora: '09:00', professoraId: 1, alunoId: null, leadId: 4,    tipo: 'experimental', status: 'confirmada', modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 16, data: '2026-09-23', hora: '09:00', professoraId: 2, alunoId: null, leadId: 9,    tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 17, data: '2026-09-23', hora: '10:00', professoraId: 1, alunoId: 3,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 18, data: '2026-09-23', hora: '10:00', professoraId: 2, alunoId: 8,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'General English',       link: 'https://meet.google.com/new' },

        /* quinta 24/09 */
        { id: 19, data: '2026-09-24', hora: '08:00', professoraId: 1, alunoId: 1,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 20, data: '2026-09-24', hora: '08:00', professoraId: 2, alunoId: null, leadId: 5,    tipo: 'experimental', status: 'confirmada', modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 21, data: '2026-09-24', hora: '09:00', professoraId: 1, alunoId: 2,    leadId: null, tipo: 'regular',      status: 'pendente',   modulo: 'Conversation Practice', link: 'https://meet.google.com/new', obs: 'Aula extra: treino para entrevista de emprego em inglês' },
        { id: 22, data: '2026-09-24', hora: '09:00', professoraId: 2, alunoId: 4,    leadId: null, tipo: 'reposicao',    status: 'pendente',   modulo: 'Grammar Focus',         link: 'https://meet.google.com/new', obs: 'Reposição da falta de 08/09' },
        { id: 23, data: '2026-09-24', hora: '10:00', professoraId: 1, alunoId: null, leadId: 7,    tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },

        /* sexta 25/09 */
        { id: 24, data: '2026-09-25', hora: '09:00', professoraId: 1, alunoId: null, leadId: 8,    tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 25, data: '2026-09-25', hora: '09:00', professoraId: 2, alunoId: null, leadId: 6,    tipo: 'experimental', status: 'confirmada', modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 26, data: '2026-09-25', hora: '10:00', professoraId: 2, alunoId: 10,   leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Listening & Speaking',  link: 'https://meet.google.com/new' },

        /* semana seguinte: pedidos de leads e proximas aulas de quem ja teve
           a aula da semana */
        { id: 27, data: '2026-09-28', hora: '08:00', professoraId: 2, alunoId: null, leadId: 12,   tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 28, data: '2026-09-28', hora: '09:00', professoraId: 1, alunoId: null, leadId: 10,   tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 29, data: '2026-09-28', hora: '10:00', professoraId: 2, alunoId: null, leadId: 11,   tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 30, data: '2026-09-29', hora: '08:00', professoraId: 1, alunoId: null, leadId: 13,   tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 31, data: '2026-09-29', hora: '08:00', professoraId: 2, alunoId: 4,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Grammar Focus',         link: 'https://meet.google.com/new' },
        { id: 32, data: '2026-09-29', hora: '09:00', professoraId: 1, alunoId: 7,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Conversation Practice', link: 'https://meet.google.com/new' },
        { id: 33, data: '2026-09-29', hora: '10:00', professoraId: 1, alunoId: 6,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'Business English',      link: 'https://meet.google.com/new' },
        { id: 34, data: '2026-09-29', hora: '10:00', professoraId: 2, alunoId: 9,    leadId: null, tipo: 'regular',      status: 'confirmada', modulo: 'General English',       link: 'https://meet.google.com/new' },
        { id: 35, data: '2026-09-30', hora: '09:00', professoraId: 1, alunoId: null, leadId: 14,   tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' },
        { id: 36, data: '2026-09-30', hora: '10:00', professoraId: 2, alunoId: null, leadId: 15,   tipo: 'experimental', status: 'pendente',   modulo: 'Aula Experimental',     link: 'https://meet.google.com/new' }
    ],


    /* ----------------------------------------------------- diariosClasse -- */
    /* texto entre *asteriscos* aparece em italico no diario */

    diariosClasse: [
        { id: 1,  alunoId: 1,  dataAula: '2026-09-22', aula: 18, topico: 'Business English — Negotiation Basics',             feedback: 'Argumentou bem ao apresentar contrapropostas. Revise *“I’m afraid we can’t…”* para recusar com cordialidade.' },
        { id: 2,  alunoId: 1,  dataAula: '2026-09-17', aula: 17, topico: 'Business English — Conference Calls',               feedback: 'Muito seguro ao abrir e encerrar a call. Falta ganhar ritmo ao resumir as decisões no final.' },
        { id: 3,  alunoId: 2,  dataAula: '2026-09-21', aula: 13, topico: 'Business English & E-mail Writing',                 feedback: 'Excelente domínio das expressões formais! Trabalhamos conectivos como *“Furthermore”* e *“In addition to”*. A pronúncia de termos corporativos melhorou consideravelmente.' },
        { id: 4,  alunoId: 2,  dataAula: '2026-09-16', aula: 12, topico: 'Conversation Practice — Travel & Airport Vocabulary', feedback: 'Ótima fluência na simulação de check-in e imigração. Atenção apenas com a entonação em perguntas indiretas.' },
        { id: 5,  alunoId: 2,  dataAula: '2026-09-14', aula: 11, topico: 'Business English — Small Talk at Work',             feedback: 'Boa iniciativa para puxar assunto. Vamos reforçar *“How have you been?”* e respostas mais longas que um simples *“Fine”*.' },
        { id: 6,  alunoId: 3,  dataAula: '2026-09-21', aula: 24, topico: 'Business English — Meetings & Agendas',             feedback: 'Conduziu a reunião simulada com clareza. Ótimo uso de *“Let’s move on to…”* para mudar de pauta.' },
        { id: 7,  alunoId: 3,  dataAula: '2026-09-16', aula: 23, topico: 'Business English — Reporting Results',              feedback: 'Apresentou os números com segurança. Cuidado com a pronúncia de *“thirty”* e *“thirteen”*.' },
        { id: 8,  alunoId: 4,  dataAula: '2026-09-22', aula: 9,  topico: 'Grammar Focus — First Conditional',                 feedback: 'Entendeu bem a estrutura *if + present, will + verb*. Precisa praticar mais exemplos na fala, não só na escrita.' },
        { id: 9,  alunoId: 4,  dataAula: '2026-09-15', aula: 8,  topico: 'Grammar Focus — Future: will x going to',           feedback: 'Boa evolução na diferença entre planos e previsões. Revise o exercício 3 da apostila.' },
        { id: 10, alunoId: 5,  dataAula: '2026-09-21', aula: 15, topico: 'Grammar Focus — Present Perfect',                   feedback: 'Usou *“already”* e *“yet”* corretamente na maior parte das frases. Vamos continuar a prática na próxima aula.' },
        { id: 11, alunoId: 5,  dataAula: '2026-09-16', aula: 14, topico: 'Grammar Focus — Past Simple x Present Perfect',     feedback: 'Ainda confunde os dois tempos em perguntas. Enviei exercícios extras para fixação.' },
        { id: 12, alunoId: 6,  dataAula: '2026-09-22', aula: 7,  topico: 'Business English — Presenting Yourself',            feedback: 'Apresentação pessoal bem estruturada. Trabalhe a velocidade da fala: as frases estão saindo apressadas.' },
        { id: 13, alunoId: 6,  dataAula: '2026-09-15', aula: 6,  topico: 'Business English — Job Titles & Departments',       feedback: 'Vocabulário corporativo assimilado. Revise a lista de cargos antes da próxima aula.' },
        { id: 14, alunoId: 7,  dataAula: '2026-09-22', aula: 11, topico: 'Conversation Practice — Daily Routines',            feedback: 'Conversa fluida e natural. Bom uso de advérbios de frequência como *“usually”* e *“hardly ever”*.' },
        { id: 15, alunoId: 7,  dataAula: '2026-09-15', aula: 10, topico: 'Conversation Practice — Food & Restaurants',        feedback: 'Fez pedidos e reclamações educadas com ótima entonação. Excelente aula!' },
        { id: 16, alunoId: 8,  dataAula: '2026-09-21', aula: 20, topico: 'General English — Phrasal Verbs at Work',           feedback: 'Assimilou *“carry out”* e *“set up”*. Ainda precisa revisar *“put off”* e *“call off”*.' },
        { id: 17, alunoId: 8,  dataAula: '2026-09-16', aula: 19, topico: 'General English — Reading Comprehension',           feedback: 'Boa compreensão geral do texto. Vamos trabalhar a leitura em voz alta para ganhar ritmo.' },
        { id: 18, alunoId: 9,  dataAula: '2026-09-22', aula: 5,  topico: 'General English — Describing People',               feedback: 'Ótimo vocabulário de aparência física. Atenção à ordem dos adjetivos antes do substantivo.' },
        { id: 19, alunoId: 9,  dataAula: '2026-09-15', aula: 4,  topico: 'General English — Family & Relationships',          feedback: 'Participação muito ativa. A pronúncia do *“th”* melhora a cada aula.' },
        { id: 20, alunoId: 10, dataAula: '2026-09-18', aula: 3,  topico: 'Listening & Speaking — Podcasts',                   feedback: 'Captou as ideias principais do áudio. Próximo passo: anotar palavras-chave durante a escuta.' },
        { id: 21, alunoId: 10, dataAula: '2026-09-11', aula: 2,  topico: 'Listening & Speaking — Introductions',              feedback: 'Começo muito bom! Apresentou-se sem travar e fez perguntas de volta ao colega.' }
    ],


    /* -------------------------------------------------------- atividades -- */
    /* tipo: Exercício | Quiz | Material.  Pendentes de cada aluno somam a
       diferenca do campo tarefas (ex.: 8/10 = 2 pendentes na lista) */

    atividades: [
        { id: 1,  alunoId: 1,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Negotiation Phrases',            envio: '2026-09-22', prazo: '2026-09-24', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 2,  alunoId: 1,  tipo: 'Quiz',      titulo: 'Quiz: Conference Call Vocabulary',                    envio: '2026-09-22', prazo: '2026-09-26', status: 'Pendente',  botao: 'Iniciar Quiz' },
        { id: 3,  alunoId: 1,  tipo: 'Material',  titulo: 'Material Complementar: Polite Disagreement (PDF)',     envio: '2026-09-17', prazo: '2026-09-21', status: 'Concluído', botao: 'Baixar PDF' },

        { id: 4,  alunoId: 2,  tipo: 'Exercício', titulo: 'Exercício de Fixação: E-mail Writing',                envio: '2026-09-21', prazo: '2026-09-25', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 5,  alunoId: 2,  tipo: 'Material',  titulo: 'Material Complementar: Business Phrasal Verbs (PDF)', envio: '2026-09-21', prazo: '2026-09-28', status: 'Pendente',  botao: 'Baixar PDF' },
        { id: 6,  alunoId: 2,  tipo: 'Quiz',      titulo: 'Vocabulary Quiz: Airport Vocabulary',                 envio: '2026-09-16', prazo: '2026-09-18', status: 'Concluído', botao: 'Ver Respostas', resultado: '9 de 10 acertos' },

        { id: 7,  alunoId: 3,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Meeting Agendas',               envio: '2026-09-21', prazo: '2026-09-23', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 8,  alunoId: 3,  tipo: 'Quiz',      titulo: 'Quiz: Numbers & Reporting',                           envio: '2026-09-16', prazo: '2026-09-19', status: 'Concluído', botao: 'Ver Respostas', resultado: '10 de 10 acertos' },
        { id: 9,  alunoId: 3,  tipo: 'Material',  titulo: 'Material Complementar: Useful Meeting Expressions (PDF)', envio: '2026-09-16', prazo: '2026-09-21', status: 'Concluído', botao: 'Baixar PDF' },

        { id: 10, alunoId: 4,  tipo: 'Exercício', titulo: 'Exercício de Fixação: First Conditional',             envio: '2026-09-22', prazo: '2026-09-28', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 11, alunoId: 4,  tipo: 'Material',  titulo: 'Material Complementar: Conditionals Cheat Sheet (PDF)', envio: '2026-09-22', prazo: '2026-09-28', status: 'Pendente', botao: 'Baixar PDF' },
        { id: 12, alunoId: 4,  tipo: 'Quiz',      titulo: 'Quiz: Will x Going to',                               envio: '2026-09-15', prazo: '2026-09-18', status: 'Concluído', botao: 'Ver Respostas', resultado: '7 de 10 acertos' },

        { id: 13, alunoId: 5,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Present Perfect (already / yet)', envio: '2026-09-21', prazo: '2026-09-25', status: 'Pendente', botao: 'Enviar Respostas' },
        { id: 14, alunoId: 5,  tipo: 'Quiz',      titulo: 'Quiz: Past Simple x Present Perfect',                 envio: '2026-09-21', prazo: '2026-09-25', status: 'Pendente',  botao: 'Iniciar Quiz' },
        { id: 15, alunoId: 5,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Irregular Verbs',               envio: '2026-09-16', prazo: '2026-09-19', status: 'Concluído', botao: 'Ver Correção', resultado: '18 de 20 acertos' },

        { id: 16, alunoId: 6,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Self-Introduction Script',      envio: '2026-09-22', prazo: '2026-09-28', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 17, alunoId: 6,  tipo: 'Material',  titulo: 'Material Complementar: Job Titles Glossary (PDF)',    envio: '2026-09-15', prazo: '2026-09-29', status: 'Pendente',  botao: 'Baixar PDF' },
        { id: 18, alunoId: 6,  tipo: 'Quiz',      titulo: 'Quiz: Departments & Roles',                           envio: '2026-09-15', prazo: '2026-09-19', status: 'Concluído', botao: 'Ver Respostas', resultado: '8 de 10 acertos' },

        { id: 19, alunoId: 7,  tipo: 'Quiz',      titulo: 'Quiz: Adverbs of Frequency',                          envio: '2026-09-22', prazo: '2026-09-28', status: 'Pendente',  botao: 'Iniciar Quiz' },
        { id: 20, alunoId: 7,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Ordering at a Restaurant',      envio: '2026-09-15', prazo: '2026-09-18', status: 'Concluído', botao: 'Ver Correção', resultado: '15 de 15 acertos' },
        { id: 21, alunoId: 7,  tipo: 'Material',  titulo: 'Material Complementar: Food Vocabulary (PDF)',        envio: '2026-09-15', prazo: '2026-09-21', status: 'Concluído', botao: 'Baixar PDF' },

        { id: 22, alunoId: 8,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Phrasal Verbs at Work',         envio: '2026-09-21', prazo: '2026-09-23', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 23, alunoId: 8,  tipo: 'Material',  titulo: 'Material Complementar: Reading Aloud Tips (PDF)',     envio: '2026-09-21', prazo: '2026-09-28', status: 'Pendente',  botao: 'Baixar PDF' },
        { id: 24, alunoId: 8,  tipo: 'Quiz',      titulo: 'Quiz: Reading Comprehension',                         envio: '2026-09-16', prazo: '2026-09-19', status: 'Concluído', botao: 'Ver Respostas', resultado: '8 de 10 acertos' },

        { id: 25, alunoId: 9,  tipo: 'Exercício', titulo: 'Exercício de Fixação: Adjective Order',               envio: '2026-09-22', prazo: '2026-09-28', status: 'Pendente',  botao: 'Enviar Respostas' },
        { id: 26, alunoId: 9,  tipo: 'Quiz',      titulo: 'Quiz: Family Members',                                envio: '2026-09-15', prazo: '2026-09-18', status: 'Concluído', botao: 'Ver Respostas', resultado: '10 de 10 acertos' },
        { id: 27, alunoId: 9,  tipo: 'Material',  titulo: 'Material Complementar: The TH Sound (PDF)',           envio: '2026-09-15', prazo: '2026-09-21', status: 'Concluído', botao: 'Baixar PDF' },

        { id: 28, alunoId: 10, tipo: 'Material',  titulo: 'Material Complementar: Podcast Listening Guide (PDF)', envio: '2026-09-18', prazo: '2026-09-25', status: 'Pendente', botao: 'Baixar PDF' },
        { id: 29, alunoId: 10, tipo: 'Exercício', titulo: 'Exercício de Fixação: Introducing Yourself',          envio: '2026-09-11', prazo: '2026-09-16', status: 'Concluído', botao: 'Ver Correção', resultado: '12 de 12 acertos' },
        { id: 30, alunoId: 10, tipo: 'Quiz',      titulo: 'Quiz: Greetings & Small Talk',                        envio: '2026-09-04', prazo: '2026-09-09', status: 'Concluído', botao: 'Ver Respostas', resultado: '9 de 10 acertos' }
    ],


    /* ------------------------------------- opcoes fixas dos formularios -- */

    vinculos: [
        { valor: 'Aluno Direto',      rotulo: 'Aluno Direto (Particular)' },
        { valor: 'Escola de Idiomas', rotulo: 'Escola de Idiomas' },
        { valor: 'Lead',              rotulo: 'Lead (Aula Experimental)' }
    ],

    tiposAula: [
        { valor: 'regular',      rotulo: 'Aula Regular (Pacote)' },
        { valor: 'experimental', rotulo: 'Aula Experimental' },
        { valor: 'reposicao',    rotulo: 'Reposição' },
        { valor: 'bloqueio',     rotulo: 'Bloqueio de Horário' }
    ]
};
