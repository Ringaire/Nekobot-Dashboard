import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import FieldRenderer from './FieldRenderer';
import type { ConfigValue, SchemaFields } from './types';

interface Props {
  fields: SchemaFields;
  value: ConfigValue;
  onChange: (val: ConfigValue) => void;
}

export default function SchemaForm({ fields, value, onChange }: Props) {
  const entries = Object.entries(fields);

  const set = (key: string, val: unknown) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Box>
      {entries.map(([key, meta], idx) => (
        <Box key={key}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={meta.type === 'bool' ? 'center' : 'flex-start'}
            sx={{ py: 1.5, px: 0.5 }}
          >
            <Box sx={{ flex: '0 0 42%', minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.4 }}>
                {meta.label}
                {meta.required && (
                  <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>
                )}
              </Typography>
              {meta.hint && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                  {meta.hint}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FieldRenderer
                fieldKey={key}
                meta={meta}
                value={value[key] ?? meta.default ?? ''}
                onChange={(v) => set(key, v)}
              />
            </Box>
          </Stack>
          {idx < entries.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
        </Box>
      ))}
    </Box>
  );
}
