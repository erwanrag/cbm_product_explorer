import { Box, Card, CardContent, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import EuroIcon from '@mui/icons-material/Euro';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';
import { formatPrix, formatPourcentage } from '@/lib/format';

export default function DashboardKPIs({ data }) {
  if (!data) return null;

  const {
    totalProduits = 0,
    caTotal = 0,
    quantiteTotal = 0,
    margeMoyenne = 0,
    stockTotalValorise = 0,
    topFournisseur = {},
  } = data;

  const { nom: topFournisseurNom = '-', ca: topFournisseurCA = 0 } = topFournisseur;

  const kpis = [
    {
      label: 'Produits Actifs',
      value: totalProduits,
      icon: <CategoryIcon color="primary" />,
    },
    {
      label: 'CA Total (12 mois)',
      value: formatPrix(caTotal),
      icon: <EuroIcon sx={{ color: '#1b5e20' }} />,
    },
    {
      label: 'Quantité Totale',
      value: Number(quantiteTotal || 0).toLocaleString('fr-FR'),
      icon: <InventoryIcon sx={{ color: '#283593' }} />,
    },
    {
      label: 'Marge Moyenne (%)',
      value: formatPourcentage(margeMoyenne),
      icon: (
        <ShowChartIcon
          sx={{
            color: margeMoyenne < 10 ? '#c62828' : margeMoyenne < 20 ? '#f9a825' : '#2e7d32',
          }}
        />
      ),
    },
    {
      label: 'Stock valorisé (PMP)',
      value: formatPrix(stockTotalValorise),
      icon: (
        <InventoryIcon
          sx={{
            color: stockTotalValorise <= 0 ? '#c62828' : '#1565c0',
          }}
        />
      ),
    },
    {
      label: 'Top Fournisseur (CA)',
      value: `${topFournisseurNom} (${formatPrix(topFournisseurCA)})`,
      icon: <StoreIcon sx={{ color: '#6a1b9a' }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mt: 2,
      }}
    >
      {kpis.map(({ label, value, icon }) => (
        <Box
          key={label}
          sx={{
            flex: '1 1 220px',
            minWidth: 200,
            maxWidth: 320,
          }}
        >
          <Card
            sx={{
              backgroundColor: '#fafaff',
              borderLeft: '5px solid #1976d2',
              height: '100%',
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon}
                <Typography variant="subtitle2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 600, color: 'text.primary' }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
