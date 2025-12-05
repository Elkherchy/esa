// Service API pour communiquer avec le backend Django
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://159.69.127.212:8000";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Récupérer les tokens depuis le localStorage
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Ajouter le token d'authentification si disponible
    if (
      this.accessToken &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/register")
    ) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Si le token a expiré, essayer de le rafraîchir
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          headers["Authorization"] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return this.handleResponse<T>(retryResponse);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur réseau est survenue",
        status: 0,
      };
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {};

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers["Authorization"] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            method: "POST",
            headers,
            body: formData,
          });
          return this.handleResponse<T>(retryResponse);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur réseau est survenue",
        status: 0,
      };
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      const errorData = isJson ? await response.json().catch(() => ({})) : {};
      return {
        error:
          errorData.detail || errorData.message || `Erreur ${response.status}`,
        status: response.status,
      };
    }

    if (isJson) {
      const data = await response.json();
      return { data, status: response.status };
    }

    return { status: response.status };
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, this.refreshToken);
        return true;
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
    }

    // Si le refresh échoue, déconnecter l'utilisateur
    this.logout();
    return false;
  }

  private setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  // ==================== AUTHENTIFICATION ====================

  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      tokens: { access: string; refresh: string };
      message: string;
    }>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Stocker les tokens immédiatement si disponibles
    if (response.data?.tokens) {
      this.setTokens(response.data.tokens.access, response.data.tokens.refresh);
      console.log("Tokens stockés dans login:", {
        hasAccess: !!this.accessToken,
        hasRefresh: !!this.refreshToken,
      });
    } else {
      console.error("Pas de tokens dans la réponse:", response);
    }

    return response;
  }

  async register(data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) {
    const response = await this.request<{
      user: any;
      tokens: { access: string; refresh: string };
      message: string;
    }>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.data?.tokens) {
      this.setTokens(response.data.tokens.access, response.data.tokens.refresh);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<any>("/api/auth/me/");
  }

  logout() {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ==================== DOCUMENTS ====================

  async uploadDocument(
    file: File,
    metadata: {
      title: string;
      description?: string;
      visibility: "PRIVATE" | "ROLE_BASED" | "PUBLIC";
      tags?: string[];
    }
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    if (metadata.description) {
      formData.append("description", metadata.description);
    }
    formData.append("visibility", metadata.visibility);
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append("tags", metadata.tags.join(","));
    }

    return this.requestFormData<any>("/api/documents/", formData);
  }

  async getDocuments(params?: {
    search?: string;
    visibility?: string;
    tags?: string;
    analyzed?: boolean;
    owner?: string;
    date_from?: string;
    date_to?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/api/documents/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.request<{
      count: number;
      next: string | null;
      previous: string | null;
      results: any[];
    }>(endpoint);
  }

  async getDocument(id: string) {
    return this.request<any>(`/api/documents/${id}/`);
  }

  async updateDocument(
    id: string,
    data: {
      title?: string;
      description?: string;
      visibility?: string;
      tags?: string[];
    }
  ) {
    return this.request<any>(`/api/documents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string) {
    return this.request<void>(`/api/documents/${id}/`, {
      method: "DELETE",
    });
  }

  async analyzeDocument(id: string) {
    return this.request<{
      message: string;
      task_id: string;
      document_id: string;
    }>(`/api/documents/${id}/analyze/`, {
      method: "POST",
    });
  }

  async getTags() {
    return this.request<any[]>("/api/documents/tags/");
  }

  async getDocumentStats() {
    return this.request<{
      total_documents: number;
      analyzed_documents: number;
      analyzed_percentage: number;
    }>("/api/documents/stats/");
  }

  // ==================== UTILISATEURS (Admin) ====================

  async getUsers(params?: { role?: string; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/api/auth/users/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.request<any[]>(endpoint);
  }

  async getUser(id: string) {
    return this.request<any>(`/api/auth/users/${id}/`);
  }

  async updateUser(
    id: string,
    data: {
      role?: string;
      is_active?: boolean;
    }
  ) {
    return this.request<any>(`/api/auth/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ==================== PERMISSIONS ====================

  async getPermissions(params?: {
    document?: string;
    user?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/api/permissions/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.request<any[]>(endpoint);
  }

  async createPermission(data: {
    document: string;
    user?: string;
    role?: string;
    start_time: string;
    end_time: string;
  }) {
    return this.request<any>("/api/permissions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string) {
    return this.request<void>(`/api/permissions/${id}/`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
