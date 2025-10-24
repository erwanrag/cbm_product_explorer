import { Card, CardContent, Typography, Box, Grid, Divider } from '@mui/material';

export default function SyntheseCard({ data }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎯 Synthèse Globale 18 Mois
        </Typography>
        
        <Grid container spacing={3}>
          {/* Gains passés (12m) */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Manque à gagner passé (12m)
            </Typography>
            <Typography variant="h5" color="warning.main">
              {data.gain_manque_achat_12m.toLocaleString()}€
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* Gains futurs (6m) */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Gain potentiel futur (6m)
            </Typography>
            <Typography variant="h5" color="success.main">
              {data.gain_potentiel_achat_6m.toLocaleString()}€
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* Total 18m */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 3, 
              bgcolor: 'primary.50', 
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.main'
            }}>
              <Typography variant="caption" color="primary.dark">
                🏆 GAIN TOTAL 18 MOIS
              </Typography>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                {data.gain_total_achat_18m.toLocaleString()}€
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Amélioration marge: +{data.amelioration_pct.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}