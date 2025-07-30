# AgroSys  
> Mini aplicação web para cadastro de clientes e endereços em JavaScript

👨‍💻 Desenvolvedor: Gabriel Cordova Medeiros
📧 Contato: gabiceemi@gmail.com

📦 COMO RODAR O PROJETO

1. Clone ou baixe o repositório.
2. Abra o arquivo `login.html` em qualquer navegador moderno (recomendo Google Chrome).
3. Cadastre um novo usuário e faça login para acessar as demais telas.

📁 ESTRUTURA DO PROJETO

- `login.html`: Tela inicial com login, cadastro de usuários e importação de banco de dados.
- `clientes.html`: Tela para cadastrar e listar clientes com CPF único.
- `enderecos.html`: Tela para cadastrar endereços vinculados a clientes.
- `assets/css/style.css`: Estilo base responsivo para todas as telas.
- `assets/js/alasql.min.js`: Plugin que simula banco de dados SQL em memória, direto no navegador.
- `assets/js/db.js`: Criação e estruturação das tabelas (users, clientes, enderecos).
- `assets/js/auth.js`: Lógica de login, cadastro e importação de banco.
- `assets/js/clientes.js`: Cadastro e listagem de clientes, exportação de banco.
- `assets/js/enderecos.js`: Cadastro e listagem de endereços, com validação de endereço principal.
- `assets/`: (opcional) pasta para ícones, imagens etc.

🧠 FUNCIONALIDADES

✔ Cadastro e login de usuários com validação de duplicidade.
✔ Importação de banco de dados `.json` via botão de configurações (ícone ⚙️ na tela de login).
✔ Cadastro de clientes com os campos obrigatórios:
   - Nome completo
   - CPF (único)
   - Data de nascimento
   - Telefone
   - Celular
✔ Cadastro de endereços com os campos:
   - Cliente relacionado (seleção obrigatória)
   - CEP, Rua, Bairro, Cidade, Estado, País
   - Marcação de endereço principal (máximo 1 por cliente)
✔ Exportação do banco de dados completo no formato JSON clicando em **📤 Exportar banco** na tela de clientes.
✔ Mobile Friendly: interface adaptada para dispositivos móveis.

📁 EXEMPLO DE EXPORTAÇÃO (JSON)

O banco exportado terá a seguinte estrutura:

```json
{
  "users": [...],
  "clientes": [...],
  "enderecos": [...]
}
````

📄 LICENÇA

Este projeto é open-source e distribuído sob a licença MIT.

💬 CONTATO

Desenvolvido por Gabriel Cordova Medeiros  
📧 gabiceemi@gmail.com
