import { Button } from '@mui/material';

type OptionButtonProps = {
  isAnswered: boolean;
  optionId: string;
  optionLabel: string;
  onSelectOption: (optionId: string) => void;
  isSelected: boolean;
  showCorrect: boolean;
  showIncorrect: boolean;
};

const OptionButton = ({
  isAnswered,
  optionId,
  optionLabel,
  onSelectOption,
  isSelected,
  showCorrect,
  showIncorrect,
}: OptionButtonProps) => {
  return (
    <Button
      disabled={isAnswered}
      key={optionId}
      onClick={() => onSelectOption(optionId)}
      sx={(theme) => ({
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: 64,
        textAlign: 'left',
        whiteSpace: 'normal',
        lineHeight: 1.4,
        py: 1.5,
        borderWidth: 2,
        backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
        borderColor: showCorrect
          ? theme.palette.success.main
          : showIncorrect
            ? theme.palette.error.main
            : undefined,
        color: showCorrect
          ? theme.palette.success.main
          : showIncorrect
            ? theme.palette.error.main
            : undefined,
        '&.Mui-disabled': {
          opacity: 1,
          borderWidth: 2,
          borderColor: showCorrect
            ? theme.palette.success.main
            : showIncorrect
              ? theme.palette.error.main
              : undefined,
          color: showCorrect
            ? theme.palette.success.main
            : showIncorrect
              ? theme.palette.error.main
              : undefined,
        },
      })}
      variant="outlined"
    >
      {optionLabel}
    </Button>
  );
};

export default OptionButton;
