// CAMADA DE SERVICE
// Responsabilidade: REGRAS DE NEGÓCIO. É aqui que mora a regra do MVP:
// "toda ocorrência deve possuir uma descrição e uma classificação de risco".
// Fica separada do controller (HTTP) e do repository (SQL) para que a regra
// possa ser testada sozinha, sem servidor e sem banco.
const ocorrenciaRepository = require('../repositories/ocorrenciaRepository');
const ValidationError = require('../errors/ValidationError');
const { NIVEIS_RISCO, STATUS_VALIDOS, STATUS_PADRAO } = require('../models/ocorrencia');

// Considera vazio: ausente, nulo ou string vazia.
function estaVazio(valor) {
  return valor === undefined || valor === null || valor === '';
}

// Padroniza valores de lista fixa antes de comparar:
// "Médio", "medio" e "MÉDIO" viram "MEDIO"; "em análise" vira "EM_ANALISE".
// Decisão: ser tolerante com o que o usuário digita, mas gravar sempre no mesmo formato.
function normalizarEnum(valor) {
  return String(valor)
    .trim()
    .normalize('NFD')                  // separa letra e acento (é -> e + ´)
    .replace(/[\u0300-\u036f]/g, '')   // remove os acentos
    .replace(/\s+/g, '_')              // espaços viram underline
    .toUpperCase();
}

// Campo de texto OBRIGATÓRIO: precisa ser string e não pode ser só espaços.
// Os erros são acumulados (e não lançados na hora) para reportar todos de uma vez.
function lerTextoObrigatorio(valor, campo, erros) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    erros.push(`O campo "${campo}" é obrigatório.`);
    return null;
  }
  return valor.trim();
}

// Campo de texto OPCIONAL: se não vier, grava null; se vier, precisa ser texto.
// Rejeitamos tipos errados (ex.: número no lugar do título) em vez de converter
// silenciosamente, para não gravar dado estranho no banco.
function lerTextoOpcional(valor, campo, erros) {
  if (estaVazio(valor)) return null;
  if (typeof valor !== 'string') {
    erros.push(`O campo "${campo}" deve ser um texto.`);
    return null;
  }
  return valor.trim();
}

// Campo de lista fixa (nível de risco, status): normaliza e confere se é permitido.
function lerEnum(valor, valoresValidos, campo, erros) {
  const normalizado = normalizarEnum(valor);
  if (!valoresValidos.includes(normalizado)) {
    erros.push(`O campo "${campo}" deve ser um dos valores: ${valoresValidos.join(', ')}.`);
    return null;
  }
  return normalizado;
}

// Valida os dados recebidos e devolve um objeto "limpo", pronto para gravar.
// Também é aqui que se aplica a REGRA DE NEGÓCIO do MVP.
function validarOcorrencia(dados) {
  const erros = [];

  // Regra de negócio, parte 1: descrição obrigatória.
  const descricao = lerTextoObrigatorio(dados.descricao, 'descricao', erros);

  // Regra de negócio, parte 2: classificação de risco obrigatória e válida.
  let nivelRisco = null;
  if (estaVazio(dados.nivelRisco)) {
    erros.push('O campo "nivelRisco" é obrigatório.');
  } else {
    nivelRisco = lerEnum(dados.nivelRisco, NIVEIS_RISCO, 'nivelRisco', erros);
  }

  // Status é opcional: se não for informado, a ocorrência nasce como ABERTA.
  const status = estaVazio(dados.status)
    ? STATUS_PADRAO
    : lerEnum(dados.status, STATUS_VALIDOS, 'status', erros);

  // Montamos o objeto campo a campo (em vez de repassar req.body inteiro) para
  // ignorar campos desconhecidos e impedir que o cliente envie dados indevidos.
  const ocorrencia = {
    titulo: lerTextoOpcional(dados.titulo, 'titulo', erros),
    descricao,
    local: lerTextoOpcional(dados.local, 'local', erros),
    responsavel: lerTextoOpcional(dados.responsavel, 'responsavel', erros),
    nivelRisco,
    status,
  };

  // Só lança o erro depois de checar tudo, juntando todas as falhas.
  if (erros.length > 0) {
    throw new ValidationError(erros);
  }
  return ocorrencia;
}

async function cadastrar(dados) {
  // "dados || {}" evita quebrar caso o corpo da requisição venha vazio.
  const ocorrencia = validarOcorrencia(dados || {});
  // Só chega ao banco quem passou pela validação.
  return ocorrenciaRepository.inserir(ocorrencia);
}

async function listar() {
  return ocorrenciaRepository.listarTodas();
}

module.exports = { cadastrar, listar };
