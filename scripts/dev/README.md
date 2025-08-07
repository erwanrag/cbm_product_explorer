REM ============================================
REM 📁 scripts/dev/README.md
REM ============================================
# Scripts de Développement CBM Product Explorer

## 🚀 Scripts Principaux

### `01_setup_project.bat`
- **Usage**: Premier démarrage / Installation initiale
- **Actions**: Crée venv Python, installe dépendances, configure .env

### `04_start_both.bat` ⭐ **PRINCIPAL**
- **Usage**: Démarrage complet (Backend + Frontend)
- **Actions**: Lance les 2 services dans des fenêtres séparées

### `05_stop_all.bat`
- **Usage**: Arrêt de tous les services CBM
- **Actions**: Ferme proprement Backend et Frontend

## 🔧 Scripts Spécialisés

### `02_start_backend.bat`
- **Usage**: Backend seul (pour debug API)
- **URL**: http://127.0.0.1:5180

### `03_start_frontend.bat`  
- **Usage**: Frontend seul (avec backend externe)
- **URL**: http://127.0.0.1:5181

### `06_clean_install.bat`
- **Usage**: Réinstallation propre complète
- **Actions**: Supprime tout et réinstalle

### `08_test_api.bat`
- **Usage**: Test de l'API backend
- **Actions**: Vérifie endpoints principaux

### `09_package_json_fix.bat`
- **Usage**: Répare package.json corrompu
- **Actions**: Recrée un package.json valide

## 🗂️ Scripts Utilitaires

### `07_logs.bat`
- **Usage**: Consultation des logs
- **Actions**: Affiche les fichiers de logs

### `clean_redis_db_2.cmd` (existant)
- **Usage**: Vide le cache Redis
- **Actions**: FLUSHDB sur DB 2

## 📋 Workflow de Développement

```bash
# 1. Premier démarrage
01_setup_project.bat

# 2. Développement quotidien  
04_start_both.bat

# 3. Arrêt propre
05_stop_all.bat

# 4. En cas de problème
06_clean_install.bat
```

## 🎯 Cas d'Usage

- **Développement normal**: `04_start_both.bat`
- **Debug backend seul**: `02_start_backend.bat`
- **Test frontend seul**: `03_start_frontend.bat`
- **Problème dépendances**: `06_clean_install.bat`
- **Test API**: `08_test_api.bat`
- **Package.json cassé**: `09_package_json_fix.bat`