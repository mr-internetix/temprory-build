import { API_BASE_URL } from "./utils";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly USER_KEY = "user";

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || `Login failed: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      
      // Store tokens and user info
      this.setTokens(data.access, data.refresh);
      this.setUser(data.user);
      
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Unable to connect to the server. Please check if the backend is running.");
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    this.clearTokens();
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      this.setTokens(data.access, refreshToken);
      return data.access;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearTokens();
      return null;
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Enhanced API request helper with better error handling
  async authenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    // Don't override Content-Type if it's FormData (for file uploads)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    console.log("🔑 Making authenticated request to:", url);
    console.log("🔑 Using token:", token ? `${token.substring(0, 20)}...` : 'No token');
    console.log("🔑 Request headers:", headers);

    try {
      const response = await fetch(url, requestOptions);
      
      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token might be expired, attempting refresh...");
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newToken = this.getAccessToken();
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          return fetch(url, {
            ...requestOptions,
            headers: retryHeaders,
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error("❌ Authenticated request failed:", error);
      throw error;
    }
  }

  // Helper method to get authorization header
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      console.log("🔄 Refreshing access token...");
      
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.getRefreshToken(), // Use this.getRefreshToken() instead of this.refreshToken
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Refresh token response:", errorText);
        
        if (response.status === 401) {
          console.error("❌ Refresh token expired, logging out...");
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Refresh token expired');
        }
        throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // Updated to match your API response: {"access": "token"}
      const newAccessToken = data.access;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      // Save the new access token (keep the same refresh token)
      this.setTokens(newAccessToken, this.getRefreshToken()!); // Use setTokens method
      console.log("✅ Access token refreshed successfully");
      
      return newAccessToken;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      
      // Only clear tokens if it's an auth error
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('expired'))) {
        this.clearTokens();
      }
      
      throw error;
    }
  }
}

export const authService = new AuthService();