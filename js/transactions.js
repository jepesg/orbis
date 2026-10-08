/**
 * Orbis Finance - Lógica de Transações
 * Gerencia o CRUD de receitas e despesas, abas, filtros e modal de edição
 * Idioma: pt-br
 */

// Estado global da página de transações
let tipoAtual = 'receita';
let transacoesAtuais = [];
let categoriasAtuais = [];
let envioTransacaoEmAndamento = false;

document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('data');
    if (dataInput && !dataInput.value) dataInput.value = new Date().toISOString().slice(0, 10);
    carregarCategorias();
    carregarTransacoes();
    configurarEventos();
});

// ==========================================================================
// Navegação por Abas (Receitas / Despesas)
// ==========================================================================

/**
 * Alterna entre as abas de Receitas e Despesas
 * Atualiza o visual e recarrega categorias + transações do tipo selecionado
 */
function alternarAba(tipo) {
    if (tipoAtual === tipo) return;

    tipoAtual = tipo;

    // Atualiza visual das abas
    const btnReceitas = document.getElementById('tab-receitas');
    const btnDespesas = document.getElementById('tab-despesas');

    if (tipo === 'receita') {
        btnReceitas.classList.add('active');
        btnDespesas.classList.remove('active');
    } else {
        btnDespesas.classList.add('active');
        btnReceitas.classList.remove('active');
    }

    // Recarrega dados conforme o tipo selecionado
    carregarCategorias();
    carregarTransacoes();
}

// ==========================================================================
// Categorias
// ==========================================================================

/**
 * Carrega as categorias do usuário filtradas pelo tipo atual
 * e popula os selects de adição, edição e filtro
 */
async function carregarCategorias() {
    const selectAdd = document.getElementById('categoria');
    const selectEdit = document.getElementById('edit-categoria');
    const selectFilter = document.getElementById('filter-categoria');

    try {
        const resposta = await fetch('/api/categories');

        if (resposta.ok) {
            const todasCategorias = await resposta.json();
            // Filtra por tipo atual (receita ou despesa)
            categoriasAtuais = todasCategorias.filter(c => c.type === tipoAtual);
        } else {
            categoriasAtuais = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
        categoriasAtuais = [];
    }

    // Popula o select de adição
    if (selectAdd) {
        selectAdd.innerHTML = '<option value="">Selecione a categoria...</option>';
        categoriasAtuais.forEach(cat => {
            selectAdd.insertAdjacentHTML('beforeend', `<option value="${cat.id}">${escaparHtml(cat.name)}</option>`);
        });
    }

    // Popula o select de edição no modal
    if (selectEdit) {
        selectEdit.innerHTML = '';
        categoriasAtuais.forEach(cat => {
            selectEdit.insertAdjacentHTML('beforeend', `<option value="${cat.id}">${escaparHtml(cat.name)}</option>`);
        });
    }

    // Popula o select de filtro
    if (selectFilter) {
        selectFilter.innerHTML = '<option value="todas">Todas as categorias</option>';
        categoriasAtuais.forEach(cat => {
            selectFilter.insertAdjacentHTML('beforeend', `<option value="${cat.id}">${escaparHtml(cat.name)}</option>`);
        });
    }
}

// ==========================================================================
// Transações - Listagem
// ==========================================================================

/**
 * Carrega as transações do tipo atual via API e renderiza na tabela
 */
async function carregarTransacoes() {
    const tbody = document.getElementById('tbody-todas');
    if (!tbody) return;

    // Mostra indicador de carregamento
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray py-4"><i class="fas fa-spinner fa-spin"></i> Carregando...</td></tr>';

    try {
        const resposta = await fetch(`/api/transactions?type=${tipoAtual}`);

        if (resposta.ok) {
            transacoesAtuais = await resposta.json();
        } else {
            transacoesAtuais = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar transações:", erro);
        transacoesAtuais = [];
    }

    renderizarTabela(transacoesAtuais);
}

/**
 * Renderiza a tabela de transações com os dados fornecidos
 */
function renderizarTabela(transacoes) {
    const tbody = document.getElementById('tbody-todas');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (transacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray py-4">Nenhuma transação encontrada. Adicione a primeira!</td></tr>';
        return;
    }

    transacoes.forEach(t => {
        const classeCor = t.type === 'receita' ? 'text-green' : 'text-red';
        const sinal = t.type === 'receita' ? '+' : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(t.date)}</td>
            <td><strong>${escaparHtml(t.description)}</strong>${t.recurring ? ' <span class="badge">Mensal</span>' : ''}</td>
            <td><span class="badge" style="background-color: ${corSegura(t.category_color)}22; color: ${corSegura(t.category_color)}">${escaparHtml(t.category_name || 'Sem categoria')}</span></td>
            <td class="${classeCor} font-medium">${sinal} ${formatarMoeda(t.amount)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon edit" onclick="abrirModalEditar(${t.id})" title="Editar transação">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-icon delete" onclick="excluirTransacao(${t.id})" title="Excluir transação">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// Transações - Criar / Editar / Excluir
// ==========================================================================

/**
 * Adiciona uma nova transação via API
 * Coleta os dados do formulário e envia via POST
 */
async function adicionarTransacao(event) {
    event.preventDefault();
    if (envioTransacaoEmAndamento) return;

    // Coleta os dados do formulário
    const descricao = document.getElementById('descricao').value.trim();
    const valor = parseFloat(document.getElementById('valor').value);
    const categoriaId = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;
    const recorrente = document.getElementById('recorrente').checked;

    // Validação básica no front-end
    if (!descricao || !valor || !data) {
        mostrarNotificacao('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    // Monta o corpo da requisição
    const corpo = {
        description: descricao,
        amount: valor,
        type: tipoAtual,
        date: data,
        recurring: recorrente,
        category_id: categoriaId ? parseInt(categoriaId) : null
    };

    envioTransacaoEmAndamento = true;
    const botaoEnviar = document.querySelector('#form-transacao button[type="submit"]');
    if (botaoEnviar) {
        botaoEnviar.disabled = true;
        botaoEnviar.setAttribute('aria-busy', 'true');
    }

    try {
        const resposta = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpo)
        });

        if (resposta.ok) {
            // Limpa o formulário e recarrega a tabela
            const formulario = document.getElementById('form-transacao');
            formulario.reset();
            document.getElementById('data').value = new Date().toISOString().slice(0, 10);
            mostrarNotificacao('Transação adicionada com sucesso!', 'sucesso');
            carregarTransacoes();
        } else {
            const erro = await resposta.json();
            mostrarNotificacao('Erro ao adicionar: ' + (erro.detail || 'Tente novamente.'), 'erro');
        }
    } catch (erro) {
        console.error("Erro ao adicionar transação:", erro);
        mostrarNotificacao('Erro de conexão. Verifique o servidor.', 'erro');
    } finally {
        envioTransacaoEmAndamento = false;
        if (botaoEnviar) {
            botaoEnviar.disabled = false;
            botaoEnviar.removeAttribute('aria-busy');
        }
    }
}

/**
 * Exclui uma transação após confirmação do usuário
 */
async function excluirTransacao(id) {
    const transacao = transacoesAtuais.find(t => t.id === id);
    const pergunta = transacao?.recurring && !transacao?.recurring_parent_id
        ? 'Excluir esta série mensal? Os lançamentos futuros serão removidos e o histórico passado será mantido.'
        : 'Tem certeza que deseja excluir esta transação?';
    if (!confirm(pergunta)) return;

    try {
        const resposta = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            mostrarNotificacao('Transação excluída com sucesso!', 'sucesso');
            carregarTransacoes();
        } else {
            mostrarNotificacao('Erro ao excluir transação.', 'erro');
        }
    } catch (erro) {
        console.error("Erro ao excluir transação:", erro);
        mostrarNotificacao('Erro de conexão.', 'erro');
    }
}

// ==========================================================================
// Modal de Edição
// ==========================================================================

/**
 * Abre o modal de edição preenchido com os dados da transação selecionada
 */
function abrirModalEditar(id) {
    const transacao = transacoesAtuais.find(t => t.id === id);
    if (!transacao) return;

    // Preenche os campos do modal com os dados da transação
    document.getElementById('edit-id').value = transacao.id;
    document.getElementById('edit-descricao').value = transacao.description;
    document.getElementById('edit-valor').value = transacao.amount;
    document.getElementById('edit-data').value = transacao.date;

    // Seleciona a categoria correta no dropdown
    if (transacao.category_id) {
        document.getElementById('edit-categoria').value = transacao.category_id;
    }

    // Exibe o modal com animação
    document.getElementById('modal-editar').style.display = 'flex';
}

/**
 * Fecha o modal de edição
 */
function fecharModal() {
    document.getElementById('modal-editar').style.display = 'none';
}

/**
 * Salva a edição da transação via API (PUT)
 */
async function salvarEdicao() {
    const id = document.getElementById('edit-id').value;
    const descricao = document.getElementById('edit-descricao').value.trim();
    const valor = parseFloat(document.getElementById('edit-valor').value);
    const categoriaId = document.getElementById('edit-categoria').value;
    const data = document.getElementById('edit-data').value;

    if (!descricao || !valor || !data) {
        mostrarNotificacao('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    const corpo = {
        description: descricao,
        amount: valor,
        date: data,
        category_id: categoriaId ? parseInt(categoriaId) : null
    };

    try {
        const resposta = await fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpo)
        });

        if (resposta.ok) {
            fecharModal();
            mostrarNotificacao('Transação atualizada com sucesso!', 'sucesso');
            carregarTransacoes();
        } else {
            mostrarNotificacao('Erro ao salvar alterações.', 'erro');
        }
    } catch (erro) {
        console.error("Erro ao salvar edição:", erro);
        mostrarNotificacao('Erro de conexão.', 'erro');
    }
}

// ==========================================================================
// Filtros e Busca
// ==========================================================================

/**
 * Configura os event listeners para busca e filtros
 */
function configurarEventos() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-categoria');
    const form = document.getElementById('form-transacao');

    // Busca em tempo real ao digitar
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }

    // Filtro por categoria ao selecionar
    if (filterSelect) {
        filterSelect.addEventListener('change', aplicarFiltros);
    }

    // Submissão do formulário de adição
    if (form) {
        form.addEventListener('submit', adicionarTransacao);
    }

    // Fechar modal ao clicar fora dele
    const modal = document.getElementById('modal-editar');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) fecharModal();
        });
    }

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') fecharModal();
    });
}

/**
 * Aplica os filtros de busca e categoria sobre as transações carregadas
 */
function aplicarFiltros() {
    const termo = document.getElementById('search-input').value.toLowerCase();
    const catFiltro = document.getElementById('filter-categoria').value;

    let filtradas = transacoesAtuais;

    // Filtra por termo de busca na descrição
    if (termo) {
        filtradas = filtradas.filter(t =>
            t.description.toLowerCase().includes(termo)
        );
    }

    // Filtra por categoria selecionada
    if (catFiltro !== 'todas') {
        filtradas = filtradas.filter(t =>
            t.category_id === parseInt(catFiltro)
        );
    }

    renderizarTabela(filtradas);
}

// ==========================================================================
// Notificações
// ==========================================================================

/**
 * Mostra uma notificação temporária no topo da página
 * tipo pode ser 'sucesso' ou 'erro'
 */
function mostrarNotificacao(mensagem, tipo) {
    // Remove notificação anterior se existir
    const existente = document.querySelector('.notificacao');
    if (existente) existente.remove();

    const div = document.createElement('div');
    div.className = `notificacao notificacao-${tipo}`;
    div.innerHTML = `
        <i class="fas ${tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensagem}</span>
    `;

    document.body.appendChild(div);

    // Remove automaticamente após 3 segundos
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translateX(100%)';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// ==========================================================================
// Funções Utilitárias
// ==========================================================================

/**
 * Formata um valor numérico para moeda brasileira (R$ X.XXX,XX)
 */
function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
 */
function formatarData(dataString) {
    if (!dataString) return '-';
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}

function escaparHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caractere => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caractere]));
}

function corSegura(valor) {
    return /^#[0-9a-f]{6}$/i.test(valor || '') ? valor : '#6b7280';
}

/**
 * Retorna a classe CSS do badge com base no nome da categoria
 */
function getBadgeClass(categoria) {
    const mapa = {
        'Salário': 'badge-salario',
        'Alimentação': 'badge-alimentacao',
        'Transporte': 'badge-transporte',
        'Lazer': 'badge-lazer'
    };
    return mapa[categoria] || 'badge-default';
}
