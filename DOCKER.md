# 🐳 Utilisation Docker

## Démarrage rapide avec Docker Compose

### Lancer l'application
```bash
docker-compose up -d
```

### Voir les logs
```bash
docker-compose logs -f
```

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer après modifications
```bash
docker-compose restart
```

### Rebuilder l'image
```bash
docker-compose up -d --build
```

## Utilisation avec Docker (sans Compose)

### Construire l'image
```bash
docker build -t podcast-player .
```

### Lancer le conteneur
```bash
docker run -d \
  --name podcast-player \
  -p 3000:3000 \
  -v $(pwd)/podcasts:/app/podcasts:ro \
  -v $(pwd)/images:/app/images:ro \
  podcast-player
```

### Voir les logs
```bash
docker logs -f podcast-player
```

### Arrêter le conteneur
```bash
docker stop podcast-player
```

### Supprimer le conteneur
```bash
docker rm podcast-player
```

## Accéder à l'application

Une fois lancée, l'application est accessible sur :
```
http://localhost:3000
```

## Volumes

Les dossiers suivants sont montés en lecture seule :
- `./podcasts` → `/app/podcasts` - Vos fichiers MP3
- `./images` → `/app/images` - Images de fond

Vous pouvez ajouter des fichiers MP3 dans le dossier `podcasts/` sans reconstruire l'image. Il suffit de rafraîchir la page web.

## Personnalisation

### Changer le port
Modifier le port dans `docker-compose.yml` :
```yaml
ports:
  - "8080:3000"  # Port hôte:Port conteneur
```

Ou avec Docker :
```bash
docker run -d -p 8080:3000 podcast-player
```

### Variables d'environnement
- `PORT` - Port du serveur (défaut: 3000)
- `NODE_ENV` - Environnement Node.js (défaut: production)

## Santé du conteneur

Un healthcheck est configuré pour vérifier que l'application répond correctement toutes les 30 secondes.

Vérifier le statut :
```bash
docker ps
```

La colonne STATUS affichera "healthy" ou "unhealthy".

## Dépannage

### Le conteneur ne démarre pas
```bash
docker-compose logs
```

### Vérifier si le port est déjà utilisé
```bash
lsof -i :3000
```

### Supprimer tout et recommencer
```bash
docker-compose down -v
docker-compose up -d --build
```

### Inspecter le conteneur
```bash
docker exec -it podcast-player sh
```

## Sécurité

L'image Docker utilise :
- Alpine Linux (image légère)
- Utilisateur non-root (nodejs:nodejs)
- Multi-stage build pour optimisation
- Volumes en lecture seule pour les fichiers statiques
