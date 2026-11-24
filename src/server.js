// PONTO DE ENTRADA DA APLICAÇÃO
// Este arquivo só "liga" a aplicação. O app.js (configuração do Express) fica separado
// para que os testes possam importar o app sem subir um servidor de verdade nem
// depender do banco de dados.
const app = require('./app');
const { criarTabelas } = require('./database/init');

// A porta vem de variável de ambiente para poder mudar sem alterar o código
// (boa prática em containers); 3000 é o valor padrão.
const PORTA = process.env.PORT || 3000;

async function iniciar() {
  // Primeiro garantimos que o banco está acessível e que a tabela existe.
  // Só depois a API começa a receber requisições, evitando erros em chamadas
  // feitas antes de o banco estar pronto.
  await criarTabelas();
  app.listen(PORTA, () => console.log(`API de ocorrências rodando na porta ${PORTA}`));
}

// Se o banco estiver fora do ar, encerramos com código 1. Assim o Docker
// (restart: on-failure) tenta subir de novo, em vez de deixar uma API "meio viva".
iniciar().catch((erro) => {
  console.error('Falha ao iniciar a aplicação:', erro.message);
  process.exit(1);
});
