import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Button,
  FormControl,
  Menu,
  MenuItem,
  Select,
  type SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { type MouseEvent, useState } from 'react';

import { getThemePreset, type ThemePresetId, themePresetOptions } from '@/lib/theme/themePresets';
import { useThemePreset } from '@/lib/theme/useThemePreset';

const StyleSelector = () => {
  const { presetId, setPresetId } = useThemePreset();
  const theme = useTheme();
  const isCompact = useMediaQuery('(max-width:549.95px)');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleChange = (event: SelectChangeEvent<ThemePresetId>) => {
    setPresetId(event.target.value);
  };

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePresetSelect = (nextPresetId: ThemePresetId) => {
    setPresetId(nextPresetId);
    handleMenuClose();
  };

  if (isCompact) {
    return (
      <>
        <Button
          aria-controls={isMenuOpen ? 'theme-selector-menu' : undefined}
          aria-expanded={isMenuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          endIcon={isMenuOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          onClick={handleMenuOpen}
          size="small"
          sx={{
            minHeight: '44px',
            borderColor: theme.customTokens.border.main,
            color: theme.customTokens.onSurface.cardPrimary,
            textTransform: 'none',
          }}
          variant="outlined"
        >
          Theme
        </Button>

        <Menu
          anchorEl={anchorEl}
          id="theme-selector-menu"
          onClose={handleMenuClose}
          open={isMenuOpen}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 180,
              },
            },
          }}
        >
          {themePresetOptions.map((option) => (
            <MenuItem
              key={option.id}
              onClick={() => handlePresetSelect(option.id)}
              selected={option.id === presetId}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <Select
        id="style-selector"
        onChange={handleChange}
        renderValue={(selected) => getThemePreset(selected).meta.label}
        value={presetId}
        sx={{ minHeight: '44px' }}
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
