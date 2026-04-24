import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

interface RemixIconProps {
  className: string;
  fontSize?: number | string;
  sx?: SxProps<Theme>;
  style?: CSSProperties;
}

export default function RemixIcon({ className, fontSize = '1rem', sx, style }: RemixIconProps) {
  const resolvedSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Box
      component="i"
      aria-hidden="true"
      className={className}
      sx={[
        {
          color: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          fontSize
        },
        ...resolvedSx
      ]}
      style={style}
    />
  );
}
