// ERRO PERSONALIZADO PARA DADOS INVÁLIDOS
// Existe para o app.js distinguir "o cliente mandou dado errado" (400) de
// "o servidor quebrou" (500). O campo "detalhes" guarda TODAS as falhas de uma vez,
// para o usuário corrigir tudo numa única tentativa em vez de descobrir um erro por vez.
class ValidationError extends Error {
  constructor(detalhes) {
    super('Dados inválidos.');
    this.name = 'ValidationError';
    this.detalhes = detalhes;
  }
}

module.exports = ValidationError;
