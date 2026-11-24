// TESTES DA REGRA DE NEGÓCIO (camada de service)
// O repository é substituído por um mock (versão falsa): assim o teste verifica só a
// regra, é rápido e não precisa de banco de dados nem de Docker.
// O mock devolve o objeto recebido com um id, simulando um INSERT bem-sucedido.
jest.mock('../src/repositories/ocorrenciaRepository', () => ({
  inserir: jest.fn(async (ocorrencia) => ({ id: 1, ...ocorrencia })),
  listarTodas: jest.fn(async () => []),
}));

const ocorrenciaRepository = require('../src/repositories/ocorrenciaRepository');
const ocorrenciaService = require('../src/services/ocorrenciaService');
const ValidationError = require('../src/errors/ValidationError');

describe('ocorrenciaService.cadastrar - regra de negócio', () => {
  // Zera o histórico de chamadas entre os testes, para um não interferir no outro.
  beforeEach(() => jest.clearAllMocks());

  // Regra do MVP: descrição é obrigatória. Também conferimos que NADA foi enviado ao banco.
  test('rejeita ocorrência sem descrição', async () => {
    await expect(ocorrenciaService.cadastrar({ nivelRisco: 'ALTO' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(ocorrenciaRepository.inserir).not.toHaveBeenCalled();
  });

  // Só espaços não contam como descrição.
  test('rejeita ocorrência com descrição em branco', async () => {
    await expect(ocorrenciaService.cadastrar({ descricao: '   ', nivelRisco: 'ALTO' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  // Regra do MVP: classificação de risco é obrigatória.
  test('rejeita ocorrência sem classificação de risco', async () => {
    await expect(ocorrenciaService.cadastrar({ descricao: 'Fio exposto' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(ocorrenciaRepository.inserir).not.toHaveBeenCalled();
  });

  // A classificação precisa ser um dos níveis permitidos (BAIXO, MEDIO, ALTO, CRITICO).
  test('rejeita nível de risco inexistente', async () => {
    await expect(ocorrenciaService.cadastrar({ descricao: 'Fio exposto', nivelRisco: 'ENORME' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  // Caminho feliz: dados válidos são aceitos, normalizados ("alto" -> "ALTO") e o status padrão é aplicado.
  test('cadastra com descrição e risco, usando status ABERTA por padrão', async () => {
    const resultado = await ocorrenciaService.cadastrar({
      descricao: 'Fio exposto no corredor',
      nivelRisco: 'alto',
    });

    expect(ocorrenciaRepository.inserir).toHaveBeenCalledTimes(1);
    expect(resultado).toMatchObject({ descricao: 'Fio exposto no corredor', nivelRisco: 'ALTO', status: 'ABERTA' });
  });

  // Tolerância na entrada: o acento não impede o cadastro, e o valor é gravado padronizado.
  test('aceita nível de risco com acento e maiúsculas', async () => {
    const resultado = await ocorrenciaService.cadastrar({ descricao: 'Piso molhado', nivelRisco: 'Médio' });
    expect(resultado.nivelRisco).toBe('MEDIO');
  });
});
