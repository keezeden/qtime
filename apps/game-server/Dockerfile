FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/game-server/package.json ./apps/game-server/package.json
COPY packages/game/package.json ./packages/game/package.json

RUN npm ci --workspace apps/game-server --workspace packages/game

COPY apps/game-server ./apps/game-server
COPY packages/game ./packages/game

WORKDIR /app/apps/game-server

RUN npm run build

CMD ["npm", "run", "start:prod"]
