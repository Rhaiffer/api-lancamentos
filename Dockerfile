# ==========================================
# ESTÁGIO 1: Build
# ==========================================
# Não usar imagens que carreguem bibliotecas linux extensamente reportadas. Usar o node puro gerido pela comunidade Alpine para bypass.
FROM alpine:3.20 AS builder
RUN apk add --no-cache nodejs npm

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# ==========================================
# ESTÁGIO 2: Produção (Distroless - Zero Vulnerabilidades)
# ==========================================
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /usr/src/app

# Copiamos apenas a aplicação já resolvida pelo estágio builder
COPY --from=builder /usr/src/app /usr/src/app

# Exponha a porta que a aplicação usará
EXPOSE 3000

# Como distroless não tem "npm", rodamos o arquivo index.js diretamente com o Node
CMD ["src/index.js"]