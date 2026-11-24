// CAMADA DE REPOSITORY
// Responsabilidade: ÚNICO lugar que conhece SQL. Se um dia o banco mudar,
// só este arquivo precisa ser reescrito; service e controller continuam iguais.
const pool = require('../database/connection');

// Colunas devolvidas pelas consultas. O banco usa snake_case (nivel_risco, criado_em),
// mas a API usa camelCase (nivelRisco, criadoEm), padrão do JavaScript/JSON.
// O "AS" faz essa conversão aqui, para o restante do código não precisar se preocupar.
const COLUNAS = `id, titulo, descricao, local, responsavel,
  nivel_risco AS "nivelRisco", status, criado_em AS "criadoEm"`;

async function inserir({ titulo, descricao, local, responsavel, nivelRisco, status }) {
  // Consulta PARAMETRIZADA ($1, $2...): os valores nunca são concatenados no texto SQL.
  // Isso protege contra SQL Injection.
  // RETURNING devolve o registro já com id e data geradas pelo banco,
  // sem precisar de um SELECT extra.
  const resultado = await pool.query(
    `INSERT INTO ocorrencias (titulo, descricao, local, responsavel, nivel_risco, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUNAS}`,
    [titulo, descricao, local, responsavel, nivelRisco, status]
  );
  return resultado.rows[0];
}

async function listarTodas() {
  // Mais recentes primeiro: quem consulta quer ver o que acabou de ser registrado.
  const resultado = await pool.query(
    `SELECT ${COLUNAS} FROM ocorrencias ORDER BY id DESC`
  );
  return resultado.rows;
}

module.exports = { inserir, listarTodas };
