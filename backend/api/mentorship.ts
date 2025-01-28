import axios from '../utils/axios';
import { MentorshipRequest } from '../../types/mentorship';

/**
 * MentorshipAPI class handles all mentorship-related API calls
 */
export class MentorshipAPI {
  private static baseURL = '/mentorship';

  /**
   * Submit a new mentorship request
   * @param mentorId - The ID of the mentor
   * @param message - The message to the mentor
   * @returns Promise<MentorshipRequest>
   * @throws {AxiosError} When the request fails
   */
  static async submitRequest(
    mentorId: string, 
    message: string
  ): Promise<MentorshipRequest> {
    try {
      console.log('Making request to:', `${this.baseURL}/request`);
      console.log('Request data:', { mentorId, message });
      
      const response = await axios.post(`${this.baseURL}/request`, {
        mentorId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Submit request error:', error);
      throw error;
    }
  }

  /**
   * Fetch all requests for a mentor
   * @returns Promise<MentorshipRequest[]>
   * @throws {AxiosError} When the request fails
   */
  static async getMentorRequests(): Promise<MentorshipRequest[]> {
    const response = await axios.get(`${this.baseURL}/mentor-requests`);
    return response.data;
  }

  /**
   * Update the status of a mentorship request
   * @param requestId - The ID of the request to update
   * @param status - The new status ('approved' or 'rejected')
   * @returns Promise<MentorshipRequest>
   * @throws {AxiosError} When the request fails
   */
  static async updateRequestStatus(
    requestId: string, 
    status: 'approved' | 'rejected'
  ): Promise<MentorshipRequest> {
    const response = await axios.put(`${this.baseURL}/request/${requestId}`, {
      status
    });
    return response.data;
  }

  /**
   * Fetch all requests for a mentee
   * @returns Promise<MentorshipRequest[]>
   * @throws {AxiosError} When the request fails
   */
  static async getMenteeRequests(): Promise<MentorshipRequest[]> {
    const response = await axios.get(`${this.baseURL}/mentee-requests`);
    return response.data;
  }
} 