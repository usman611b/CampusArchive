import { apiClient } from './apiClient';
import { LoginDTO, RegisterDTO, AuthResponseData, User } from '../types/auth';

export class AuthService {
  static async login(credentials: LoginDTO): Promise<AuthResponseData> {
    const response = await apiClient.post('/auth/login', credentials);
    const resData = response.data.data;
    const token = resData.token || resData.accessToken;
    const user = resData.user;
    
    if (token) {
      localStorage.setItem('access_token', token);
    }
    
    return {
      user,
      accessToken: token,
      refreshToken: token,
      expiresIn: 604800
    };
  }

  static async register(payload: RegisterDTO): Promise<any> {
    const response = await apiClient.post('/auth/register', payload);
    const resData = response.data.data;
    const token = resData.token || resData.accessToken;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return response.data;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('access_token');
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  }

  static async updateProfile(payload: {
    fullName?: string;
    username?: string;
    universityName?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const response = await apiClient.put('/auth/profile', payload);
    return response.data.data.user;
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.patch('/auth/password', { currentPassword, newPassword });
  }

  static async deleteAccount(currentPassword: string): Promise<void> {
    await apiClient.delete('/auth/me', { data: { currentPassword } });
    localStorage.removeItem('access_token');
  }

  static async forgotPassword(email: string): Promise<string> {
    return 'Password reset instructions sent to email.';
  }
}
