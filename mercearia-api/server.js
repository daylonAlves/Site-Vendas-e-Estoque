const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// Listar produtos
app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Criar produto
app.post('/produtos', (req, res) => {
  const { nome, preco, quantidade } = req.body;
  console.log('Recebido:', { nome, preco, quantidade }); // 👈 Adicione isso

  db.query(
    'INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)',
    [nome, preco, quantidade],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir no banco:', err); // 👈 Log de erro
        return res.status(500).json(err);
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});

// Atualizar quantidade
app.put('/produtos/:id', (req, res) => {
  const { quantidade } = req.body;
  db.query(
    'UPDATE produtos SET quantidade = ? WHERE id = ?',
    [quantidade, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.sendStatus(200);
    }
  );
});

// Deletar produto
app.delete('/produtos/:id', (req, res) => {
  db.query('DELETE FROM produtos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

// Registrar uma venda
app.post('/vendas', (req, res) => {
  const { itens, valor_total } = req.body;

  db.query('INSERT INTO vendas (valor_total) VALUES (?)', [valor_total], (err, result) => {
    if (err) return res.status(500).json(err);

    const vendaId = result.insertId;

    const valores = itens.map(item => [vendaId, item.id, item.quantidade, item.preco]);

    db.query(
      'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES ?',
      [valores],
      (err2) => {
        if (err2) return res.status(500).json(err2);
        res.status(201).json({ vendaId });
      }
    );
  });
});
