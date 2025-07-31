const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'TCC2024K',
  database: 'loja'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao MySQL');
});

module.exports = db;
