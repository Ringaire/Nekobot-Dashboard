import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import RemixIcon from 'ui-component/extended/RemixIcon';

interface StatCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  isLoading = false
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card sx={{ height: 100, borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={18} />
              <Skeleton variant="text" width="40%" height={26} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, height: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <RemixIcon className={icon} sx={{ fontSize: 18, color: 'text.secondary' }} />
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {value ?? '-'}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
