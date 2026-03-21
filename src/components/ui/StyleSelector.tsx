import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { type ThemePresetId, themePresetOptions } from '@/lib/theme/themePresets';
import { useThemePreset } from '@/lib/theme/useThemePreset';

const StyleSelector = () => {
  const { presetId, setPresetId } = useThemePreset();

  const handleChange = (event: SelectChangeEvent<ThemePresetId>) => {
    setPresetId(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="style-selector-label">Style</InputLabel>
      <Select
        id="style-selector"
        label="Style"
        labelId="style-selector-label"
        onChange={handleChange}
        value={presetId}
      >
        {themePresetOptions.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StyleSelector;
