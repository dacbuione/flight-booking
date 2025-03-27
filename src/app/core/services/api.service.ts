import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpContext } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { apiConfig } from '../config/api.config';

// These options match Angular HttpClient options
export interface ApiOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | Record<string, string | string[] | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?: boolean | { includeHeaders?: string[] };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api/';

  constructor(private http: HttpClient) {}

  /**
   * Make a GET request
   * @param endpoint The API endpoint (without base URL)
   * @param options Optional HTTP options
   * @returns Observable with the response
   */
  get<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, this.addDefaultOptions(options))
      .pipe(
        timeout(apiConfig.defaultTimeout),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Make a POST request
   * @param endpoint The API endpoint (without base URL)
   * @param body The request body
   * @param options Optional HTTP options
   * @returns Observable with the response
   */
  post<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, this.addDefaultOptions(options))
      .pipe(
        timeout(apiConfig.defaultTimeout),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Make a PUT request
   * @param endpoint The API endpoint (without base URL)
   * @param body The request body
   * @param options Optional HTTP options
   * @returns Observable with the response
   */
  put<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, this.addDefaultOptions(options))
      .pipe(
        timeout(apiConfig.defaultTimeout),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Make a DELETE request
   * @param endpoint The API endpoint (without base URL)
   * @param options Optional HTTP options
   * @returns Observable with the response
   */
  delete<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, this.addDefaultOptions(options))
      .pipe(
        timeout(apiConfig.defaultTimeout),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Make a PATCH request
   * @param endpoint The API endpoint (without base URL)
   * @param body The request body
   * @param options Optional HTTP options
   * @returns Observable with the response
   */
  patch<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, this.addDefaultOptions(options))
      .pipe(
        timeout(apiConfig.defaultTimeout),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create default headers for all requests
   * @returns HttpHeaders with default headers
   */
  createDefaultHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': apiConfig.headers.contentType,
      'Accept': apiConfig.headers.accept,
      'X-App-Version': apiConfig.headers.appVersion
    });
    
    return headers;
  }

  /**
   * Add default options to all requests
   * @param options The options to extend
   * @returns Extended options with defaults
   */
  private addDefaultOptions(options?: ApiOptions): ApiOptions {
    const defaultOptions: ApiOptions = {
      headers: this.createDefaultHeaders()
    };

    if (!options) {
      return defaultOptions;
    }

    // Merge headers if they exist in options
    if (options.headers) {
      const defaultHeaders = this.createDefaultHeaders();
      
      if (options.headers instanceof HttpHeaders) {
        // If options.headers is an HttpHeaders instance, convert to an object
        const headerObj: Record<string, string | string[]> = {};
        options.headers.keys().forEach(key => {
          const value = options.headers instanceof HttpHeaders ? options.headers.getAll(key) : null;
          if (value) {
            headerObj[key] = value;
          }
        });
        
        // Create a new HttpHeaders instance with merged values
        options.headers = new HttpHeaders({
          ...Object.fromEntries(defaultHeaders.keys().map(key => [key, defaultHeaders.getAll(key) || []])),
          ...headerObj
        });
      } else {
        // If options.headers is a plain object
        options.headers = {
          ...Object.fromEntries(defaultHeaders.keys().map(key => [key, defaultHeaders.getAll(key) || []])),
          ...options.headers
        };
      }
    } else {
      options.headers = defaultOptions.headers;
    }

    return options;
  }

  /**
   * Handle HTTP errors
   * @param error The HTTP error
   * @returns An observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 