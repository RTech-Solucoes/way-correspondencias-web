# Etapa de build
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro (cache de dependências)
COPY package.json ./

# Instalar dependências (sem dev cache do yarn)
RUN yarn install --frozen-lockfile
RUN yarn cache clean

# Copiar o resto do código
COPY . .

# Gerar build de produção
RUN yarn build

# Etapa de produção
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar apenas dependências de produção
COPY package.json ./
RUN yarn install --frozen-lockfile --production
RUN yarn cache clean

# Copiar build gerado e arquivos necessários
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expor porta do Next.js
EXPOSE 3000

# Variáveis de ambiente default (pode sobrescrever em runtime)
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Rodar aplicação
CMD ["yarn", "start"]