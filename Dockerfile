FROM node:24-alpine AS client-build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app/client
COPY client/package.json client/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY client/ ./
RUN pnpm run build

FROM node:24-alpine AS server-build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app/server
COPY server/package.json server/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY server/ ./
RUN pnpm run build

FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache openssl
WORKDIR /app/server

COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/package.json ./
COPY --from=client-build /app/client/dist ./public

RUN pnpm install --prod

# Generate self-signed certificate
RUN mkdir -p /app/certs && \
    openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /app/certs/key.pem \
    -out /app/certs/cert.pem \
    -days 365 \
    -subj "/CN=localhost"

EXPOSE 3001
CMD ["node", "dist/index.js"]
