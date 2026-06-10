import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import * as path from 'node:path'
import * as fs from 'node:fs'
import type { DatabaseAdapter } from './types'

type DBData = Record<string, Record<string, any[]>> // tenantId -> model -> records

export class JsonAdapter implements DatabaseAdapter {
  private db: Low<DBData>
  private ready: Promise<void>

  constructor(dataDir: string) {
    fs.mkdirSync(dataDir, { recursive: true })
    const file = path.join(dataDir, 'data.json')
    const adapter = new JSONFile<DBData>(file)
    this.db = new Low<DBData>(adapter, {})
    this.ready = this.db.read()
  }

  private async ensure() {
    await this.ready
    if (!this.db.data) this.db.data = {}
  }

  private tenantData(tenantId: string) {
    if (!this.db.data![tenantId]) this.db.data![tenantId] = {}
  }

  async find(table: string, tenantId: string, query?: Record<string, unknown>): Promise<any[]> {
    await this.ensure(); this.tenantData(tenantId);
    const records = this.db.data![tenantId][table] || [];
    if (query && Object.keys(query).length) {
      return records.filter(r => Object.entries(query).every(([k, v]) => r[k] === v));
    }
    return records;
  }

  async findById(table: string, tenantId: string, id: string): Promise<any | null> {
    return (await this.find(table, tenantId, { id }))[0] || null;
  }

  async create(table: string, tenantId: string, data: Record<string, unknown>): Promise<any> {
    await this.ensure(); this.tenantData(tenantId);
    if (!this.db.data![tenantId][table]) this.db.data![tenantId][table] = [];
    const record = { id: (data as any).id || crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    this.db.data![tenantId][table].push(record);
    await this.db.write();
    return record;
  }

  async update(table: string, tenantId: string, id: string, data: Record<string, unknown>): Promise<any> {
    await this.ensure(); this.tenantData(tenantId);
    const records = this.db.data![tenantId][table] || [];
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Not found');
    records[idx] = { ...records[idx], ...data, id, updatedAt: new Date().toISOString() };
    await this.db.write();
    return records[idx];
  }

  async delete(table: string, tenantId: string, id: string): Promise<boolean> {
    await this.ensure(); this.tenantData(tenantId);
    const records = this.db.data![tenantId][table] || [];
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Not found');
    records.splice(idx, 1);
    await this.db.write();
    return true;
  }
}
