# 🪐 Orbis - Sistema de Finanças Pessoais

> "Suas finanças em órbita"

## 📋 Sobre o Projeto

O **Orbis** é um sistema web moderno e robusto para gestão e controle financeiro pessoal, desenvolvido para colocar você no comando de suas finanças de maneira visual, ágil e intuitiva. Com foco em segurança, desempenho e excelente experiência do usuário, a plataforma oferece uma visão 360° da sua vida financeira através de painéis analíticos e organização meticulosa de receitas e despesas.

### Destaques do Sistema:
- **Gestão de Finanças Pessoais:** Controle abrangente de fluxo financeiro diário, mensal e histórico.
- **Dashboard Interativo em Tempo Real:** Cálculos automáticos de saldo total, receitas, despesas e percentual de economia do mês vigente.
- **Gerenciamento Completo de Transações (CRUD):** Criação, visualização, edição e exclusão de lançamentos financeiros de forma simplificada.
- **Gráficos Visuais Avançados:** Gráficos de área (evolução comparativa receitas vs. despesas ao longo dos últimos 6 meses) e gráficos donut (distribuição percentual de despesas por categoria) alimentados por Chart.js.
- **Sistema de Categorização:** Organização por categorias padrão e personalizadas para classificar com precisão cada despesa ou receita.
- **Autenticação Segura:** Autenticação stateless via JWT (JSON Web Tokens) com senhas criptografadas por bcrypt e persistência segura em cookies HTTP.
- **Interface Dark Premium:** Layout escuro exclusivo em tons de preto e roxo profundo, proporcionando sofisticação visual sem a sobrecarga de frameworks CSS pesados.

---

## 🚀 Tecnologias Utilizadas

- **Python 3.10+**: Linguagem de programação principal, moderna e tipada.
- **FastAPI**: Framework web assíncrono de alto desempenho para APIs e renderização de páginas.
- **PostgreSQL**: Sistema gerenciador de banco de dados relacional robusto e escalável.
- **SQLAlchemy**: ORM (Object-Relational Mapping) moderno para modelagem e manipulação dos dados.
- **Alembic**: Ferramenta de controle de versão e migrações do esquema do banco de dados.
- **Jinja2**: Motor de templates para renderização dinâmica das interfaces HTML no servidor.
- **Chart.js**: Biblioteca JavaScript interativa e flexível para renderização dos gráficos.
- **JWT + bcrypt**: Mecanismo de geração e validação de tokens JWT associado à criptografia forte para senhas.
- **CSS Customizado**: Folha de estilos proprietária, responsiva e performática, criada sem dependência de frameworks externos.

---

## 📁 Estrutura do Projeto

A organização de diretórios e arquivos foi planejada com separação clara de responsabilidades:

```
SaaS FInanças/
├── app/                       # Código Python (backend)
│   ├── __init__.py
│   ├── main.py               # Ponto de entrada do FastAPI
│   ├── config.py             # Configurações do projeto
│   ├── database.py           # Conexão com PostgreSQL
│   ├── models.py             # Modelos do banco de dados
│   ├── schemas.py            # Schemas de validação
│   ├── auth.py               # Autenticação JWT
│   └── routers/              # Rotas da API
│       ├── __init__.py
│       ├── auth.py           # Login e registro
│       ├── dashboard.py      # Dashboard e cálculos
│       └── transactions.py   # CRUD de transações
├── templates/                 # Páginas HTML
│   ├── base.html             # Template base
│   ├── login.html            # Tela de login
│   ├── register.html         # Tela de registro
│   ├── dashboard.html        # Dashboard principal
│   └── transactions.html     # Gerenciamento de transações
├── assets/                    # Arquivos estáticos
│   └── css/
│       └── style.css         # Estilos (tema dark roxo)
├── js/                        # JavaScript
│   ├── dashboard.js          # Lógica do dashboard e gráficos
│   └── transactions.js       # Lógica de transações
├── requirements.txt           # Dependências Python
└── README.md                  # Documentação
```

---

## ⚙️ Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados no seu ambiente:

- **Python 3.10** ou superior
- **PostgreSQL 14** ou superior em execução
- **pip** (gerenciador de pacotes padrão do Python)
- Git (opcional, para controle de versão)

---

## 🛠️ Instalação e Configuração

Siga o passo a passo abaixo para rodar a aplicação localmente:

### 1. Clonar/Acessar o projeto
Navegue até a pasta do projeto no seu terminal:
```bash
cd "SaaS FInanças"
```

### 2. Criar ambiente virtual
Crie e ative um ambiente virtual isolado para as dependências:
```bash
python -m venv venv
```
- No Windows (PowerShell / Prompt):
```powershell
venv\Scripts\activate
```
- No Linux / macOS:
```bash
source venv/bin/activate
```

### 3. Instalar dependências
Com o ambiente virtual ativo, instale todas as bibliotecas necessárias:
```bash
pip install -r requirements.txt
```

### 4. Configurar o banco de dados
Acesse seu cliente do PostgreSQL (como `psql` ou pgAdmin) e crie a base de dados:
```sql
CREATE DATABASE orbis;
```

### 5. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto (mesmo nível de `requirements.txt`) contendo suas credenciais:
```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/orbis
SECRET_KEY=sua_chave_secreta_aqui
```
> Substitua `sua_senha` pela sua senha do PostgreSQL e defina um `SECRET_KEY` seguro e imprevisível.

### 6. Executar o servidor
Inicie o servidor de desenvolvimento utilizando o Uvicorn com recarregamento automático:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Acessar no navegador
Abra seu navegador de preferência e acesse:
```
http://localhost:8000
```

---

## 📱 Funcionalidades

### Autenticação
- **Registro de Novo Usuário:** Criação simplificada de conta com geração automática das categorias essenciais pré-configuradas (ex: Salário, Alimentação, Moradia, Transporte, Lazer, etc.).
- **Login Seguro:** Autenticação por e-mail e senha com validação robusta.
- **Sessão JWT:** Armazenamento seguro de token JWT em cookie, garantindo persistência sem comprometer a segurança.
- **Logout Seguro:** Invalidação imediata da sessão no navegador.

### Dashboard
- **Cards de Resumo Financeiro:** Indicadores de saldo acumulado, total de receitas, total de despesas e percentual de economia do mês selecionado.
- **Gráfico de Área Comparativo:** Análise histórica visual do equilíbrio entre entradas e saídas nos últimos 6 meses.
- **Gráfico Donut de Despesas:** Visualização proporcional dos gastos segregados por categoria.
- **Tabela de Atividades Recentes:** Lista rápida com as últimas movimentações registradas pelo usuário.

### Transações
- **Lançamento de Receitas e Despesas:** Cadastro detalhado contendo descrição, valor, data e categoria.
- **Categorização Dinâmica:** Associação direta com as categorias cadastradas.
- **Marcação de Recorrência:** Opção de sinalizar receitas ou despesas recorrentes (como salários, assinaturas e aluguel).
- **Edição e Exclusão (CRUD):** Controle total para alterar dados incorretos ou excluir transações.
- **Busca por Descrição:** Campo de pesquisa instantânea para localização de transações específicas.
- **Filtros por Categoria:** Filtragem ágil para auditoria detalhada de gastos por categoria.

---

## 🗄️ Banco de Dados

A arquitetura do banco de dados relacional é estruturada em 3 tabelas principais:

1. **`users`**
   - Armazena as credenciais e dados cadastrais dos usuários da plataforma.
   - Campos: identificador único (`id`), e-mail (`email`), hash da senha (`hashed_password`) e timestamp de criação (`created_at`).
   - Relaciona-se com as tabelas `categories` e `transactions` para garantir o isolamento estrito de dados multi-tenant.

2. **`categories`**
   - Contém as categorias de receitas e despesas vinculadas a cada usuário.
   - Campos: identificador único (`id`), nome da categoria (`name`), tipo de categoria (`type` - receita ou despesa), identificador do usuário (`user_id`), ícone/cor representativa e metadados.
   - Permite que cada usuário possua seu próprio catálogo de categorias personalizadas.

3. **`transactions`**
   - Registra todos os lançamentos financeiros individuais.
   - Campos: identificador único (`id`), descrição (`description`), valor (`amount`), data da transação (`date`), tipo (`type`), referência à categoria (`category_id`), flag de recorrência (`is_recurring`), identificador do usuário (`user_id`) e data de cadastro.
   - Possui chaves estrangeiras referenciando o usuário proprietário e a categoria associada.

---

## 🔒 Segurança

- **Hashing de Senhas com bcrypt:** Senhas nunca são armazenadas em texto puro, passando por algoritmo de derivação com salt seguro.
- **Tokens JWT:** Assinatura criptográfica dos tokens de autenticação com tempo de expiração determinado (24 horas).
- **Proteção de Rotas:** Endpoints de visualização de painel, transações e operações de CRUD são protegidos via dependências de autenticação no FastAPI, bloqueando requisições não autorizadas.
- **Isolamento de Dados por Usuário:** Todas as consultas no banco de dados aplicam filtros estritos baseados no identificador do usuário autenticado (`user_id`), impedindo acesso indevido entre contas.

---

## 🎨 Interface

- **Tema Dark Premium:** Paleta de cores moderna com predomínio de preto e roxo neon/profundo, oferecendo uma estética elegante e confortável aos olhos.
- **Design Responsivo:** Layout adaptável para telas desktop, tablets e smartphones.
- **Gráficos Interativos:** Visualizações dinâmicas integradas via Chart.js com tooltips informativos e transições limpas.
- **Animações e Transições Suaves:** Feedback visual fluido em interações, botões, modais e cards.
- **Sem Dependência de Frameworks CSS:** CSS nativo e limpo, garantindo carregamento ultrarrápido sem o overhead de bibliotecas pesadas.

---

## 🔮 Possíveis Melhorias Futuras

1. **Relatórios em PDF:** Exportar relatórios mensais e anuais formatados para apresentação e arquivamento.
2. **Metas Financeiras:** Definir metas de economia e acompanhar o progresso com barras visuais.
3. **Importação de Extratos:** Permitir upload e reconciliação automática de arquivos CSV e OFX emitidos por instituições financeiras.
4. **Notificações:** Alertas visuais e por e-mail para contas próximas ao vencimento e metas alcançadas.
5. **Multi-moeda:** Suporte a diferentes moedas internacionais (USD, EUR, GBP) com cotação em tempo real.
6. **Gráficos Avançados:** Inclusão de mais modalidades de gráficos (barras empilhadas, dispersão) e períodos temporais flexíveis.
7. **App Mobile:** Versão móvel dedicada utilizando Progressive Web App (PWA) ou React Native.
8. **Integração Bancária:** Conexão direta com APIs bancárias via ecossistema Open Banking.
9. **Orçamento por Categoria:** Estabelecimento de limites de gastos mensais por categoria com avisos preventivos.
10. **Transações Recorrentes Automáticas:** Geração automática programada de lançamentos financeiros baseados em regras de recorrência.
11. **Modo Claro:** Opção de alternância dinâmica entre tema dark e light no cabeçalho.
12. **Backup Automático:** Rotinas de exportação periódica dos dados do usuário para nuvem ou download local.
13. **Compartilhamento:** Funcionalidade de finanças compartilhadas para parceiros, famílias ou repúblicas.
14. **IA Preditiva:** Mecanismo inteligente de previsão de despesas futuras baseado no histórico de compras.
15. **Dashboard Personalizável:** Funcionalidade drag-and-drop para mover, redimensionar e reorganizar os widgets da tela inicial.

---

## 📄 Licença

Projeto desenvolvido para fins de uso pessoal e educacional.

---

## 👨‍💻 Desenvolvido por

**Guilherme**

---

*Orbis - Suas finanças em órbita* 🪐
