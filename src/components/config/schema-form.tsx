import { cn } from '@/lib/utils';
import { FieldLabel, FieldRenderer } from './field-renderer';
import type { ConfigValue, SchemaFields } from '@/types/config';

interface SchemaFormProps {
  fields: SchemaFields;
  value: ConfigValue;
  onChange: (val: ConfigValue) => void;
  className?: string;
}

export function SchemaForm({ fields, value, onChange, className }: SchemaFormProps) {
  const entries = Object.entries(fields);
  const set = (key: string, val: unknown) => onChange({ ...value, [key]: val });

  return (
    <div className={cn('divide-y', className)}>
      {entries.map(([key, meta]) => (
        <div
          key={key}
          className={cn(
            'grid gap-2 py-3 sm:grid-cols-[42%_1fr]',
            meta.type === 'bool' ? 'sm:items-center' : 'sm:items-start',
          )}
        >
          <FieldLabel meta={meta} />
          <div className="min-w-0">
            <FieldRenderer
              meta={meta}
              value={value[key] ?? meta.default ?? ''}
              onChange={(v) => set(key, v)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
