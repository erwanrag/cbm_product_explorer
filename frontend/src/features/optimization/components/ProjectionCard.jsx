import { Card, CardContent, Typography, Box, Grid, Chip, Stack } from '@mui/material';

export default function ProjectionCard({ data }) {
  const { totaux, taux_croissance, metadata } = data;
  
  const getQualityColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔮 Projection 6 Mois
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip 
            size="small" 
            label={metadata.method} 
            variant="outlined" 
          />
          <Chip 
            size="small" 
            label={`${(metadata.quality_score * 100).toFixed(0)}%`}
            color={getQualityColor(metadata.quality_score)}
          />
        </Stack>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption">CA Projeté</Typography>
            <Typography variant="h6">
              {totaux.ca.toLocaleString()}€
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption">Taux Croissance</Typography>
            <Typography variant="h6" color={taux_croissance >= 0 ? 'success.main' : 'error.main'}>
              {(taux_croissance * 100).toFixed(1)}%
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'success.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'success.200'
            }}>
              <Typography variant="caption">💰 Gain potentiel 6m</Typography>
              <Typography variant="h5" color="success.dark">
                {totaux.gain_potentiel_achat.toLocaleString()}€
              </Typography>
            </Box>
          </Grid>
          
          {metadata.warnings?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" color="warning.main">
                ⚠️ {metadata.warnings[0]}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}