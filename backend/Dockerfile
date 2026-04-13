# On part d'une image Node.js officielle légère
FROM node:22-alpine

# Dossier de travail dans le container
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste du code
COPY . .

# Expose le port 3000
EXPOSE 3000

# Lance le serveur
CMD ["node", "server.js"]