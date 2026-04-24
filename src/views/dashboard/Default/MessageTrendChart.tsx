import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

interface MessageTrendChartProps {
  isLoading: boolean;
}

const RANGE_OPTIONS = [
  { value: 86400, label: '1天' },
  { value: 604800, label: '7天' },
  { value: 2592000, label: '30天' }
];

export default function MessageTrendChart({ isLoading }: MessageTrendChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chartRef = useRef<ReactEChartsCore>(null);
  const [range, setRange] = useState(86400);
  const [chartData, setChartData] = useState<{ dates: string[]; counts: number[] }>({ dates: [], counts: [] });

  useEffect(() => {
    if (isLoading) return;
    fetch(`/api/dashboard/message-trend?range=${range}`)
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.dates && data.counts) {
          setChartData({ dates: data.dates, counts: data.counts });
        }
      })
      .catch(() => {
        setChartData({ dates: [], counts: [] });
      });
  }, [isLoading, range]);

  const hasData = chartData.dates.length > 0;

  const option = {
    grid: { top: 48, right: 16, bottom: 30, left: 48 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1f1f1f' : '#fff',
      borderColor: isDark ? '#333' : '#e0e0e0',
      textStyle: { color: isDark ? '#fff' : '#333' }
    },
    xAxis: {
      type: 'category',
      data: hasData ? chartData.dates : [],
      axisLine: { lineStyle: { color: isDark ? '#555' : '#ccc' } },
      axisLabel: {
        color: isDark ? '#999' : '#666',
        fontSize: 11,
        formatter: (val: string) => {
          if (!val) return '';
          const parts = val.split(' ');
          return parts.length >= 2 ? `${parts[1]}` : val;
        }
      },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: isDark ? '#2a2a2a' : '#f0f0f0' } },
      axisLine: { show: false },
      axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 }
    },
    series: [
      {
        name: '消息条数',
        type: 'line',
        data: hasData ? chartData.counts : [],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2.5,
          color: isDark ? '#90caf9' : '#2196f3'
        },
        itemStyle: {
          color: isDark ? '#90caf9' : '#2196f3'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: isDark ? 'rgba(144,202,249,0.25)' : 'rgba(33,150,243,0.2)' },
            { offset: 1, color: isDark ? 'rgba(144,202,249,0.02)' : 'rgba(33,150,243,0.02)' }
          ])
        }
      }
    ]
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={220} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                消息趋势分析
              </Typography>
              <Typography variant="caption" color="text.secondary">
                跟踪消息数量随时间的变化
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={range}
                onChange={(e) => setRange(Number(e.target.value))}
                variant="outlined"
                sx={{ height: 32, fontSize: '0.8rem' }}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ height: 260, mt: 1 }}>
            {hasData ? (
              <ReactEChartsCore
                ref={chartRef}
                echarts={echarts}
                option={option}
                style={{ height: '100%', width: '100%' }}
                theme={isDark ? 'dark' : undefined}
              />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Box sx={{ fontSize: 36, fontWeight: 600, color: 'text.secondary' }}>0</Box>
                <Typography variant="caption" color="text.secondary">暂无数据</Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
