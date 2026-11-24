// MODELO / CONSTANTES DO DOMÍNIO
// Centraliza os valores permitidos em um único lugar. Se a empresa quiser
// um novo nível de risco ou status, só este arquivo precisa mudar.
// Foram usados valores sem acento e em maiúsculas para facilitar comparações e
// evitar variações como "Médio", "medio" e "MÉDIO" no banco.
const NIVEIS_RISCO = ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'];
const STATUS_VALIDOS = ['ABERTA', 'EM_ANALISE', 'RESOLVIDA'];

// Toda ocorrência nova começa "ABERTA": ainda não foi analisada.
const STATUS_PADRAO = 'ABERTA';

module.exports = { NIVEIS_RISCO, STATUS_VALIDOS, STATUS_PADRAO };
