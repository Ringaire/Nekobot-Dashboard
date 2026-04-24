import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { useAuth } from 'contexts/AuthContext';
import ResetPasswordDialog from 'views/settings/ResetPasswordDialog';
import MainCard from 'ui-component/cards/MainCard';
import RemixIconAdapter from 'ui-component/extended/RemixIconAdapter';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';

const IconLogout = (props) => <RemixIconAdapter className="ri-logout-box-r-line" {...props} />;
const IconKey = (props) => <RemixIconAdapter className="ri-key-2-line" {...props} />;
const IconMoon = (props) => <RemixIconAdapter className="ri-moon-line" {...props} />;
const IconMenu = (props) => <RemixIconAdapter className="ri-menu-line" {...props} />;

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const { user, logout } = useAuth();
  const {
    state: { borderRadius }
  } = useConfig();

  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      if (action === 'change-password') setPasswordDialogOpen(true);
      if (action === 'logout') logout();
    };
    window.addEventListener('nekobot-search-action', handler);
    return () => window.removeEventListener('nekobot-search-action', handler);
  }, [logout]);

  /**
   * anchorRef is used on different components and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleIconClick = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <Box sx={{ ml: 1.5 }}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: mode === 'dark' ? '#ffffff' : '#333333',
            background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            '&:hover': {
              color: mode === 'dark' ? '#ffffff' : '#000000',
              background: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
            }
          }}
          onClick={handleIconClick}
          aria-label="toggle-theme"
        >
          <IconMoon stroke={1.5} size="20px" />
        </Avatar>
      </Box>
      <Box sx={{ ml: 1.5 }}>
        <Avatar
          variant="rounded"
          ref={anchorRef}
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: mode === 'dark' ? '#ffffff' : '#333333',
            background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            '&:hover, &[aria-controls="menu-list-grow"]': {
              color: '#ffffff',
              background: theme.vars.palette.primary.main
            }
          }}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <IconMenu stroke={1.5} size="20px" />
        </Avatar>
      </Box>
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2 }}>
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 200,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={() => { setPasswordDialogOpen(true); handleClose({ target: {} }); }}>
                          <ListItemIcon>
                            <IconKey stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">修改密码</Typography>} />
                        </ListItemButton>
                        <Divider sx={{ my: 0.5 }} />
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={() => { logout(); handleClose({ target: {} }); }}>
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">退出登录</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
      <ResetPasswordDialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} />
    </>
  );
}
