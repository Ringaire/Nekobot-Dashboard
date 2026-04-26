import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import type { FieldMeta } from './types';

interface Props {
  fieldKey: string;
  meta: FieldMeta;
  value: unknown;
  onChange: (val: unknown) => void;
}

function ListField({ value, onChange, hint }: { value: unknown; onChange: (v: unknown) => void; hint?: string | null }) {
  const items: string[] = Array.isArray(value) ? value.map(String) : [];
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) {
      onChange([...items, v]);
    }
    setInput('');
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <Stack spacing={1}>
      <TextField
        size="small"
        fullWidth
        placeholder="输入后按 Enter 添加"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        helperText={hint ?? undefined}
        InputProps={{
          endAdornment: input ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={add}>
                <Box component="span" className="ri-add-line" sx={{ fontSize: '1rem' }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
      {items.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {items.map((item, idx) => (
            <Chip key={idx} label={item} size="small" onDelete={() => remove(idx)} />
          ))}
        </Box>
      )}
    </Stack>
  );
}

export default function FieldRenderer({ fieldKey, meta, value, onChange }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const hint = meta.hint ?? undefined;

  if (meta.type === 'bool') {
    return (
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label=""
        sx={{ m: 0 }}
      />
    );
  }

  if (meta.type === 'select') {
    const options = meta.options ?? [];
    const labels = meta.option_labels ?? options;
    return (
      <FormControl size="small" fullWidth>
        <Select
          value={value ?? meta.default ?? ''}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
        >
          {options.map((opt, i) => (
            <MenuItem key={opt} value={opt}>{labels[i] ?? opt}</MenuItem>
          ))}
        </Select>
        {hint && <FormHelperText>{hint}</FormHelperText>}
      </FormControl>
    );
  }

  if (meta.type === 'list') {
    return <ListField value={value} onChange={onChange} hint={hint} />;
  }

  if (meta.type === 'int' || meta.type === 'float') {
    const hasSlider = meta.min !== undefined && meta.max !== undefined;
    const numVal = typeof value === 'number' ? value : (typeof meta.default === 'number' ? meta.default : 0);
    const step = meta.step ?? (meta.type === 'float' ? 0.1 : 1);

    return (
      <Stack spacing={1}>
        {hasSlider && (
          <Slider
            size="small"
            value={numVal}
            min={meta.min}
            max={meta.max}
            step={step}
            onChange={(_, v) => onChange(v)}
            valueLabelDisplay="auto"
          />
        )}
        <TextField
          size="small"
          fullWidth
          type="number"
          value={numVal}
          onChange={(e) => {
            const parsed = meta.type === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
          inputProps={{ step, min: meta.min, max: meta.max }}
          helperText={hint}
        />
      </Stack>
    );
  }

  if (meta.type === 'text') {
    return (
      <TextField
        size="small"
        fullWidth
        multiline
        rows={4}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        helperText={hint}
      />
    );
  }

  if (meta.type === 'password') {
    return (
      <TextField
        size="small"
        fullWidth
        type={showPassword ? 'text' : 'password'}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        helperText={hint}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowPassword((s) => !s)} edge="end">
                <Box
                  component="span"
                  className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}
                  sx={{ fontSize: '1rem' }}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }

  // default: string
  return (
    <TextField
      size="small"
      fullWidth
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      helperText={hint}
    />
  );
}
