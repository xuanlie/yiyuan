
export interface Category {
  id: string;
  id: string;
  name: string;
  icon: string;
  items: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dish {
  id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: string;
  createdAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Table {
  id: string;
  id: string;
  number: number;
  seats: number;
  status: string;
  orders: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  id: string;
  table: string;
  items: string;
  total: number;
  status: string;
  createdAt: string;
  createdAt?: string;
  updatedAt?: string;
}

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


  // ===== Category =====
  async getCategorys(): Promise<Category[]> {
    return this.request('/api/categorys');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request('/api/categorys/' + id);
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return this.request('/api/categorys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request('/api/categorys/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request('/api/categorys/' + id, {
      method: 'DELETE',
    });
  }

  // ===== Dish =====
  async getDishs(): Promise<Dish[]> {
    return this.request('/api/dishs');
  }

  async getDish(id: string): Promise<Dish> {
    return this.request('/api/dishs/' + id);
  }

  async createDish(data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> {
    return this.request('/api/dishs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDish(id: string, data: Partial<Dish>): Promise<Dish> {
    return this.request('/api/dishs/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDish(id: string): Promise<void> {
    return this.request('/api/dishs/' + id, {
      method: 'DELETE',
    });
  }

  // ===== Table =====
  async getTables(): Promise<Table[]> {
    return this.request('/api/tables');
  }

  async getTable(id: string): Promise<Table> {
    return this.request('/api/tables/' + id);
  }

  async createTable(data: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<Table> {
    return this.request('/api/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTable(id: string, data: Partial<Table>): Promise<Table> {
    return this.request('/api/tables/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTable(id: string): Promise<void> {
    return this.request('/api/tables/' + id, {
      method: 'DELETE',
    });
  }

  // ===== Order =====
  async getOrders(): Promise<Order[]> {
    return this.request('/api/orders');
  }

  async getOrder(id: string): Promise<Order> {
    return this.request('/api/orders/' + id);
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    return this.request('/api/orders/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    return this.request('/api/orders/' + id, {
      method: 'DELETE',
    });
  }
}

// 默认导出单例（方便全局使用）
export const api = new ApiClient();
