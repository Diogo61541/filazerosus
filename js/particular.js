/* ============================================================
   particular.js – Lógica da página de Atendimento Particular
   ============================================================ */

// ---------- Dados simulados de profissionais ----------
const PROFISSIONAIS = [
    {
        id: 'p1',
        nome: 'Dr. Carlos Mendes',
        especialidade: 'clinica_geral',
        crm: 'CRM/SP 123456',
        preco: 150,
        avaliacao: 4.8,
        disponivel: 'Hoje, 14h–18h',
        avatar: '👨‍⚕️',
    },
    {
        id: 'p2',
        nome: 'Dra. Ana Souza',
        especialidade: 'cardiologia',
        crm: 'CRM/SP 789012',
        preco: 250,
        avaliacao: 4.9,
        disponivel: 'Hoje, 9h–12h',
        avatar: '👩‍⚕️',
    },
    {
        id: 'p3',
        nome: 'Dr. Ricardo Lima',
        especialidade: 'pediatria',
        crm: 'CRM/SP 345678',
        preco: 180,
        avaliacao: 4.7,
        disponivel: 'Amanhã, 8h–12h',
        avatar: '👨‍⚕️',
    },
    {
        id: 'p4',
        nome: 'Dra. Fernanda Castro',
        especialidade: 'ginecologia',
        crm: 'CRM/SP 901234',
        preco: 220,
        avaliacao: 4.6,
        disponivel: 'Hoje, 16h–19h',
        avatar: '👩‍⚕️',
    },
    {
        id: 'p5',
        nome: 'Dr. Paulo Saito',
        especialidade: 'odontologia',
        crm: 'CRO/SP 111222',
        preco: 120,
        avaliacao: 4.5,
        disponivel: 'Hoje, 10h–14h',
        avatar: '🦷',
    },
    {
        id: 'p6',
        nome: 'Dra. Marcia Neves',
        especialidade: 'psicologia',
        crm: 'CRP/SP 333444',
        preco: 200,
        avaliacao: 4.9,
        disponivel: 'Amanhã, 14h–18h',
        avatar: '🧠',
    },
    {
        id: 'p7',
        nome: 'Dr. Bruno Faria',
        especialidade: 'fisioterapia',
        crm: 'CREFITO/SP 555666',
        preco: 130,
        avaliacao: 4.4,
        disponivel: 'Hoje, 8h–11h',
        avatar: '💪',
    },
    {
        id: 'p8',
        nome: 'Laboratório Saúde+',
        especialidade: 'laboratorio',
        crm: 'CRF/SP 777888',
        preco: 80,
        avaliacao: 4.6,
        disponivel: 'Aberto agora',
        avatar: '🧪',
    },
    {
        id: 'p9',
        nome: 'Dra. Juliana Torres',
        especialidade: 'clinica_geral',
        crm: 'CRM/SP 654321',
        preco: 90,
        avaliacao: 4.3,
        disponivel: 'Amanhã, 9h–12h',
        avatar: '👩‍⚕️',
    },
];

let especialidadeSelecionada = null;
let profissionalSelecionado  = null;

// ---------- Step 1: Dados Pessoais ----------
function validarDadosParticular() {
    const nome    = document.getElementById('nome-particular').value.trim();
    const cpf     = document.getElementById('cpf-particular').value.trim();
    const celular = document.getElementById('celular-particular').value.trim();

    if (nome.length < 3) {
        alert('Por favor informe seu nome completo.');
        return;
    }

    if (!validarCPF(cpf)) {
        alert('CPF inválido. Verifique e tente novamente.');
        return;
    }

    const celularNumeros = celular.replace(/\D/g, '');
    if (celularNumeros.length < 10) {
        alert('Número de celular inválido.');
        return;
    }

    irParaStep(2, 'particular');
}

// ---------- Step 2: Especialidade ----------
function selecionarEspecialidade(codigo, elemento) {
    especialidadeSelecionada = codigo;

    document.querySelectorAll('.espec-card').forEach(card => card.classList.remove('selected'));
    if (elemento) elemento.classList.add('selected');
}

function validarEspecialidade() {
    if (!especialidadeSelecionada) {
        alert('Por favor selecione uma especialidade.');
        return;
    }
    carregarProfissionais();
    irParaStep(3, 'particular');
}

// ---------- Step 3: Profissionais ----------
function carregarProfissionais() {
    const lista = especialidadeSelecionada
        ? PROFISSIONAIS.filter(p => p.especialidade === especialidadeSelecionada)
        : PROFISSIONAIS;
    renderizarProfissionais(lista);
}

function filtrarProfissionaisParticular() {
    const filtroPreco = document.getElementById('filtro-preco').value;
    const filtroAval  = document.getElementById('filtro-avaliacao').value;

    let lista = especialidadeSelecionada
        ? PROFISSIONAIS.filter(p => p.especialidade === especialidadeSelecionada)
        : [...PROFISSIONAIS];

    if (filtroPreco === 'ate_100')   lista = lista.filter(p => p.preco <= 100);
    if (filtroPreco === '100_200')   lista = lista.filter(p => p.preco > 100 && p.preco <= 200);
    if (filtroPreco === 'acima_200') lista = lista.filter(p => p.preco > 200);

    if (filtroAval === '4_5') lista = lista.filter(p => p.avaliacao >= 4.5);
    if (filtroAval === '4')   lista = lista.filter(p => p.avaliacao >= 4.0);

    renderizarProfissionais(lista);
}

function renderizarProfissionais(lista) {
    const container = document.getElementById('lista-profissionais');
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:#718096;text-align:center;padding:24px;">Nenhum profissional encontrado com os filtros selecionados.</p>';
        return;
    }

    container.innerHTML = lista.map(p => {
        const selecionado = profissionalSelecionado && profissionalSelecionado.id === p.id ? 'selected' : '';
        const estrelas = '⭐'.repeat(Math.round(p.avaliacao));

        return `
        <div class="profissional-card ${selecionado}" onclick="selecionarProfissional('${p.id}')">
            <div class="profissional-avatar">${p.avatar}</div>
            <div class="profissional-info">
                <div class="profissional-nome">${p.nome}</div>
                <div class="profissional-espec">${p.crm}</div>
                <div class="profissional-meta">
                    <span class="profissional-preco">R$ ${p.preco.toFixed(2)}</span>
                    <span class="profissional-avaliacao">${estrelas} ${p.avaliacao.toFixed(1)}</span>
                    <span class="profissional-disponivel">🕐 ${p.disponivel}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

function selecionarProfissional(id) {
    profissionalSelecionado = PROFISSIONAIS.find(p => p.id === id);
    renderizarProfissionais(
        especialidadeSelecionada
            ? PROFISSIONAIS.filter(p => p.especialidade === especialidadeSelecionada)
            : PROFISSIONAIS
    );
    gerarConfirmacaoParticular();
    irParaStep(4, 'particular');
}

// ---------- Step 4: Confirmação ----------
function gerarConfirmacaoParticular() {
    if (!profissionalSelecionado) return;

    const nome    = document.getElementById('nome-particular').value.trim();
    const celular = document.getElementById('celular-particular').value.trim();
    const sintomas = document.getElementById('sintomas-particular') ? document.getElementById('sintomas-particular').value.trim() : '';
    const protocolo = 'PART-' + Date.now().toString().slice(-6);

    const container = document.getElementById('confirmacao-particular-content');
    if (!container) return;

    container.innerHTML = `
        <div class="confirmacao-card">
            <h3>${profissionalSelecionado.avatar} ${profissionalSelecionado.nome}</h3>
            <p>${profissionalSelecionado.crm}</p>
            <p>🕐 Disponível: <strong>${profissionalSelecionado.disponivel}</strong></p>
            <p>💰 Consulta: <strong>R$ ${profissionalSelecionado.preco.toFixed(2)}</strong></p>
        </div>
        <div class="dados-confirmacao">
            <strong>Paciente:</strong> ${nome}<br>
            <strong>Celular:</strong> ${celular}<br>
            ${sintomas ? `<strong>Observações:</strong> ${sintomas}<br>` : ''}
            <strong>Protocolo:</strong> ${protocolo}
        </div>
    `;
}

function confirmarAgendamentoParticular() {
    if (!profissionalSelecionado) {
        voltarStep(3, 'particular');
        return;
    }

    const nome    = document.getElementById('nome-particular').value.trim();
    const celular = document.getElementById('celular-particular').value.trim();
    const protocolo = 'PART-' + Date.now().toString().slice(-6);

    document.getElementById('dados-confirmacao-particular').innerHTML = `
        <strong>Paciente:</strong> ${nome}<br>
        <strong>Celular:</strong> ${celular}<br>
        <strong>Profissional:</strong> ${profissionalSelecionado.nome}<br>
        <strong>Horário:</strong> ${profissionalSelecionado.disponivel}<br>
        <strong>Valor:</strong> R$ ${profissionalSelecionado.preco.toFixed(2)}<br>
        <strong>Protocolo:</strong> ${protocolo}
    `;

    abrirModal('modal-sucesso-particular');
}
