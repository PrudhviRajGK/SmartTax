import api from './api';
import type { TaxCalculationRequest, TaxCalculationResult } from '../types/tax.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const taxService = {
  async parseForm16(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<any>>('/parse/form16', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.data;
  },

  async parseEquity(file: File, broker: 'groww' | 'zerodha' = 'groww'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('broker', broker);
    
    const response = await api.post<ApiResponse<any>>('/parse/equity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.data;
  },

  async parseGroww(file: File): Promise<any> {
    return this.parseEquity(file, 'groww');
  },

  async parseMutualFund(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<any>>('/parse/mf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.data;
  },

  async calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResult> {
    const response = await api.post<ApiResponse<TaxCalculationResult>>('/calculate/tax', request);
    return response.data.data;
  },
};
