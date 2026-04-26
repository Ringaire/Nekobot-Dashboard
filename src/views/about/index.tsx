import { memo, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import apiClient from 'api/client';

const BUILD_VERSION: string = import.meta.env.VITE_APP_VERSION || '0.1.0';

const features = [
  { icon: 'ri-chat-3-line', title: '多平台聊天管理' },
  { icon: 'ri-plugin-line', title: '插件系统' },
  { icon: 'ri-book-2-line', title: '知识库管理' },
  { icon: 'ri-brain-line', title: 'LLM 接入' },
  { icon: 'ri-terminal-box-line', title: '命令管理' },
  { icon: 'ri-file-list-3-line', title: '日志查看' },
  { icon: 'ri-settings-3-line', title: '系统设置' },
  { icon: 'ri-emotion-line', title: '人格管理' }
];

const techStack = [
  { icon: 'ri-reactjs-line', title: 'React 19', color: 'info.main' },
  { icon: 'ri-palette-line', title: 'Material UI', color: 'secondary.main' },
  { icon: 'ri-code-s-slash-line', title: 'TypeScript', color: 'primary.main' },
  { icon: 'ri-route-line', title: 'React Router', color: 'error.main' },
  { icon: 'ri-layout-grid-line', title: 'Vite', color: 'warning.main' },
  { icon: 'ri-refresh-line', title: 'SWR', color: 'success.main' }
];

function AboutPage() {
  const [backendVersion, setBackendVersion] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<{ version?: string }>('/api/v1/ping')
      .then((res) => { if (res.data.version) setBackendVersion(res.data.version); })
      .catch(() => {});
  }, []);

  const version = backendVersion ?? BUILD_VERSION;

  const infoCards = [
    {
      icon: 'ri-information-line',
      color: 'primary.main',
      title: '关于项目',
      description: 'NekoBot 是一个功能强大的聊天机器人管理系统，支持多平台接入、插件扩展、知识库管理等功能。'
    },
    {
      icon: 'ri-shield-check-line',
      color: 'success.main',
      title: '版本信息',
      description: `当前版本: v${version}`
    },
    {
      icon: 'ri-team-line',
      color: 'secondary.main',
      title: '开发团队',
      description: 'OfficialNekoTeam'
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: 1 }}>
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ py: { xs: 4, md: 5 }, px: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <Box component="img" src="/logo.svg" alt="NekoBot" sx={{ width: { xs: 48, sm: 60 }, height: 'auto', mb: 2 }} />
            <Typography variant="h3" gutterBottom>
              NekoBot Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              基于 React 和 Material-UI 的聊天机器人管理面板
            </Typography>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }
          }}
        >
          {infoCards.map((item) => (
            <MainCard key={item.title}>
              <Stack spacing={2}>
                <Box className={item.icon} sx={{ fontSize: '2.5rem', color: item.color }} />
                <Typography variant="h5">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Stack>
            </MainCard>
          ))}
        </Box>

        <MainCard title="主要功能">
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: 'repeat(1, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }
            }}
          >
            {features.map((item) => (
              <Stack key={item.title} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box className={item.icon} sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="body2">{item.title}</Typography>
              </Stack>
            ))}
          </Box>
        </MainCard>

        <MainCard title="技术栈">
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' }
            }}
          >
            {techStack.map((item) => (
              <Stack key={item.title} spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Box className={item.icon} sx={{ fontSize: '2rem', color: item.color }} />
                <Typography variant="body2">{item.title}</Typography>
              </Stack>
            ))}
          </Box>
        </MainCard>

        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} OfficialNekoTeam. All rights reserved.
        </Typography>
      </Stack>
    </Box>
  );
}

export default memo(AboutPage);
