# Podcast Player

Minimal web app that lists MP3 files from the `podcasts/` directory and plays selected files.

## 🚀 Démarrage rapide

### Option 1: Avec Docker (Recommandé)

```bash
# Démarrer l'application
docker-compose up -d

# Ou utiliser le script
./docker.sh start
```

L'application sera accessible sur http://localhost:3000

### Option 2: Sans Docker

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser.

## 📖 Documentation

- [Guide Docker complet](DOCKER.md) - Instructions détaillées pour l'utilisation avec Docker

## 📝 Notes
- Put your `.mp3` files inside the `podcasts/` folder at the project root.
- The server provides an API `GET /api/podcasts` that returns the list of mp3 files.
- L'application est entièrement responsive et fonctionne sur mobile, tablette et desktop.

## 🐳 Commandes Docker utiles

```bash
./docker.sh start    # Démarrer
./docker.sh stop     # Arrêter
./docker.sh logs     # Voir les logs
./docker.sh restart  # Redémarrer
./docker.sh build    # Rebuilder l'image
```
