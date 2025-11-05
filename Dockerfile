# syntax = docker/dockerfile:1.2

FROM oven/bun:latest as base

ENV NODE_ENV="production"

RUN apt-get update \
    && apt-get install -y curl unzip bash ca-certificates 
    

ENV PATH="/root/.bun/bin:$PATH"

FROM base as codegen
WORKDIR /usr/src/app

# Copy source code
COPY packages ./packages
COPY server ./server
COPY turbo.json ./turbo.json
COPY bun.lock ./bun.lock
COPY package.json ./package.json

# Run turbo prune for docker build
RUN bun install turbo --global && \
    bun x turbo prune @motus/server --docker

FROM base as builder
WORKDIR /usr/src/app
COPY --from=codegen /usr/src/app/out/json .
RUN --mount=type=cache,target=/root/.bun/cache\
    bun install --frozen-lockfine

COPY --from=codegen /usr/src/app/out/full . 

FROM base as runtime
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ .

RUN bun add pm2 --global

ENV HOST="0.0.0.0"
ENV NODE_ENV=production

CMD sh -c "bun x pm2-runtime start server/ecosystem.config.js"

