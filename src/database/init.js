// CRIAÇÃO DAS TABELAS
// O trabalho exige demonstrar conexão e criação de tabelas. Isso roda toda vez que a
// API inicia. "IF NOT EXISTS" torna o processo seguro de repetir: cria a tabela
// na primeira vez e não faz nada nas seguintes (não apaga dados).
const pool = require('./connection');

// Decisões sobre as colunas:
// - descricao e nivel_risco são NOT NULL: a regra de negócio também fica garantida no
//   banco, mesmo que alguém grave direto nele sem passar pela API.
// - titulo, local e responsavel são opcionais, pois o MVP só obriga descrição e risco.
// - status tem DEFAULT 'ABERTA' e criado_em tem DEFAULT NOW(): o banco preenche sozinho.
// - descricao é TEXT (tamanho livre); os demais são VARCHAR com limite.
const CRIAR_TABELA_OCORRENCIAS = `
  CREATE TABLE IF NOT EXISTS ocorrencias (
    id          SERIAL PRIMARY KEY,
    titulo      VARCHAR(150),
    descricao   TEXT         NOT NULL,
    local       VARCHAR(150),
    responsavel VARCHAR(150),
    nivel_risco VARCHAR(10)  NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ABERTA',
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
  )
`;

async function criarTabelas() {
  // Esta é a primeira consulta da aplicação, então também serve de
  // teste de conexão: se o banco estiver inacessível, o erro aparece aqui.
  await pool.query(CRIAR_TABELA_OCORRENCIAS);
  console.log('Banco de dados conectado e tabelas verificadas.');
}

module.exports = { criarTabelas };
