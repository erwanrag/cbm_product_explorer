from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest

def is_payload_empty(payload: ProductIdentifierRequest) -> bool:
    """
    Vérifie si aucun identifiant produit n’est fourni dans le payload :
    - cod_pro
    - ref_crn
    - ref_ext
    - refint
    - cod_pro_list
    """
    return not (
        payload.cod_pro
        or payload.ref_crn
        or payload.ref_ext
        or payload.refint
        or (payload.cod_pro_list and len(payload.cod_pro_list) > 0)
    )