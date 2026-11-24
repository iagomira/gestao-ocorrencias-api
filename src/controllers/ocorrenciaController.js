// CAMADA DE CONTROLLER
// Responsabilidade: traduzir HTTP <-> aplicação. Lê a requisição, chama o service
// e escolhe o status da resposta. NÃO valida regras nem acessa o banco.
const ocorrenciaService = require('../services/ocorrenciaService');

async function listar(req, res, next) {
  try {
    const ocorrencias = await ocorrenciaService.listar();
    res.status(200).json(ocorrencias);
  } catch (erro) {
    // Repassa o erro ao middleware central do app.js.
    // O try/catch é necessário porque o Express 4 não captura erros de funções async sozinho.
    next(erro);
  }
}

async function cadastrar(req, res, next) {
  try {
    const ocorrencia = await ocorrenciaService.cadastrar(req.body);
    // 201 Created é o status correto quando um recurso novo é criado (e não 200).
    res.status(201).json(ocorrencia);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, cadastrar };
