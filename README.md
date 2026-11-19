# Bloom English — Controle de Agenda e Acompanhamento Pedagógico

Sistema web desenvolvido para automatizar o gerenciamento de agendamentos, bloqueio de conflitos de horário e registro histórico de evolução pedagógica para uma docente autônoma de língua inglesa[cite: 18]. O projeto abrange o ciclo completo de Engenharia de Software — desde o mapeamento de processos de negócio (BPMN) e especificação de requisitos (ISO/IEC 25010) até a modelagem UML 2.5 e implementação das interfaces responsivas[cite: 20, 21, 24, 31, 36].

---

## Problema e Contexto Operacional

A operação original apresentava gargalos típicos de prestadores de serviços autônomos que gerenciam agendas híbridas (alunos diretos e alunos oriundos de escola de idiomas parceira)[cite: 19, 20]:

* **Descentralização de Agendamentos:** Negociação manual de horários via WhatsApp e e-mail, gerando alto risco de sobreposição de compromissos e retrabalho administrativo[cite: 19, 20].
* **Fragmentação do Histórico Pedagógico:** Ausência de um prontuário estruturado para registrar conteúdos trabalhados, vocabulário, feedbacks e tarefas de casa por estudante[cite: 19, 31].
* **Falta de Visibilidade de Conversão:** Dificuldade no rastreamento de aulas experimentais (*Leads*) e na distinção de vínculos para controle gerencial[cite: 26, 30, 35].

---

## Solução Proposta e Módulos do Sistema

A aplicação centraliza a operação em dois ambientes distintos com controle de acesso baseado em perfil (RBAC)[cite: 29, 39]:

### Módulo da Professora (Administrativo)
* **Agenda Unificada (`professora-agenda.html`):** Visualização diária, semanal e mensal diferenciando por status aulas regulares confirmadas, aulas experimentais (*Leads*), solicitações pendentes e aulas concluídas[cite: 25, 30, 66].
* **Gestão de Aulas e Grade (`professora-gestao-aulas.html`):** Aprovação ou recusa de solicitações de agendamento, alocação de novos horários, bloqueio manual de agenda, reagendamentos e cancelamentos[cite: 25, 30, 68].
* **Gestão de Alunos e Conversão (`professora-gestao-alunos.html`):** Manutenção cadastral (CRUD), indicadores consolidados da carteira (Alunos Diretos vs. Escola Parceira) e conversão de *Leads* experimentais em alunos ativos[cite: 26, 29, 30, 67].
* **Diário de Classe:** Registro estruturado pós-aula contendo conteúdo gramatical, vocabulário, pontos de atenção, tarefas de casa e controle de presença ou *no-show*[cite: 31, 42, 43].

### Módulo do Aluno e Área Pública
* **Captação Pública de Leads (`index.html` / `criar-conta.html`):** Acesso público para solicitação de aula experimental gratuita via integração direta com WhatsApp e fluxo de autocadastro[cite: 38, 64, 65].
* **Agenda do Aluno (`aluno-minha-agenda.html`):** Consulta aos próximos compromissos, acesso direto ao link da sala virtual (Google Meet / Microsoft Teams) e solicitação de novos horários ou reagendamentos[cite: 27, 30, 33, 63].
* **Prontuário de Progresso (`aluno-meu-progresso.html`):** Linha do tempo cronológica com histórico de presença, feedbacks individuais da docente e acompanhamento de exercícios pendentes ou concluídos[cite: 27, 31, 62].

---

## Regras de Negócio Automatizadas

O núcleo da aplicação incorpora travas computacionais para garantir a integridade operacional do serviço[cite: 34]:

* **RN001 — Antecedência de Cancelamento:** Desmarcações automatizadas pelo painel do aluno exigem antecedência mínima de 72 horas[cite: 34].
* **RN002 — Política de Reagendamento:** Trocas de horário pelo aluno exigem antecedência mínima de 48 horas e respeitam a franquia máxima de 2 reagendamentos por trimestre[cite: 34].
* **RN003 — Unicidade e Bloqueio de Sobreposição:** Validação transacional que impede o choque de horários na grade unificada, considerando a duração da aula somada ao intervalo de descanso configurado[cite: 34, 41].
* **RN004 — Limite de Aula Experimental:** Concessão restrita a 1 aula experimental gratuita por cadastro de *Lead*[cite: 35].
* **RN005 — Segregação de Vínculo:** Classificação obrigatória entre Aluno Direto e Aluno da Escola Parceira para apuração de indicadores gerenciais[cite: 35, 44].

---

## Engenharia de Software e Modelagem

Toda a arquitetura do projeto foi documentada seguindo padrões acadêmicos e de mercado antes da codificação[cite: 18, 23]:

* **Modelagem de Processos:** Diagramas BPMN 2.0 mapeando o fluxo atual (*As-Is*) e o fluxo automatizado (*To-Be*)[cite: 20, 22].
* **Engenharia de Requisitos:** 15 Requisitos Funcionais (`RF001`–`RF015`), 13 Requisitos Não Funcionais (`RNF` aderentes à norma ISO/IEC 25010) e Matriz de Rastreabilidade (`RF x RN`)[cite: 29, 30, 31, 32, 33, 34, 35, 36].
* **Modelagem UML 2.5:** Diagramas de Casos de Uso (`UC001`–`UC006`), Diagrama de Classes Conceitual e de Domínio (com especialização de `Usuário` em `Parceira` e `Aluno`, composição com `Agenda` e associação com `Aula` e `Lead`), Modelo Lógico ER e Diagramas de Sequência[cite: 21, 37, 47, 49, 52, 53, 54].

---

## Stack Tecnológica

* **Front-end (Implementado):** HTML5 semântico, CSS3 responsivo e JavaScript (Vanilla JS com camada de dados simulados em `js/mock-data.js` e regras de interação em `js/main.js`)[cite: 23, 62].
* **Back-end (Arquitetura Alvo):** API RESTful em Node.js / Express.js com autenticação via JSON Web Token (JWT) e criptografia de senhas via BCrypt/Argon2[cite: 23, 29, 32, 33].
* **Banco de Dados (Arquitetura Alvo):** PostgreSQL (modelo relacional normalizado)[cite: 23, 36].
* **Prototipação:** Figma[cite: 24].

---

## Estrutura de Diretórios

```text
bloom-english/
├── docs/                           # Documentação completa de Engenharia de Software e diagramas UML/BPMN
├── css/
│   └── style.css                   # Folhas de estilo e identidade visual responsiva
├── js/
│   ├── mock-data.js                # Estrutura de dados simulados para validação de fluxo
│   └── main.js                     # Lógica de interface, filtros e manipulação de estado
├── index.html                      # Tela de autenticação e acesso público para aula experimental
├── criar-conta.html                # Fluxo de autocadastro de novos estudantes
├── recuperar-senha.html            # Fluxo de recuperação de credenciais
├── professora-agenda.html          # Grade interativa da docente (Dia, Semana, Mês)
├── professora-gestao-aulas.html    # Central de aprovações, novos agendamentos e manutenção
├── professora-gestao-alunos.html   # Painel de indicadores, carteira de alunos e conversão de leads
├── aluno-minha-agenda.html         # Visão de horários do estudante e solicitação de agendamento
└── aluno-meu-progresso.html        # Prontuário pedagógico, feedbacks e tarefas de fixação