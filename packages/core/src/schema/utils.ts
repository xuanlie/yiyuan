import type { ModelDef, FieldMeta } from './schema'

export function getPrimaryKey(model: ModelDef): string | null {
  for (const [key, field] of Object.entries(model.fields)) {
    if (field.type === 'auto') return key
  }
  return null
}

export function getWritableFields(model: ModelDef): string[] {
  return Object.entries(model.fields)
    .filter(([_, f]) => f.type !== 'auto' && !(f.type === 'relation' && f.relation?.type === 'hasMany'))
    .map(([key]) => key)
}

export function getSearchableFields(model: ModelDef): string[] {
  return Object.entries(model.fields)
    .filter(([_, f]) => f.searchable)
    .map(([key]) => key)
}

export function getRelationFields(model: ModelDef): Array<{ key: string; field: FieldMeta }> {
  return Object.entries(model.fields)
    .filter(([_, f]) => f.type === 'relation')
    .map(([key, field]) => ({ key, field }))
}
