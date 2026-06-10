import Database from 'better-sqlite3';
import type { DatabaseAdapter } from './types';

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor(filepath: string) {
    this.db = new Database(filepath);
    this.db.pragma('journal_mode = WAL');
  }

  async init(models: string[]): Promise<void> {
    for (const name of models) {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS "${name}" (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL
        )
      `);
    }
  }

  async findMany(model: string, opts?: { where?: any; limit?: number }): Promise<any[]> {
    let query = `SELECT id, data FROM "${model}"`;
    const params: any[] = [];
    if (opts?.where) {
      const keys = Object.keys(opts.where);
      const conditions = keys.map(key => `json_extract(data, '$.${key}') = ?`);
      query += ' WHERE ' + conditions.join(' AND ');
      params.push(...Object.values(opts.where));
    }
    if (opts?.limit) {
      query += ` LIMIT ${opts.limit}`;
    }
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map(row => ({ id: row.id, ...JSON.parse(row.data) }));
  }

  async findOne(model: string, where: Record<string, any>): Promise<any | null> {
    const row = this.db.prepare(
      `SELECT id, data FROM "${model}" WHERE json_extract(data, '$.id') = ? LIMIT 1`
    ).get(where.id || '') as any;
    if (!row) return null;
    return { id: row.id, ...JSON.parse(row.data) };
  }

  async create(model: string, data: any): Promise<any> {
    const record = { id: data.id || crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    this.db.prepare(`INSERT INTO "${model}" (id, data) VALUES (?, ?)`).run(record.id, JSON.stringify(record));
    return record;
  }

  async update(model: string, where: Record<string, any>, data: any): Promise<any> {
    const existing = await this.findOne(model, where);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() };
    this.db.prepare(`UPDATE "${model}" SET data = ? WHERE id = ?`).run(JSON.stringify(updated), existing.id);
    return updated;
  }

  async delete(model: string, where: Record<string, any>): Promise<any> {
    this.db.prepare(`DELETE FROM "${model}" WHERE json_extract(data, '$.id') = ?`).run(where.id || '');
    return { success: true };
  }
}
