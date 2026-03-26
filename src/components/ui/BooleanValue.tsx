import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SvgIconProps } from '@mui/material/SvgIcon';

import { getBooleanValueLabel } from '@/utils/booleanValue';

type BooleanValueProps = {
  value: boolean;
  ariaLabel?: string;
  fontSize?: SvgIconProps['fontSize'];
  showLabel?: boolean;
};

const BooleanValue = ({
  value,
  ariaLabel,
  fontSize = 'small',
  showLabel = false,
}: BooleanValueProps) => {
  const label = getBooleanValueLabel(value);
  const Icon = value ? CheckCircleIcon : CancelIcon;

  return (
    <Box
      component="span"
      role="img"
      aria-label={ariaLabel ?? label}
      sx={{
        alignItems: 'center',
        color: value ? 'success.main' : 'error.main',
        display: 'inline-flex',
        gap: 0.75,
        verticalAlign: 'middle',
      }}
    >
      <Icon aria-hidden fontSize={fontSize} />
      {showLabel ? (
        <Typography
          component="span"
          sx={{
            color: 'inherit',
            lineHeight: 1,
          }}
          variant="body2"
        >
          {label}
        </Typography>
      ) : null}
    </Box>
  );
};

export default BooleanValue;
