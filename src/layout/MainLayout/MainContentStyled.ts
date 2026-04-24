// material-ui
import { styled } from '@mui/material/styles';

// project imports
import { drawerWidth } from 'store/constant';

// ==============================|| MAIN LAYOUT - STYLED ||============================== //

interface MainContentStyledProps {
  open?: boolean;
  borderRadius?: number;
}

const MainContentStyled = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'borderRadius'
})<MainContentStyledProps>(({ theme, open, borderRadius }) => ({
  backgroundColor: theme.vars.palette.background.default,
  minWidth: '1%',
  width: '100%',
  minHeight: 'calc(100vh - 64px)',
  flexGrow: 1,
  padding: 12,
  marginTop: 64,
  marginRight: 12,
  borderRadius: `${borderRadius}px`,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  ...(!open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter + 200
    }),
    [theme.breakpoints.up('md')]: {
      marginLeft: -(drawerWidth - 72),
      width: `calc(100% - ${drawerWidth}px)`,
      marginTop: 64
    }
  }),
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter + 200
    }),
    marginLeft: 0,
    marginTop: 64,
    width: `calc(100% - ${drawerWidth}px)`,
    [theme.breakpoints.up('md')]: {
      marginTop: 64
    }
  }),
  [theme.breakpoints.down('md')]: {
    marginLeft: 12,
    padding: 10,
    marginTop: 64,
    ...(!open && {
      width: `calc(100% - ${drawerWidth}px)`
    })
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 6,
    marginRight: 6
  }
}));

export default MainContentStyled;
