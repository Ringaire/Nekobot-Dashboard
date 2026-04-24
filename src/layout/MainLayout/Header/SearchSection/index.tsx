import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import RemixIcon from 'ui-component/extended/RemixIcon';
import { searchMenu } from 'utils/menuSearch';
import type { SearchableItem } from 'utils/menuSearch';

export function dispatchSearchAction(action: string) {
  window.dispatchEvent(new CustomEvent('nekobot-search-action', { detail: action }));
}

export default function SearchSection() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const results = useMemo(() => searchMenu(value), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setAnchorEl(e.currentTarget);
    setOpen(true);
  };

  const handleSelect = useCallback((item: SearchableItem) => {
    if (item.url) {
      if (item.url.startsWith('http')) {
        window.open(item.url, '_blank');
      } else {
        navigate(item.url);
      }
    } else if (item.action) {
      switch (item.action) {
        case 'toggle-dark-mode':
          setMode(mode === 'dark' ? 'light' : 'dark');
          break;
        default:
          dispatchSearchAction(item.action);
      }
    }
    setValue('');
    setOpen(false);
  }, [navigate, mode, setMode]);

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={handleChange}
          onFocus={(e) => { setAnchorEl(e.currentTarget); if (value) setOpen(true); }}
          placeholder="搜索..."
          startAdornment={
            <InputAdornment position="start">
              <RemixIcon className="ri-search-line" fontSize="16px" />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  color: mode === 'dark' ? '#ffffff' : '#333333',
                  background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    color: '#ffffff',
                    background: theme.vars.palette.primary.main
                  }
                }}
              >
                <RemixIcon className="ri-equalizer-line" fontSize="20px" />
              </Avatar>
            </InputAdornment>
          }
          slotProps={{ input: { 'aria-label': 'search', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
          sx={{ width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
        />
        <Popper open={open && results.length > 0} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1200, mt: 1 }}>
          <Paper
            elevation={8}
            sx={{
              width: anchorEl?.offsetWidth || 250,
              maxHeight: 320,
              overflow: 'auto',
              borderRadius: 2,
              boxShadow: theme.shadows[8]
            }}
          >
            <Box sx={{ py: 0.5 }}>
              {results.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={1.5}
                  onClick={() => handleSelect(item)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    cursor: 'pointer',
                    alignItems: 'center',
                    '&:hover': { bgcolor: 'primary.light' }
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.description || item.path.join(' / ')}
                    </Typography>
                  </Box>
                  {item.action && (
                    <RemixIcon className="ri-arrow-right-up-line" fontSize="14px" sx={{ color: 'text.disabled' }} />
                  )}
                </Stack>
              ))}
            </Box>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
