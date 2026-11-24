# Gestão de Ocorrências

API REST para registro e consulta de ocorrências relacionadas a riscos identificados durante as atividades de uma empresa. Projeto desenvolvido para a disciplina de Sistemas de Informação — Facape — 2026.2.

## Informações do projeto

- **Nome do sistema:** Gestão de Ocorrências (MVP 6)
- **Integrantes do grupo:**
  - Nome do integrante Iago Mira
  - Nome do integrante Gabriel Silva
  - Nome do integrante Marx Maltez
  - Nome do integrante Pedro Cézar
    
- **Objetivo:** centralizar o registro das ocorrências de risco feitas pelos funcionários, para que possam ser analisadas posteriormente.

## Tecnologias utilizadas

- Node.js 22
- Express
- PostgreSQL 16
- Docker e Docker Compose
- Jest e Supertest (testes automatizados)

## Como executar

Pré-requisito: Docker com Docker Compose instalado.

```bash
docker compose up --build
```

Esse comando sobe o PostgreSQL e a API. A tabela `ocorrencias` é criada automaticamente na inicialização. A API fica disponível em `http://localhost:3000`.

Para parar e remover os containers: `docker compose down` (adicione `-v` para apagar também os dados do banco).

### Executar os testes

Os testes não precisam de banco nem de Docker (o repositório é simulado com mock):

```bash
npm install
npm test
```

## Endpoints disponíveis

### `GET /ocorrencias`

Lista as ocorrências cadastradas (da mais recente para a mais antiga).

```bash
curl http://localhost:3000/ocorrencias
```

### `POST /ocorrencias`

Cadastra uma nova ocorrência e retorna `201` com o registro criado.

```bash
curl -X POST http://localhost:3000/ocorrencias \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Risco elétrico",
    "descricao": "Fio exposto no corredor do bloco A",
    "local": "Bloco A",
    "responsavel": "Maria Silva",
    "nivelRisco": "ALTO"
  }'
```

| Campo         | Obrigatório | Descrição                                                    |
|---------------|-------------|--------------------------------------------------------------|
| `descricao`   | **Sim**     | Descrição da ocorrência                                      |
| `nivelRisco`  | **Sim**     | `BAIXO`, `MEDIO`, `ALTO` ou `CRITICO` (aceita acento/minúsculas) |
| `titulo`      | Não         | Título resumido                                              |
| `local`       | Não         | Local onde ocorreu                                           |
| `responsavel` | Não         | Responsável pela ocorrência                                  |
| `status`      | Não         | `ABERTA` (padrão), `EM_ANALISE` ou `RESOLVIDA`               |

### Regra de negócio

Toda ocorrência deve possuir uma **descrição** e uma **classificação de risco**. Caso contrário, a API retorna `400`:

```json
{
  "erro": "Dados inválidos.",
  "detalhes": [
    "O campo \"descricao\" é obrigatório.",
    "O campo \"nivelRisco\" é obrigatório."
  ]
}
```

## Verificar os dados no banco

```bash
docker compose exec db psql -U ocorrencias -d ocorrencias -c "SELECT * FROM ocorrencias;"
```

## Estrutura do projeto

```
projeto-grupo/
├── README.md
├── Dockerfile
├── docker-compose.yml
├── package.json
├── src/
│   ├── app.js                  # configuração do Express e tratamento de erros
│   ├── server.js               # inicialização (cria tabelas e sobe a API)
│   ├── routes/                 # definição das rotas
│   ├── controllers/            # recebe a requisição e devolve a resposta HTTP
│   ├── services/               # regras de negócio e validações
│   ├── repositories/           # acesso ao banco (SQL)
│   ├── models/                 # constantes do domínio (níveis de risco, status)
│   ├── errors/                 # erro de validação
│   └── database/               # conexão e criação das tabelas
└── tests/                      # testes automatizados (Jest + Supertest)
```

Fluxo de uma requisição: `route → controller → service → repository → PostgreSQL`.

## Principais decisões de projeto

- **Arquitetura em camadas** (route, controller, service, repository): cada camada tem uma única responsabilidade, o que facilita manutenção e testes.
- **Regra de negócio no service:** pode ser testada sem servidor e sem banco. Ela também é reforçada no banco (`NOT NULL`).
- **Consultas SQL parametrizadas:** evitam SQL Injection.
- **Configuração por variáveis de ambiente:** o mesmo código roda no Docker e fora dele.
- **Healthcheck no banco:** a API só inicia depois que o PostgreSQL está pronto.
- **Tratamento de erros centralizado** (`app.js`): respostas padronizadas (400 para erro do cliente, 500 para erro interno).

Cada arquivo do código-fonte possui comentários explicando sua função e o motivo das escolhas.
