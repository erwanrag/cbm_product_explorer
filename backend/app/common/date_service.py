from datetime import date, timedelta

def get_last_n_months(n: int):
    today = date.today()
    months = []
    for i in range(n):
        y = today.year - ((today.month - i - 1) // 12)
        m = (today.month - i - 1) % 12 + 1
        months.append(f"{y}-{m:02d}")
    return list(reversed(months))
