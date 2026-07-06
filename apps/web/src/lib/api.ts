const isBrowser = typeof window !== 'undefined';

const API_BASE = isBrowser
  ? '/api'
  : (process.env.INTERNAL_API_URL || 'http://api:3001/api');

const PUBLIC_PATHS = [
  '/csrf/token',
  '/auth/otp',
  '/auth/verify',
  '/auth/refresh',
  '/health',
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(p => path.includes(p));
}

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401 && !isPublicPath(path)) {
      if (isBrowser) {
        window.location.href = '/auth';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message);
    }

    return response.json();
  }

  get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${path}${query}`);
  }

  post<T = unknown>(
    path: string,
    body?: Record<string, unknown>,
    extra?: { headers?: Record<string, string> },
  ): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: extra?.headers,
    });
  }

  patch<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T = unknown>(path: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (response.status === 401 && !isPublicPath(path)) {
      if (isBrowser) {
        window.location.href = '/auth';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message);
    }

    return response.json();
  }
}

export const api = new ApiClient();
