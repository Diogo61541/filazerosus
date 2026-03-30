/* ============================================================
   app.js – Shared utilities for Fila Zero SUS
   ============================================================ */

/* ---------- CPF formatting & validation ---------- */
function formatarCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

/* ---------- Phone formatting ---------- */
function formatarCelular(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/* ---------- CEP lookup ---------- */
async function buscarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) return null;
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.erro) return null;
        return data;
    } catch {
        return null;
    }
}

/* ---------- Modal helpers ---------- */
function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

/* ---------- Step navigation ---------- */
function irParaStep(numero, prefixo) {
    prefixo = prefixo || '';
    const sufixo = prefixo ? '-' + prefixo : '';

    // Mapeamento de numero -> id do formulário
    const mapa = {
        1: 'form-dados' + (prefixo === 'particular' ? '-particular' : ''),
        2: prefixo === 'particular' ? 'form-especialidade' : 'form-sintomas',
        3: prefixo === 'particular' ? 'form-profissional' : 'form-unidades',
        4: prefixo === 'particular' ? 'form-confirmacao-particular' : 'form-confirmacao',
    };

    // Esconde todos os steps
    Object.values(mapa).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    // Mostra o step atual
    const alvo = document.getElementById(mapa[numero]);
    if (alvo) alvo.classList.add('active');

    // Atualiza stepper visual
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById('step' + i + (prefixo ? '-' + prefixo : ''));
        if (!stepEl) continue;
        stepEl.classList.remove('active', 'completed');
        if (i < numero) stepEl.classList.add('completed');
        if (i === numero) stepEl.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function voltarStep(numero, prefixo) {
    irParaStep(numero, prefixo);
}

/* ---------- Generic input masks on DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', function () {
    // CPF mask
    document.querySelectorAll('input[id*="cpf"]').forEach(function (el) {
        el.addEventListener('input', function () {
            this.value = formatarCPF(this.value);
        });
    });

    // Phone mask
    document.querySelectorAll('input[id*="celular"]').forEach(function (el) {
        el.addEventListener('input', function () {
            this.value = formatarCelular(this.value);
        });
    });

    // CEP lookup
    document.querySelectorAll('input[id*="cep"]').forEach(function (el) {
        el.addEventListener('blur', async function () {
            const dados = await buscarCEP(this.value);
            const endEl = document.getElementById('endereco');
            if (dados && endEl) {
                endEl.value = dados.logradouro + ', ' + dados.bairro + ' – ' + dados.localidade + '/' + dados.uf;
            }
        });
    });

    // Close modal on backdrop click (event delegation)
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal') && e.target.classList.contains('open')) {
            e.target.classList.remove('open');
        }
    });
});
