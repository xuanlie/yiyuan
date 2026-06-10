import { MongoClient, Db, Collection } from 'mongodb';
import type { DatabaseAdapter } from './types';

export class MongoAdapter implements DatabaseAdapter {
  private client: MongoClient;
  private db!: Db;

  constructor(url: string) {
    this.client = new MongoClient(url);
  }

  async init(models: string[]): Promise<void> {
    await this.client.connect();
    this.db = this.client.db();
  }

  private col(model: string): Collection {
    return this.db.collection(model);
  }

  async findMany(model: string, opts?: { where?: any; limit?: number }): Promise<any[]> {
    const filter: any = {};
    if (opts?.where) {
      for (const [key, value] of Object.entries(opts.where)) {
        filter[key] = value;
      }
    }
    let cursor = this.col(model).find(filter);
    if (opts?.limit) cursor = cursor.limit(opts.limit);
    return cursor.toArray();
  }

  async findOne(model: string, where: Record<string, any>): Promise<any | null> {
    return this.col(model).findOne(where);
  }

  async create(model: string, data: any): Promise<any> {
    const record = { ...data, _id: data.id || crypto.randomUUID(), createdAt: new Date().toISOString() };
    const result = await this.col(model).insertOne(record);
    return { id: result.insertedId, ...record };
  }

  async update(model: string, where: Record<string, any>, data: any): Promise<any> {
    const existing = await this.findOne(model, where);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await this.col(model).updateOne(where, { $set: updated });
    return updated;
  }

  async delete(model: string, where: Record<string, any>): Promise<any> {
    await this.col(model).deleteOne(where);
    return { success: true };
  }
}
