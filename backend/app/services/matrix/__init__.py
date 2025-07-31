# backend/app/services/matrix/__init__.py

"""
Services pour la gestion de la vue matricielle.

Ce module contient les services pour :
- Vue matricielle des correspondances (matrix_view_service)
- Export et analyse des données matricielles
- Gestion des filtres et de la pagination
"""

from .matrix_view_service import (
    get_matrix_view_data,
    get_matrix_view_filtered
)

__all__ = [
    "get_matrix_view_data",
    "get_matrix_view_filtered"
]