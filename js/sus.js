/* ============================================================
   sus.js – Lógica da página de Atendimento SUS
   ============================================================ */

// ---------- Dados simulados de unidades ----------
const UNIDADES = [
    {
        id: 'ubs_centro',
        nome: 'UBS Centro',
        tipo: 'UBS',
        distancia: 1.2,
        fila: 8,
        tempoEspera: 40,
        ocupacao: 45,
        endereco: 'R. das Flores, 120 – Centro',
    },
    {
        id: 'ubs_norte',
        nome: 'UBS Norte',
        tipo: 'UBS',
        distancia: 3.5,
        fila: 22,
        tempoEspera: 110,
        ocupacao: 78,
        endereco: 'Av. Norte, 500 – Bairro Norte',
    },
    {
        id: 'ubs_sul',
        nome: 'UBS Sul',
        tipo: 'UBS',
        distancia: 4.8,
        fila: 5,
        tempoEspera: 25,
        ocupacao: 30,
        endereco: 'R. Sul, 88 – Bairro Sul',
    },
    {
        id: 'pa_emergencia',
        nome: 'PA Emergência',
        tipo: 'PA',
        distancia: 6.1,
        fila: 35,
        tempoEspera: 180,
        ocupacao: 92,
        endereco: 'Av. Principal, 1000 – Centro',
    },
    {
        id: 'hospital_geral',
        nome: 'Hospital Geral',
        tipo: 'Hospital',
        distancia: 8.4,
        fila: 12,
        tempoEspera: 60,
        ocupacao: 55,
        endereco: 'Av. da Saúde, 2000 – Zona Leste',
    },
];

let unidadesFiltradas = [...UNIDADES];
let unidadeSelecionada = null;

// ---------- Step 1: Dados Pessoais ----------
function validarDados() {
    let valido = true;

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const cep = document.getElementById('cep').value.trim();

    document.getElementById('erro-nome').textContent = '';
    document.getElementById('erro-cpf').textContent = '';
    document.getElementById('erro-celular').textContent = '';
    document.getElementById('erro-cep').textContent = '';

    if (nome.length < 3) {
        document.getElementById('erro-nome').textContent = 'Informe seu nome completo.';
        valido = false;
    }

    if (!validarCPF(cpf)) {
        document.getElementById('erro-cpf').textContent = 'CPF inválido.';
        valido = false;
    }

    const celularNumeros = celular.replace(/\D/g, '');
    if (celularNumeros.length < 10) {
        document.getElementById('erro-celular').textContent = 'Número de celular inválido.';
        valido = false;
    }

    const cepNumeros = cep.replace(/\D/g, '');
    if (cepNumeros.length !== 8) {
        document.getElementById('erro-cep').textContent = 'CEP inválido.';
        valido = false;
    }

    if (valido) {
        irParaStep(2);
    }
}

// ---------- Step 2: Sintomas ----------
function atualizarEspecialidades() {
    // Placeholder: poderia filtrar unidades por especialidade no step 3
}

function validarSintomas() {
    const sintomas = document.getElementById('sintomas').value.trim();

    if (sintomas.length < 10) {
        abrirModal('modal-erro');
        document.getElementById('titulo-erro').textContent = 'Descrição incompleta';
        document.getElementById('msg-erro').textContent = 'Por favor descreva seus sintomas com pelo menos 10 caracteres.';
        return;
    }

    carregarUnidades();
    irParaStep(3);
}

// ---------- Step 3: Unidades ----------
function carregarUnidades() {
    renderizarUnidades(unidadesFiltradas);
}

function filtrarUnidades(tipo, event) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    switch (tipo) {
        case 'proxima':
            unidadesFiltradas = [...UNIDADES].sort((a, b) => a.distancia - b.distancia);
            break;
        case 'menor_fila':
            unidadesFiltradas = [...UNIDADES].sort((a, b) => a.fila - b.fila);
            break;
        default:
            unidadesFiltradas = [...UNIDADES];
    }

    renderizarUnidades(unidadesFiltradas);
}

function renderizarUnidades(lista) {
    const container = document.getElementById('lista-unidades');
    if (!container) return;

    container.innerHTML = lista.map(u => {
        const statusClass = u.ocupacao < 50 ? 'badge-green' : u.ocupacao < 80 ? 'badge-yellow' : 'badge-red';
        const statusLabel = u.ocupacao < 50 ? 'Disponível' : u.ocupacao < 80 ? 'Moderado' : 'Lotado';
        const selecionado = unidadeSelecionada && unidadeSelecionada.id === u.id ? 'selected' : '';

        return `
        <div class="unidade-card ${selecionado}" onclick="selecionarUnidade('${u.id}')">
            <div class="unidade-header">
                <span class="unidade-nome">🏥 ${u.nome} <small style="font-weight:400;color:#718096;">(${u.tipo})</small></span>
                <span class="badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="unidade-info">
                <span>📍 <strong>${u.distancia} km</strong></span>
                <span>👥 <strong>${u.fila}</strong> na fila</span>
                <span>⏱️ ~<strong>${u.tempoEspera} min</strong></span>
                <span>📊 <strong>${u.ocupacao}%</strong> ocupação</span>
            </div>
            <div style="font-size:0.85rem;color:#718096;margin-top:8px;">📌 ${u.endereco}</div>
        </div>`;
    }).join('');
}

function selecionarUnidade(id) {
    unidadeSelecionada = UNIDADES.find(u => u.id === id);
    renderizarUnidades(unidadesFiltradas);
    gerarConfirmacao();
    irParaStep(4);
}

// ---------- Step 4: Confirmação ----------
function gerarConfirmacao() {
    if (!unidadeSelecionada) return;

    const nome = document.getElementById('nome').value.trim();
    const posicao = unidadeSelecionada.fila + 1;
    const senha = 'SUS-' + String(posicao).padStart(3, '0') + '-' + String(Math.floor(Math.random() * 900) + 100);

    const container = document.getElementById('confirmacao-content');
    if (!container) return;

    container.innerHTML = `
        <div class="confirmacao-card">
            <h3>🏥 ${unidadeSelecionada.nome}</h3>
            <p>📌 ${unidadeSelecionada.endereco}</p>
            <p>📍 ${unidadeSelecionada.distancia} km de distância</p>
        </div>
        <div class="fila-numero">${senha}</div>
        <p class="tempo-espera">⏱️ Tempo estimado de espera: <strong>~${unidadeSelecionada.tempoEspera} min</strong></p>
        <p class="tempo-espera" style="margin-top:8px;">👥 Você é o <strong>${posicao}º</strong> na fila virtual</p>
        <p style="color:#718096;font-size:0.88rem;margin-top:16px;">Verifique seus dados antes de confirmar:</p>
        <div class="dados-confirmacao" style="margin-top:8px;">
            <strong>Nome:</strong> ${nome}<br>
            <strong>Unidade:</strong> ${unidadeSelecionada.nome}<br>
            <strong>Sintomas:</strong> ${document.getElementById('sintomas').value.trim().substring(0, 80)}${document.getElementById('sintomas').value.trim().length > 80 ? '…' : ''}
        </div>
    `;
}

function finalizarAgendamento() {
    if (!unidadeSelecionada) {
        voltarStep(3);
        return;
    }

    const nome = document.getElementById('nome').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const posicao = unidadeSelecionada.fila + 1;
    const senha = 'SUS-' + String(posicao).padStart(3, '0') + '-' + String(Math.floor(Math.random() * 900) + 100);

    document.getElementById('dados-confirmacao').innerHTML = `
        <strong>Nome:</strong> ${nome}<br>
        <strong>Celular:</strong> ${celular}<br>
        <strong>Unidade:</strong> ${unidadeSelecionada.nome}<br>
        <strong>Senha:</strong> ${senha}<br>
        <strong>Posição:</strong> ${posicao}º na fila<br>
        <strong>Tempo estimado:</strong> ~${unidadeSelecionada.tempoEspera} min
    `;

    abrirModal('modal-sucesso');
}
