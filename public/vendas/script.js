let produtos = [];
let produtoSelecionado = null;
let carrinho = [];

// Carrega os produtos da API
fetch('http://localhost:3000/produtos')
  .then(res => res.json())
  .then(data => {
    produtos = data;
    console.log('Produtos carregados:', produtos);
  });

// Busca produto por nome ou ID
document.getElementById('busca').addEventListener('input', function () {
  const termo = this.value.trim().toLowerCase();

  if (!termo) {
    produtoSelecionado = null;
    document.getElementById('resultadoBusca').textContent = '';
    return;
  }

  const resultado = produtos.find(p =>
    p.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) ||
    String(p.id) === termo
  );

  if (resultado) {
    produtoSelecionado = resultado;

    const preco = Number(resultado.preco);
    const texto = isNaN(preco)
      ? `Selecionado: ${resultado.nome} (Estoque: ${resultado.quantidade})`
      : `Selecionado: ${resultado.nome} (Estoque: ${resultado.quantidade}, R$ ${preco.toFixed(2)})`;

    document.getElementById('resultadoBusca').textContent = texto;
  } else {
    produtoSelecionado = null;
    document.getElementById('resultadoBusca').textContent = 'Produto não encontrado.';
  }
});

// Adiciona ao carrinho
function adicionarAoCarrinho() {
  if (!produtoSelecionado) {
    alert("Selecione um produto válido.");
    return;
  }

  const qtd = parseInt(document.getElementById('quantidade').value);
  if (isNaN(qtd) || qtd <= 0) {
    alert("Digite uma quantidade válida.");
    return;
  }

  if (qtd > produtoSelecionado.quantidade) {
    alert("Quantidade insuficiente em estoque.");
    return;
  }

  carrinho.push({
  id: produtoSelecionado.id,
  nome: produtoSelecionado.nome,
  preco: Number(produtoSelecionado.preco), 
  quantidade: qtd
});


  renderizarCarrinho();
  document.getElementById('quantidade').value = '';
  document.getElementById('busca').value = '';
  document.getElementById('resultadoBusca').textContent = '';
  produtoSelecionado = null;
}

// Renderiza carrinho
function renderizarCarrinho() {
  const ul = document.getElementById('carrinho');
  ul.innerHTML = '';
  let total = 0;

  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nome} - ${item.quantidade} x R$ ${item.preco.toFixed(2)} = R$ ${(item.quantidade * item.preco).toFixed(2)}`;
    ul.appendChild(li);
    total += item.quantidade * item.preco;
  });

  document.getElementById('valorTotal').textContent = `Valor total: R$ ${total.toFixed(2)}`;
}

// Finaliza a venda
function realizarVenda() {
  if (carrinho.length === 0) {
    document.getElementById('mensagem').textContent = 'Carrinho vazio.';
    return;
  }

  let erros = [];

  carrinho.forEach(item => {
    const produto = produtos.find(p => p.id === item.id);
    const novaQtd = produto.quantidade - item.quantidade;

    fetch(`http://localhost:3000/produtos/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: novaQtd })
    })
      .then(res => {
        if (!res.ok) erros.push(item.nome);
      });
  });

  setTimeout(() => {
    if (erros.length === 0) {
      document.getElementById('mensagem').textContent = 'Venda realizada com sucesso!';
      carrinho = [];
      renderizarCarrinho();
    } else {
      document.getElementById('mensagem').textContent = `Erro ao registrar venda para: ${erros.join(', ')}`;
    }
  }, 1000);
}

fetch('http://localhost:3000/vendas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itens: carrinho,
    valor_total: carrinho.reduce((acc, item) => acc + item.quantidade * item.preco, 0)
  })
})
.then(res => res.json())
.then(data => {
  console.log('Venda registrada com ID:', data.vendaId);
});
