import type { ParsedSchema } from '@yiyuan/core';

export function generateApiClient(schema: ParsedSchema): string {
  const models = Object.entries(schema.models);
  
  // 生成模型类型
  const typeDefs = models.map(([name, def]) => {
    const fields = Object.entries(def.fields).map(([fieldName, field]) => {
      const tsType = field.type === 'number' || field.type === 'integer' ? 'number' :
                     field.type === 'boolean' ? 'boolean' : 'string';
      return `  ${fieldName}: ${tsType};`;
    }).join('\n');
    return `export interface ${name} {\n  id: string;\n${fields}\n  createdAt?: string;\n  updatedAt?: string;\n}`;
  }).join('\n\n');

  // 生成 ApiClient 类
  const clientMethods = models.map(([name]) => {
    const lower = name.toLowerCase();
    return `
  // ===== ${name} =====
  async get${name}s(): Promise<${name}[]> {
    return this.request('/api/${lower}s');
  }

  async get${name}(id: string): Promise<${name}> {
    return this.request('/api/${lower}s/' + id);
  }

  async create${name}(data: Omit<${name}, 'id' | 'createdAt' | 'updatedAt'>): Promise<${name}> {
    return this.request('/api/${lower}s', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update${name}(id: string, data: Partial<${name}>): Promise<${name}> {
    return this.request('/api/${lower}s/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete${name}(id: string): Promise<void> {
    return this.request('/api/${lower}s/' + id, {
      method: 'DELETE',
    });
  }`;
  }).join('\n');

  return `
${typeDefs}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    // 尝试从 localStorage 恢复 token
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // 登录并保存 token
  async login(username: string, password: string): Promise<string> {
    const res = await fetch(this.baseUrl + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.token = data.token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', this.token!);
    }
    return this.token!;
  }

  // 退出登录
  logout() {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // 设置自定义 token（如 API Key）
  setToken(token: string) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // 获取当前 token
  getToken(): string | null {
    return this.token;
  }

  // 核心请求方法，自动附加认证头
  private async request(url: string, options: RequestInit = {}): Promise<any> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', 'Bearer ' + this.token);
    }
    
    // 支持多租户：从全局配置读取租户 ID（可在应用初始化时设置）
    const tenantId = (typeof window !== 'undefined' && (window as any).__YIYUAN_TENANT__) 
                     || headers.get('x-tenant-id');
    if (tenantId) {
      headers.set('x-tenant-id', tenantId);
    }

    const res = await fetch(this.baseUrl + url, { ...options, headers });

    // 自动处理 401 刷新 token（如果实现刷新接口可扩展）
    if (res.status === 401 && this.token) {
      // 可在这里添加 token 刷新逻辑，暂不实现
      this.logout();
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    if (res.status === 204) return;
    return res.json();
  }

${clientMethods}
}

// 默认导出单例（方便全局使用）
export const api = new ApiClient();
`;
}
