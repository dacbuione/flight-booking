import { environment } from '../../../environments/environment';

/**
 * API configuration object with common settings
 */
export const apiConfig = {
  baseUrl: environment.apiUrl,
  defaultTimeout: 30000, // 30 seconds
  retryCount: 3,
  retryDelay: 1000, // 1 second
  
  // Common endpoints
  endpoints: {
    auth: {
      login: 'login',
      register: 'register',
      refreshToken: 'refresh-token',
      forgotPassword: 'forgot-password',
      resetPassword: 'reset-password',
      autoLogin: 'login',
      logout: 'logout'
    },
    flights: {
      search: 'flights/search',
      details: 'flights/{id}',
      popular: 'flights/popular',
      airports: 'flights/airports'
    },
    bookings: {
      create: 'bookings',
      list: 'bookings/user/{userId}',
      details: 'bookings/{id}',
      cancel: 'bookings/{id}/cancel',
      updateStatus: 'bookings/{id}/status',
      updatePayment: 'bookings/{id}/payment'
    },
    user: {
      profile: 'user/profile',
      updateProfile: 'user/profile',
      preferences: 'user/preferences'
    }
  },
  
  // Common headers
  headers: {
    contentType: 'application/json',
    accept: 'application/json',
    appVersion: '1.0.0'
  },
  
  // Response status codes
  statusCodes: {
    success: 200,
    created: 201,
    noContent: 204,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    serverError: 500
  }
}; 