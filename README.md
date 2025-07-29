# CBM GRC Matcher - Backend API

## 🚀 **Overview**

API REST moderne pour le matching et l'analyse des produits CBM. Basée sur FastAPI avec architecture en couches, cache Redis et sécurité enterprise-grade.

## 📋 **Features**

### Core Business
- ✅ **Résolution d'identifiants produits** - Conversion cod_pro ↔ ref_crn ↔ ref_ext
- ✅ **Grouping intelligent** - Regroupement par familles et qualités
- ✅ **Données produits** - Détails, historique, stock, prix
- ✅ **Optimisation business** - Analyses de gains et projections

### Technical
- ✅ **Sécurité SQL** - Protection contre les injections
- ✅ **Cache Redis** - Performance optimisée avec TTL adaptatifs
- ✅ **Monitoring** - Logs structurés + métriques + healthchecks
- ✅ **Multi-environnements** - dev/staging/prod
- ✅ **API versionnée** - `/api/v1/`

## 🏗️ **Architecture**

```
backend/
├── app/
│   ├── main.py                 # FastAPI app + middlewares
│   ├── settings.py             # Configuration
│   ├── routers/               # API endpoints
│   │   ├── identifiers/       # Résolution cod_pro
│   │   ├── products/          # Détails, matrix, match
│   │   ├── sales/             # Historique ventes
│   │   ├── stock/             # Stock actuel/historique
│   │   ├── purchase/          # Prix d'achat
│   │   └── optimisation/      # Analyses business
│   ├── services/              # Logique métier
│   ├── schemas/               # Modèles Pydantic
│   ├── db/                    # Database + sessions
│   ├── common/                # Utilitaires partagés
│   └── cache/                 # Gestion cache Redis
└── requirements.txt
```

## 🛠️ **Installation**

### Prerequisites
- Python 3.11+
- SQL Server (CBM_DATA database)
- Redis 6.0+

### Setup
```bash
# Clone & Navigate
cd backend

# Virtual Environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Dependencies
pip install -r requirements.txt

# Environment Configuration
cp .env.example .env.dev
# Edit .env.dev with your settings
```

### Configuration (`.env.dev`)
```env
# Database
SQL_SERVER=your-sql-server
SQL_DATABASE=CBM_DATA
SQL_USER=your-user
SQL_PASSWORD=your-password
DATABASE_URL=mssql+aioodbc://...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Security
SECRET_KEY=your-secret-key-32-chars-minimum

# Environment
CBM_ENV=dev
```

## 🚀 **Usage**

### Start Server
```bash
# Development (auto-reload)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5180

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --workers 4
```

### Health Check
```bash
curl http://localhost:5180/healthcheck
```

### API Documentation
- **Swagger UI**: http://localhost:5180/docs (dev only)
- **ReDoc**: http://localhost:5180/redoc (dev only)

## 📡 **API Endpoints**

### Core Services
```http
POST /api/v1/identifiers/resolve-codpro  # Résolution identifiants
POST /api/v1/products/details            # Détails produits  
POST /api/v1/products/match              # Matching cod_pro ↔ ref_crn
POST /api/v1/products/matrix             # Matrice produits
POST /api/v1/sales/history               # Historique ventes
POST /api/v1/sales/aggregate             # Agrégats ventes
POST /api/v1/stock/current               # Stock actuel
POST /api/v1/stock/history               # Historique stock
POST /api/v1/purchase/price              # Prix d'achat
POST /api/v1/optimisation/optimisation   # Analyses business
```

### System
```http
GET  /                     # API info
GET  /healthcheck         # Health status
```

## 🎯 **Examples**

### Résolution avec Grouping
```bash
curl -X POST "http://localhost:5180/api/v1/products/details" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_pro": 23412,
    "grouping_crn": 1
  }'
```

### Historique Ventes
```bash
curl -X POST "http://localhost:5180/api/v1/sales/history?last_n_months=6" \
  -H "Content-Type: application/json" \
  -d '{
    "ref_crn": "ABC123",
    "qualite": "OEM"
  }'
```

## 📊 **Monitoring**

### Logs
```bash
# Logs en temps réel
tail -f logs/cbm_api.log

# Logs structurés (JSONL)
cat logs/cbm_api.log | jq '.'
```

### Métriques
- **Response times** - Tracked per endpoint
- **Error rates** - By HTTP status
- **Cache hit rates** - Redis performance
- **Database health** - Connection monitoring

## 🔧 **Development**

### Code Quality
```bash
# Format code
black app/

# Run tests (when available)
pytest tests/

# Type checking
mypy app/
```

### Database
```bash
# Flush Redis cache
python app/common/flush_redis.py

# Test DB connection
python -c "from app.db.engine import test_db_connection; import asyncio; print(asyncio.run(test_db_connection()))"
```

## 🔒 **Security**

### Implemented
- ✅ **SQL Injection Protection** - Parameterized queries only
- ✅ **Input Validation** - Pydantic schemas with strict typing
- ✅ **Error Handling** - No sensitive data in responses
- ✅ **CORS Configuration** - Restricted origins
- ✅ **Rate Limiting** - Per-IP request limits
- ✅ **Security Headers** - XSS, CSRF, HSTS protection

### Best Practices
- Never log sensitive data (passwords, tokens)
- All SQL queries use bound parameters
- Error messages don't expose internal structure
- Production mode hides debug information

## 🐛 **Troubleshooting**

### Common Issues

**Database Connection Failed**
```bash
# Check SQL Server connectivity
telnet your-sql-server 1433

# Verify credentials in .env.dev
# Check Windows Authentication vs SQL Server Auth
```

**Redis Connection Failed**
```bash
# Check Redis server
redis-cli ping

# Verify REDIS_HOST and REDIS_PORT in .env.dev
```

**Module Import Errors**
```bash
# Ensure PYTHONPATH includes backend directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or run from backend/ directory
cd backend && python -m uvicorn app.main:app
```

### Debug Mode
```env
CBM_ENV=dev          # Enable debug logs
LOG_LEVEL=DEBUG      # Verbose logging
```

## 📈 **Performance**

### Benchmarks (Typical)
- **Simple queries**: < 50ms
- **Grouping resolution**: < 200ms  
- **Complex aggregations**: < 500ms
- **Cache hits**: < 5ms

### Optimization Tips
- Use `grouping_crn=1` for better cache efficiency
- Batch multiple cod_pro in single requests
- Monitor Redis memory usage
- Use pagination for large datasets

## 🚀 **Production Deployment**

### Environment Variables
```env
CBM_ENV=prod
DEBUG=false
LOG_LEVEL=WARNING
REDIS_TTL_LONG=86400
```

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5180"]
```

### Process Management
```bash
# Using systemd
sudo systemctl start cbm-api
sudo systemctl enable cbm-api

# Using supervisor
supervisorctl start cbm-api
```

## 📞 **Support**

### Logs Analysis
1. Check `/healthcheck` endpoint
2. Review `logs/cbm_api.log` for errors
3. Monitor Redis and SQL Server connectivity
4. Verify environment configuration

### Contact
- **Technical Issues**: Check logs first
- **Business Logic**: Review API documentation
- **Performance**: Monitor endpoint response times

---

**Version**: 1.0.0  
**Last Updated**: July 2025  
**Status**: ✅ Production Ready