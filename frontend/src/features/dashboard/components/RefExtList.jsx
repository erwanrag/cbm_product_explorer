import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function RefExtList({ list = [], value, onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="refext-label">Ref Externe</InputLabel>
      <Select
        labelId="refext-label"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Ref Externe"
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
