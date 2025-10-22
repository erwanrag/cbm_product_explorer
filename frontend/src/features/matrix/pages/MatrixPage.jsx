// ===================================
// 📁 frontend/src/features/matrix/pages/MatrixPage.jsx
// ✅ Version clean avec le même ExportExcelButton que le Dashboard
// ===================================

import React, { useMemo, useState } from 'react';
import { Box, Typography, Alert, IconButton, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useMatrixData } from '../hooks/useMatrixData';
import { useFeatureStates } from '@/store/hooks/useFeatureStates';
import MatrixFiltersSection from '../components/MatrixFiltersSection';
import MatrixTable from '../components/MatrixTable';
import MatrixInsights from '../components/MatrixInsights';
import MatrixLegend from '../components/MatrixLegend';
import { ExportExcelButton } from '@/shared/components/export'; // ✅ même composant que Dashboard

// ===================================
// 💾 COMPOSANT PRINCIPAL
// ===================================

export default function MatrixPage() {
  const [searchParams] = useSearchParams();
  const states = useFeatureStates({
    enableInsights: true,
    enableColumnVisibility: true,
    defaultColumnVisibility: {
      details: true,
      designation: true,
      qualite: true,
      statut: true,
      famille: true,
      fournisseur: true,
    },
  });

  // ✅ Récupération filtres depuis URL
  const filtersFromUrl = useMemo(() => {
    const codPro = searchParams.get('cod_pro');
    const groupingCrn = searchParams.get('grouping_crn');
    return codPro
      ? { cod_pro: parseInt(codPro), grouping_crn: groupingCrn === '1' ? 1 : 0 }
      : null;
  }, [searchParams]);

  const { matrixData, isLoading, isError, error, refetch } = useMatrixData(filtersFromUrl);

  // ✅ Filtres locaux
  const [selectedRefInt, setSelectedRefInt] = useState('');
  const [selectedRefCrn, setSelectedRefCrn] = useState('');
  const [selectedRefExt, setSelectedRefExt] = useState('');

  // ✅ Données filtrées
  const filteredData = useMemo(() => {
    if (!matrixData) return null;
    let filteredProducts = [...matrixData.products];

    if (selectedRefInt)
      filteredProducts = filteredProducts.filter((p) => p.refint === selectedRefInt);

    if (selectedRefCrn)
      filteredProducts = filteredProducts.filter((p) =>
        matrixData.correspondences.some(
          (c) => c.cod_pro === p.cod_pro && c.ref_crn === selectedRefCrn
        )
      );

    if (selectedRefExt)
      filteredProducts = filteredProducts.filter((p) =>
        matrixData.correspondences.some(
          (c) => c.cod_pro === p.cod_pro && c.ref_ext === selectedRefExt
        )
      );

    return { ...matrixData, products: filteredProducts };
  }, [matrixData, selectedRefInt, selectedRefCrn, selectedRefExt]);

  // ✅ Prépare les données d’export pour le bouton
  const exportData = useMemo(() => {
    if (!filteredData?.products?.length) return [];
    const allRefs = filteredData.columnRefs || [];

    return filteredData.products.map((p) => {
      const row = {
        'Code Produit': p.cod_pro,
        'Référence Interne': p.refint,
        'Désignation': p.nom_pro,
        'Qualité': p.qualite,
        'Statut': p.statut === 0 ? 'Actif' : 'Inactif',
        'Famille': p.famille,
        'Fournisseur': p.nom_fou,
      };

      allRefs.forEach((col) => {
        const matches = filteredData.correspondences.filter((m) => m.cod_pro === p.cod_pro);
        const inCrn = matches.some((m) => m.ref_crn === col.ref);
        const inExt = matches.some((m) => m.ref_ext === col.ref);

        if (inCrn && inExt) row[`[${col.type}] ${col.ref}`] = 'C+E';
        else if (inCrn) row[`[${col.type}] ${col.ref}`] = 'CRN';
        else if (inExt) row[`[${col.type}] ${col.ref}`] = 'EXT';
        else row[`[${col.type}] ${col.ref}`] = '-';
      });

      return row;
    });
  }, [filteredData]);

  // ===================================
  // 🎨 Rendu principal
  // ===================================

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            Matrice de Correspondance CBM
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Rafraîchir les données">
              <IconButton onClick={refetch}>
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* ✅ Le même bouton que Dashboard */}
            <ExportExcelButton
              data={exportData}
              filename="matrice_cbm_export"
              sheetName="Matrice produits"
            />
          </Box>
        </Box>

        {/* États de chargement */}
        {isLoading && <Alert severity="info">Chargement des données...</Alert>}
        {isError && <Alert severity="error">{error?.message}</Alert>}
        {!matrixData && !isLoading && (
          <Alert severity="info">Aucune donnée disponible</Alert>
        )}

        {/* Contenu principal */}
        {!isLoading && matrixData && (
          <>
            <MatrixFiltersSection
              data={matrixData}
              selectedRefInt={selectedRefInt}
              selectedRefCrn={selectedRefCrn}
              selectedRefExt={selectedRefExt}
              onRefIntChange={setSelectedRefInt}
              onRefCrnChange={setSelectedRefCrn}
              onRefExtChange={setSelectedRefExt}
            />

            {states.insights.isVisible && <MatrixInsights data={filteredData} />}
            <MatrixLegend compact sx={{ mb: 2 }} />

            <MatrixTable
              products={filteredData?.products || []}
              matches={filteredData?.correspondences || []}
              columnRefs={filteredData?.columnRefs || []}
              columnVisibility={states.columnVisibility}
              onColumnVisibilityChange={states.setColumnVisibility}
            />
          </>
        )}
      </motion.div>
    </Box>
  );
}
