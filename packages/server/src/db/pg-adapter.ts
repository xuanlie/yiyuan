import { Pool, PoolClient } from 'pg';
import type { DatabaseAdapter } from './types';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.ready = this.pool.query('SELECT 1').then(() => {});
  }

  private async getClient(): Promise<PoolClient> {
    await this.ready;
    return this.pool.connect();
  }

  async init(models: string[]): Promise<void> {
    const client = await this.getClient();
    try {
      for (const model of models) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "${model}" (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);
      }
    } finally {
      client.release();
    }
  }

  private async exec<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }

  async findMany(model: string, opts?: { where?: any; limit?: number }): Promise<any[]> {
    return this.exec(async client => {
      let query = `SELECT id, data FROM "${model}"`;
      const params: any[] = [];
      if (opts?.where) {
        const keys = Object.keys(opts.where);
        const conditions = keys.map((key, i) => `data->>'${key}' = $${i + 1}`);
        query += ' WHERE ' + conditions.join(' AND ');
        params.push(...Object.values(opts.where));
      }
      if (opts?.limit) {
        query += ` LIMIT ${opts.limit}`;
      }
      const res = await client.query(query, params);
      return res.rows.map(row => ({ id: row.id, ...row.data }));
    });
  }

  async findOne(model: string, where: Record<string, any>): Promise<any | null> {
    return this.exec(async client => {
      const res = await client.query(
        `SELECT id, data FROM "${model}" WHERE data->>'id' = $1 LIMIT 1`,
        [where.id || '']
      );
      if (res.rows.length === 0) return null;
      return { id: res.rows[0].id, ...res.rows[0].data };
    });
  }

  async create(model: string, data: any): Promise<any> {
    const record = { id: data.id || crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    return this.exec(async client => {
      await client.query(
        `INSERT INTO "${model}" (id, data) VALUES ($1, $2)`,
        [record.id, JSON.stringify(record)]
      );
      return record;
    });
  }

  async update(model: string, where: Record<string, any>, data: any): Promise<any> {
    const existing = await this.findOne(model, where);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() };
    return this.exec(async client => {
      await client.query(
        `UPDATE "${model}" SET data = $1 WHERE id = $2`,
        [JSON.stringify(updated), existing.id]
      );
      return updated;
    });
  }

  async delete(model: string, where: Record<string, any>): Promise<any> {
    return this.exec(async client => {
      await client.query(`DELETE FROM "${model}" WHERE data->>'id' = $1`, [where.id || '']);
      return { success: true };
    });
  }
}
