import { Field, type FieldMeta } from './field'

export interface ModelDef {
  name: string
  fields: Record<string, FieldMeta>
}

export interface AccessPolicy {
  read?:   'public' | 'authenticated' | string
  create?: 'public' | 'authenticated' | string
  update?: 'public' | 'authenticated' | string
  delete?: 'public' | 'authenticated' | string
}

export interface SchemaConfig {
  models: Record<string, Record<string, Field>>
  rules?: Record<string, AccessPolicy>
}

export interface ParsedSchema {
  models: Record<string, ModelDef>
  rules: Record<string, AccessPolicy>
}

export function defineSchema(config: SchemaConfig): ParsedSchema {
  const models: Record<string, ModelDef> = {}

  for (const [name, fields] of Object.entries(config.models)) {
    const parsed: Record<string, FieldMeta> = {}
    for (const [key, field] of Object.entries(fields)) {
      parsed[key] = { ...field.meta }
    }
    models[name] = { name, fields: parsed }
  }

  return { models, rules: config.rules ?? {} }
}
export type { FieldMeta } from "./field";
