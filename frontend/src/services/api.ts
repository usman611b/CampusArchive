const API_BASE_URL = 'http://localhost:4000/api/v1';

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('campusarchive_jwt_token');
  }

  private static getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  static async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth)
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'API Request failed');
    }

    return payload.data as T;
  }

  static async post<T>(endpoint: string, body: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'API Request failed');
    }

    return payload.data as T;
  }

  static async put<T>(endpoint: string, body: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'API Request failed');
    }

    return payload.data as T;
  }
}
