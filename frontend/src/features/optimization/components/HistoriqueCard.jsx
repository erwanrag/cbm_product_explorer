import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export default function HistoriqueCard({ data }) {
  const { totaux_12m } = data;
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Historique 12 Mois
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption">CA Réel</Typography>
            <Typography variant="h6">
              {totaux_12m.ca_reel.toLocaleString()}€
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption">Marge Actuelle (PA)</Typography>
            <Typography variant="h6" color="primary">
              {totaux_12m.marge_achat_actuelle.toLocaleString()}€
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'warning.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'warning.200'
            }}>
              <Typography variant="caption">💸 Manque à gagner 12m</Typography>
              <Typography variant="h5" color="warning.dark">
                {totaux_12m.gain_manque_achat.toLocaleString()}€
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Écart marge actuelle vs optimisée)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}