// CONEXÃO COM O BANCO DE DADOS
// Usamos um Pool (conjunto de conexões reutilizáveis) em vez de abrir uma conexão
// nova a cada requisição, o que é bem mais eficiente. O Pool só conecta de fato
// quando a primeira consulta é feita.
// Cada configuração vem de variável de ambiente, para o mesmo código funcionar
// no Docker (DB_HOST=db, definido no docker-compose.yml) e na máquina local.
// Os valores padrão são só uma conveniência de desenvolvimento.
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'ocorrencias',
  password: process.env.DB_PASSWORD || 'ocorrencias',
  database: process.env.DB_NAME || 'ocorrencias',
});

module.exports = pool;
