/**
 * Orbis Finance - Lógica do Dashboard
 * Gerencia os cards de resumo, gráficos e tabela de transações recentes
 * Idioma: pt-br
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard();
    configurarDataAtual();
});

/**
 * Configura o texto do mês/ano atual no cabeçalho
 */
function configurarDataAtual() {
    const elementoData = document.getElementById('current-month-year');
    if (elementoData) {
        const data = new Date();
        const opcoes = { month: 'long', year: 'numeric' };
        let texto = data.toLocaleDateString('pt-BR', opcoes);
        // Capitalizar a primeira letra do mês
        texto = texto.charAt(0).toUpperCase() + texto.slice(1);
        elementoData.textContent = texto;
    }
}

/**
 * Inicializa o dashboard carregando todos os dados em paralelo
 */
async function inicializarDashboard() {
    try {
        await Promise.all([
            carregarResumo(),
            carregarGraficos(),
            carregarTransacoesRecentes()
        ]);
    } catch (erro) {
        console.error("Erro ao inicializar o dashboard:", erro);
    }
}

/**
 * Carrega o resumo financeiro do mês atual (saldo, receitas, despesas, economia)
 * e preenche os 4 cards de resumo
 */
async function carregarResumo() {
    try {
        const resposta = await fetch('/api/dashboard/summary');

        if (resposta.ok) {
            const dados = await resposta.json();
            document.getElementById('saldo-total').textContent = formatarMoeda(dados.saldo_total);
            document.getElementById('total-receitas').textContent = formatarMoeda(dados.total_receitas);
            document.getElementById('total-despesas').textContent = formatarMoeda(dados.total_despesas);
            document.getElementById('economia').textContent = `${dados.percentual_economia.toFixed(1)}%`;
        } else {
            // Se a API falhar, mostra valores zerados
            document.getElementById('saldo-total').textContent = formatarMoeda(0);
            document.getElementById('total-receitas').textContent = formatarMoeda(0);
            document.getElementById('total-despesas').textContent = formatarMoeda(0);
            document.getElementById('economia').textContent = '0%';
        }
    } catch (erro) {
        console.error("Erro ao carregar resumo:", erro);
        // Valores zerados em caso de erro de rede
        document.getElementById('saldo-total').textContent = formatarMoeda(0);
        document.getElementById('total-receitas').textContent = formatarMoeda(0);
        document.getElementById('total-despesas').textContent = formatarMoeda(0);
        document.getElementById('economia').textContent = '0%';
    }
}

/**
 * Carrega os dados dos gráficos via API e renderiza com Chart.js
 * - Gráfico de área: Receitas vs Despesas (últimos 6 meses)
 * - Gráfico donut: Despesas por categoria
 */
async function carregarGraficos() {
    try {
        const resposta = await fetch('/api/dashboard/chart');
        let labels = [];
        let receitas = [];
        let despesas = [];
        let categorias = {};

        if (resposta.ok) {
            const dados = await resposta.json();
            labels = dados.labels;
            receitas = dados.receitas;
            despesas = dados.despesas;
            categorias = dados.despesas_por_categoria || {};
        } else {
            // Dados vazios caso a API falhe
            const agora = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
                labels.push(d.toLocaleDateString('pt-BR', { month: 'short' }));
            }
            receitas = [0, 0, 0, 0, 0, 0];
            despesas = [0, 0, 0, 0, 0, 0];
        }

        // Formatar labels para exibição curta (mês abreviado)
        const labelsFormatados = labels.map(l => {
            // Se vier no formato MM/YYYY, converter para nome do mês
            if (l.includes('/')) {
                const partes = l.split('/');
                const data = new Date(parseInt(partes[1]), parseInt(partes[0]) - 1, 1);
                let nome = data.toLocaleDateString('pt-BR', { month: 'short' });
                return nome.charAt(0).toUpperCase() + nome.slice(1).replace('.', '');
            }
            return l;
        });

        renderizarGraficoArea(labelsFormatados, receitas, despesas);
        renderizarGraficoDonut(categorias);

    } catch (erro) {
        console.error("Erro ao carregar gráficos:", erro);
    }
}

/**
 * Renderiza o gráfico de área com receitas vs despesas
 */
function renderizarGraficoArea(labels, receitas, despesas) {
    const ctxArea = document.getElementById('chart-receitas-despesas');
    if (!ctxArea) return;

    new Chart(ctxArea, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitas,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: '#8b5cf6',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Despesas',
                    data: despesas,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        font: { family: 'Inter', size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    borderColor: '#2a2a2a',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += formatarMoeda(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#2a2a2a', drawBorder: false },
                    ticks: { color: '#9ca3af', font: { family: 'Inter' } }
                },
                y: {
                    grid: { color: '#2a2a2a', drawBorder: false },
                    ticks: {
                        color: '#9ca3af',
                        font: { family: 'Inter' },
                        callback: function(value) {
                            if (value >= 1000) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                            return 'R$ ' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

/**
 * Renderiza o gráfico donut com despesas por categoria
 */
function renderizarGraficoDonut(categorias) {
    const ctxDonut = document.getElementById('chart-categorias');
    if (!ctxDonut) return;

    const nomes = Object.keys(categorias);
    const valores = Object.values(categorias);

    // Cores padrão para categorias conhecidas
    const mapaCorCategoria = {
        'Moradia': '#ef4444',
        'Alimentação': '#f97316',
        'Transporte': '#3b82f6',
        'Lazer': '#ec4899',
        'Saúde': '#10b981',
        'Educação': '#8b5cf6',
        'Outros': '#9ca3af'
    };

    // Cores de fallback para categorias desconhecidas
    const coresFallback = ['#8b5cf6', '#a78bfa', '#f97316', '#3b82f6', '#ec4899', '#10b981', '#22c55e', '#9ca3af'];
    const cores = nomes.map((nome, i) => mapaCorCategoria[nome] || coresFallback[i % coresFallback.length]);

    // Se não houver dados, mostra gráfico vazio
    if (nomes.length === 0) {
        nomes.push('Sem dados');
        valores.push(1);
        cores.push('#2a2a2a');
    }

    new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            labels: nomes,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#e2e8f0',
                        padding: 16,
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    borderColor: '#2a2a2a',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            label += formatarMoeda(context.parsed);
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Carrega as últimas 5 transações e preenche a tabela
 */
async function carregarTransacoesRecentes() {
    const tbody = document.getElementById('tbody-transacoes');
    if (!tbody) return;

    try {
        const resposta = await fetch('/api/transactions/recent');

        if (resposta.ok) {
            const transacoes = await resposta.json();
            tbody.innerHTML = '';

            if (transacoes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray py-4">Nenhuma transação encontrada. Adicione sua primeira!</td></tr>';
                return;
            }

            transacoes.forEach(t => {
                const classeCor = t.type === 'receita' ? 'text-green' : 'text-red';
                const sinal = t.type === 'receita' ? '+' : '-';
                const classeBadge = getBadgeClass(t.category_name);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatarData(t.date)}</td>
                    <td><strong>${t.description}</strong></td>
                    <td><span class="badge ${classeBadge}" style="background-color: ${t.category_color}22; color: ${t.category_color}">${t.category_name || 'Sem categoria'}</span></td>
                    <td class="text-right ${classeCor} font-medium">${sinal} ${formatarMoeda(t.amount)}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray py-4">Nenhuma transação encontrada.</td></tr>';
        }
    } catch (erro) {
        console.error("Erro ao carregar transações recentes:", erro);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray py-4">Erro ao carregar transações.</td></tr>';
    }
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
