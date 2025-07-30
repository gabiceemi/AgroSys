// Protege rota
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) {
  Swal.fire({
    icon: 'warning',
    title: 'Atenção',
    text: 'Você precisa estar logado para acessar esta página.'
  });
  window.location.href = 'login.html';
}

const clienteSelect = document.getElementById('cliente_id');
const enderecoForm = document.getElementById('endereco-form');
const tabelaBody = document.querySelector('#enderecos-tabela tbody');

// Carrega clientes no select
function carregarClientes() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const clientes = alasql(
    'SELECT * FROM clientes WHERE user_id = ? ORDER BY nome',
    [currentUser.id]
  );

  clienteSelect.innerHTML = '<option value="">Selecione</option>';
  clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.nome} (${c.cpf})`;
    clienteSelect.appendChild(opt);
  });

  // se só existir um cliente, já seleciona e lista
  if (clientes.length === 1) {
    clienteSelect.value = clientes[0].id;
    listarEnderecos();
  }
}

// Ao mudar o cliente selecionado, recarrega tabela
clienteSelect.addEventListener('change', () => {
  listarEnderecos();
});

// Cadastra endereço
enderecoForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const cliente_id = parseInt(clienteSelect.value);
  const cep = document.getElementById('cep').value.trim();
  const rua = document.getElementById('rua').value.trim();
  const bairro = document.getElementById('bairro').value.trim();
  const cidade = document.getElementById('cidade').value.trim();
  const estado = document.getElementById('estado').value.trim();
  const pais = document.getElementById('pais').value.trim();
  const principal = document.getElementById('principal').checked;

  if (!cliente_id) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Você precisa selecionar um cliente para cadastrar um endereço.'
    });
    return;
  }

  // Se for principal, desmarcar os outros
  if (principal) {
    alasql('UPDATE enderecos SET principal = false WHERE cliente_id = ?', [cliente_id]);
  }

  const numero = document.getElementById('numero').value.trim();
  const complemento = document.getElementById('complemento').value.trim();

  alasql(
    'INSERT INTO enderecos (cliente_id, cep, rua, numero, complemento, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [cliente_id, cep, rua, numero, complemento, bairro, cidade, estado, pais, principal]
  );

  this.reset();
  listarEnderecos();
});

// Lista os endereços do cliente selecionado
function listarEnderecos() {
  const cliente_id = parseInt(clienteSelect.value);
  if (!cliente_id) {
    tabelaBody.innerHTML = '';
    return;
  }

  const enderecos = alasql('SELECT * FROM enderecos WHERE cliente_id = ?', [cliente_id]);
  tabelaBody.innerHTML = '';

  enderecos.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td data-label="Rua">${e.rua}, ${e.numero || ''} ${e.complemento || ''}</td>
    <td data-label="Bairro">${e.bairro}</td>
    <td data-label="Cidade">${e.cidade}</td>
    <td data-label="Estado">${e.estado}</td>
    <td data-label="País">${e.pais}</td>
    <td data-label="Principal">${e.principal ? '✔️' : ''}</td>
  `;
    tabelaBody.appendChild(tr);
  });
}

// Inicialização
carregarClientes();

document.getElementById('cep').addEventListener('blur', async function () {
  const cep = this.value.replace(/\D/g, '');

  if (cep.length !== 8) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'CEP inválido. Deve ter 8 dígitos.'
    });
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'CEP não encontrado.'
      });
      return;
    }

    // Preenche os campos
    document.getElementById('rua').value = data.logradouro || '';
    document.getElementById('bairro').value = data.bairro || '';
    document.getElementById('cidade').value = data.localidade || '';
    document.getElementById('estado').value = data.uf || '';
    document.getElementById('pais').value = 'Brasil';

    // Se não tem logradouro, libera edição do campo rua
    document.getElementById('rua').readOnly = !!data.logradouro;
  } catch (err) {
    console.error('Erro ao consultar ViaCEP:', err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível consultar o CEP. Tente novamente mais tarde.'
    });
  }
});

