export interface DatabaseAdapter {
  init(models: string[]): Promise<void>;
  find(table: string, tenantId: string, query?: Record<string, unknown>): Promise<any[]>;
  findById(table: string, tenantId: string, id: string): Promise<any | null>;
  create(table: string, tenantId: string, data: Record<string, unknown>): Promise<any>;
  update(table: string, tenantId: string, id: string, data: Record<string, unknown>): Promise<any | null>;
  delete(table: string, tenantId: string, id: string): Promise<boolean>;
}
