// Test file to debug API calls
import { authApi } from '../api/auth';

export const testLogin = async () => {
  try {
    console.log('Testing login with test credentials...');
    
    const testCredentials = {
      email: 'shiftback3+2@gmail.com',
      password: 'password123'
    };
    
    const response = await authApi.login(testCredentials);
    console.log('✅ Login response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Test the API base URL
export const testApiConnection = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/test');
    const data = await response.json();
    console.log('✅ API connection test:', data);
    return data;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    throw error;
  }
};