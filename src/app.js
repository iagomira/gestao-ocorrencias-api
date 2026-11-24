// CONFIGURAÇÃO DO EXPRESS
// Aqui ficam apenas a montagem da aplicação (middlewares, rotas e tratamento de erros).
// Nenhuma regra de negócio mora neste arquivo.
const path = require('path');
const express = require('express');
const ocorrenciaRoutes = require('./routes/ocorrenciaRoutes');
const ValidationError = require('./errors/ValidationError');

const app = express();

// Middleware que lê o corpo das requisições em JSON e o coloca em req.body.
app.use(express.json());

// Serve a página de demonstração (src/public/index.html) em http://localhost:3000/.
// É só uma interface visual: ela consome a mesma API /ocorrencias, sem alterar nenhuma regra.
app.use(express.static(path.join(__dirname, 'public')));

// Todas as rotas de ocorrência ficam sob o prefixo /ocorrencias.
// Se o sistema crescer (ex.: /usuarios), basta registrar outro grupo de rotas aqui.
app.use('/ocorrencias', ocorrenciaRoutes);

// TRATAMENTO CENTRAL DE ERROS
// Controllers e services apenas lançam erros; é aqui que eles viram respostas HTTP.
// Isso evita repetir res.status(...) em todo lugar e mantém o padrão das respostas.
// O Express só reconhece um middleware de erro se ele tiver 4 parâmetros,
// por isso o "next" aparece mesmo sem ser usado.
// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
  // Erro de regra de negócio (dados inválidos): culpa de quem chamou -> 400.
  if (erro instanceof ValidationError) {
    return res.status(400).json({ erro: erro.message, detalhes: erro.detalhes });
  }
  // JSON malformado no corpo da requisição: também é erro do cliente -> 400.
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  // Qualquer outro erro é inesperado (ex.: banco caiu). Registramos no log para
  // diagnóstico, mas devolvemos uma mensagem genérica para não vazar detalhes internos.
  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
