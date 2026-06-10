import { createClient } from 'redis';
import type { DatabaseAdapter } from './types';

export class RedisAdapter implements DatabaseAdapter {
  private client: ReturnType<typeof createClient>;

  constructor(url: string) {
    this.client = createClient({ url });
  }

  async init(models: string[]): Promise<void> {
    await this.client.connect();
    for (const model of models) {
      const exists = await this.client.exists(`model:${model}`);
      if (!exists) {
        await this.client.set(`model:${model}`, '[]');
      }
    }
  }

  private async getStore(model: string): Promise<any[]> {
    const raw = await this.client.get(`model:${model}`);
    return raw ? JSON.parse(raw) : [];
  }

  private async setStore(model: string, data: any[]): Promise<void> {
    await this.client.set(`model:${model}`, JSON.stringify(data));
  }

  async findMany(model: string, opts?: { where?: any; limit?: number }): Promise<any[]> {
    let items = await this.getStore(model);
    if (opts?.where) {
      items = items.filter(item =>
        Object.entries(opts.where!).every(([k, v]) => item[k] === v)
      );
    }
    if (opts?.limit) {
      items = items.slice(0, opts.limit);
    }
    return items;
  }

  async findOne(model: string, where: Record<string, any>): Promise<any | null> {
    const items = await this.getStore(model);
    return items.find(item =>
      Object.entries(where).every(([k, v]) => item[k] === v)
    ) || null;
  }

  async create(model: string, data: any): Promise<any> {
    const items = await this.getStore(model);
    const record = { id: data.id || crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    items.push(record);
    await this.setStore(model, items);
    return record;
  }

  async update(model: string, where: Record<string, any>, data: any): Promise<any> {
    const items = await this.getStore(model);
    const index = items.findIndex(item =>
      Object.entries(where).every(([k, v]) => item[k] === v)
    );
    if (index === -1) throw new Error('Not found');
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    await this.setStore(model, items);
    return items[index];
  }

  async delete(model: string, where: Record<string, any>): Promise<any> {
    let items = await this.getStore(model);
    items = items.filter(item =>
      !Object.entries(where).every(([k, v]) => item[k] === v)
    );
    await this.setStore(model, items);
    return { success: true };
  }
}
