// ===================================
// 📁 frontend/src/features/matrix/components/MatrixFiltersSection.jsx
// ===================================
import React, { useMemo } from 'react';
import { Box, Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

export default function MatrixFiltersSection({
  data,
  selectedRefInt,
  selectedRefCrn,
  selectedRefExt,
  onRefIntChange,
  onRefCrnChange,
  onRefExtChange,
}) {
  if (!data?.products || data.products.length === 0) return null;

  // 🔹 Listes uniques
  const refIntList = useMemo(() => {
    const set = new Set();

    // Depuis la liste produits
    if (data.products?.length) {
      data.products.forEach(p => p.refint && set.add(p.refint));
    }

    // Depuis les correspondances (si présentes)
    if (data.correspondences?.length) {
      data.correspondences.forEach(c => {
        if (c.refint) set.add(c.refint);
        if (c.ref_int) set.add(c.ref_int); // parfois nommé différemment selon l’API
      });
    }

    return Array.from(set).sort();
  }, [data.products, data.correspondences]);

  const refCrnList = useMemo(() => {
    const set = new Set();
    if (data.correspondences) {
      data.correspondences.forEach(c => c.ref_crn && set.add(c.ref_crn));
    }
    return Array.from(set).sort();
  }, [data.correspondences]);

  const refExtList = useMemo(() => {
    const set = new Set();
    if (data.correspondences) {
      data.correspondences.forEach(c => c.ref_ext && set.add(c.ref_ext));
    }
    return Array.from(set).sort();
  }, [data.correspondences]);

  // 🔹 Compte produits filtrés
  const filteredCount = useMemo(() => {
    let count = data.products.length;
    if (selectedRefInt || selectedRefCrn || selectedRefExt) {
      count = data.products.filter(prod => {
        const matchInt = !selectedRefInt || prod.refint === selectedRefInt;
        const matchCrn = !selectedRefCrn || data.correspondences?.some(c => c.cod_pro === prod.cod_pro && c.ref_crn === selectedRefCrn);
        const matchExt = !selectedRefExt || data.correspondences?.some(c => c.cod_pro === prod.cod_pro && c.ref_ext === selectedRefExt);
        return matchInt && matchCrn && matchExt;
      }).length;
    }
    return count;
  }, [data, selectedRefInt, selectedRefCrn, selectedRefExt]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
          🔍 Filtres de Références
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Référence Interne</InputLabel>
              <Select value={selectedRefInt} label="Ref Interne" onChange={e => onRefIntChange(e.target.value)}>
                <MenuItem value="">Toutes ({refIntList.length})</MenuItem>
                {refIntList.map(ref => <MenuItem key={ref} value={ref}>{ref}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Référence Constructeur</InputLabel>
              <Select value={selectedRefCrn} label="Ref CRN" onChange={e => onRefCrnChange(e.target.value)}>
                <MenuItem value="">Toutes ({refCrnList.length})</MenuItem>
                {refCrnList.map(ref => <MenuItem key={ref} value={ref}>{ref}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Référence Externe</InputLabel>
              <Select value={selectedRefExt} label="Ref EXT" onChange={e => onRefExtChange(e.target.value)}>
                <MenuItem value="">Toutes ({refExtList.length})</MenuItem>
                {refExtList.map(ref => <MenuItem key={ref} value={ref}>{ref}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {filteredCount} produit(s) affiché(s)
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
}
