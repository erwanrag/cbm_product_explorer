import React from "react";
import { Chip, Box } from "@mui/material";
import { getQualiteColor, getStatutColor, getMargeColor, getMatchPercentColor } from "@/constants/colors";

/**
 * CBMBadge - Badge universel CBM (qualité, statut, marge, matching, etc.)
 * type: 'qualite' | 'statut' | 'marge' | 'matching'
 * value: string|number (ex: "OEM", "PMQ", 21.5, 83)
 * label: optionnel (si tu veux overrider l'affichage)
 * ...props: passés à Chip
 */
export default function CBMBadge({ type, value, label, ...props }) {
    let color = "default";
    let badgeLabel = label ?? value;

    switch (type) {
        case "qualite":
            color = getQualiteColor(value);
            break;
        case "statut":
            color = getStatutColor(value);
            break;
        case "marge":
            color = getMargeColor(value);
            badgeLabel = `${Number(value).toFixed(1)}%`;
            break;
        case "matching":
            color = getMatchPercentColor(value);
            badgeLabel = `${Number(value).toFixed(0)}%`;
            break;
        default:
            color = "default";
    }

    return (
        <Chip
            label={badgeLabel}
            size="small"
            sx={{
                fontWeight: 600,
                fontSize: '0.78em',
                bgcolor: color,
                color: "#fff",
                minWidth: 38,
                ...props.sx
            }}
            {...props}
        />
    );
}
