// ---------- HANDLERS DE LOGIN ----------
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Busca usuário na tabela
  const user = alasql(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password]
  )[0];

  if (user) {
    // Salva no localStorage e redireciona
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'clientes.html';
  } else {
    Swal.fire({ icon: 'error', title: 'Oops...', text: 'Usuário ou senha inválidos!' });
  }
});

// ---------- TOGGLE DE FORMULÁRIO DE CADASTRO ----------
document.getElementById('show-register').addEventListener('click', function (e) {
  e.preventDefault();
  const container = document.getElementById('register-container');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
});

// ---------- HANDLER DE CADASTRO DE NOVO USUÁRIO ----------
document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const newUsername = document.getElementById('new-username').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  // Verifica duplicidade
  const exists = alasql('SELECT * FROM users WHERE username = ?', [newUsername]);
  if (exists.length > 0) {
    Swal.fire({ icon: 'error', title: 'Oops...', text: 'Usuário já existe!' });
    return;
  }

  // Insere novo usuário
  alasql(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [newUsername, newPassword]
  );

  Swal.fire({
    icon: 'success',
    title: 'Sucesso!',
    text: 'Usuário cadastrado com sucesso! Faça login.'
  });
  this.reset();
  document.getElementById('register-container').style.display = 'none';
});

// ---------- CONFIGURAÇÃO: IMPORTAR BANCO (.JSON) ----------
document.getElementById('config-btn').addEventListener('click', () => {
  document.getElementById('import-db').click();
});

document.getElementById('import-db').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      restoreDatabase(data);
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Banco de dados importado com sucesso!'
      });
      // Após restaurar, recarrega a página de login para reafetar rotas
      location.reload();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível importar o banco de dados. Verifique o formato do arquivo.'
      });
    }
  };
  reader.readAsText(file);
});

// ---------- RESTAURAÇÃO DO BANCO DE DADOS ----------
function restoreDatabase(data) {
  // 1) Drop de tudo na ordem inversa às FKs
  alasql('DROP TABLE IF EXISTS enderecos');
  alasql('DROP TABLE IF EXISTS clientes');
  alasql('DROP TABLE IF EXISTS users');

  // 2) Recria o esquema (copia exatamente do seu db.js)
  alasql(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username STRING UNIQUE,
      password STRING
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      nome STRING,
      cpf STRING UNIQUE,
      data_nascimento DATE,
      telefone STRING,
      celular STRING,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS enderecos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT,
      cep STRING,
      rua STRING,
      numero STRING,
      complemento STRING,
      bairro STRING,
      cidade STRING,
      estado STRING,
      pais STRING,
      principal BOOLEAN,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
  `);

  // 3) Insere os pais primeiro
  (data.users || []).forEach(u => {
    alasql(
      'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
      [u.id, u.username, u.password]
    );
  });

  // 4) Depois os clientes (que referenciam users)
  (data.clientes || []).forEach(c => {
    alasql(
      `INSERT INTO clientes
         (id, user_id, nome, cpf, data_nascimento, telefone, celular)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.user_id, c.nome, c.cpf, c.data_nascimento, c.telefone, c.celular]
    );
  });

  // 5) Por fim os endereços (que referenciam clientes)
  (data.enderecos || []).forEach(e => {
    alasql(
      `INSERT INTO enderecos
         (id, cliente_id, cep, rua, numero, complemento, bairro, cidade, estado, pais, principal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.id,
        e.cliente_id,
        e.cep,
        e.rua,
        e.numero,
        e.complemento,
        e.bairro,
        e.cidade,
        e.estado,
        e.pais,
        e.principal
      ]
    );
  });
}
