import { apiClient } from './apiClient';

export interface ContactRequestPayload {
  fullName: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  resourceUrl?: string;
  consent: boolean;
  website?: string;
}

export class ContactService {
  static async submit(payload: ContactRequestPayload): Promise<{ referenceId?: string }> {
    const response = await apiClient.post('/contact', payload);
    return response.data.data || {};
  }
}
