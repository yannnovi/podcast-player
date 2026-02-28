#!/bin/bash

# Script de gestion Docker pour Podcast Player
# Usage: ./docker.sh [start|stop|restart|logs|build|clean]

case "$1" in
  start)
    echo "🚀 Démarrage du Podcast Player..."
    docker-compose up -d
    echo "✅ Application démarrée sur http://localhost:3000"
    ;;
    
  stop)
    echo "🛑 Arrêt du Podcast Player..."
    docker-compose down
    echo "✅ Application arrêtée"
    ;;
    
  restart)
    echo "🔄 Redémarrage du Podcast Player..."
    docker-compose restart
    echo "✅ Application redémarrée"
    ;;
    
  logs)
    echo "📋 Logs du Podcast Player (Ctrl+C pour quitter)..."
    docker-compose logs -f
    ;;
    
  build)
    echo "🔨 Rebuild de l'image Docker..."
    docker-compose up -d --build
    echo "✅ Image reconstruite et application redémarrée"
    ;;
    
  clean)
    echo "🧹 Nettoyage complet..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Nettoyage terminé"
    ;;
    
  status)
    echo "📊 Statut du Podcast Player..."
    docker-compose ps
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|logs|build|clean|status}"
    echo ""
    echo "Commandes disponibles:"
    echo "  start   - Démarre l'application"
    echo "  stop    - Arrête l'application"
    echo "  restart - Redémarre l'application"
    echo "  logs    - Affiche les logs en temps réel"
    echo "  build   - Reconstruit et redémarre l'application"
    echo "  clean   - Nettoie les conteneurs et volumes"
    echo "  status  - Affiche le statut du conteneur"
    exit 1
    ;;
esac

exit 0
