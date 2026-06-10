import { JsonAdapter } from './json-adapter'
import type { DatabaseAdapter } from './types'

let _db: DatabaseAdapter | null = null

export function initDB(dataDir: string): DatabaseAdapter {
  _db = new JsonAdapter(dataDir)
  return _db
}

export function getDB(): DatabaseAdapter {
  if (!_db) throw new Error('DB not initialized. Call initDB() first.')
  return _db
}

export type { DatabaseAdapter, FindManyOptions } from './types'
