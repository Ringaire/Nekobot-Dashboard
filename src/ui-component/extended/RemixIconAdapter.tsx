import type { CSSProperties } from 'react';

import RemixIcon from './RemixIcon';

interface RemixIconAdapterProps {
  className: string;
  size?: number | string;
  style?: CSSProperties;
}

export default function RemixIconAdapter({ className, size = '1rem', style }: RemixIconAdapterProps) {
  return <RemixIcon className={className} fontSize={size} style={style} />;
}
