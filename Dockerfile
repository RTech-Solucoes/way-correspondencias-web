# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN yarn install --frozen-lockfile
RUN yarn cache clean

COPY . .

RUN yarn build

# Etapa de runner
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
RUN yarn install --frozen-lockfile --production
RUN yarn cache clean

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "start"]