import { memo, useEffect, useMemo, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MenuList from '../MenuList';
import MiniDrawerStyled from './MiniDrawerStyled';

import useConfig from 'hooks/useConfig';
import { drawerWidth } from 'store/constant';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import RemixIcon from 'ui-component/extended/RemixIcon';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

const GITHUB_REPO = 'OfficialNekoTeam/NekoBot';

function formatStarCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count.toString();
}

function SidebarFooter({ drawerOpen }: { drawerOpen: boolean }) {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count != null) setStarCount(data.stargazers_count);
      })
      .catch(() => {});
  }, []);

  if (!drawerOpen) return null;

  return (
    <Stack spacing={0.5} sx={{ px: 2, pb: 2 }}>
      <Stack
        component="a"
        href={`https://github.com/${GITHUB_REPO}`}
        target="_blank"
        rel="noopener noreferrer"
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'flex-start', pl: 1, textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
      >
        <RemixIcon className="ri-github-fill" sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>GitHub</Typography>
        {starCount !== null && (
          <>
            <RemixIcon className="ri-star-fill" sx={{ fontSize: 14, color: '#ffb300', ml: 'auto' }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{formatStarCount(starCount)}</Typography>
          </>
        )}
      </Stack>
      <Stack
        component="a"
        href="https://docs.nekobot.dev"
        target="_blank"
        rel="noopener noreferrer"
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'flex-start', pl: 1, textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
      >
        <RemixIcon className="ri-book-open-line" sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>文档</Typography>
      </Stack>
      <Stack
        component="a"
        href={`https://github.com/${GITHUB_REPO}/issues`}
        target="_blank"
        rel="noopener noreferrer"
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'flex-start', pl: 1, textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
      >
        <RemixIcon className="ri-question-line" sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>问题反馈</Typography>
      </Stack>
    </Stack>
  );
}

// ==============================|| SIDEBAR DRAWER ||============================== //

function Sidebar() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const {
    state: { miniDrawer }
  } = useConfig();

  const drawer = useMemo(() => {
    let drawerSX = { paddingLeft: '0px', paddingRight: '0px', marginTop: '20px' };
    if (drawerOpen) drawerSX = { paddingLeft: '16px', paddingRight: '16px', marginTop: '0px' };

    return (
      <>
        {downMD ? (
          <Box sx={drawerSX}>
            <MenuList />
            {drawerOpen && <SidebarFooter drawerOpen={drawerOpen} />}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
            <SimpleBar sx={{ flex: 1, ...drawerSX }}>
              <MenuList />
            </SimpleBar>
            <SidebarFooter drawerOpen={drawerOpen} />
          </Box>
        )}
      </>
    );
  }, [downMD, drawerOpen]);

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { xs: 'auto', md: drawerWidth } }} aria-label="mailbox folders">
      {downMD || (miniDrawer && drawerOpen) ? (
        <Drawer
          variant={downMD ? 'temporary' : 'persistent'}
          anchor="left"
          open={drawerOpen}
          onClose={() => handlerDrawerOpen(!drawerOpen)}
          slotProps={{
            paper: {
              sx: {
                mt: downMD ? 0 : 8,
                zIndex: 1099,
                width: drawerWidth,
                bgcolor: 'background.default',
                color: 'text.primary',
                borderRight: 'none'
              }
            }
          }}
          ModalProps={{ keepMounted: true }}
          color="inherit"
        >
        {drawer}
        </Drawer>
      ) : (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {drawer}
        </MiniDrawerStyled>
      )}
    </Box>
  );
}

export default memo(Sidebar);
