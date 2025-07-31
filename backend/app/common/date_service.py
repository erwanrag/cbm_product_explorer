from datetime import date

def get_last_n_months(n: int):
    """
    Génère les N derniers mois au format YYYY-MM
    Corrigé pour gérer correctement les années
    """
    today = date.today()
    months = []
    
    for i in range(n):
        # Calculer le mois et l'année correctement
        current_month = today.month - i
        current_year = today.year
        
        # Si le mois devient négatif, ajuster l'année
        while current_month <= 0:
            current_month += 12
            current_year -= 1
            
        months.append(f"{current_year}-{current_month:02d}")
    
    # Retourner dans l'ordre chronologique (plus ancien en premier)
    return list(reversed(months))