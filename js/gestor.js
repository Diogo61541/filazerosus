/* ============================================================
   gestor.js – Lógica do Painel de Gestores
   ============================================================ */

// ---------- Dados simulados ----------
const DADOS_UNIDADES = [
    { id: 'ubs_centro',     nome: 'UBS Centro',      pacientes: 42, tempoMedio: 38, ocupacao: 45, online: true  },
    { id: 'ubs_norte',      nome: 'UBS Norte',       pacientes: 68, tempoMedio: 92, ocupacao: 78, online: true  },
    { id: 'ubs_sul',        nome: 'UBS Sul',         pacientes: 21, tempoMedio: 25, ocupacao: 30, online: true  },
    { id: 'pa_emergencia',  nome: 'PA Emergência',   pacientes: 95, tempoMedio: 145, ocupacao: 92, online: true },
    { id: 'hospital_geral', nome: 'Hospital Geral',  pacientes: 53, tempoMedio: 58, ocupacao: 55, online: true  },
];

const FILAS_DADOS = [
    { unidade: 'UBS Centro',     especialidade: 'Clínica Geral',    fila: 12, tempo: 40,  status: 'normal'   },
    { unidade: 'UBS Centro',     especialidade: 'Pediatria',        fila: 8,  tempo: 28,  status: 'normal'   },
    { unidade: 'UBS Norte',      especialidade: 'Clínica Geral',    fila: 30, tempo: 110, status: 'atencao'  },
    { unidade: 'UBS Norte',      especialidade: 'Ginecologia',      fila: 18, tempo: 75,  status: 'atencao'  },
    { unidade: 'UBS Sul',        especialidade: 'Clínica Geral',    fila: 5,  tempo: 20,  status: 'normal'   },
    { unidade: 'PA Emergência',  especialidade: 'Urgência',         fila: 35, tempo: 180, status: 'critico'  },
    { unidade: 'Hospital Geral', especialidade: 'Cardiologia',      fila: 10, tempo: 55,  status: 'normal'   },
    { unidade: 'Hospital Geral', especialidade: 'Ortopedia',        fila: 14, tempo: 65,  status: 'atencao'  },
];

let acaoPendente = null;

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', function () {
    atualizarDashboard();
    // Atualizar KPIs a cada 60 segundos (simulação de tempo real)
    setInterval(atualizarKPIs, 60000);
});

// ---------- Dashboard principal ----------
function atualizarDashboard() {
    atualizarKPIs();
    renderizarStatusUnidades();
    renderizarFilas();
    renderizarAlertas();
}

function atualizarKPIs() {
    const filtroUnidade = document.getElementById('filtro-unidade') ? document.getElementById('filtro-unidade').value : '';
    const dados = filtroUnidade
        ? DADOS_UNIDADES.filter(u => u.id === filtroUnidade)
        : DADOS_UNIDADES;

    const totalPacientes = dados.reduce((s, u) => s + u.pacientes, 0);
    const tempoMedio = dados.length
        ? Math.round(dados.reduce((s, u) => s + u.tempoMedio, 0) / dados.length)
        : 0;
    const unidadesOnline = dados.filter(u => u.online).length;
    const taxaOcupacao = dados.length
        ? Math.round(dados.reduce((s, u) => s + u.ocupacao, 0) / dados.length)
        : 0;

    setText('total-pacientes', totalPacientes);
    setText('tempo-medio', tempoMedio + ' min');
    setText('unidades-online', unidadesOnline);
    setText('taxa-ocupacao', taxaOcupacao + '%');
}

function setText(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
}

// ---------- Status das Unidades ----------
function renderizarStatusUnidades() {
    const container = document.getElementById('unidades-status');
    if (!container) return;

    container.innerHTML = DADOS_UNIDADES.map(u => {
        const barClass = u.ocupacao < 50 ? 'bar-low' : u.ocupacao < 80 ? 'bar-mid' : 'bar-high';
        const statusText = u.ocupacao < 50 ? '🟢 Normal' : u.ocupacao < 80 ? '🟡 Atenção' : '🔴 Crítico';

        return `
        <div class="unidade-status-card">
            <h4>${u.nome}</h4>
            <div style="font-size:0.85rem;color:#4a5568;margin-bottom:4px;">${u.pacientes} pacientes · ${u.tempoMedio} min médio</div>
            <div class="ocupacao-bar-wrap">
                <div class="ocupacao-bar ${barClass}" style="width:${u.ocupacao}%"></div>
            </div>
            <div class="ocupacao-label">${statusText} — ${u.ocupacao}% ocupação</div>
        </div>`;
    }).join('');
}

// ---------- Tabela de Filas ----------
function renderizarFilas() {
    const tbody = document.getElementById('filas-tbody');
    if (!tbody) return;

    const filtroUnidade = document.getElementById('filtro-unidade') ? document.getElementById('filtro-unidade').value : '';
    const filasFiltradas = filtroUnidade
        ? FILAS_DADOS.filter(f => {
            const u = DADOS_UNIDADES.find(u => u.id === filtroUnidade);
            return u && f.unidade === u.nome;
        })
        : FILAS_DADOS;

    tbody.innerHTML = filasFiltradas.map(f => `
        <tr>
            <td><strong>${f.unidade}</strong></td>
            <td>${f.especialidade}</td>
            <td>${f.fila} pacientes</td>
            <td>${f.tempo} min</td>
            <td><span class="status-tag status-${f.status}">${labelStatus(f.status)}</span></td>
            <td>
                ${f.status !== 'normal'
                    ? `<button class="btn btn-primary btn-sm" onclick="sugerirRedirecionamento('${f.unidade}', '${f.especialidade}')">Redistribuir</button>`
                    : '—'}
            </td>
        </tr>
    `).join('');
}

function labelStatus(status) {
    return { normal: '✅ Normal', atencao: '⚠️ Atenção', critico: '🔴 Crítico' }[status] || status;
}

// ---------- Alertas ----------
function renderizarAlertas() {
    const container = document.getElementById('alertas-container');
    if (!container) return;

    const criticos = DADOS_UNIDADES.filter(u => u.ocupacao >= 90);
    const atencao  = DADOS_UNIDADES.filter(u => u.ocupacao >= 70 && u.ocupacao < 90);
    const alertas  = [];

    criticos.forEach(u => alertas.push({
        tipo: 'alerta-danger',
        icone: '🔴',
        msg: `<strong>${u.nome}</strong> está com ${u.ocupacao}% de ocupação. Considere redistribuir pacientes imediatamente.`,
    }));

    atencao.forEach(u => alertas.push({
        tipo: 'alerta-warning',
        icone: '⚠️',
        msg: `<strong>${u.nome}</strong> está com ${u.ocupacao}% de ocupação. Fique atento ao aumento da demanda.`,
    }));

    if (alertas.length === 0) {
        alertas.push({
            tipo: 'alerta-info',
            icone: 'ℹ️',
            msg: 'Todas as unidades estão operando dentro dos parâmetros normais.',
        });
    }

    container.innerHTML = alertas.map(a => `
        <div class="alerta ${a.tipo}">
            <span class="alerta-icon">${a.icone}</span>
            <span>${a.msg}</span>
        </div>
    `).join('');
}

// ---------- Controle de Carga ----------
function sugerirRedirecionamento(unidade, especialidade) {
    const origem = document.getElementById('unidade-origem');
    if (origem) {
        for (let i = 0; i < origem.options.length; i++) {
            if (origem.options[i].text.includes(unidade)) {
                origem.selectedIndex = i;
                break;
            }
        }
    }
    document.getElementById('msg-confirmacao').textContent =
        `Deseja redistribuir pacientes de "${unidade}" (${especialidade})?`;
    acaoPendente = { tipo: 'redistribuir', unidade, especialidade };
    abrirModal('modal-confirmacao');
}

function processarRedirecionamento() {
    const origem   = document.getElementById('unidade-origem').value;
    const destino  = document.getElementById('unidade-destino').value;
    const qtd      = parseInt(document.getElementById('quantidade-redirecionar').value) || 0;

    if (!origem || !destino || qtd <= 0) {
        alert('Preencha todos os campos: unidade de origem, quantidade e destino.');
        return;
    }

    if (origem === destino) {
        alert('A unidade de origem e destino não podem ser iguais.');
        return;
    }

    document.getElementById('msg-confirmacao').textContent =
        `Confirmar o redirecionamento de ${qtd} paciente(s) para a unidade selecionada?`;
    acaoPendente = { tipo: 'mover', origem, destino, qtd };
    abrirModal('modal-confirmacao');
}

function confirmarAcao() {
    fecharModal('modal-confirmacao');
    if (!acaoPendente) return;

    if (acaoPendente.tipo === 'mover') {
        const origemDado = DADOS_UNIDADES.find(u => u.id === acaoPendente.origem);
        const destinoDado = DADOS_UNIDADES.find(u => u.id === acaoPendente.destino);
        if (origemDado && destinoDado) {
            const movidos = Math.min(acaoPendente.qtd, origemDado.pacientes);
            origemDado.pacientes   -= movidos;
            destinoDado.pacientes  += movidos;
            origemDado.ocupacao    = Math.max(0, origemDado.ocupacao - Math.round(movidos * 1.5));
            destinoDado.ocupacao   = Math.min(100, destinoDado.ocupacao + Math.round(movidos * 1.5));
        }
    }

    acaoPendente = null;
    atualizarDashboard();
}

// ---------- Exportar Relatório ----------
function exportarRelatorio() {
    const linhas = ['Unidade,Pacientes Hoje,Tempo Médio (min),Ocupação (%)'];
    DADOS_UNIDADES.forEach(u => {
        linhas.push(`"${u.nome}",${u.pacientes},${u.tempoMedio},${u.ocupacao}`);
    });

    const csv = linhas.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'relatorio-fila-zero-sus.csv';
    link.click();
    URL.revokeObjectURL(url);
}
