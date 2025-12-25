const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface InitializePaymentDto {
  token: 'KESy_TESTNET';
  amount: number;
  email: string;
  currency: 'KES';
  metadata: {
    orderID: string;
  };
  callback_url?: string;
  channels?: string[];
  crypto_account?: string;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  authorization_url: string;
  access_code: string;
  orderID: string;
}

export interface Transaction {
  reference: string;
  orderID: string;
  email: string;
  amount: number;
  currency: string;
  token: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  authorizationUrl: string;
  cryptoAccount?: string;
  channels?: string[];
  callbackUrl?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  failedAt?: string;
}

export interface TransactionsResponse {
  success: boolean;
  payments: Transaction[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface PaymentDetailsResponse {
  success: boolean;
  payment: Transaction;
}

export interface VerifyPaymentResponse {
  success: boolean;
  reference: string;
  verified: boolean;
  status: 'SUCCESS' | 'NOT_COMPLETED';
}

export interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmountSpent: number;
  currency: string;
  recentPayments: number;
  successRate: string;
  lastSuccessfulPayment: {
    amount: number;
    currency: string;
    date: string;
  } | null;
}

export interface StatsResponse {
  success: boolean;
  stats: PaymentStats;
}

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
  /**
   * Initialize a payment with Orion Ramp
   * @param data - Payment initialization data
   * @param token - JWT authentication token
   * @returns Payment response with authorization URL
   * 
   * Example:
   * const payment = await ApiClient.initializeOnramp({
   *   token: 'KESy_TESTNET',
   *   amount: 1000,
   *   email: 'user@example.com',
   *   currency: 'KES',
   *   metadata: { orderID: generateUUID() }
   * }, userToken);
   * 
   * // Redirect user to payment page
   * window.location.href = payment.authorization_url;
   */
  static async initializeOnramp(
    data: InitializePaymentDto,
    token: string
  ): Promise<PaymentResponse> {
    return this.request<PaymentResponse>('/onramp/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * Get all transactions for the authenticated user
   * @param token - JWT authentication token
   * @param limit - Number of records to return (default: 50, max: 100)
   * @param skip - Number of records to skip for pagination (default: 0)
   * @returns List of user transactions
   * 
   * Example:
   * const { payments, total, hasMore } = await ApiClient.getUserTransactions(token, 10, 0);
   */
  static async getUserTransactions(
    token: string,
    limit = 50,
    skip = 0
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams({
      limit: Math.min(limit, 100).toString(),
      skip: skip.toString(),
    });
    
    return this.request<TransactionsResponse>(
      `/onramp/transactions?${params.toString()}`,
      { token }
    );
  }

  /**
   * Get transaction details by reference ID
   * @param reference - Payment reference ID
   * @param token - JWT authentication token
   * @returns Transaction details
   * 
   * Example:
   * const { payment } = await ApiClient.getTransactionByReference('ref_abc123', token);
   */
  static async getTransactionByReference(
    reference: string,
    token: string
  ): Promise<PaymentDetailsResponse> {
    return this.request<PaymentDetailsResponse>(
      `/onramp/transaction/reference/${reference}`,
      { token }
    );
  }

  /**
   * Get transaction details by order ID
   * @param orderID - Order ID from metadata
   * @param token - JWT authentication token
   * @returns Transaction details
   * 
   * Example:
   * const { payment } = await ApiClient.getTransactionByOrderId('uuid-123', token);
   */
  static async getTransactionByOrderId(
    orderID: string,
    token: string
  ): Promise<PaymentDetailsResponse> {
    return this.request<PaymentDetailsResponse>(
      `/onramp/transaction/order/${orderID}`,
      { token }
    );
  }

  /**
   * Verify if a transaction is completed successfully
   * @param reference - Payment reference ID
   * @param token - JWT authentication token
   * @returns Verification status
   * 
   * Example:
   * const { verified } = await ApiClient.verifyTransaction('ref_abc123', token);
   * if (verified) {
   *   console.log('Payment successful!');
   * }
   */
  static async verifyTransaction(
    reference: string,
    token: string
  ): Promise<VerifyPaymentResponse> {
    return this.request<VerifyPaymentResponse>(
      `/onramp/transaction/${reference}/verify`,
      { token }
    );
  }

  /**
   * Get payment statistics for the authenticated user
   * @param token - JWT authentication token
   * @returns User payment statistics
   * 
   * Example:
   * const { stats } = await ApiClient.getUserPaymentStats(token);
   * console.log(`Success rate: ${stats.successRate}%`);
   */
  static async getUserPaymentStats(token: string): Promise<StatsResponse> {
    return this.request<StatsResponse>('/onramp/stats', { token });
  }

  /**
   * Check onramp service health
   * @returns Health status
   * 
   * Example:
   * const health = await ApiClient.checkOnrampHealth();
   * console.log(health.status); // 'ok'
   */

}