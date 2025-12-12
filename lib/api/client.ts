const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

export class ApiClient {
  private static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit & { token?: string } = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;
    const url = `${API_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Company endpoints
  static async createCompany(data: any, token: string) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  static async getCompany(id: string, token?: string) {
    return this.request(`/companies/${id}`, { token });
  }

  static async updateCompany(id: string, data: any, token: string) {
    return this.request(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  static async listCompanies(skip = 0, limit = 10, token?: string) {
    return this.request(`/companies?skip=${skip}&limit=${limit}`, { token });
  }

  // Bond endpoints
  static async createBond(companyId: string, data: any, token: string) {
    return this.request(`/companies/${companyId}/bond`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  static async getBonds(companyId: string, token?: string) {
    return this.request(`/companies/${companyId}/bond`, { token });
  }

  // Equity endpoints
  static async createEquity(companyId: string, data: any, token: string) {
    return this.request(`/companies/${companyId}/equity`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  static async getEquities(companyId: string, token?: string) {
    return this.request(`/companies/${companyId}/equity`, { token });
  }
}
