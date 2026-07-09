export type FieldType = 'string' | 'password' | 'int' | 'float' | 'bool' | 'text' | 'list' | 'select';

export interface FieldMeta {
  type: FieldType;
  label: string;
  hint?: string | null;
  required?: boolean;
  default?: unknown;
  options?: string[];
  option_labels?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export type SchemaFields = Record<string, FieldMeta>;

export interface ConfigSchema {
  label?: string;
  description?: string;
  fields: SchemaFields;
}

export type ConfigValue = Record<string, unknown>;
