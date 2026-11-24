// CAMADA DE ROTAS
// Responsabilidade: dizer "qual método + caminho chama qual função do controller".
// Não tem lógica nenhuma, o que deixa fácil enxergar todos os endpoints num só lugar.
const { Router } = require('express');
const ocorrenciaController = require('../controllers/ocorrenciaController');

const router = Router();

// GET /ocorrencias -> consulta (lista as ocorrências do banco)
router.get('/', ocorrenciaController.listar);

// POST /ocorrencias -> cadastro de uma nova ocorrência (JSON no corpo)
router.post('/', ocorrenciaController.cadastrar);

module.exports = router;
