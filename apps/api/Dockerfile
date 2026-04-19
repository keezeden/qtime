FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN npm ci --workspace apps/api --workspace packages/types

COPY apps/api ./apps/api
COPY packages/types ./packages/types

WORKDIR /app/apps/api

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
