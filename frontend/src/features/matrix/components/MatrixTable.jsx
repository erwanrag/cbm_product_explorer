import React, { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import PaginatedDataGrid from '@/shared/components/tables/PaginatedDataGrid';

export default function MatrixTable({ products = [], matches = [], onInspectProduct }) {
  // === 1. Construction liste colonnes distinctes
  const allRefs = useMemo(() => {
    const refCrnSet = new Set(matches.map((m) => m.ref_crn).filter(Boolean));
    const refExtSet = new Set(matches.map((m) => m.ref_ext).filter(Boolean));

    const combined = new Set([...refCrnSet, ...refExtSet]);
    return [...combined].map((ref) => {
      const isCrn = refCrnSet.has(ref);
      const isExt = refExtSet.has(ref);
      return {
        ref,
        type: isCrn && isExt ? 'both' : isCrn ? 'crn' : 'ext',
      };
    });
  }, [matches]);

  // === 2. Mapping produit → {crn: Set, ext: Set}
  const productRefsMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const prodMatches = matches.filter((m) => m.cod_pro === p.cod_pro);
      map[p.cod_pro] = {
        crn: new Set(prodMatches.map((m) => m.ref_crn).filter(Boolean)),
        ext: new Set(prodMatches.map((m) => m.ref_ext).filter(Boolean)),
      };
    });
    return map;
  }, [products, matches]);

  // === 3. Colonnes DataGrid
  const columns = useMemo(() => {
    const baseCols = [
      { field: 'cod_pro', headerName: 'Code Produit', width: 120 },
      { field: 'refint', headerName: 'Référence Interne', width: 160 },
      { field: 'qualite', headerName: 'Qualité', width: 100 },
    ];

    const dynamicCols = allRefs.map((r) => ({
      field: r.ref,
      headerName: r.ref,
      width: 120,
      renderHeader: () => (
        <Chip
          label={r.ref}
          size="small"
          sx={{
            bgcolor:
              r.type === 'both'
                ? '#e1bee7' // violet clair
                : r.type === 'crn'
                  ? '#c8e6c9' // vert clair
                  : '#bbdefb', // bleu clair
            color: '#000',
            fontWeight: 600,
          }}
        />
      ),
      renderCell: ({ row }) => {
        const refType = productRefsMap[row.cod_pro] || { crn: new Set(), ext: new Set() };
        const inCrn = refType.crn.has(r.ref);
        const inExt = refType.ext.has(r.ref);

        let color = '#ffcdd2'; // rouge clair par défaut
        if (inCrn && inExt)
          color = '#d1c4e9'; // violet
        else if (inCrn)
          color = '#a5d6a7'; // vert
        else if (inExt) color = '#90caf9'; // bleu

        return (
          <Box
            sx={{
              bgcolor: color,
              borderRadius: 1,
              px: 1,
              py: 0.5,
              textAlign: 'center',
              fontWeight: 600,
              cursor: inCrn || inExt ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (inCrn || inExt) onInspectProduct(row);
            }}
          >
            {inCrn || inExt ? '✔' : '-'}
          </Box>
        );
      },
    }));

    return [...baseCols, ...dynamicCols];
  }, [allRefs, productRefsMap, onInspectProduct]);

  return (
    <Box mt={4}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🗂️ Matrice Produits – <strong>{products.length}</strong> ligne(s)
      </Typography>
      <PaginatedDataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row.cod_pro}
        pageSizeOptions={[20, 50, 100]}
        initialPageSize={20}
      />
    </Box>
  );
}
