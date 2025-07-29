// src/shared/components/tables/PaginatedDataGrid.jsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import GlobalSkeleton from "@/shared/components/skeleton/GlobalSkeleton";

/**
 * Composant générique de DataGrid avec pagination serveur,
 * chargement anticipé par blocs de 2 pages, et cache local.
 */
export default function PaginatedDataGrid({
  columns,
  fetchRows,
  filterModel,
  onFilterChange,
  onRowClick,
  pageSizeOptions = [20, 50, 100],
  initialPageSize = 20,
  getRowId = (row) => row.id,
  getRowClassName,
  resetKey // 🟢 Utilisé pour forcer le reset (clé unique)
}) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const cache = useRef({});

  // 🔥 Reset tout à chaque changement de resetKey
  useEffect(() => {
    cache.current = {};
    setRows([]);
    setPage(0);
  }, [resetKey]);

  const loadingPages = useRef(new Set());
  const loadPageBlock = useCallback(async (basePage) => {
    if (loadingPages.current.has(basePage)) return;
    loadingPages.current.add(basePage);
    const pagesToLoad = [basePage, basePage + 1];
    const missing = pagesToLoad.filter((p) => !cache.current[p]);
    if (missing.length === 0) {
      loadingPages.current.delete(basePage);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const results = await Promise.all(missing.map((p) => fetchRows(p, pageSize, filterModel)));
      results.forEach((res, i) => {
        if (!res) return;
        const p = missing[i];
        cache.current[p] = res.rows;
        setRowCount(res.total);
        setRows((prev) => {
          const updated = [...prev];
          res.rows.forEach((r, i) => {
            updated[p * pageSize + i] = r;
          });
          return updated;
        });
      });
    } catch (e) {
      console.error("❌ Erreur chargement bloc pages", basePage, e);
    } finally {
      loadingPages.current.delete(basePage);
      setLoading(false);
    }
  }, [fetchRows, pageSize, filterModel, loading]);

  // Précharge le bloc de 2 pages (ex: 0-1, 2-3, etc.)
    useEffect(() => {
        const basePage = Math.floor(page / 2) * 2;
        console.log("🔄 Préchargement page bloc", basePage);
        loadPageBlock(basePage);
    }, [page, pageSize, filterModel, loadPageBlock]);


    const visibleRows = rows.slice(page * pageSize, (page + 1) * pageSize);
    console.log("👁️ visibleRows", visibleRows.length, visibleRows);

  return (
    <Box sx={{ width: "100%" }}>
      {loading && visibleRows.length === 0 ? (
        <GlobalSkeleton height="60vh" />
      ) : (
        <DataGrid
          rows={visibleRows}
          columns={columns}
          getRowId={getRowId}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          pageSizeOptions={pageSizeOptions}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          filterModel={filterModel}
          onFilterModelChange={(model) => {
            onFilterChange?.(model);
            setPage(0);
          }}
          onRowClick={onRowClick}
          loading={loading}
          density="compact"
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          filterMode="server"
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              backgroundColor: "white",
              // 🎯 Ici la seule ligne à ajouter ou modifier :
              "& .MuiDataGrid-columnHeaders": {
                minHeight: 70,
                height: 70,
                maxHeight: 70,
              },
              // (optionnel mais conseillé pour forcer chaque cellule header)
              "& .MuiDataGrid-columnHeader": {
                minHeight: 70,
                height: 70,
                maxHeight: 70,
              },
            }}
            getRowClassName={getRowClassName}

        />
      )}
    </Box>
  );
}
