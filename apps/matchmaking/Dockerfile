FROM node:22-alpine

WORKDIR /app

# Copy root lockfile + workspace manifests first for cache-friendly installs
COPY package.json package-lock.json ./
COPY apps/matchmaking/package.json ./apps/matchmaking/package.json
COPY packages/types/package.json ./packages/types/package.json

# The shared types package is consumed directly through tsx in this container.
RUN npm pkg set --prefix packages/types main=index.ts

# Install dependencies for this service and its local workspace dependency
RUN npm ci --workspace apps/matchmaking --workspace packages/types

# Copy source for both workspaces used at build time
COPY apps/matchmaking ./apps/matchmaking
COPY packages/types ./packages/types

WORKDIR /app/apps/matchmaking

RUN npm run build

CMD ["node", "dist/matchmaking.js"]
