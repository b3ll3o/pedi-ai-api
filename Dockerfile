FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl ca-certificates postgresql-client wget

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main.js"]
