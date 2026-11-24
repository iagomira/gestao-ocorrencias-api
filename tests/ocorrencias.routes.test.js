// TESTES DAS ROTAS (camadas route + controller + service, via HTTP simulado)
// O Supertest chama o app Express diretamente, sem abrir porta de rede.
// Só o repository (acesso ao banco) é simulado, então o restante do fluxo roda de verdade.
jest.mock('../src/repositories/ocorrenciaRepository', () => ({
  inserir: jest.fn(async (ocorrencia) => ({ id: 1, criadoEm: '2026-01-01T00:00:00.000Z', ...ocorrencia })),
  listarTodas: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const ocorrenciaRepository = require('../src/repositories/ocorrenciaRepository');

// Consulta: a rota deve responder 200 com os dados vindos do repository.
describe('GET /ocorrencias', () => {
  test('retorna 200 e a lista de ocorrências cadastradas', async () => {
    ocorrenciaRepository.listarTodas.mockResolvedValue([
      { id: 1, descricao: 'Fio exposto', nivelRisco: 'ALTO', status: 'ABERTA' },
    ]);

    const resposta = await request(app).get('/ocorrencias');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].descricao).toBe('Fio exposto');
  });
});

// Cadastro: sucesso (201), regra de negócio violada (400) e JSON quebrado (400).
describe('POST /ocorrencias', () => {
  test('retorna 201 e a ocorrência criada', async () => {
    const resposta = await request(app).post('/ocorrencias').send({
      titulo: 'Risco elétrico',
      descricao: 'Fio exposto no corredor',
      local: 'Bloco A',
      responsavel: 'Maria',
      nivelRisco: 'ALTO',
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ id: 1, nivelRisco: 'ALTO', status: 'ABERTA' });
  });

  // Garante que a regra do MVP chega até a resposta HTTP, listando os dois erros.
  test('retorna 400 quando falta descrição e classificação de risco', async () => {
    const resposta = await request(app).post('/ocorrencias').send({ titulo: 'Sem dados' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes).toHaveLength(2);
  });

  // O corpo é enviado como texto inválido de propósito; deve virar 400 e não 500.
  test('retorna 400 para JSON malformado', async () => {
    const resposta = await request(app)
      .post('/ocorrencias')
      .set('Content-Type', 'application/json')
      .send('{ invalido');

    expect(resposta.status).toBe(400);
  });
});
