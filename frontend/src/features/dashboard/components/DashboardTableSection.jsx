// frontend/src/features/dashboard/components/DashboardTableSection.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Analytics, TrendingUp } from '@mui/icons-material';
import EnterpriseDataGrid from '@/shared/components/ui/DataGrid/EnterpriseDataGrid';
import { useProductTableColumns } from '@/features/dashboard/hooks/useProductTableColumns';

/**
 * Section tableau du dashboard - Composant focalisé
 * Responsabilité: Affichage et interaction avec le tableau des produits
 */
export default function DashboardTableSection({
  data,
  loading,
  onProductSelect,
  onExport,
  onRefresh,
}) {
  // Hook personnalisé pour les colonnes
  const columns = useProductTableColumns();

  // Préparation des données enrichies
  const enrichedRows = useMemo(() => {
    if (!data?.details) return [];
    return data.details.map((product) => ({
      ...product,
      // Ajout d'un ID unique pour le DataGrid
      id: product.cod_pro || `${product.refint}-${Date.now()}`,
    }));
  }, [data?.details]);

  const customActions = [
    {
      key: 'analyze',
      icon: <Analytics />,
      label: 'Analyser',
      onClick: (row) => onProductSelect(row),
      showInMenu: true,
    },
    {
      key: 'optimize',
      icon: <TrendingUp />,
      label: 'Optimiser',
      onClick: (row) => {
        window.open(`/optimization?cod_pro=${row.cod_pro}`, '_blank');
      },
      showInMenu: true,
      disabled: (row) => !row.ca_total,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <EnterpriseDataGrid
        rows={enrichedRows}
        columns={columns}
        title="Produits et Performances"
        subtitle={`${enrichedRows.length} produit(s) correspondant aux critères`}
        loading={loading}
        onRowClick={({ row }) => onProductSelect(row)}
        onExport={onExport}
        onRefresh={onRefresh}
        customActions={customActions}
        pageSize={50}
        pageSizeOptions={[25, 50, 100, 200]}
        sx={{ mt: 3 }}
        getRowId={(row) => row.id || row.cod_pro}
      />
    </motion.div>
  );
}
