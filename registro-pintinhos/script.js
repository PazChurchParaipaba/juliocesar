document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');
    const tbody = document.getElementById('registrosBody');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnCancel = document.getElementById('btnCancel');
    
    // Global state
    let registros = JSON.parse(localStorage.getItem('registrosPintinhos')) || [];
    let editId = null;

    // Initialize table
    renderTable();

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            nomeGalo: document.getElementById('nomeGalo').value,
            anilhaGalo: document.getElementById('anilhaGalo').value,
            nomeGalinha: document.getElementById('nomeGalinha').value,
            anilhaGalinha: document.getElementById('anilhaGalinha').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            anilhaPintinho: document.getElementById('anilhaPintinho').value,
            vacinas: document.getElementById('vacinas').value || 'Nenhuma'
        };

        if (editId) {
            // Update existing record
            const index = registros.findIndex(r => r.id === editId);
            if (index !== -1) {
                registros[index] = { ...registros[index], ...formData };
            }
            resetForm();
        } else {
            // Create new record
            const novoRegistro = {
                id: Date.now().toString(),
                ...formData
            };
            registros.push(novoRegistro);
            form.reset();
            document.getElementById('nomeGalo').focus();
        }

        salvarRegistros();
        renderTable();
    });

    // Handle Cancel Edit
    if (btnCancel) {
        btnCancel.addEventListener('click', resetForm);
    }

    function resetForm() {
        form.reset();
        editId = null;
        if (btnSubmit) btnSubmit.textContent = 'Salvar Registro';
        if (btnCancel) btnCancel.style.display = 'none';
        document.getElementById('formTitle').textContent = 'Novo Registro';
    }

    // Handle Deletion
    window.excluirRegistro = (id) => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            registros = registros.filter(r => r.id !== id);
            if (editId === id) {
                resetForm();
            }
            salvarRegistros();
            renderTable();
        }
    };

    // Handle Editing
    window.editarRegistro = (id) => {
        const registro = registros.find(r => r.id === id);
        if (!registro) return;

        editId = id;
        
        // Populate form
        document.getElementById('nomeGalo').value = registro.nomeGalo;
        document.getElementById('anilhaGalo').value = registro.anilhaGalo;
        document.getElementById('nomeGalinha').value = registro.nomeGalinha;
        document.getElementById('anilhaGalinha').value = registro.anilhaGalinha;
        document.getElementById('dataNascimento').value = registro.dataNascimento;
        document.getElementById('anilhaPintinho').value = registro.anilhaPintinho;
        document.getElementById('vacinas').value = registro.vacinas !== 'Nenhuma' ? registro.vacinas : '';

        // Update UI
        if (btnSubmit) btnSubmit.textContent = 'Atualizar Registro';
        if (btnCancel) btnCancel.style.display = 'inline-block';
        document.getElementById('formTitle').textContent = 'Editar Registro';

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function salvarRegistros() {
        localStorage.setItem('registrosPintinhos', JSON.stringify(registros));
    }

    function formatarData(dataISO) {
        if (!dataISO) return '';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function renderTable() {
        tbody.innerHTML = '';
        
        if (registros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem; display: block; width: 100%;">
                        Nenhum registro encontrado. Comece adicionando um novo pintinho acima!
                    </td>
                </tr>
            `;
            return;
        }

        // Render from newest to oldest
        const registrosInvertidos = [...registros].reverse();

        registrosInvertidos.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Data Nasc.">${formatarData(r.dataNascimento)}</td>
                <td data-label="Anilha Pintinho"><strong>${r.anilhaPintinho}</strong></td>
                <td data-label="Galo (Anilha)">${r.nomeGalo} <span style="color: var(--text-muted)">(${r.anilhaGalo})</span></td>
                <td data-label="Galinha (Anilha)">${r.nomeGalinha} <span style="color: var(--text-muted)">(${r.anilhaGalinha})</span></td>
                <td data-label="Vacinas">${r.vacinas}</td>
                <td data-label="Ações">
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editarRegistro('${r.id}')">Editar</button>
                        <button class="btn-delete" onclick="excluirRegistro('${r.id}')">Excluir</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
});
