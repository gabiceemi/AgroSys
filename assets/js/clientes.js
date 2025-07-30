$(document).ready(function () {
  // —————————————————————————————————————
  // 1) Protege rota e captura currentUser
  // —————————————————————————————————————
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Você precisa estar logado para acessar esta página.'
    });
    window.location.href = 'login.html';
  }

  // —————————————————————————————————————
  // 2) Máscaras
  // —————————————————————————————————————
  $('#cpf').inputmask('999.999.999-99');
  $('#telefone, #celular').inputmask('(99) 99999-9999');

  // —————————————————————————————————————
  // 3) Cadastro de cliente
  // —————————————————————————————————————
  document.getElementById('cliente-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const data_nascimento = document.getElementById('data_nascimento').value;
    const telefone = document.getElementById('telefone').value.trim();
    const celular = document.getElementById('celular').value.trim();

    // evita duplicar CPF
    if (alasql('SELECT * FROM clientes WHERE cpf = ?', [cpf]).length > 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Já existe um cliente com este CPF!' });
      return;
    }

    // insere usando o mesmo currentUser que capturamos no topo
    alasql(
      'INSERT INTO clientes (nome, cpf, data_nascimento, telefone, celular, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cpf, data_nascimento, telefone, celular, currentUser.id]
    );

    this.reset();
    listarClientes();
  });

  // —————————————————————————————————————
  // 4) Listagem de clientes
  // —————————————————————————————————————
  function listarClientes() {
    const lista = alasql(
      'SELECT * FROM clientes WHERE user_id = ? ORDER BY nome',
      [currentUser.id]
    );
    const tbody = document.querySelector('#clientes-tabela tbody');
    tbody.innerHTML = '';

    lista.forEach(cli => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td data-label="Nome">${cli.nome}</td>
      <td data-label="CPF">${cli.cpf}</td>
      <td data-label="Data Nasc.">${cli.data_nascimento}</td>
      <td data-label="Telefone">${cli.telefone}</td>
      <td data-label="Celular">${cli.celular}</td>
    `;
      tbody.appendChild(tr);
    });
  }

  // —————————————————————————————————————
  // 5) Exportar JSON (opcional)
  // —————————————————————————————————————
  document.getElementById('exportar-db').addEventListener('click', () => {
    const users = alasql('SELECT * FROM users');
    const clientes = alasql('SELECT * FROM clientes');
    const enderecos = alasql('SELECT * FROM enderecos');

    const blob = new Blob(
      [JSON.stringify({ users, clientes, enderecos }, null, 2)],
      { type: 'application/json' }
    );

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'banco_clientes.json';
    a.click();
  });

  // —————————————————————————————————————
  // 6) Inicia listagem assim que o script carrega
  // —————————————————————————————————————
  listarClientes();
});