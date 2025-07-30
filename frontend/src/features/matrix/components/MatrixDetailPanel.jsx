import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { getSingleProductDetail } from '@/api/productApi';

export default function MatrixDetailPanel({ product, onClose }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!product?.cod_pro) return;
    const fetchData = async () => {
      try {
        const data = await getSingleProductDetail(product.cod_pro);
        setDetails(data);
      } catch (err) {
        console.error('Erreur chargement détail produit:', err);
        setDetails({ error: true });
      }
    };
    fetchData();
  }, [product]);

  return (
    <Drawer anchor="right" open={Boolean(product)} onClose={onClose} sx={{ zIndex: 1300 }}>
      {!details ? (
        <Box sx={{ p: 2, width: 360 }}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" height={100} sx={{ my: 2 }} />
        </Box>
      ) : details.error ? (
        <Box sx={{ p: 2, width: 360 }}>
          <Typography color="error">Erreur chargement produit.</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2, width: 360 }}>
          <Typography variant="h6">
            {details.refint} – ({details.cod_pro})
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List dense>
            <ListItem>
              <ListItemText primary={`Qualité : ${details.qualite}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Famille : ${details.famille}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Réf Constructeur : ${details.ref_crn || '-'}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Réf Externe : ${details.ref_ext || '-'}`} />
            </ListItem>
          </List>
        </Box>
      )}
    </Drawer>
  );
}
