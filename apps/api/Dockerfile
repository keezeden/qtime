# Use Node Alpine
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Run the app
CMD ["npm", "run", "start:dev"]