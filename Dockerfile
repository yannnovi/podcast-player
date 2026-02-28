# Étape 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production --no-optional && npm cache clean --force

# Étape 2: Production
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances depuis le builder
COPY --from=builder /app/node_modules ./node_modules

# Copier les fichiers de l'application
COPY . .

# Créer les dossiers nécessaires s'ils n'existent pas
RUN mkdir -p podcasts images public

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV PORT=3000 \
    NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["npm", "start"]
