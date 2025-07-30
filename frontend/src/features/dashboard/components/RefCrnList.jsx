import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function RefCrnList({ list = [], value, onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="refcrn-label">Ref CRN</InputLabel>
      <Select
        labelId="refcrn-label"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Ref CRN"
      >
        <MenuItem value="">Toutes</MenuItem>
        {list.map((ref) => (
          <MenuItem key={ref} value={ref}>
            {ref}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
