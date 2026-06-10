import mysql from 'mysql2/promise';
import type { DatabaseAdapter } from './types';

export class MysqlAdapter implements DatabaseAdapter {
  private pool: mysql.Pool;

  constructor(config: string | mysql.PoolOptions) {
    this.pool = mysql.createPool(typeof config === 'string' ? { uri: config } : config);
  }

  async init(models: string[]): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      for (const model of models) {
        await conn.execute(`
          CREATE TABLE IF NOT EXISTS \`${model}\` (
            id VARCHAR(36) PRIMARY KEY,
            data JSON NOT NULL
          )
        `);
      }
    } finally {
      conn.release();
    }
  }

  async findMany(model: string, opts?: { where?: any; limit?: number }): Promise<any[]> {
    const conn = await this.pool.getConnection();
    try {
      let query = `SELECT id, data FROM \`${model}\``;
      const params: any[] = [];
      if (opts?.where) {
        const keys = Object.keys(opts.where);
        const conditions = keys.map(key => `JSON_EXTRACT(data, '$.${key}') = ?`);
        query += ' WHERE ' + conditions.join(' AND ');
        params.push(...Object.values(opts.where));
      }
      if (opts?.limit) {
        query += ` LIMIT ${opts.limit}`;
      }
      const [rows] = await conn.query(query, params);
      return (rows as any[]).map(row => ({ id: row.id, ...row.data }));
    } finally {
      conn.release();
    }
  }

  async findOne(model: string, where: Record<string, any>): Promise<any | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT id, data FROM \`${model}\` WHERE JSON_EXTRACT(data, '$.id') = ? LIMIT 1`,
        [where.id || '']
      );
      if ((rows as any[]).length === 0) return null;
      const row = (rows as any[])[0];
      return { id: row.id, ...row.data };
    } finally {
      conn.release();
    }
  }

  async create(model: string, data: any): Promise<any> {
    const record = { id: data.id || crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    const conn = await this.pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO \`${model}\` (id, data) VALUES (?, ?)`,
        [record.id, JSON.stringify(record)]
      );
      return record;
    } finally {
      conn.release();
    }
  }

  async update(model: string, where: Record<string, any>, data: any): Promise<any> {
    const existing = await this.findOne(model, where);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() };
    const conn = await this.pool.getConnection();
    try {
      await conn.execute(
        `UPDATE \`${model}\` SET data = ? WHERE id = ?`,
        [JSON.stringify(updated), existing.id]
      );
      return updated;
    } finally {
      conn.release();
    }
  }

  async delete(model: string, where: Record<string, any>): Promise<any> {
    const conn = await this.pool.getConnection();
    try {
      await conn.execute(`DELETE FROM \`${model}\` WHERE JSON_EXTRACT(data, '$.id') = ?`, [where.id || '']);
      return { success: true };
    } finally {
      conn.release();
    }
  }
}
