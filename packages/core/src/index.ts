export { defineSchema } from './schema/schema'
export type { SchemaConfig, ParsedSchema, ModelDef, AccessPolicy } from './schema/schema'

export { string, text, number, boolean, timestamp, json, auto, enumOf, hasOne, hasMany } from './schema/field'
export type { FieldMeta, FieldType } from './schema/field'

export { getPrimaryKey, getWritableFields, getSearchableFields, getRelationFields } from './schema/utils'

export { definePage, mountPage, pageQuery } from './page/define'
export type { PageConfig } from './page/define'

// 框架配置类型
export interface YiyuanConfig {
  backend?: string;
  datasource?: {
    provider?: 'json' | 'sqlite' | 'postgres' | 'mysql' | 'mongodb' | 'redis';
    url?: string;
  };
  server?: {
    port?: number;
    banner?: 'colorful' | 'simple' | 'none';
  };
  outDir?: string;
  plugins?: any[];
  frontend?: 'vanilla' | 'react' | 'vue';
  middlewares?: string[];
}
