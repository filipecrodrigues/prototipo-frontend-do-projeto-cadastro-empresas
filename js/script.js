// ================== CONFIG ==================
const API_URL = 'http://localhost:8080/api/empresas';

let empresas = [];
let editingId = null;

// ================== ELEMENTOS ==================
const modal = document.getElementById('modal');
const empresaForm = document.getElementById('empresaForm');
const cardsContainer = document.getElementById('cardsContainer');
const empresasCount = document.getElementById('empresasCount');

const btnNovaEmpresa = document.getElementById('btnNovaEmpresa');
const fabNovaEmpresa = document.getElementById('fabNovaEmpresa');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelar = document.getElementById('btnCancelar');
const searchInput = document.getElementById('searchInput');

// ================== MODAL ==================
function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

function resetForm() {
    empresaForm.reset();
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Nova Empresa';
}

// ================== API ==================
async function carregarEmpresas() {
    try {
        const response = await fetch(API_URL);
        empresas = await response.json();
        renderEmpresas(empresas);
    } catch (err) {
        console.error('Erro ao carregar empresas', err);
    }
}

async function salvarEmpresaAPI(empresa) {
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa)
    });

    if (!response.ok) {
        throw new Error('Erro ao salvar empresa');
    }
}

async function buscarEmpresaPorId(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar empresa');
    return response.json();
}

async function excluirEmpresaAPI(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Erro ao excluir empresa');
    }
}

// ================== RENDER ==================
function renderEmpresas(lista = empresas) {
    empresasCount.textContent =
        `${lista.length} empresa${lista.length !== 1 ? 's' : ''} no sistema`;

    if (lista.length === 0) {
        cardsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <h3>Nenhuma empresa cadastrada</h3>
                <p>Comece adicionando sua primeira empresa</p>
            </div>
        `;
        return;
    }

    cardsContainer.innerHTML = lista.map(emp => `
        <div class="card">
            <div class="card-header">
                <div class="card-id">#${emp.id}</div>
            </div>

            <h3 class="card-title">${emp.nomeFantasia}</h3>
            <p class="card-subtitle">${emp.razaoSocial}</p>
            <p class="card-subtitle">Atividade Econômica: ${emp.atividadeEconomica}</p>

            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">CNPJ:</span>
                    <span class="info-value">${emp.cnpj}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Endereço:</span>
                    <span class="info-value">${emp.endereco}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Telefone:</span>
                    <span class="info-value">${emp.telefone}</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn btn-success btn-icon" data-edit="${emp.id}">✏️</button>
                <button class="btn btn-danger btn-icon" data-delete="${emp.id}">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ================== CRUD ==================
async function saveEmpresa(event) {
    event.preventDefault();

    const empresa = {
        cnpj: document.getElementById('cnpj').value,
        razaoSocial: document.getElementById('razaoSocial').value,
        nomeFantasia: document.getElementById('nomeFantasia').value,
        atividadeEconomica: document.getElementById('atividadeEconomica').value,
        endereco: document.getElementById('endereco').value,
        telefone: document.getElementById('telefone').value
    };

    try {
        await salvarEmpresaAPI(empresa);
        closeModal();
        carregarEmpresas();
    } catch (err) {
        console.error(err);
        alert('Erro ao salvar empresa');
    }
}

async function editEmpresa(id) {
    try {
        const emp = await buscarEmpresaPorId(id);

        editingId = id;

        document.getElementById('cnpj').value = emp.cnpj;
        document.getElementById('razaoSocial').value = emp.razaoSocial;
        document.getElementById('nomeFantasia').value = emp.nomeFantasia;
        document.getElementById('atividadeEconomica').value = emp.atividadeEconomica;
        document.getElementById('endereco').value = emp.endereco;
        document.getElementById('telefone').value = emp.telefone;

        document.getElementById('modalTitle').textContent = 'Editar Empresa';
        openModal();
    } catch (err) {
        console.error(err);
    }
}

async function deleteEmpresa(id) {
    if (!confirm('Deseja excluir esta empresa?')) return;

    try {
        await excluirEmpresaAPI(id);
        carregarEmpresas();
    } catch (err) {
        console.error(err);
        alert('Erro ao excluir empresa');
    }
}

// ================== BUSCA ==================
function filterEmpresas() {
    const termo = searchInput.value.toLowerCase();

    const filtradas = empresas.filter(emp =>
        emp.cnpj.toLowerCase().includes(termo) ||
        emp.razaoSocial.toLowerCase().includes(termo) ||
        emp.nomeFantasia.toLowerCase().includes(termo) ||
        emp.endereco.toLowerCase().includes(termo) ||
        emp.telefone.toLowerCase().includes(termo)
    );

    renderEmpresas(filtradas);
}

// ================== FORMATAÇÕES ==================
function formatCNPJ(input) {
    let v = input.value.replace(/\D/g, '');

    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');

    input.value = v;
}

function formatTelefone(input) {
    let v = input.value.replace(/\D/g, '');

    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    v = v.length > 10
        ? v.replace(/(\d{5})(\d)/, '$1-$2')
        : v.replace(/(\d{4})(\d)/, '$1-$2');

    input.value = v;
}

// ================== EVENTOS ==================
document.addEventListener('DOMContentLoaded', carregarEmpresas);

btnNovaEmpresa?.addEventListener('click', openModal);
fabNovaEmpresa?.addEventListener('click', openModal);
btnCloseModal?.addEventListener('click', closeModal);
btnCancelar?.addEventListener('click', closeModal);

empresaForm.addEventListener('submit', saveEmpresa);
searchInput.addEventListener('input', filterEmpresas);

cardsContainer.addEventListener('click', (e) => {
    const editId = e.target.dataset.edit;
    const deleteId = e.target.dataset.delete;

    if (editId) editEmpresa(Number(editId));
    if (deleteId) deleteEmpresa(Number(deleteId));
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.getElementById('cnpj').addEventListener('input', e => formatCNPJ(e.target));
document.getElementById('telefone').addEventListener('input', e => formatTelefone(e.target));
