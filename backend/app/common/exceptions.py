# 📄 backend/app/common/exceptions.py

from fastapi import HTTPException
from typing import Any, Dict, Optional


class CBMBaseException(Exception):
    """Exception de base pour l'application CBM"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class DatabaseError(CBMBaseException):
    """Erreur liée à la base de données"""
    pass


class CacheError(CBMBaseException):
    """Erreur liée au cache Redis"""
    pass


class ValidationError(CBMBaseException):
    """Erreur de validation des données"""
    pass


class NotFoundError(CBMBaseException):
    """Ressource non trouvée"""
    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} non trouvé: {identifier}"
        super().__init__(message, {"resource": resource, "identifier": identifier})


class UnauthorizedError(CBMBaseException):
    """Accès non autorisé"""
    def __init__(self, action: str):
        message = f"Action non autorisée: {action}"
        super().__init__(message, {"action": action})


# Conversion vers HTTPException FastAPI
def to_http_exception(exc: CBMBaseException, status_code: int = 500) -> HTTPException:
    """Convertit une exception CBM en HTTPException FastAPI"""
    return HTTPException(
        status_code=status_code,
        detail={
            "message": exc.message,
            "details": exc.details,
            "type": exc.__class__.__name__
        }
    )


# Exceptions HTTP prêtes à l'emploi
class HTTPNotFound(HTTPException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=404,
            detail=f"{resource} non trouvé: {identifier}"
        )


class HTTPBadRequest(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=400,
            detail=message
        )


class HTTPInternalError(HTTPException):
    def __init__(self, message: str = "Erreur interne du serveur"):
        super().__init__(
            status_code=500,
            detail=message
        )