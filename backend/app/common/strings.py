import re
def normalize_str(value: str) -> str:
    return value.strip().lower()

def truncate(value: str, max_len: int) -> str:
    return value[:max_len] + "..." if len(value) > max_len else value

def normalize_ref_ext(ref_ext: str) -> str:
    """
    Nettoie et uniformise une ref_ext pour matching :
    - enlève espaces, points, tirets, slashes, parenthèses, etc.
    - met en majuscule
    - ne garde que [A-Z0-9]
    """
    if not ref_ext:
        return ""
    # Supprime tout ce qui n'est pas lettre ou chiffre
    ref = re.sub(r"[^A-Za-z0-9]", "", ref_ext)
    return ref.upper()
