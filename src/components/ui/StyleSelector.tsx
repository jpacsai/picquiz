import { FormControl, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { getThemePreset, type ThemePresetId, themePresetOptions } from '@/lib/theme/themePresets';
import { useThemePreset } from '@/lib/theme/useThemePreset';

const StyleSelector = () => {
  const { presetId, setPresetId } = useThemePreset();

  const handleChange = (event: SelectChangeEvent<ThemePresetId>) => {
    setPresetId(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <Select
        id="style-selector"
        onChange={handleChange}
        renderValue={(selected) => getThemePreset(selected).meta.label}
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
