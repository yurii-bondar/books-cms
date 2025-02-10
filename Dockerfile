FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# ideally, you should do 'npm ci', but we have dependency conflicts, so it will be like this
RUN npm i --omit=dev --legacy-peer-deps

RUN npm i -g @nestjs/cli

COPY . .

RUN npm run build