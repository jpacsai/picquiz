import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

type ImageUploadActionProps = {
  disabled: boolean;
  helperText?: string;
  label: string;
  onClick: () => void;
};

const ImageUploadAction = ({
  disabled,
  helperText,
  label,
  onClick,
}: ImageUploadActionProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        width: '100%',
      }}
    >
      {disabled && helperText ? (
        <Box
          component="span"
          sx={{
            color: 'text.secondary',
            fontSize: 12,
          }}
        >
          {helperText}
        </Box>
      ) : null}

      <Button variant="contained" disabled={disabled} onClick={onClick} sx={{ height: '67px' }}>
        {label}
      </Button>
    </Box>
  );
};

export default ImageUploadAction;
