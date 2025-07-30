; (function () {
  // 1) Cria as tabelas
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

  // 2) Carrega do localStorage, se existir
  function loadFromStorage() {
    const raw = localStorage.getItem('mydb');
    if (!raw) return;

    const { users = [], clientes = [], enderecos = [] } = JSON.parse(raw);

    users.forEach(u => {
      alasql(
        'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
        [u.id, u.username, u.password]
      );
    });

    clientes.forEach(c => {
      alasql(
        `INSERT INTO clientes 
       (id, user_id, nome, cpf, data_nascimento, telefone, celular) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.user_id,
          c.nome,
          c.cpf,
          c.data_nascimento,
          c.telefone,
          c.celular
        ]
      );
    });

    enderecos.forEach(e => {
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

  // 3) Salva no localStorage
  function saveToStorage() {
    const users = alasql('SELECT * FROM users');
    const clientes = alasql('SELECT * FROM clientes');
    const enderecos = alasql('SELECT * FROM enderecos');
    localStorage.setItem('mydb', JSON.stringify({ users, clientes, enderecos }));
  }

  // 4) Dispara carga inicial
  loadFromStorage();

  // 5) Monkey-patch para persistir após cada comando mutador
  const origExec = alasql.exec;
  alasql.exec = function (sql, params) {
    const res = origExec.apply(this, arguments);
    const cmd = (sql + '').trim().toUpperCase();
    if (cmd.startsWith('INSERT') || cmd.startsWith('UPDATE') || cmd.startsWith('DELETE')) {
      saveToStorage();
    }
    return res;
  };

  // 6) Se quiser criar um admin automático na primeira vez
  const existing = alasql('SELECT * FROM users');
  if (existing.length === 0) {
    alasql('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', '1234']);
    // saveToStorage() já é chamado pelo patch acima
  }
})();
