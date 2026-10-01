let alunos = [];
let idEditando = null;
let proximoId = 1;
const CHAVE = "alunos";

function carregar() {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) {
        alunos = JSON.parse(salvo);
        proximoId = alunos.length ? Math.max(...alunos.map(a => a.id)) + 1 : 1;
    }
    listar();
}

function persistir() {
    localStorage.setItem(CHAVE, JSON.stringify(alunos));
}

function escapar(txt) {
    return String(txt ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function listar() {
    const tbody = document.getElementById("lista");
    tbody.innerHTML = "";
    document.getElementById("vazio").hidden = alunos.length > 0;
    alunos.forEach(a => {
        tbody.innerHTML += `<tr>
            <td>${a.id}</td><td>${escapar(a.nome)}</td><td>${escapar(a.email)}</td><td>${escapar(a.idade)}</td>
            <td>
                <button class="btn btn-pequeno btn-amarelo" onclick="editar(${a.id})">Editar</button>
                <button class="btn btn-pequeno btn-vermelho" onclick="excluir(${a.id})">Excluir</button>
            </td>
        </tr>`;
    });
}

function salvar() {
    const n = document.getElementById("nome");
    const e = document.getElementById("email");
    const i = document.getElementById("idade");
    if (!n.value) return alert("Preencha o nome!");
    if (i.value === "" || Number(i.value) < 0) return alert("Preencha uma idade válida!");

    if (idEditando) {
        const a = alunos.find(x => x.id === idEditando);
        a.nome = n.value;
        a.email = e.value;
        a.idade = Number(i.value);
        idEditando = null;
        document.getElementById("btnSalvar").innerText = "Salvar";
        document.getElementById("btnCancelar").hidden = true;
    } else {
        alunos.push({ id: proximoId++, nome: n.value, email: e.value, idade: Number(i.value) });
    }

    n.value = e.value = i.value = "";
    persistir();
    listar();
}

function editar(id) {
    const a = alunos.find(x => x.id === id);
    document.getElementById("nome").value = a.nome;
    document.getElementById("email").value = a.email;
    document.getElementById("idade").value = a.idade ?? "";
    idEditando = id;
    document.getElementById("btnSalvar").innerText = "Atualizar #" + id;
    document.getElementById("btnCancelar").hidden = false;
}

function cancelar() {
    idEditando = null;
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("idade").value = "";
    document.getElementById("btnSalvar").innerText = "Salvar";
    document.getElementById("btnCancelar").hidden = true;
}

function excluir(id) {
    if (confirm("Excluir este aluno?")) {
        alunos = alunos.filter(a => a.id !== id);
        persistir();
        listar();
    }
}

function exportar() {
    const texto = JSON.stringify(alunos, null, 2);
    const blob = new Blob([texto], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "alunos.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
}

function importar(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
        try {
            const dados = JSON.parse(leitor.result);
            if (!Array.isArray(dados)) throw new Error("O JSON precisa conter uma lista []");

            alunos = dados;
            proximoId = alunos.length ? Math.max(...alunos.map(a => a.id)) + 1 : 1;

            persistir();
            listar();
            alert("Sucesso! " + alunos.length + " alunos importados.");
        } catch (e) {
            alert("Falha ao importar: " + e.message);
        }
    };
    leitor.readAsText(arquivo);
}

function resetar() {
    if (!confirm("Tem certeza que deseja apagar todo o banco de dados local?")) return;
    localStorage.removeItem(CHAVE);
    alunos = [];
    proximoId = 1;
    listar();
}

carregar();