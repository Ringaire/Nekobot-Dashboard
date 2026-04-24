// material-ui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export default function Logo() {
  const theme = useTheme();

  return (
    <Typography
      variant="h5"
      component="div"
      sx={{
        fontWeight: 600,
        fontSize: '1.25rem',
        color: theme.vars.palette.text.primary,
        letterSpacing: '-0.5px',
        userSelect: 'none'
      }}
    >
      NekoBot Dash
    </Typography>
  );
}
