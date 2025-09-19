import api from "./api";

class AuthService {
  // Register company
  async registerCompany(data) {
    try {
      const response = await api.post("/auth/register-company", data);

      // Handle response structure (may have data wrapper or direct response)
      const responseData = response.data.data || response.data;

      // Store tokens and user data
      if (responseData.tokens?.accessToken) {
        localStorage.setItem("accessToken", responseData.tokens.accessToken);
      }
      if (responseData.tokens?.refreshToken) {
        localStorage.setItem("refreshToken", responseData.tokens.refreshToken);
      }
      if (responseData.user || response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(responseData.user || response.data.user)
        );
      }
      if (responseData.company || response.data.company) {
        localStorage.setItem(
          "company",
          JSON.stringify(responseData.company || response.data.company)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Register company error:", error);
      throw error;
    }
  }

  // Login
  async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      console.log("Attempting login with email:", email);
      const response = await api.post("/auth/login", { email, password });

      // Validate response format
      if (!response.data) {
        console.error("Empty response from server");
        throw new Error("Invalid response from server");
      }

      console.log("Login response structure:", response.data);

      // ✅ Handle new nested response structure
      const data = response.data.data || response.data;

      // Validate required fields in nested structure
      if (!data.user || !data.tokens) {
        console.error("Missing required data in response:", response.data);
        throw new Error("Invalid response format from server");
      }

      // ✅ Store tokens and user data from nested structure
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Store company data (includes permissions and subscription)
      if (data.company) {
        console.log("Storing company data with permissions:", data.company);
        localStorage.setItem("company", JSON.stringify(data.company));
      }

      // ✅ Handle separate subscription (fallback for backward compatibility)
      if (data.subscription && !data.company?.subscription) {
        localStorage.setItem("subscription", JSON.stringify(data.subscription));
      }

      console.log("Login successful for user:", data.user.email);
      console.log(
        "Company permissions stored:",
        data.company?.permissions?.length || 0
      );

      return response.data;
    } catch (error) {
      console.error("Login error:", error.response || error);

      if (error.response?.status === 500) {
        throw new Error(
          "Internal server error. Please try again later or contact support."
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error(
        "Failed to login. Please check your credentials and try again."
      );
    }
  }

  // Logout
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      localStorage.removeItem("subscription");
    }
  }

  // ✅ Updated getProfile to handle new response structure
  async getProfile() {
    try {
      const response = await api.get("/auth/profile");

      console.log("Profile response:", response.data);

      // Handle nested response structure
      const data = response.data.data || response.data;

      // Update localStorage with fresh data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.company) {
        console.log("Updating company data with permissions:", data.company);
        localStorage.setItem("company", JSON.stringify(data.company));
      }
      if (data.subscription && !data.company?.subscription) {
        localStorage.setItem("subscription", JSON.stringify(data.subscription));
      }

      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  // Update profile
  async updateProfile(data) {
    try {
      const response = await api.put("/auth/profile", data);

      // Update localStorage with new user data
      const responseData = response.data.data || response.data;
      if (responseData.user) {
        localStorage.setItem("user", JSON.stringify(responseData.user));
      }

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error("Failed to update profile");
    }
  }

  // Change password
  async changePassword(data) {
    try {
      const response = await api.put("/auth/change-password", data);
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw new Error("Failed to change password");
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    try {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      return !!(token && user);
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  }

  // Get current user
  getCurrentUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  // ✅ Enhanced getCurrentCompany to handle permissions
  getCurrentCompany() {
    try {
      const company = localStorage.getItem("company");
      const parsedCompany = company ? JSON.parse(company) : null;

      if (parsedCompany) {
        console.log(
          "Retrieved company with permissions:",
          parsedCompany.permissions?.length || 0
        );
      }

      return parsedCompany;
    } catch (error) {
      console.error("Get company error:", error);
      return null;
    }
  }

  // Get current subscription
  getCurrentSubscription() {
    try {
      // First try to get subscription from company data
      const company = this.getCurrentCompany();
      if (company?.subscription) {
        return company.subscription;
      }

      // Fallback to separate subscription storage
      const subscription = localStorage.getItem("subscription");
      return subscription ? JSON.parse(subscription) : null;
    } catch (error) {
      console.error("Get subscription error:", error);
      return null;
    }
  }

  // ✅ New method to get access token
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  // ✅ New method to get refresh token
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  // ✅ New method to clear all auth data
  clearAuthData() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("subscription");
  }

  // ✅ Debug method to check current auth state
  debugAuthState() {
    console.log("=== AUTH DEBUG ===");
    console.log("Token:", this.getAccessToken() ? "Present" : "Missing");
    console.log("User:", this.getCurrentUser());
    console.log("Company:", this.getCurrentCompany());
    console.log(
      "Company Permissions:",
      this.getCurrentCompany()?.permissions?.length || 0
    );
    console.log("Subscription:", this.getCurrentSubscription());
    console.log("Authenticated:", this.isAuthenticated());
    console.log("================");
  }
}

export default new AuthService();
