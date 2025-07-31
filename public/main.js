const API_URL = 'http://localhost:3000/produtos';
const lista = document.getElementById('lista-produtos');
const form = document.getElementById('produto-form');

function carregarProdutos() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      lista.innerHTML = '';
      data.forEach(produto => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${produto.nome} - R$ ${produto.preco} (${produto.quantidade} un)</span>
          <button onclick="deletarProduto(${produto.id})">Excluir</button>
        `;
        lista.appendChild(li);
      });
    });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const preco = parseFloat(document.getElementById('preco').value);
  const quantidade = parseInt(document.getElementById('quantidade').value);

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, preco, quantidade })
  })
    .then(() => {
      form.reset();
      carregarProdutos();
    });
});

function deletarProduto(id) {
  fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    .then(() => carregarProdutos());
}

// Carrega ao abrir a página
carregarProdutos();
