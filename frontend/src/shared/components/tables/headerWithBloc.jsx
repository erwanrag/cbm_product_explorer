//frontend/src/shared/components/tables/headerWithBloc.js
import { Box } from "@mui/material";

export function headerWithBloc(label, blocLabel, color, sx = {}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        minHeight: 54, // <-- Hauteur plus grande, modifie ici si besoin (56, 60...)
        py: 1.3, // Padding vertical
        gap: 0.5,
        ...sx,
      }}
    >
      <span style={{ lineHeight: 1.4 }}>{label}</span>
      <span
        style={{
          background: color,
          color: "#fff",
          fontSize: "1em",
          borderRadius: 5,
          padding: "2px 10px",
          marginTop: 4,
          fontWeight: 700,
          letterSpacing: 1,
          minHeight: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {blocLabel}
      </span>
    </Box>
  );
}
