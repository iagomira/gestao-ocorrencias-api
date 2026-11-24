# Imagem base "alpine": versão enxuta do Linux, gera uma imagem pequena e rápida de baixar.
FROM node:22-alpine

WORKDIR /app

# Copiamos primeiro só o package*.json e instalamos as dependências.
# Assim o Docker reaproveita essa camada em cache e só reinstala dependências
# quando elas mudam, e não a cada alteração no código (build bem mais rápido).
COPY package*.json ./
# "npm ci" instala exatamente as versões do package-lock.json (build reproduzível);
# "--omit=dev" deixa de fora Jest e Supertest, que não são necessários em produção.
RUN npm ci --omit=dev

# O código só é copiado depois das dependências (veja o motivo acima).
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

# Segurança: roda como usuário "node" (sem privilégios de root) dentro do container.
USER node

CMD ["node", "src/server.js"]
