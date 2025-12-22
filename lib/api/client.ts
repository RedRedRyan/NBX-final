const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
  success?: boolean;
}

export class ApiClient {
  private static getHeaders(token?: string, isFormData = false): HeadersInit {
    const headers: HeadersInit = {};

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit & { token?: string; isFormData?: boolean } = {}
  ): Promise<T> {
    const { token, isFormData, ...fetchOptions } = options;
    const url = `${API_URL}${endpoint}`;

    try {
      // Build headers properly
      const headers = this.getHeaders(token, isFormData);
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.message || `API Error: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Company endpoints
  static async createCompany(formData: FormData, token: string) {
    return this.request('/companies', {
      method: 'POST',
      body: formData, // Send FormData directly
      token,
      isFormData: true, // Flag to skip Content-Type header
    });
  }

  static async getCompany(id: string, token?: string) {
    return this.request(`/companies/${id}`, { token });
  }

  static async getCompanyBySymbol(symbol: string, token?: string) {
    return this.request(`/companies/symbol/${symbol}`, { token });
  }

  static async getUserCompanies(email: string, token: string) {
    return this.request(`/companies/user/${email}`, { token });
  }

  static async updateCompany(id: string, data: any, token: string) {
    return this.request(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  static async listCompanies(skip = 0, limit = 10, sector?: string, token?: string) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (sector) params.append('sector', sector);
    
    return this.request(`/companies?${params.toString()}`, { token });
  }

  static async deleteCompany(id: string, token: string) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
      token,
    });
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

  // Upload endpoints
  static async uploadCompanyDocument(
    companyId: string,
    file: File,
    documentType: string,
    token: string
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.request(`/uploads/company/${companyId}/document`, {
      method: 'POST',
      body: formData,
      token,
      isFormData: true,
    });
  }

  static async getCompanyDocuments(companyId: string, token: string) {
    return this.request(`/uploads/company/${companyId}/documents`, { token });
  }

  static async deleteCompanyDocument(
    companyId: string,
    documentId: string,
    token: string
  ) {
    return this.request(`/uploads/company/${companyId}/document/${documentId}`, {
      method: 'DELETE',
      token,
    });
  }
}