import { useState } from 'react';
import { Eye, EyeOff, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { FieldMeta } from '@/types/config';

interface FieldRendererProps {
  meta: FieldMeta;
  value: unknown;
  onChange: (val: unknown) => void;
}

function ListField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const items: string[] = Array.isArray(value) ? value.map(String) : [];
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="输入后回车添加"
        />
        <Button type="button" size="icon" variant="outline" onClick={add} aria-label="添加">
          <Plus className="size-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <Badge key={`${item}-${idx}`} variant="secondary" className="gap-1 pr-1.5">
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                aria-label={`移除 ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function FieldLabel({ meta }: { meta: FieldMeta }) {
  return (
    <div className="space-y-0.5">
      <Label className="text-sm font-medium leading-tight">
        {meta.label}
        {meta.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {meta.hint && <p className="text-xs text-muted-foreground">{meta.hint}</p>}
    </div>
  );
}

export function FieldRenderer({ meta, value, onChange }: FieldRendererProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (meta.type === 'bool') {
    return <Switch checked={Boolean(value)} onCheckedChange={onChange} />;
  }

  if (meta.type === 'select') {
    const options = meta.options ?? [];
    const labels = meta.option_labels ?? options;
    const current = (value ?? meta.default ?? '') as string;
    return (
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="请选择" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt, i) => (
            <SelectItem key={opt} value={opt}>
              {labels[i] ?? opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (meta.type === 'list') {
    return <ListField value={value} onChange={onChange} />;
  }

  if (meta.type === 'int' || meta.type === 'float') {
    const hasSlider = meta.min !== undefined && meta.max !== undefined;
    const numVal = typeof value === 'number' ? value : typeof meta.default === 'number' ? meta.default : 0;
    const step = meta.step ?? (meta.type === 'float' ? 0.1 : 1);
    return (
      <div className="space-y-2">
        {hasSlider && (
          <Slider
            value={[numVal]}
            min={meta.min}
            max={meta.max}
            step={step}
            onValueChange={([v]) => onChange(v)}
          />
        )}
        <Input
          type="number"
          value={Number.isNaN(numVal) ? 0 : numVal}
          step={step}
          min={meta.min}
          max={meta.max}
          onChange={(e) => {
            const p =
              meta.type === 'float'
                ? parseFloat(e.target.value)
                : parseInt(e.target.value, 10);
            onChange(Number.isNaN(p) ? 0 : p);
          }}
        />
      </div>
    );
  }

  if (meta.type === 'text') {
    return (
      <Textarea
        rows={4}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (meta.type === 'password') {
    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="pr-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-9"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? '隐藏密码' : '显示密码'}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    );
  }

  return (
    <Input
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
