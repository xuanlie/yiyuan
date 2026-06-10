export type FieldType =
  | 'string' | 'number' | 'boolean' | 'timestamp'
  | 'enum' | 'relation' | 'auto' | 'text' | 'json'

export interface FieldMeta {
  type: FieldType
  required: boolean
  unique: boolean
  searchable: boolean
  default?: any
  enumValues?: string[]
  relation?: {
    model: string
    type: 'hasOne' | 'hasMany'
  }
}

export class Field {
  meta: FieldMeta

  constructor(type: FieldType) {
    this.meta = {
      type,
      required: false,
      unique: false,
      searchable: false,
    }
  }

  required()        { this.meta.required = true;   return this }
  unique()          { this.meta.unique = true;     return this }
  searchable()      { this.meta.searchable = true; return this }
  default(val: any) { this.meta.default = val;     return this }
}

export const string    = () => new Field('string')
export const text      = () => new Field('text')
export const number    = () => new Field('number')
export const boolean   = () => new Field('boolean')
export const timestamp = () => new Field('timestamp')
export const json      = () => new Field('json')
export const auto      = () => new Field('auto')

export const enumOf = (...values: string[]) => {
  const f = new Field('enum')
  f.meta.enumValues = values
  return f
}

export const hasOne = (model: string) => {
  const f = new Field('relation')
  f.meta.relation = { model, type: 'hasOne' }
  return f
}

export const hasMany = (model: string) => {
  const f = new Field('relation')
  f.meta.relation = { model, type: 'hasMany' }
  return f
}
