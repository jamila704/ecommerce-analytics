FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Lance le script de génération
CMD ["node", "generate.js"]