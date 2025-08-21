FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
RUN yarn install

# Copiar código fonte e fazer build
COPY . .
RUN yarn build

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start"]