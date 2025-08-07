// frontend/README.md - DOCUMENTATION ENTERPRISE
# CBM Product Explorer - Frontend Enterprise

## 🏗️ Architecture

### Structure du Projet
```
src/
├── app/                    # Configuration application
│   ├── App.jsx            # Point d'entrée principal
│   └── routes/            # Configuration routing
├── features/              # Modules métier
│   ├── dashboard/         # Module dashboard
│   ├── matrix/           # Module matrice
│   └── optimization/     # Module optimisation
├── shared/               # Composants partagés
│   ├── components/       # UI components
│   ├── layout/          # Layout système
│   └── theme/           # Configuration thème
├── store/               # Gestion d'état
│   ├── hooks/           # Hooks métier
│   └── contexts/        # React contexts
├── api/                 # Couche API
│   ├── core/            # Configuration Axios
│   └── services/        # Services métier
├── utils/               # Utilitaires
├── lib/                 # Librairies internes
└── config/              # Configuration
```

### Technologies

- **React 19** - Framework UI moderne
- **Material-UI v7** - Design system enterprise
- **TanStack Query v5** - State management serveur
- **React Router v7** - Navigation SPA
- **Framer Motion** - Animations fluides
- **Plotly.js** - Graphiques interactifs
- **Vite** - Build tool ultra-rapide

## 🚀 Démarrage Rapide

### Prérequis
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
# Clone et installation
git clone [repo]
cd frontend
npm install

# Configuration environnement
cp .env.example .env.development
# Éditer .env.development avec vos valeurs

# Démarrage développement
npm run dev
```

### Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build production
npm run build:staging    # Build staging
npm run preview          # Preview du build

# Qualité du code
npm run lint             # Vérification ESLint
npm run lint:check       # Vérification seule
npm run format           # Formatage Prettier
npm run format:check     # Vérification formatage

# Tests & Analyse
npm run test             # Tests unitaires
npm run test:coverage    # Couverture de code
npm run analyze          # Analyse du bundle

# Maintenance
npm run clean            # Nettoyage cache
```

## 📋 Standards de Développement

### Conventions de Code

1. **Composants** : PascalCase avec export par défaut
2. **Hooks** : Préfixe `use` + logique métier encapsulée
3. **Services** : Classes avec méthodes async/await
4. **Constantes** : UPPER_SNAKE_CASE
5. **Fichiers** : kebab-case ou PascalCase selon le type

### Architecture des Composants

```jsx
// ✅ BON - Composant focalisé
function ProductCard({ product, onSelect }) {
  return (
    <Card onClick={() => onSelect(product)}>
      <CardContent>
        <Typography>{product.name}</Typography>
      </CardContent>
    </Card>
  );
}

// ❌ MAUVAIS - Composant monolithique
function MegaComponent() {
  // 500 lignes de code...
}
```

### Performance

1. **Lazy Loading** : Toutes les pages sont chargées à la demande
2. **Code Splitting** : Séparation automatique des bundles
3. **Memoization** : React.memo pour composants coûteux
4. **Cache Intelligent** : TanStack Query avec TTL adaptatifs

### Sécurité

1. **Variables d'environnement** chiffrées en production
2. **Headers de sécurité** configurés
3. **Validation** côté client ET serveur
4. **Pas de données sensibles** en localStorage

## 🔧 Configuration

### Variables d'Environnement

| Variable | Description | Défaut | Obligatoire |
|----------|-------------|---------|-------------|
| `VITE_API_URL` | URL de l'API backend | - | ✅ |
| `VITE_REQUEST_TIMEOUT` | Timeout requêtes (ms) | 30000 | ❌ |
| `VITE_CACHE_TIMEOUT` | TTL cache (ms) | 300000 | ❌ |
| `VITE_DEFAULT_PAGE_SIZE` | Taille page défaut | 50 | ❌ |

### Thématisation

Le thème Material-UI est configuré dans `src/shared/theme/theme.js` avec :
- Couleurs CBM officielles
- Typography Inter
- Composants personnalisés
- Mode responsive

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test -- --watch
```

## 📦 Déploiement

### Build de Production

```bash
# Build optimisé
npm run build

# Vérification du build
npm run preview

# Analyse du bundle
npm run analyze
```

### Stratégies de Cache

1. **Assets statiques** : Cache long terme avec hash
2. **API calls** : Cache intelligent avec invalidation
3. **Code splitting** : Chunks séparés pour optimiser le cache

### Monitoring

En production, l'application collecte :
- **Web Vitals** (LCP, FID, CLS)
- **Erreurs JavaScript** 
- **Performance des requêtes**
- **Métriques d'usage**

## 🔍 Debug

### Outils de Développement

- **React DevTools** : Inspection des composants
- **TanStack Query DevTools** : État du cache
- **Network Tab** : Monitoring des requêtes API

### Logs

```javascript
// Mode développement : logs détaillés
console.log('🔍 Debug info:', data);

// Mode production : logs d'erreur uniquement
console.error('❌ Error:', error);
```

## 🚨 Dépannage

### Erreurs Courantes

1. **Module not found** : Vérifier les imports avec `@/`
2. **API errors** : Vérifier `VITE_API_URL` dans `.env`
3. **Build fails** : Nettoyer le cache avec `npm run clean`

### Performance

Si l'app est lente :
1. Vérifier le bundle avec `npm run analyze`
2. Optimiser les re-renders avec React DevTools
3. Vérifier les requêtes réseau dupliquées

---
