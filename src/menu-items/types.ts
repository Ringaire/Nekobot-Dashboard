import { ForwardRefExoticComponent } from 'react';
import { IconProps } from '@mui/material';

// ==============================|| MENU ITEM TYPES ||============================== //

export interface MenuItem {
  id: string;
  title: string;
  type: 'group' | 'collapse' | 'item' | 'divider';
  url?: string;
  icon?: ForwardRefExoticComponent<IconProps & Record<string, unknown>>;
  breadcrumbs?: boolean;
  children?: MenuItem[];
  external?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

export interface MenuGroupProps {
  item: MenuItem;
  lastItem?: boolean;
  remItems?: MenuItem[];
  lastItemId?: string;
  selectedID: string;
  setSelectedID: (id: string) => void;
  isParents?: boolean;
}

export interface NavCollapseProps {
  item: MenuItem;
  level?: number;
  isParents?: boolean;
  setSelectedID: (id: string) => void;
  key: string;
}

export interface NavItemProps {
  item: MenuItem;
  level: number;
  isParents?: boolean;
  setSelectedID: (id: string) => void;
}