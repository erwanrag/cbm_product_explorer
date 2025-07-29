from app.routers.identifiers.identifier_router import router as identifier_router
from app.routers.suggestion.suggestion_router import router as suggestion_router
from app.routers.dashboard.dashboard_router import router as dashboard_router
from app.routers.products.detail_router import router as detail_router
from app.routers.products.match_router import router as match_router
from app.routers.products.matrix_router import router as matrix_router
from app.routers.stock.stock_router import router as stock_router
from app.routers.sales.sales_router import router as sales_router
from app.routers.purchase.purchase_router import router as purchase_router
from app.routers.optimisation.optimisation_router import router as optimisation_router

routers = [
    identifier_router,
    suggestion_router,
    dashboard_router,
    detail_router,
    match_router,
    matrix_router,
    stock_router,
    sales_router,
    purchase_router,
    optimisation_router,
]

# Laisse __all__ explicite, c'est plus propre
__all__ = [
    "identifier_router",
    "suggestion_router",
    "dashboard_router",
    "detail_router",
    "match_router",
    "matrix_router",
    "stock_router",
    "sales_router",
    "purchase_router",
    "optimisation_router",
]
